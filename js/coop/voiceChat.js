/* ==========================================================================
   Cozy Garden — WebRTC Peer-to-Peer Voice Chat (js/coop/voiceChat.js)
   Mesh audio call for 2-4 co-working players in the same room.
   Handles mic capture, mute/deafen, ICE queuing, and live RMS speaking ring.
   ========================================================================== */

(function () {
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  // Public STUN + Free OpenRelay TURN servers so peers behind strict 4G/symmetric NAT can hear & talk!
  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ];

  class VoiceChat {
    constructor(options = {}) {
      this.getMyId = options.getMyId || (() => null);
      this.sendSignal = options.sendSignal || (() => {});
      this.onVoiceStateChange = options.onVoiceStateChange || (() => {});
      this.onSpeakingChange = options.onSpeakingChange || (() => {});
      this.onDevicesChange = options.onDevicesChange || (() => {});
      this.onPeerStatusChange = options.onPeerStatusChange || (() => {});
      this.onError = options.onError || (() => {});

      this.active = false;
      this.muted = false;
      this.deafened = false;
      this.selectedDeviceId = '';
      this.localStream = null;
      this.peers = new Map(); // peerId -> { pc, pendingCandidates, audioEl, analyser }
      this.localAnalyser = null;
      this.audioCtx = null;
      this.speakTimer = null;
      this.speakingIds = new Set();

      if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
        navigator.mediaDevices.addEventListener('devicechange', () => {
          this.refreshDevices();
        });
      }
    }

    async refreshDevices() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        const mics = list.filter((d) => d.kind === 'audioinput');
        this.onDevicesChange(mics, this.selectedDeviceId);
        return mics;
      } catch (_) {
        return [];
      }
    }

    async _captureMicStream(deviceId) {
      const baseAudio = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };
      if (deviceId) baseAudio.deviceId = { ideal: deviceId };
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: baseAudio, video: false });
      } catch (err) {
        // Fallback for wired headsets / 3.5mm combo jacks that reject advanced audio constraints!
        if (err && err.name !== 'NotAllowedError') {
          return await navigator.mediaDevices.getUserMedia({
            audio: deviceId ? { deviceId: { ideal: deviceId } } : true,
            video: false,
          });
        }
        throw err;
      }
    }

    async setDevice(deviceId) {
      this.selectedDeviceId = deviceId || '';
      if (!this.active) return;
      try {
        const newStream = await this._captureMicStream(this.selectedDeviceId);
        const newTrack = newStream.getAudioTracks()[0];
        if (!newTrack) return;
        newTrack.enabled = !this.muted;

        // Hot-swap mic track across all active WebRTC peer connections!
        for (const entry of this.peers.values()) {
          const sender = entry.pc.getSenders().find((s) => s.track && s.track.kind === 'audio');
          if (sender) await sender.replaceTrack(newTrack);
        }

        if (this.localStream) {
          this.localStream.getTracks().forEach((t) => t.stop());
        }
        this.localStream = newStream;
        this._setupLocalAnalyser();
        await this.refreshDevices();
      } catch (_) {
        this.onError('Không thể chuyển sang thiết bị Micro đã chọn.');
      }
    }

    async join() {
      if (this.active) return true;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.onError('Cần mở qua http://localhost:3000 hoặc HTTPS để bật Micro.');
        return false;
      }
      try {
        this.localStream = await this._captureMicStream(this.selectedDeviceId);
      } catch (err) {
        const msg =
          err && err.name === 'NotAllowedError'
            ? 'Bạn chưa cấp quyền Micro trên trình duyệt.'
            : 'Không thể bật Micro (hãy kiểm tra thiết bị tai nghe hoặc mở qua localhost/HTTPS).';
        this.onError(msg);
        return false;
      }

      const activeTrack = this.localStream.getAudioTracks()[0];
      if (activeTrack && activeTrack.getSettings && activeTrack.getSettings().deviceId) {
        this.selectedDeviceId = activeTrack.getSettings().deviceId;
      }

      this.active = true;
      this.muted = false;
      this._setupLocalAnalyser();
      this._startSpeakingMonitor();
      await this.refreshDevices();
      this.onVoiceStateChange({ active: true, muted: false });
      this.sendSignal(null, { kind: 'join' });
      return true;
    }

    leave() {
      if (!this.active && !this.localStream && this.peers.size === 0) return;
      if (this.active) {
        this.sendSignal(null, { kind: 'leave' });
      }
      this.active = false;
      this.muted = false;

      if (this.speakTimer) {
        clearInterval(this.speakTimer);
        this.speakTimer = null;
      }
      for (const peerId of Array.from(this.peers.keys())) {
        this._closePeer(peerId);
      }
      if (this.localStream) {
        this.localStream.getTracks().forEach((t) => t.stop());
        this.localStream = null;
      }
      this.localAnalyser = null;
      this.speakingIds.clear();
      this.onSpeakingChange(new Set());
      this.onPeerStatusChange(0, 0);
      this.onVoiceStateChange({ active: false, muted: false });
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((t) => {
          t.enabled = !this.muted;
        });
      }
      this.onVoiceStateChange({ active: this.active, muted: this.muted });
    }

    setDeafened(deafened) {
      this.deafened = Boolean(deafened);
      for (const entry of this.peers.values()) {
        if (entry.audioEl) entry.audioEl.muted = this.deafened;
      }
    }

    syncMembers(members) {
      const validIds = new Set((members || []).map((m) => m.id));
      for (const peerId of Array.from(this.peers.keys())) {
        if (!validIds.has(peerId)) this._closePeer(peerId);
      }
    }

    async handleSignal(senderId, signal) {
      if (!senderId || !signal || senderId === this.getMyId()) return;

      if (signal.kind === 'leave') {
        this._closePeer(senderId);
        this._emitPeerStatus();
        return;
      }

      if (!this.active) return;

      const myId = this.getMyId();
      try {
        if (signal.kind === 'join') {
          this.sendSignal(senderId, { kind: 'ready' });
          if (myId && myId < senderId) {
            await this._createOffer(senderId);
          }
          return;
        }

        if (signal.kind === 'ready') {
          if (myId && myId < senderId) {
            await this._createOffer(senderId);
          }
          return;
        }

        if (signal.kind === 'offer') {
          const entry = this._getOrCreatePeer(senderId);
          const polite = myId > senderId;
          if (entry.pc.signalingState !== 'stable') {
            if (!polite) return; // Impolite peer ignores colliding offer
            await entry.pc.setLocalDescription({ type: 'rollback' });
          }
          await entry.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          await this._flushCandidates(entry);
          const answer = await entry.pc.createAnswer();
          await entry.pc.setLocalDescription(answer);
          this.sendSignal(senderId, { kind: 'answer', sdp: entry.pc.localDescription });
          return;
        }

        if (signal.kind === 'answer') {
          const entry = this.peers.get(senderId);
          if (!entry || entry.pc.signalingState !== 'have-local-offer') return;
          await entry.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          await this._flushCandidates(entry);
          return;
        }

        if (signal.kind === 'ice' && signal.candidate) {
          const entry = this._getOrCreatePeer(senderId);
          const cand = new RTCIceCandidate(signal.candidate);
          if (entry.pc.remoteDescription && entry.pc.remoteDescription.type) {
            try {
              await entry.pc.addIceCandidate(cand);
            } catch (_) {}
          } else {
            entry.pendingCandidates.push(cand);
          }
        }
      } catch (err) {
        // Keep voice loop alive even if one transient signaling race occurs
        console.warn('Voice signal error:', err);
      }
    }

    _emitPeerStatus() {
      let connected = 0;
      for (const entry of this.peers.values()) {
        const s = entry.pc.iceConnectionState;
        if (s === 'connected' || s === 'completed') connected++;
      }
      this.onPeerStatusChange(connected, this.peers.size);
    }

    _playAudioElement(audioEl) {
      if (!audioEl) return;
      const p = audioEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Browser autoplay blocked async remote audio — unlock on next user tap!
          const unlock = () => {
            audioEl.play().catch(() => {});
          };
          window.addEventListener('pointerdown', unlock, { once: true });
          window.addEventListener('keydown', unlock, { once: true });
        });
      }
    }

    _getOrCreatePeer(peerId) {
      if (this.peers.has(peerId)) return this.peers.get(peerId);

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const entry = {
        pc,
        pendingCandidates: [],
        audioEl: null,
        analyser: null,
        retriedIce: false,
      };
      this.peers.set(peerId, entry);

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => pc.addTrack(track, this.localStream));
      }

      pc.onicecandidate = (e) => {
        if (e.candidate && this.active) {
          this.sendSignal(peerId, { kind: 'ice', candidate: e.candidate });
        }
      };

      pc.ontrack = (e) => {
        const stream = e.streams && e.streams[0] ? e.streams[0] : new MediaStream([e.track]);
        if (!entry.audioEl) {
          const audioEl = document.createElement('audio');
          audioEl.autoplay = true;
          audioEl.playsInline = true;
          audioEl.volume = 1.0;
          audioEl.muted = this.deafened;
          audioEl.srcObject = stream;
          audioEl.style.display = 'none';
          document.body.appendChild(audioEl);
          entry.audioEl = audioEl;
        } else {
          entry.audioEl.srcObject = stream;
        }
        this._playAudioElement(entry.audioEl);
        entry.analyser = this._attachAnalyser(stream);
      };

      pc.oniceconnectionstatechange = () => {
        this._emitPeerStatus();
        if (pc.iceConnectionState === 'failed' && !entry.retriedIce) {
          entry.retriedIce = true;
          if (typeof pc.restartIce === 'function') {
            try { pc.restartIce(); } catch (_) {}
          }
        }
      };

      pc.onconnectionstatechange = () => {
        this._emitPeerStatus();
        if (pc.connectionState === 'closed') {
          this._closePeer(peerId);
        }
      };

      this._emitPeerStatus();
      return entry;
    }

    async _createOffer(peerId) {
      const entry = this._getOrCreatePeer(peerId);
      if (entry.pc.signalingState !== 'stable') return;
      const offer = await entry.pc.createOffer();
      await entry.pc.setLocalDescription(offer);
      this.sendSignal(peerId, { kind: 'offer', sdp: entry.pc.localDescription });
    }

    async _flushCandidates(entry) {
      while (entry.pendingCandidates.length > 0) {
        const cand = entry.pendingCandidates.shift();
        try {
          await entry.pc.addIceCandidate(cand);
        } catch (_) {}
      }
    }

    _closePeer(peerId) {
      const entry = this.peers.get(peerId);
      if (!entry) return;
      try {
        entry.pc.close();
      } catch (_) {}
      if (entry.audioEl && entry.audioEl.parentNode) {
        entry.audioEl.srcObject = null;
        entry.audioEl.parentNode.removeChild(entry.audioEl);
      }
      this.peers.delete(peerId);
      this.speakingIds.delete(peerId);
    }

    _ensureAudioContext() {
      if (!this.audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) this.audioCtx = new Ctx();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    }

    _attachAnalyser(stream) {
      const ctx = this._ensureAudioContext();
      if (!ctx || !stream) return null;
      try {
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        return analyser;
      } catch (_) {
        return null;
      }
    }

    _setupLocalAnalyser() {
      if (!this.localStream) return;
      this.localAnalyser = this._attachAnalyser(this.localStream);
    }

    _computeRms(analyser, buf) {
      if (!analyser) return 0;
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      return Math.sqrt(sum / buf.length);
    }

    _startSpeakingMonitor() {
      if (this.speakTimer) clearInterval(this.speakTimer);
      const buf = new Uint8Array(128);
      this.speakTimer = setInterval(() => {
        if (!this.active) return;
        const nextSpeaking = new Set();
        const myId = this.getMyId();
        if (myId && !this.muted && this._computeRms(this.localAnalyser, buf) > 0.035) {
          nextSpeaking.add(myId);
        }
        if (!this.deafened) {
          for (const [peerId, entry] of this.peers.entries()) {
            if (this._computeRms(entry.analyser, buf) > 0.035) {
              nextSpeaking.add(peerId);
            }
          }
        }
        if (
          nextSpeaking.size !== this.speakingIds.size ||
          Array.from(nextSpeaking).some((id) => !this.speakingIds.has(id))
        ) {
          this.speakingIds = nextSpeaking;
          this.onSpeakingChange(new Set(nextSpeaking));
        }
      }, 150);
    }
  }

  CozyGarden.VoiceChat = VoiceChat;
})();
