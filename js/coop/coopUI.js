/* ==========================================================================
   Cozy Garden — Co-Working UI Controller (js/coop/coopUI.js)
   Manages Room Lobby, Room Code Creation/Joining, Live Chat, Quick Reactions,
   Focus Goal sharing & Unanimous Pomodoro Voting.
   ========================================================================== */

(function () {
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  class CoopUI {
    constructor(options = {}) {
      this.onEnterRoom = options.onEnterRoom;
      this.onUpdateMembers = options.onUpdateMembers;
      this.onLeaveRoom = options.onLeaveRoom;
      this.onReaction = options.onReaction;
      this.onChatSound = options.onChatSound;
      this.onVoiceSound = options.onVoiceSound;
      this.onPeerMoveEmote = options.onPeerMoveEmote;
      this.onRoomLevelChange = options.onRoomLevelChange;
      this.onPomoApproved = options.onPomoApproved;
      this.getOutfit = options.getOutfit || (() => 0);
      this.getAvatar = options.getAvatar || (() => null);

      this.selectedScene = 'coop_library';
      this.activeRoom = null;
      this.speakingIds = new Set();
      this.prevVoiceActiveIds = new Set();

      this._bindDOM();

      this.voice = CozyGarden.VoiceChat
        ? new CozyGarden.VoiceChat({
            getMyId: () => this.client.clientId,
            sendSignal: (targetId, signal) => this.client.sendVoiceSignal(targetId, signal),
            onVoiceStateChange: (vState) => {
              this.client.updateVoiceState(vState);
              this._updateVoiceButtons(vState);
            },
            onSpeakingChange: (set) => {
              this.speakingIds = set || new Set();
              this._refreshMemberSpeakingClasses();
            },
            onError: (msg) => this._appendChat('', `⚠️ ${msg}`, true),
          })
        : null;

      this.client = new CozyGarden.CoopClient({
        onRoomList: (rooms) => this._renderOpenRooms(rooms),
        onRoomState: (room) => this._handleRoomState(room),
        onChat: (msg) => {
          this._appendChat(msg.senderName, msg.text, false);
          if (this.onChatSound) this.onChatSound();
        },
        onSystem: (text) => this._appendChat('', text, true),
        onReaction: (msg) => {
          this._appendChat('', `${msg.senderName} thả ${msg.emoji} ${msg.text}`, true);
          if (this.onReaction) this.onReaction(msg.senderId, msg.emoji);
        },
        onPeerMoveEmote: (msg) => {
          if (this.onPeerMoveEmote) this.onPeerMoveEmote(msg.senderId, msg.pos, msg.emote);
        },
        onVoiceSignal: (msg) => {
          if (this.voice) this.voice.handleSignal(msg.senderId, msg.signal);
        },
        onPomoApproved: (mode) => {
          this._appendChat('', '🎉 Mọi người đã đồng ý! Bắt đầu phiên Pomodoro ngay!', true);
          this._hideVoteBanner();
          if (this.onPomoApproved) this.onPomoApproved(mode);
        },
        onPomoRejected: (by) => {
          this._appendChat('', `⏸ ${by} chưa sẵn sàng — hoãn bắt đầu Pomodoro.`, true);
          this._hideVoteBanner();
        },
        onError: (text) => {
          this.errorEl.textContent = text;
        },
      });
    }

    _bindDOM() {
      this.btnOpenCoop = document.getElementById('btnCoopMode');
      this.coopLabel = document.getElementById('coopLabel');
      this.modal = document.getElementById('coopModal');
      this.btnCloseModal = document.getElementById('btnCloseCoopModal');
      this.nameInput = document.getElementById('coopNameInput');
      this.goalInput = document.getElementById('coopGoalInput');
      this.codeInput = document.getElementById('coopCodeInput');
      this.btnCreate = document.getElementById('btnCoopCreate');
      this.btnJoin = document.getElementById('btnCoopJoin');
      this.sceneCards = Array.from(document.querySelectorAll('.coop-scene-card'));
      this.openList = document.getElementById('coopOpenRooms');
      this.errorEl = document.getElementById('coopError');

      this.dock = document.getElementById('coopDock');
      this.roomTitle = document.getElementById('coopRoomTitle');
      this.roomLevelBadge = document.getElementById('coopRoomLevelBadge');
      this.codeBadge = document.getElementById('coopCodeBadge');
      this.btnLeave = document.getElementById('btnCoopLeave');
      this.membersList = document.getElementById('coopMembersList');
      this.chatLog = document.getElementById('coopChatLog');
      this.chatForm = document.getElementById('coopChatForm');
      this.chatInput = document.getElementById('coopChatInput');
      this.reactionsRow = document.getElementById('coopReactionsRow');

      this.voteBanner = document.getElementById('coopVoteBanner');
      this.voteText = document.getElementById('coopVoteText');
      this.btnVoteYes = document.getElementById('btnVoteYes');
      this.btnVoteNo = document.getElementById('btnVoteNo');

      this.btnVoiceJoin = document.getElementById('btnVoiceJoin');
      this.btnVoiceMute = document.getElementById('btnVoiceMute');
      this.btnVoiceDeafen = document.getElementById('btnVoiceDeafen');
      this.voiceStatus = document.getElementById('voiceStatus');

      // Load saved nickname
      const savedName = localStorage.getItem('cozy_garden_nickname_v1');
      if (savedName) this.nameInput.value = savedName;

      this.btnOpenCoop.addEventListener('click', () => {
        this.errorEl.textContent = '';
        this.client.requestRoomList();
        this.modal.classList.remove('hidden');
      });
      this.btnCloseModal.addEventListener('click', () => this.modal.classList.add('hidden'));
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.modal.classList.add('hidden');
      });

      this.sceneCards.forEach((card) => {
        card.addEventListener('click', () => {
          this.selectedScene = card.dataset.coopScene;
          this.sceneCards.forEach((c) => c.classList.toggle('active', c === card));
        });
      });

      this.btnCreate.addEventListener('click', () => {
        const name = this._getNickname();
        this.errorEl.textContent = '';
        this.client.createRoom({
          sceneId: this.selectedScene,
          name,
          outfit: this.getOutfit(),
          avatar: this.getAvatar(),
          goal: this.goalInput.value.trim(),
        });
      });

      this.btnJoin.addEventListener('click', () => {
        const code = this.codeInput.value.trim().toUpperCase();
        if (!code) {
          this.errorEl.textContent = 'Hãy nhập mã phòng (6 ký tự).';
          return;
        }
        this.errorEl.textContent = '';
        this.client.joinRoom({
          code,
          name: this._getNickname(),
          outfit: this.getOutfit(),
          avatar: this.getAvatar(),
          goal: this.goalInput.value.trim(),
        });
      });

      this.btnLeave.addEventListener('click', () => this.leaveRoom());

      this.codeBadge.addEventListener('click', () => {
        if (!this.activeRoom) return;
        navigator.clipboard?.writeText(this.activeRoom.code).catch(() => {});
        const orig = this.codeBadge.textContent;
        this.codeBadge.textContent = '✓ Đã chép mã!';
        setTimeout(() => (this.codeBadge.textContent = orig), 1400);
      });

      this.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.chatInput.value.trim();
        if (!text) return;
        this.client.sendChat(text);
        this.chatInput.value = '';
      });

      // Populate quick silent reactions bar
      this.reactionsRow.innerHTML = '';
      (CozyGarden.COOP_REACTIONS || []).forEach((r) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'coop-react-btn';
        btn.textContent = r.emoji;
        btn.title = r.text;
        btn.addEventListener('click', () => this.client.sendReaction(r.emoji, r.text));
        this.reactionsRow.appendChild(btn);
      });

      this.btnVoteYes.addEventListener('click', () => this.client.castPomodoroVote(true));
      this.btnVoteNo.addEventListener('click', () => this.client.castPomodoroVote(false));

      if (this.btnVoiceJoin) {
        this.btnVoiceJoin.addEventListener('click', async () => {
          if (!this.voice) return;
          if (this.voice.active) {
            this.voice.leave();
          } else {
            await this.voice.join();
          }
        });
      }
      if (this.btnVoiceMute) {
        this.btnVoiceMute.addEventListener('click', () => {
          if (!this.voice || !this.voice.active) return;
          const nextMuted = !this.voice.muted;
          this.voice.setMuted(nextMuted);
          if (this.onVoiceSound) this.onVoiceSound(nextMuted ? 'mute' : 'unmute');
        });
      }
      if (this.btnVoiceDeafen) {
        this.btnVoiceDeafen.addEventListener('click', () => {
          if (!this.voice || !this.voice.active) return;
          this.voice.setDeafened(!this.voice.deafened);
          this._updateVoiceButtons({ active: this.voice.active, muted: this.voice.muted });
        });
      }
    }

    _getNickname() {
      const n = this.nameInput.value.trim() || `Bạn #${Math.floor(10 + Math.random() * 89)}`;
      localStorage.setItem('cozy_garden_nickname_v1', n);
      return n;
    }

    isInRoom() {
      return Boolean(this.activeRoom);
    }

    needsPomodoroVote() {
      return Boolean(this.activeRoom && this.activeRoom.members && this.activeRoom.members.length >= 2);
    }

    proposePomodoro(mode) {
      this.client.proposePomodoro(mode);
    }

    syncOutfit(outfitIdx) {
      if (this.activeRoom) this.client.updateProfile({ outfit: outfitIdx });
    }

    syncAvatar(avatar) {
      if (this.activeRoom) this.client.updateProfile({ outfit: avatar.shirt, avatar });
    }

    levelUpRoom() {
      if (this.activeRoom) this.client.levelUpRoom();
    }

    sendMoveEmote(pos, emote) {
      if (this.activeRoom) this.client.sendMoveEmote(pos, emote);
    }

    leaveRoom() {
      if (this.voice) this.voice.leave();
      this.prevVoiceActiveIds.clear();
      this.client.leaveRoom();
      this.activeRoom = null;
      document.body.classList.remove('in-coop');
      this.dock.classList.add('hidden');
      this._hideVoteBanner();
      this.coopLabel.textContent = 'Làm chung';
      if (this.onLeaveRoom) this.onLeaveRoom();
    }

    _updateVoiceButtons(vState) {
      const active = Boolean(vState && vState.active);
      const muted = Boolean(vState && vState.muted);
      const deafened = Boolean(this.voice && this.voice.deafened);

      if (this.btnVoiceJoin) {
        this.btnVoiceJoin.classList.toggle('active', active);
        this.btnVoiceJoin.textContent = active ? '📞 Rời thoại' : '🎙️ Vào thoại';
      }
      if (this.btnVoiceMute) {
        this.btnVoiceMute.classList.toggle('hidden', !active);
        this.btnVoiceMute.classList.toggle('muted', muted);
        this.btnVoiceMute.textContent = muted ? '🔇 Tắt Mic' : '🔊 Mic Bật';
      }
      if (this.btnVoiceDeafen) {
        this.btnVoiceDeafen.classList.toggle('hidden', !active);
        this.btnVoiceDeafen.classList.toggle('muted', deafened);
        this.btnVoiceDeafen.textContent = deafened ? '🔕 Tắt Loa' : '🔈 Loa Bật';
      }
      if (this.voiceStatus) {
        this.voiceStatus.textContent = !active
          ? 'Thoại: Tắt'
          : muted
            ? 'Mic đang tắt'
            : 'Đang mở Mic';
      }
    }

    _refreshMemberSpeakingClasses() {
      if (!this.membersList) return;
      Array.from(this.membersList.children).forEach((li) => {
        const mid = li.dataset.memberId;
        li.classList.toggle('speaking', Boolean(mid && this.speakingIds.has(mid)));
      });
    }

    _handleRoomState(room) {
      const prevRoom = this.activeRoom;
      const wasInRoom = Boolean(prevRoom && prevRoom.code === room.code);
      this.activeRoom = room;
      if (this.voice) this.voice.syncMembers(room.members);

      const nextVoiceIds = new Set(
        (room.members || []).filter((m) => m.voice && m.voice.active).map((m) => m.id)
      );
      if (wasInRoom) {
        const joinedVoice = (room.members || []).filter(
          (m) => nextVoiceIds.has(m.id) && !this.prevVoiceActiveIds.has(m.id)
        );
        const leftVoiceIds = Array.from(this.prevVoiceActiveIds).filter((id) => !nextVoiceIds.has(id));
        if (joinedVoice.length > 0 && this.onVoiceSound) {
          this.onVoiceSound('join');
          joinedVoice.forEach((m) => {
            if (m.id !== this.client.clientId) {
              this._appendChat('', `🎙️ ${m.name} đã tham gia thoại nhóm.`, true);
            }
          });
        } else if (leftVoiceIds.length > 0 && this.onVoiceSound) {
          this.onVoiceSound('leave');
        }
      }
      this.prevVoiceActiveIds = nextVoiceIds;
      document.body.classList.add('in-coop');
      this.modal.classList.add('hidden');
      this.dock.classList.remove('hidden');

      const sceneMeta = CozyGarden.COOP_SCENES[room.sceneId] || CozyGarden.COOP_SCENES.coop_library;
      this.roomTitle.textContent = `${sceneMeta.icon} ${sceneMeta.name}`;
      if (this.roomLevelBadge) this.roomLevelBadge.textContent = `Lv.${room.level || 0}/6`;
      this.codeBadge.textContent = `Mã: ${room.code}`;
      this.coopLabel.textContent = `${room.code} (${room.members.length}/4)`;
      if (this.onRoomLevelChange) this.onRoomLevelChange(room.level || 0);

      // Render members list (with live voice badge & speaking highlight!)
      this.membersList.innerHTML = '';
      room.members.forEach((m) => {
        const li = document.createElement('li');
        li.className = 'coop-member-item';
        li.dataset.memberId = m.id;
        if (this.speakingIds.has(m.id)) li.classList.add('speaking');
        const isMe = m.id === this.client.clientId;
        const vIcon = m.voice && m.voice.active ? (m.voice.muted ? ' 🔇' : ' 🎙️') : '';
        const left = document.createElement('span');
        left.textContent = `Ghế ${m.seat + 1} • ${m.name}${isMe ? ' (Bạn)' : ''}${vIcon}`;
        const right = document.createElement('span');
        right.className = 'coop-member-goal';
        right.textContent = m.goal || 'Đang tập trung';
        li.append(left, right);
        this.membersList.appendChild(li);
      });

      // Handle Pomodoro Vote Banner
      if (room.vote) {
        const modeNames = { micro: '5p Bắt đầu', focus: '25p Làm', break: '5p Nghỉ' };
        const yesCount = room.vote.yesIds.length;
        const total = room.members.length;
        const iVoted = room.vote.yesIds.includes(this.client.clientId);
        this.voteText.textContent = `🍅 ${room.vote.proposerName} mời bắt đầu ${modeNames[room.vote.mode] || '25p'} (${yesCount}/${total} đồng ý)`;
        this.btnVoteYes.disabled = iVoted;
        this.btnVoteYes.textContent = iVoted ? '✓ Đã đồng ý' : '✓ Đồng ý';
        this.voteBanner.classList.remove('hidden');
      } else {
        this._hideVoteBanner();
      }

      if (!wasInRoom) {
        this.chatLog.innerHTML = '';
        if (this.onEnterRoom) this.onEnterRoom(room.sceneId, room.members, this.client.clientId);
      } else if (this.onUpdateMembers) {
        this.onUpdateMembers(room.members, this.client.clientId);
      }
    }

    _hideVoteBanner() {
      this.voteBanner.classList.add('hidden');
    }

    _appendChat(sender, text, isSystem) {
      const div = document.createElement('div');
      div.className = `chat-msg${isSystem ? ' system' : ''}`;
      if (isSystem) {
        div.textContent = text;
      } else {
        const s = document.createElement('span');
        s.className = 'sender';
        s.textContent = `${sender}:`;
        div.append(s, document.createTextNode(text));
      }
      this.chatLog.appendChild(div);
      this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    _renderOpenRooms(rooms) {
      this.openList.innerHTML = '';
      if (!rooms || rooms.length === 0) {
        const li = document.createElement('li');
        li.className = 'coop-open-item';
        li.textContent = 'Chưa có phòng nào đang mở — hãy tạo phòng mới nhé!';
        this.openList.appendChild(li);
        return;
      }
      rooms.forEach((r) => {
        const meta = CozyGarden.COOP_SCENES[r.sceneId] || CozyGarden.COOP_SCENES.coop_library;
        const li = document.createElement('li');
        li.className = 'coop-open-item';
        const info = document.createElement('span');
        info.textContent = `${meta.icon} ${meta.name} • Mã ${r.code} (${r.count}/4)`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip active';
        btn.textContent = 'Vào';
        btn.addEventListener('click', () => {
          this.client.joinRoom({
            code: r.code,
            name: this._getNickname(),
            outfit: this.getOutfit(),
            avatar: this.getAvatar(),
            goal: this.goalInput.value.trim(),
          });
        });
        li.append(info, btn);
        this.openList.appendChild(li);
      });
    }
  }

  CozyGarden.CoopUI = CoopUI;
})();
