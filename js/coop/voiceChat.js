/* ==========================================================================
   Cozy Garden — WebRTC Peer-to-Peer Voice Chat (js/coop/voiceChat.js)
   Mesh audio call for 2-4 co-working players in the same room.
   Handles mic capture, mute/deafen, ICE queuing, and live RMS speaking ring.
   ========================================================================== */

(function () {
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  class VoiceChat {
    constructor(options = {}) {
      this.getMyId = options.getMyId || (() => null);
      this.sendSignal = options.sendSignal || (() => {});
      this.onVoiceStateChange = options.onVoiceStateChange || (() => {});
      this.onSpeakingChange = options.onSpeakingChange || (() => {});
      this.onError = options.onError || (() => {});

      this.active = false;
      this.muted = false;
      this.deafened = false;
      this.localStream = null;
      this.peers = new Map(); // peerId -> { pc, pendingCandidates, audioEl, analyser }
      this.localAnalyser = null;
      this.audioCtx = null;
      this.speakTimer = null;
      this.speakingIds = new Set();
    }

    async join() {
      if (this.active) return true;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.onError('Cần mở qua http://localhost:3000 hoặc HTTPS để bật Micro.');
        return false;
      }
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      } catch (err) {
        const msg =
          err && err.name === 'NotAllowedError'
            ? 'Bạn chưa cấp quyền Micro trên trình duyệt.'
            : 'Không thể bật Micro (hãy kiểm tra thiết bị hoặc mở qua localhost/HTTPS).';
        this.onError(msg);
        return false;
      }

      this.active = true;
      this.muted = false;
      this._setupLocalAnalyser();
      this._startSpeakingMonitor();
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
        return;
      }

      if (!this.active) return;

      const myId = this.getMyId();
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
        await entry.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        await this._flushCandidates(entry);
        const answer = await entry.pc.createAnswer();
        await entry.pc.setLocalDescription(answer);
        this.sendSignal(senderId, { kind: 'answer', sdp: entry.pc.localDescription });
        return;
      }

      if (signal.kind === 'answer') {
        const entry = this.peers.get(senderId);
        if (!entry) return;
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
    }

    _getOrCreatePeer(peerId) {
      if (this.peers.has(peerId)) return this.peers.get(peerId);

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const entry = {
        pc,
        pendingCandidates: [],
        audioEl: null,
        analyser: null,
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
          audioEl.muted = this.deafened;
          audioEl.srcObject = stream;
          audioEl.style.display = 'none';
          document.body.appendChild(audioEl);
          entry.audioEl = audioEl;
        } else {
          entry.audioEl.srcObject = stream;
        }
        entry.analyser = this._attachAnalyser(stream);
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          this._closePeer(peerId);
        }
      };

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
