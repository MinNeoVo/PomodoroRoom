/* ==========================================================================
   Cozy Garden — Dual-Mode Co-Working Client (js/coop/coopClient.js)
   Automatically uses WebSocket when served via http(s), or BroadcastChannel +
   localStorage when opened via file:// so 2-4 tabs work out of the box!
   ========================================================================== */

(function () {
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});
  const LOCAL_ROOMS_KEY = 'cozy_garden_local_coop_rooms_v1';

  class CoopClient {
    constructor(handlers = {}) {
      this.handlers = handlers;
      this.clientId = 'u_' + Math.random().toString(36).slice(2, 10);
      this.mode = 'local'; // 'ws' | 'local'
      this.ws = null;
      this.channel = null;
      this.currentRoom = null;

      this._initTransport();
    }

    _initTransport() {
      const isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';
      if (isHttp && window.WebSocket) {
        const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        try {
          this.ws = new WebSocket(`${wsProto}//${window.location.host}`);
          this.ws.addEventListener('open', () => {
            this.mode = 'ws';
            this.requestRoomList();
          });
          this.ws.addEventListener('message', (e) => {
            try {
              const msg = JSON.parse(e.data);
              if (msg.type === 'welcome') {
                this.clientId = msg.id;
                if (this.handlers.onRoomList) this.handlers.onRoomList(msg.rooms || []);
              } else {
                this._dispatch(msg);
              }
            } catch (_) {}
          });
          this.ws.addEventListener('error', () => this._fallbackToLocal());
          return;
        } catch (_) {}
      }
      this._fallbackToLocal();
    }

    _fallbackToLocal() {
      if (this.channel) return;
      this.mode = 'local';
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel('cozy_garden_cowork_v1');
        this.channel.onmessage = (e) => {
          const msg = e.data;
          if (!msg) return;
          if (msg.type === 'room_list_ping') {
            if (this.handlers.onRoomList) this.handlers.onRoomList(this._readLocalRoomList());
            return;
          }
          if (this.currentRoom && msg.roomCode === this.currentRoom.code) {
            this._dispatch(msg);
          }
        };
      }
      window.addEventListener('beforeunload', () => {
        if (this.mode === 'local' && this.currentRoom) this.leaveRoom();
      });
    }

    _dispatch(msg) {
      if (msg.type === 'room_state') {
        this.currentRoom = msg.room;
        if (this.handlers.onRoomState) this.handlers.onRoomState(msg.room);
      } else if (msg.type === 'room_list') {
        if (this.handlers.onRoomList) this.handlers.onRoomList(msg.rooms || []);
      } else if (msg.type === 'chat') {
        if (this.handlers.onChat) this.handlers.onChat(msg);
      } else if (msg.type === 'system') {
        if (this.handlers.onSystem) this.handlers.onSystem(msg.text);
      } else if (msg.type === 'reaction') {
        if (this.handlers.onReaction) this.handlers.onReaction(msg);
      } else if (msg.type === 'pomo_approved') {
        if (this.handlers.onPomoApproved) this.handlers.onPomoApproved(msg.mode);
      } else if (msg.type === 'pomo_rejected') {
        if (this.handlers.onPomoRejected) this.handlers.onPomoRejected(msg.by);
      } else if (msg.type === 'peer_move_emote') {
        if (this.handlers.onPeerMoveEmote) this.handlers.onPeerMoveEmote(msg);
      } else if (msg.type === 'voice_signal') {
        if (msg.senderId === this.clientId) return;
        if (msg.targetId && msg.targetId !== this.clientId) return;
        if (this.handlers.onVoiceSignal) this.handlers.onVoiceSignal(msg);
      } else if (msg.type === 'error') {
        if (this.handlers.onError) this.handlers.onError(msg.text);
      }
    }

    /* ---------------- Local BroadcastChannel Room Store ---------------- */
    _readLocalRooms() {
      try {
        return JSON.parse(localStorage.getItem(LOCAL_ROOMS_KEY) || '{}');
      } catch (_) {
        return {};
      }
    }

    _writeLocalRooms(map) {
      try {
        localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(map));
      } catch (_) {}
    }

    _readLocalRoomList() {
      const map = this._readLocalRooms();
      return Object.values(map).map((r) => ({
        code: r.code,
        sceneId: r.sceneId,
        count: (r.members || []).length,
      }));
    }

    _broadcastLocal(msg) {
      if (this.channel) this.channel.postMessage(msg);
      this._dispatch(msg);
    }

    /* ---------------- Public Actions ---------------- */
    generateCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }

    requestRoomList() {
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'list_rooms' }));
      } else if (this.handlers.onRoomList) {
        this.handlers.onRoomList(this._readLocalRoomList());
      }
    }

    createRoom({ code, sceneId, name, outfit, avatar, goal }) {
      const cleanCode = (code || this.generateCode()).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'create_room', code: cleanCode, sceneId, name, outfit, avatar, goal }));
        return;
      }
      const rooms = this._readLocalRooms();
      const room = {
        code: cleanCode,
        sceneId: sceneId || 'coop_library',
        level: 0,
        members: [{ id: this.clientId, name, outfit: Number(outfit) || 0, avatar: avatar || null, seat: 0, goal: goal || '' }],
        vote: null,
      };
      rooms[cleanCode] = room;
      this._writeLocalRooms(rooms);
      this.currentRoom = room;
      this._broadcastLocal({ type: 'room_state', roomCode: cleanCode, room });
      this._broadcastLocal({ type: 'system', roomCode: cleanCode, text: `${name} đã tạo phòng ${cleanCode}.` });
      if (this.channel) this.channel.postMessage({ type: 'room_list_ping' });
      this.requestRoomList();
    }

    joinRoom({ code, name, outfit, avatar, goal }) {
      const cleanCode = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (!cleanCode) return;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'join_room', code: cleanCode, name, outfit, avatar, goal }));
        return;
      }
      const rooms = this._readLocalRooms();
      const room = rooms[cleanCode];
      if (!room) {
        this._dispatch({ type: 'error', text: `Không tìm thấy phòng mã "${cleanCode}".` });
        return;
      }
      if (room.members.length >= 4 && !room.members.some((m) => m.id === this.clientId)) {
        this._dispatch({ type: 'error', text: `Phòng "${cleanCode}" đã đủ 4/4 người.` });
        return;
      }
      const usedSeats = new Set(room.members.map((m) => m.seat));
      let seat = 0;
      while (usedSeats.has(seat) && seat < 4) seat++;
      room.members = room.members.filter((m) => m.id !== this.clientId);
      room.members.push({ id: this.clientId, name, outfit: Number(outfit) || 0, avatar: avatar || null, seat, goal: goal || '' });
      rooms[cleanCode] = room;
      this._writeLocalRooms(rooms);
      this.currentRoom = room;
      this._broadcastLocal({ type: 'room_state', roomCode: cleanCode, room });
      this._broadcastLocal({ type: 'system', roomCode: cleanCode, text: `${name} đã tham gia phòng (Ghế #${seat + 1}).` });
      if (this.channel) this.channel.postMessage({ type: 'room_list_ping' });
      this.requestRoomList();
    }

    leaveRoom() {
      if (!this.currentRoom) return;
      const code = this.currentRoom.code;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'leave_room' }));
        this.currentRoom = null;
        return;
      }
      const rooms = this._readLocalRooms();
      const room = rooms[code];
      if (room) {
        const me = room.members.find((m) => m.id === this.clientId);
        room.members = room.members.filter((m) => m.id !== this.clientId);
        if (room.members.length === 0) {
          delete rooms[code];
        } else {
          rooms[code] = room;
          if (this.channel) {
            if (me) this.channel.postMessage({ type: 'system', roomCode: code, text: `${me.name} đã rời phòng.` });
            this.channel.postMessage({ type: 'room_state', roomCode: code, room });
          }
        }
        this._writeLocalRooms(rooms);
      }
      this.currentRoom = null;
      if (this.channel) this.channel.postMessage({ type: 'room_list_ping' });
      this.requestRoomList();
    }

    sendChat(text) {
      if (!this.currentRoom) return;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'chat', text }));
        return;
      }
      const me = this.currentRoom.members.find((m) => m.id === this.clientId);
      this._broadcastLocal({
        type: 'chat',
        roomCode: this.currentRoom.code,
        senderId: this.clientId,
        senderName: me ? me.name : 'Bạn',
        text,
        ts: Date.now(),
      });
    }

    sendReaction(emoji, text) {
      if (!this.currentRoom) return;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'reaction', emoji, text }));
        return;
      }
      const me = this.currentRoom.members.find((m) => m.id === this.clientId);
      this._broadcastLocal({
        type: 'reaction',
        roomCode: this.currentRoom.code,
        senderId: this.clientId,
        senderName: me ? me.name : 'Bạn',
        emoji,
        text,
      });
    }

    updateProfile({ outfit, avatar, goal }) {
      if (!this.currentRoom) return;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'update_profile', outfit, avatar, goal }));
        return;
      }
      const rooms = this._readLocalRooms();
      const room = rooms[this.currentRoom.code];
      if (!room) return;
      const me = room.members.find((m) => m.id === this.clientId);
      if (me) {
        if (typeof outfit === 'number') me.outfit = outfit;
        if (avatar) me.avatar = avatar;
        if (typeof goal === 'string') me.goal = goal.slice(0, 50);
      }
      rooms[room.code] = room;
      this._writeLocalRooms(rooms);
      this._broadcastLocal({ type: 'room_state', roomCode: room.code, room });
    }

    levelUpRoom() {
      if (!this.currentRoom) return;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'room_level_up' }));
        return;
      }
      const rooms = this._readLocalRooms();
      const room = rooms[this.currentRoom.code];
      if (!room) return;
      room.level = Math.min(6, (room.level || 0) + 1);
      rooms[room.code] = room;
      this._writeLocalRooms(rooms);
      this._broadcastLocal({ type: 'system', roomCode: room.code, text: `🎉 Phòng chung đã lên cấp Lv.${room.level}! Mở khóa vật phẩm mới!` });
      this._broadcastLocal({ type: 'room_state', roomCode: room.code, room });
    }

    sendMoveEmote(pos, emote) {
      if (!this.currentRoom) return;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'move_emote', pos, emote }));
        return;
      }
      this._broadcastLocal({
        type: 'peer_move_emote',
        roomCode: this.currentRoom.code,
        senderId: this.clientId,
        pos,
        emote,
      });
    }

    sendVoiceSignal(targetId, signal) {
      if (!this.currentRoom) return;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'voice_signal', targetId: targetId || null, signal }));
        return;
      }
      if (this.channel) {
        this.channel.postMessage({
          type: 'voice_signal',
          roomCode: this.currentRoom.code,
          senderId: this.clientId,
          targetId: targetId || null,
          signal,
        });
      }
    }

    updateVoiceState(voice) {
      if (!this.currentRoom) return;
      const cleanVoice = {
        active: Boolean(voice && voice.active),
        muted: Boolean(voice && voice.muted),
      };
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'voice_state', voice: cleanVoice }));
        return;
      }
      const rooms = this._readLocalRooms();
      const room = rooms[this.currentRoom.code];
      if (!room) return;
      const me = room.members.find((m) => m.id === this.clientId);
      if (me) me.voice = cleanVoice;
      rooms[room.code] = room;
      this._writeLocalRooms(rooms);
      this._broadcastLocal({ type: 'room_state', roomCode: room.code, room });
    }

    proposePomodoro(mode) {
      if (!this.currentRoom) return;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'pomo_vote_start', mode }));
        return;
      }
      const rooms = this._readLocalRooms();
      const room = rooms[this.currentRoom.code];
      if (!room) return;
      const me = room.members.find((m) => m.id === this.clientId);
      if (room.members.length <= 1) {
        this._broadcastLocal({ type: 'pomo_approved', roomCode: room.code, mode });
        return;
      }
      room.vote = {
        proposerId: this.clientId,
        proposerName: me ? me.name : 'Bạn',
        mode,
        yesIds: [this.clientId],
        noIds: [],
      };
      rooms[room.code] = room;
      this._writeLocalRooms(rooms);
      this._broadcastLocal({ type: 'room_state', roomCode: room.code, room });
    }

    castPomodoroVote(agree) {
      if (!this.currentRoom) return;
      if (this.mode === 'ws' && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ type: 'pomo_vote_cast', agree }));
        return;
      }
      const rooms = this._readLocalRooms();
      const room = rooms[this.currentRoom.code];
      if (!room || !room.vote) return;
      const me = room.members.find((m) => m.id === this.clientId);

      if (!agree) {
        room.vote = null;
        rooms[room.code] = room;
        this._writeLocalRooms(rooms);
        this._broadcastLocal({ type: 'pomo_rejected', roomCode: room.code, by: me ? me.name : 'Thành viên' });
        this._broadcastLocal({ type: 'room_state', roomCode: room.code, room });
        return;
      }
      if (!room.vote.yesIds.includes(this.clientId)) room.vote.yesIds.push(this.clientId);
      if (room.vote.yesIds.length >= room.members.length) {
        const mode = room.vote.mode;
        room.vote = null;
        rooms[room.code] = room;
        this._writeLocalRooms(rooms);
        this._broadcastLocal({ type: 'pomo_approved', roomCode: room.code, mode });
        this._broadcastLocal({ type: 'room_state', roomCode: room.code, room });
      } else {
        rooms[room.code] = room;
        this._writeLocalRooms(rooms);
        this._broadcastLocal({ type: 'room_state', roomCode: room.code, room });
      }
    }
  }

  CozyGarden.CoopClient = CoopClient;
})();
