/* ==========================================================================
   Cozy Garden — Zero-Dependency HTTP + WebSocket Co-Working Server
   Run with: node server/coworkServer.js
   Supports 2-4 players per room, room codes, live chat, reactions & Pomodoro vote.
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// In-memory rooms: code -> { code, sceneId, members: Map<id, member>, vote: null | {...} }
const rooms = new Map();
const clients = new Map(); // socket -> { id, roomCode }

function sendWs(socket, payload) {
  if (!socket || socket.destroyed) return;
  const json = Buffer.from(JSON.stringify(payload), 'utf8');
  const len = json.length;
  let header;
  if (len < 126) {
    header = Buffer.from([0x81, len]);
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  try {
    socket.write(Buffer.concat([header, json]));
  } catch (_) {}
}

function broadcastRoom(code, payload) {
  const room = rooms.get(code);
  if (!room) return;
  for (const m of room.members.values()) {
    sendWs(m.socket, payload);
  }
}

function serializeRoom(room) {
  return {
    code: room.code,
    sceneId: room.sceneId,
    level: room.level || 0,
    hostId: room.hostId || null,
    members: Array.from(room.members.values()).map((m) => ({
      id: m.id,
      name: m.name,
      outfit: m.outfit,
      avatar: m.avatar || null,
      seat: m.seat,
      goal: m.goal || '',
      pos: m.pos || null,
      emote: m.emote || 'idle',
      voice: m.voice || { active: false, muted: false },
    })),
    vote: room.vote
      ? {
          proposerId: room.vote.proposerId,
          proposerName: room.vote.proposerName,
          mode: room.vote.mode,
          yesIds: Array.from(room.vote.yesIds),
          noIds: Array.from(room.vote.noIds),
        }
      : null,
  };
}

function getRoomList() {
  const list = [];
  for (const r of rooms.values()) {
    list.push({ code: r.code, sceneId: r.sceneId, count: r.members.size });
  }
  return list;
}

function broadcastRoomList() {
  const list = getRoomList();
  for (const sock of clients.keys()) {
    sendWs(sock, { type: 'room_list', rooms: list });
  }
}

function leaveCurrentRoom(socket) {
  const meta = clients.get(socket);
  if (!meta || !meta.roomCode) return;
  const room = rooms.get(meta.roomCode);
  if (room) {
    const member = room.members.get(meta.id);
    room.members.delete(meta.id);
    if (room.vote) {
      room.vote.yesIds.delete(meta.id);
      room.vote.noIds.delete(meta.id);
    }
    if (room.members.size === 0) {
      rooms.delete(meta.roomCode);
    } else {
      if (member) {
        broadcastRoom(room.code, { type: 'voice_signal', senderId: meta.id, signal: { kind: 'leave' } });
        broadcastRoom(room.code, { type: 'system', text: `${member.name} đã rời phòng.` });
      }
      // If Host left, randomly transfer Host role to one of the remaining members!
      if (room.hostId === meta.id) {
        const remaining = Array.from(room.members.values());
        const nextHost = remaining[Math.floor(Math.random() * remaining.length)];
        room.hostId = nextHost.id;
        broadcastRoom(room.code, {
          type: 'system',
          text: `👑 Quyền trưởng phòng đã tự động chuyển cho ${nextHost.name}!`,
        });
      }
      broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
    }
  }
  meta.roomCode = null;
  broadcastRoomList();
}

function handleMessage(socket, msg) {
  const meta = clients.get(socket);
  if (!meta) return;

  if (msg.type === 'list_rooms') {
    sendWs(socket, { type: 'room_list', rooms: getRoomList() });
    return;
  }

  if (msg.type === 'create_room' || msg.type === 'join_room') {
    leaveCurrentRoom(socket);
    const code = String(msg.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!code) return;

    let room = rooms.get(code);
    if (msg.type === 'create_room') {
      if (!room) {
        room = {
          code,
          sceneId: msg.sceneId || 'coop_library',
          level: 0,
          hostId: meta.id,
          members: new Map(),
          vote: null,
        };
        rooms.set(code, room);
      }
    } else if (!room) {
      sendWs(socket, { type: 'error', text: `Không tìm thấy phòng mã "${code}".` });
      return;
    }

    if (room.members.size >= 4) {
      sendWs(socket, { type: 'error', text: `Phòng "${code}" đã đủ 4/4 người.` });
      return;
    }

    // Assign first free seat 0..3
    const usedSeats = new Set(Array.from(room.members.values()).map((m) => m.seat));
    let seat = 0;
    while (usedSeats.has(seat) && seat < 4) seat++;

    const name = String(msg.name || 'Bạn học').slice(0, 18);
    room.members.set(meta.id, {
      id: meta.id,
      socket,
      name,
      outfit: Number(msg.outfit) || 0,
      avatar: msg.avatar || null,
      seat,
      goal: String(msg.goal || '').slice(0, 50),
    });
    meta.roomCode = code;

    broadcastRoom(code, { type: 'room_state', room: serializeRoom(room) });
    broadcastRoom(code, { type: 'system', text: `${name} đã tham gia phòng (Ghế #${seat + 1}).` });
    broadcastRoomList();
    return;
  }

  if (msg.type === 'leave_room') {
    leaveCurrentRoom(socket);
    return;
  }

  const room = meta.roomCode ? rooms.get(meta.roomCode) : null;
  if (!room) return;
  const sender = room.members.get(meta.id);
  if (!sender) return;

  if (msg.type === 'chat') {
    const text = String(msg.text || '').trim().slice(0, 180);
    if (!text) return;
    broadcastRoom(room.code, {
      type: 'chat',
      senderId: sender.id,
      senderName: sender.name,
      text,
      ts: Date.now(),
    });
  } else if (msg.type === 'reaction') {
    broadcastRoom(room.code, {
      type: 'reaction',
      senderId: sender.id,
      senderName: sender.name,
      emoji: String(msg.emoji || '✨').slice(0, 4),
      text: String(msg.text || '').slice(0, 30),
    });
  } else if (msg.type === 'update_profile') {
    if (typeof msg.outfit === 'number') sender.outfit = msg.outfit;
    if (msg.avatar) sender.avatar = msg.avatar;
    if (typeof msg.goal === 'string') sender.goal = msg.goal.slice(0, 50);
    broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
  } else if (msg.type === 'room_level_up') {
    room.level = Math.min(6, (room.level || 0) + 1);
    broadcastRoom(room.code, { type: 'system', text: `🎉 Phòng chung đã lên cấp Lv.${room.level}! Mở khóa vật phẩm mới!` });
    broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
  } else if (msg.type === 'move_emote') {
    if (msg.pos) sender.pos = msg.pos;
    if (msg.emote) sender.emote = String(msg.emote).slice(0, 16);
    broadcastRoom(room.code, {
      type: 'peer_move_emote',
      senderId: sender.id,
      pos: sender.pos,
      emote: sender.emote,
    });
  } else if (msg.type === 'voice_state') {
    sender.voice = {
      active: Boolean(msg.voice && msg.voice.active),
      muted: Boolean(msg.voice && msg.voice.muted),
    };
    broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
  } else if (msg.type === 'voice_signal') {
    const packet = {
      type: 'voice_signal',
      senderId: sender.id,
      targetId: msg.targetId || null,
      signal: msg.signal,
    };
    if (msg.targetId) {
      const target = room.members.get(msg.targetId);
      if (target && target.id !== sender.id) sendWs(target.socket, packet);
    } else {
      for (const m of room.members.values()) {
        if (m.id !== sender.id) sendWs(m.socket, packet);
      }
    }
  } else if (msg.type === 'room_alert') {
    const text = String(msg.text || 'có chuyện muốn nói!').trim().slice(0, 80);
    broadcastRoom(room.code, {
      type: 'room_alert',
      senderId: sender.id,
      senderName: sender.name,
      text,
    });
  } else if (msg.type === 'peer_interact') {
    const target = room.members.get(msg.targetId);
    if (!target || target.id === sender.id) return;
    const action = ['bonk', 'hug', 'poke'].includes(msg.action) ? msg.action : 'bonk';
    broadcastRoom(room.code, {
      type: 'peer_interact',
      senderId: sender.id,
      senderName: sender.name,
      targetId: target.id,
      targetName: target.name,
      action,
    });
  } else if (msg.type === 'transfer_host') {
    if (room.hostId !== sender.id) return;
    const target = room.members.get(msg.targetId);
    if (!target || target.id === sender.id) return;
    room.hostId = target.id;
    broadcastRoom(room.code, {
      type: 'system',
      text: `👑 ${sender.name} đã nhượng quyền trưởng phòng cho ${target.name}!`,
    });
    broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
  } else if (msg.type === 'pomo_force_mode') {
    if (room.hostId !== sender.id) return;
    const mode = ['micro', 'focus', 'break'].includes(msg.mode) ? msg.mode : 'break';
    room.vote = null;
    broadcastRoom(room.code, { type: 'pomo_approved', mode, forcedBy: sender.name });
    broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
  } else if (msg.type === 'pomo_vote_start') {
    const mode = ['micro', 'focus', 'break'].includes(msg.mode) ? msg.mode : 'focus';
    room.vote = {
      proposerId: sender.id,
      proposerName: sender.name,
      mode,
      yesIds: new Set([sender.id]),
      noIds: new Set(),
    };
    if (room.members.size <= 1) {
      room.vote = null;
      broadcastRoom(room.code, { type: 'pomo_approved', mode });
    } else {
      broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
    }
  } else if (msg.type === 'pomo_vote_cast') {
    if (!room.vote) return;
    if (msg.agree) {
      room.vote.yesIds.add(sender.id);
      room.vote.noIds.delete(sender.id);
    } else {
      room.vote.noIds.add(sender.id);
      room.vote.yesIds.delete(sender.id);
    }
    if (room.vote.noIds.size > 0) {
      const rejectName = sender.name;
      room.vote = null;
      broadcastRoom(room.code, { type: 'pomo_rejected', by: rejectName });
      broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
    } else if (room.vote.yesIds.size >= room.members.size) {
      const approvedMode = room.vote.mode;
      room.vote = null;
      broadcastRoom(room.code, { type: 'pomo_approved', mode: approvedMode });
      broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
    } else {
      broadcastRoom(room.code, { type: 'room_state', room: serializeRoom(room) });
    }
  }
}

// Static HTTP Server
const server = http.createServer((req, res) => {
  const cleanUrl = (req.url || '/').split('?')[0];
  const filePath = path.join(ROOT_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// Minimal RFC 6455 WebSocket Upgrade Handler
server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }
  const accept = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );

  const clientId = 'u_' + crypto.randomBytes(4).toString('hex');
  clients.set(socket, { id: clientId, roomCode: null });
  sendWs(socket, { type: 'welcome', id: clientId, rooms: getRoomList() });

  let buffer = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 2) {
      const opcode = buffer[0] & 0x0f;
      const masked = (buffer[1] & 0x80) !== 0;
      let payloadLen = buffer[1] & 0x7f;
      let offset = 2;
      if (payloadLen === 126) {
        if (buffer.length < 4) return;
        payloadLen = buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLen === 127) {
        if (buffer.length < 10) return;
        payloadLen = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }
      const totalLen = offset + (masked ? 4 : 0) + payloadLen;
      if (buffer.length < totalLen) return;

      let payload = buffer.subarray(offset + (masked ? 4 : 0), totalLen);
      if (masked) {
        const mask = buffer.subarray(offset, offset + 4);
        const unmasked = Buffer.alloc(payloadLen);
        for (let i = 0; i < payloadLen; i++) unmasked[i] = payload[i] ^ mask[i % 4];
        payload = unmasked;
      }
      buffer = buffer.subarray(totalLen);

      if (opcode === 0x8) {
        leaveCurrentRoom(socket);
        clients.delete(socket);
        socket.end();
        return;
      }
      if (opcode === 0x1) {
        try {
          handleMessage(socket, JSON.parse(payload.toString('utf8')));
        } catch (_) {}
      }
    }
  });

  socket.on('end', () => {
    leaveCurrentRoom(socket);
    clients.delete(socket);
  });
  socket.on('close', () => {
    leaveCurrentRoom(socket);
    clients.delete(socket);
  });
  socket.on('error', () => {
    leaveCurrentRoom(socket);
    clients.delete(socket);
  });
});

server.listen(PORT, () => {
  console.log(`Cozy Garden Co-Working Server running at http://localhost:${PORT}`);
});
