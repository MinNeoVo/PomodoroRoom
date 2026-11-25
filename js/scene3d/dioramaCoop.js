/* ==========================================================================
   Cozy Garden — 3 Four-Seat Co-Working 3D Dioramas (js/scene3d/dioramaCoop.js)
   - coop_library: Grand Library with 4-seat oak table & emerald banker lamps
   - coop_cafe: Communal Cafe Lounge with 4 seats, espresso bar & Edison lights
   - coop_beach: Chill Beach Deck with palms, ocean waves & 4 lounge work spots
   Includes 3D peer avatars, floating nameplates & 3D emoji reaction popups!
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  class DioramaCoop3D {
    constructor(scene, tagInteractable) {
      this.scene = scene;
      this.tagInteractable = tagInteractable;
      this.activeCoopId = null;

      this.root = new THREE.Group();
      this.root.visible = false;
      scene.add(this.root);

      this.scenes = {
        coop_library: this._buildLibrary(),
        coop_cafe: this._buildCafe(),
        coop_beach: this._buildBeach(),
      };
      this.roomLevel = 0;
      Object.values(this.scenes).forEach((s) => {
        s.group.visible = false;
        this.root.add(s.group);
      });
      this._buildCoopUnlocks();

      // Up to 3 peer 3D avatars + nameplates for seats 0..3
      this.peerChars = [];
      for (let i = 0; i < 3; i++) {
        const ch = new CozyGarden.Character3D(this.root, () => {});
        ch.group.visible = false;
        this.peerChars.push(ch);
      }

      this.nameplates = {}; // memberId -> THREE.Sprite
      this.reactions3D = []; // active rising emoji sprites
      this.memberAnchors = {}; // memberId -> Vector3
    }

    _makeLaptop(x, y, z, rotY) {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.028, 0.32),
        new THREE.MeshStandardMaterial({ color: 0xe6e6ee })
      );
      const lid = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.28, 0.022),
        new THREE.MeshStandardMaterial({ color: 0xd9d9e3 })
      );
      lid.position.set(0, 0.14, -0.15);
      lid.rotation.x = -0.2;
      const scr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.37, 0.23),
        new THREE.MeshBasicMaterial({ color: 0xb8d4ff })
      );
      scr.position.set(0, 0.14, -0.135);
      scr.rotation.x = -0.2;
      g.add(base, lid, scr);
      return g;
    }

    _makeChair(x, y, z, rotY, col) {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.48), mat);
      seat.position.y = 0.45;
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.54, 0.07), mat);
      back.position.set(0, 0.72, 0.22);
      [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]].forEach(([lx, lz]) => {
        const l = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.45, 6), mat);
        l.position.set(lx, 0.225, lz);
        g.add(l);
      });
      g.add(seat, back);
      return g;
    }

    /* ---------------- 1. Shared 4-Seat Library ---------------- */
    _buildLibrary() {
      const group = new THREE.Group();
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.34, 7.2),
        new THREE.MeshStandardMaterial({ color: 0x6b4534, roughness: 0.85 })
      );
      floor.receiveShadow = true;
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x4f342d, roughness: 0.9 });
      const wallZ = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.8, 0.24), wallMat);
      wallZ.position.set(0, 2.05, -3.48);
      const wallX = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.8, 7.2), wallMat);
      wallX.position.set(-3.48, 2.05, 0);
      group.add(floor, wallZ, wallX);

      // Tall Bookshelves along back wall
      const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3b241c });
      const bookCols = [0xa84a4a, 0x4a7568, 0xd4a459, 0x5b6a94, 0x8c5a7a];
      for (let bay = -1; bay <= 1; bay++) {
        const bx = bay * 2.05;
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.85, 3.2, 0.45), shelfMat);
        frame.position.set(bx, 1.75, -3.12);
        group.add(frame);
        for (let row = 0; row < 4; row++) {
          for (let b = 0; b < 6; b++) {
            const bk = new THREE.Mesh(
              new THREE.BoxGeometry(0.22, 0.44, 0.32),
              new THREE.MeshStandardMaterial({ color: bookCols[(row * 3 + b + bay + 5) % bookCols.length] })
            );
            bk.position.set(bx - 0.65 + b * 0.26, 0.68 + row * 0.72, -3.02);
            group.add(bk);
          }
        }
      }

      // Large Shared 4-Seat Oak Reading Table in center
      const oak = new THREE.MeshStandardMaterial({ color: 0x7d503a, roughness: 0.78 });
      const top = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.75), oak);
      top.position.set(0.15, 0.95, 0.25);
      top.castShadow = true;
      top.receiveShadow = true;
      group.add(top);
      [[-1.35, -0.45], [1.65, -0.45], [-1.35, 0.95], [1.65, 0.95]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.78, 0.11), oak);
        leg.position.set(lx, 0.56, lz);
        group.add(leg);
      });

      // Two Emerald Banker's Lamps in center of table
      [-0.75, 1.05].forEach((lx) => {
        const lamp = new THREE.Group();
        lamp.position.set(lx, 1.02, 0.25);
        const shade = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.18, 0.24),
          new THREE.MeshStandardMaterial({ color: 0x2d7a59, emissive: 0x1d5940, emissiveIntensity: 0.7 })
        );
        shade.position.y = 0.42;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0xd4a85d }));
        stem.position.y = 0.2;
        const light = new THREE.PointLight(0xffcf82, 1.35, 7);
        light.position.y = 0.35;
        lamp.add(stem, shade, light);
        group.add(lamp);
      });

      // 4 Seats (2 on front side facing -Z, 2 on back side facing +Z — flush on chair seats, hands on laptops!)
      const seats = [
        { x: -0.65, y: 0.49, z: 1.24, rotY: 0 },
        { x: 0.95, y: 0.49, z: 1.24, rotY: 0 },
        { x: -0.65, y: 0.49, z: -0.74, rotY: Math.PI },
        { x: 0.95, y: 0.49, z: -0.74, rotY: Math.PI },
      ];
      seats.forEach((s) => {
        group.add(this._makeChair(s.x, 0.17, s.z, s.rotY, 0x4f352e));
        const lapZ = s.rotY === 0 ? 0.88 : -0.38;
        group.add(this._makeLaptop(s.x, 1.02, lapZ, s.rotY));
      });

      return { group, seats };
    }

    /* ---------------- 2. Shared 4-Seat Cafe Lounge ---------------- */
    _buildCafe() {
      const group = new THREE.Group();
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.34, 7.2),
        new THREE.MeshStandardMaterial({ color: 0xa67f5e, roughness: 0.85 })
      );
      floor.receiveShadow = true;
      const wallWarm = new THREE.MeshStandardMaterial({ color: 0xd9c2ab, roughness: 0.9 });
      const wallZ = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.6, 0.24), wallWarm);
      wallZ.position.set(0, 1.95, -3.48);
      const wallX = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.6, 7.2), wallWarm);
      wallX.position.set(-3.48, 1.95, 0);
      group.add(floor, wallZ, wallX);

      // Back Espresso Counter & Menu Board
      const bar = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.0, 0.85), new THREE.MeshStandardMaterial({ color: 0x5c3a2a }));
      bar.position.set(0.5, 0.67, -2.55);
      const menu = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.05, 0.08), new THREE.MeshStandardMaterial({ color: 0x242e29 }));
      menu.position.set(0.5, 2.55, -3.3);
      group.add(bar, menu);

      // Communal 4-Seat Timber Cafe Table
      const tblMat = new THREE.MeshStandardMaterial({ color: 0x85553b, roughness: 0.8 });
      const top = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.65), tblMat);
      top.position.set(0.15, 0.95, 0.45);
      top.castShadow = true;
      group.add(top);
      [[-1.35, -0.2], [1.65, -0.2], [-1.35, 1.1], [1.65, 1.1]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.78, 8), new THREE.MeshStandardMaterial({ color: 0x2b2625 }));
        leg.position.set(lx, 0.56, lz);
        group.add(leg);
      });

      // Warm Hanging Edison Pendant Lights
      [-0.75, 1.05].forEach((lx) => {
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd98e }));
        bulb.position.set(lx, 2.85, 0.45);
        const light = new THREE.PointLight(0xffbe73, 1.4, 8);
        light.position.set(lx, 2.75, 0.45);
        group.add(bulb, light);
      });

      const seats = [
        { x: -0.65, y: 0.49, z: 1.40, rotY: 0 },
        { x: 0.95, y: 0.49, z: 1.40, rotY: 0 },
        { x: -0.65, y: 0.49, z: -0.50, rotY: Math.PI },
        { x: 0.95, y: 0.49, z: -0.50, rotY: Math.PI },
      ];
      seats.forEach((s) => {
        group.add(this._makeChair(s.x, 0.17, s.z, s.rotY, 0x734935));
        const lapZ = s.rotY === 0 ? 1.04 : -0.14;
        group.add(this._makeLaptop(s.x, 1.02, lapZ, s.rotY));
      });

      return { group, seats };
    }

    /* ---------------- 3. Chill 4-Seat Beach Cabana Deck ---------------- */
    _buildBeach() {
      const group = new THREE.Group();

      // Turquoise ocean base slab + golden sandy beach + wooden deck
      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(5.6, 5.4, 0.25, 28),
        new THREE.MeshStandardMaterial({ color: 0x5cb3cc, roughness: 0.22, metalness: 0.12 })
      );
      water.position.y = -0.12;
      const sand = new THREE.Mesh(
        new THREE.CylinderGeometry(4.2, 4.6, 0.32, 24),
        new THREE.MeshStandardMaterial({ color: 0xebd1a4, roughness: 0.92 })
      );
      sand.position.set(-0.4, 0.02, -0.2);
      sand.receiveShadow = true;
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.14, 3.6),
        new THREE.MeshStandardMaterial({ color: 0x9c6e4e, roughness: 0.85 })
      );
      deck.position.set(-0.2, 0.2, -0.1);
      deck.receiveShadow = true;
      group.add(water, sand, deck);

      // Two Swaying Palm Trees framing the beach deck
      const barkMat = new THREE.MeshStandardMaterial({ color: 0x6e4a35 });
      const palmMat = new THREE.MeshStandardMaterial({ color: 0x4f9153, flatShading: true });
      [[-3.0, -2.0], [2.6, -2.3]].forEach(([px, pz], idx) => {
        const palm = new THREE.Group();
        palm.position.set(px, 0.2, pz);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 3.2, 8), barkMat);
        trunk.position.y = 1.6;
        trunk.rotation.z = idx === 0 ? -0.18 : 0.18;
        palm.add(trunk);
        for (let f = 0; f < 6; f++) {
          const frond = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.45, 5), palmMat);
          const a = (f / 6) * Math.PI * 2;
          frond.position.set(Math.cos(a) * 0.55 + (idx === 0 ? 0.28 : -0.28), 3.15, Math.sin(a) * 0.55);
          frond.rotation.z = -Math.cos(a) * 1.1;
          frond.rotation.x = Math.sin(a) * 1.1;
          palm.add(frond);
        }
        group.add(palm);
      });

      // Shared Beach Timber Table + String Light Poles
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.12, 1.55), new THREE.MeshStandardMaterial({ color: 0xb5845e }));
      tbl.position.set(-0.15, 0.98, 0.05);
      tbl.castShadow = true;
      group.add(tbl);
      [[-1.6, -0.55], [1.3, -0.55], [-1.6, 0.65], [1.3, 0.65]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.72, 0.1), new THREE.MeshStandardMaterial({ color: 0x7a543f }));
        leg.position.set(lx, 0.6, lz);
        group.add(leg);
      });

      // Overhead warm beach string lights
      for (let i = 0; i < 6; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffe299 }));
        b.position.set(-2.2 + i * 0.85, 2.75 - Math.sin((i / 5) * Math.PI) * 0.3, -1.5);
        group.add(b);
      }

      const seats = [
        { x: -0.95, y: 0.57, z: 0.98, rotY: 0 },
        { x: 0.65, y: 0.57, z: 0.98, rotY: 0 },
        { x: -0.95, y: 0.57, z: -0.88, rotY: Math.PI },
        { x: 0.65, y: 0.57, z: -0.88, rotY: Math.PI },
      ];
      seats.forEach((s) => {
        group.add(this._makeChair(s.x, 0.25, s.z, s.rotY, 0x5ca3a3));
        const lapZ = s.rotY === 0 ? 0.62 : -0.52;
        group.add(this._makeLaptop(s.x, 1.05, lapZ, s.rotY));
      });

      return { group, seats };
    }

    /* ---------------- Shared Room Level Unlocks (Lv 1..6 per Coop Scene) ---------------- */
    _buildCoopUnlocks() {
      this.coopUnlocks = { coop_library: {}, coop_cafe: {}, coop_beach: {} };
      const addU = (sceneKey, lv, mesh) => {
        const g = this.coopUnlocks[sceneKey][lv] || new THREE.Group();
        if (!this.coopUnlocks[sceneKey][lv]) {
          this.coopUnlocks[sceneKey][lv] = g;
          this.scenes[sceneKey].group.add(g);
        }
        g.add(mesh);
        g.visible = false;
      };

      // Library Shared Unlocks (Lv 1..6)
      const libPlant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), new THREE.MeshStandardMaterial({ color: 0x4f8c5c }));
      libPlant.position.set(2.65, 0.85, 2.35);
      addU('coop_library', 1, libPlant);
      for (let i = 0; i < 6; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffe099 }));
        b.position.set(-2.2 + i * 0.9, 3.3, -2.5);
        addU('coop_library', 2, b);
      }
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), new THREE.MeshStandardMaterial({ color: 0x5ca3c4, metalness: 0.2 }));
      globe.position.set(0.15, 1.32, 0.25);
      addU('coop_library', 3, globe);
      const teaSet = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 10), new THREE.MeshStandardMaterial({ color: 0xf7efe4 }));
      teaSet.position.set(-1.35, 1.12, 0.25);
      addU('coop_library', 4, teaSet);
      const chandelier = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 8, 18), new THREE.MeshStandardMaterial({ color: 0xd4a85d, emissive: 0x8c6828, emissiveIntensity: 0.6 }));
      chandelier.rotation.x = Math.PI / 2;
      chandelier.position.set(0.15, 3.25, 0.25);
      addU('coop_library', 5, chandelier);
      const libOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 1), new THREE.MeshBasicMaterial({ color: 0xffe8a3 }));
      libOrb.position.set(0.15, 3.55, 0.25);
      addU('coop_library', 6, libOrb);

      // Cafe Shared Unlocks (Lv 1..6)
      const cafePlant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), new THREE.MeshStandardMaterial({ color: 0x458559 }));
      cafePlant.position.set(2.65, 0.85, 2.35);
      addU('coop_cafe', 1, cafePlant);
      const pastry = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.07, 6, 12), new THREE.MeshStandardMaterial({ color: 0xe6a15c }));
      pastry.rotation.x = Math.PI / 2;
      pastry.position.set(0.15, 1.08, 0.45);
      addU('coop_cafe', 2, pastry);
      const spk = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.72, 0.36), new THREE.MeshStandardMaterial({ color: 0x5c3e2e }));
      spk.position.set(-2.65, 0.55, 2.25);
      addU('coop_cafe', 3, spk);
      for (let i = 0; i < 6; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffd285 }));
        b.position.set(-2.2 + i * 0.9, 3.2, -2.1);
        addU('coop_cafe', 4, b);
      }
      const roaster = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.85, 12), new THREE.MeshStandardMaterial({ color: 0xd4a254, metalness: 0.5 }));
      roaster.position.set(2.55, 0.6, -1.65);
      addU('coop_cafe', 5, roaster);
      const neonRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 8, 18), new THREE.MeshBasicMaterial({ color: 0xffe08a }));
      neonRing.position.set(0.5, 3.2, -3.28);
      addU('coop_cafe', 6, neonRing);

      // Beach Shared Unlocks (Lv 1..6)
      const fire = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 6), new THREE.MeshBasicMaterial({ color: 0xff8c42 }));
      fire.position.set(2.35, 0.52, 1.55);
      addU('coop_beach', 1, fire);
      const board = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 1.15, 4, 8), new THREE.MeshStandardMaterial({ color: 0x73daca }));
      board.position.set(-2.75, 0.95, 1.35);
      board.rotation.z = 0.25;
      addU('coop_beach', 2, board);
      const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0xf7768e, flatShading: true }));
      umbrella.position.set(2.45, 2.25, 0.85);
      addU('coop_beach', 3, umbrella);
      const boat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.26, 0.55), new THREE.MeshStandardMaterial({ color: 0x8c5e43 }));
      boat.position.set(3.85, 0.05, 1.85);
      addU('coop_beach', 4, boat);
      for (let i = 0; i < 4; i++) {
        const lant = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd98e }));
        lant.position.set(-1.8 + i * 1.2, 2.55, 1.65);
        addU('coop_beach', 5, lant);
      }
      const balloon = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffe08a, flatShading: true }));
      balloon.position.set(-3.4, 4.1, -2.5);
      addU('coop_beach', 6, balloon);
    }

    setRoomLevel(level) {
      this.roomLevel = Math.max(0, Math.min(6, Number(level) || 0));
      Object.values(this.coopUnlocks).forEach((map) => {
        for (let lv = 1; lv <= 6; lv++) {
          if (map[lv]) map[lv].visible = this.roomLevel >= lv;
        }
      });
    }

    /* ---------------- Multi-Player Sync & Floating Nameplates ---------------- */
    _createNameplate(text, isMe) {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 56;
      const ctx = c.getContext('2d');
      ctx.fillStyle = isMe ? 'rgba(245, 185, 113, 0.92)' : 'rgba(26, 22, 32, 0.82)';
      ctx.beginPath();
      ctx.roundRect(12, 8, 232, 40, 14);
      ctx.fill();
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.fillStyle = isMe ? '#1f1612' : '#fff8f0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.slice(0, 14), 128, 29);

      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      sp.scale.set(1.5, 0.33, 1);
      return sp;
    }

    setActiveCoop(coopId) {
      this.activeCoopId = coopId;
      this.root.visible = Boolean(coopId);
      Object.entries(this.scenes).forEach(([k, s]) => {
        s.group.visible = k === coopId;
      });
    }

    syncMembers(members, myId, mainCharacter, pomoMode, breakActivity) {
      if (!this.activeCoopId || !this.scenes[this.activeCoopId]) return;
      const seats = this.scenes[this.activeCoopId].seats;

      // Clear old nameplates
      Object.values(this.nameplates).forEach((sp) => this.root.remove(sp));
      this.nameplates = {};
      this.memberAnchors = {};
      this.peerChars.forEach((p) => (p.group.visible = false));

      let peerIdx = 0;
      this.peerIdMap = {};
      members.forEach((m) => {
        const seat = seats[m.seat % seats.length];
        const pos = m.pos || { x: seat.x, y: seat.y, z: seat.z, rotY: seat.rotY };
        this.memberAnchors[m.id] = new THREE.Vector3(pos.x, pos.y, pos.z);

        const plate = this._createNameplate(m.id === myId ? `${m.name} (Bạn)` : m.name, m.id === myId);
        plate.position.set(pos.x, pos.y + 1.65, pos.z);
        this.root.add(plate);
        this.nameplates[m.id] = plate;

        const outfit = CozyGarden.OUTFITS_3D[m.outfit % CozyGarden.OUTFITS_3D.length];
        if (m.id === myId) {
          if (m.avatar) mainCharacter.applyAvatar(m.avatar);
          else mainCharacter.applyOutfit(outfit);
          if (pomoMode !== 'break') {
            mainCharacter.setEmote('idle');
            mainCharacter.setPose(pomoMode, breakActivity, seat);
          } else {
            mainCharacter.setPose(pomoMode, breakActivity, { x: seat.x, y: seat.y, z: seat.z, rotY: 3.7 });
          }
        } else if (peerIdx < this.peerChars.length) {
          const peer = this.peerChars[peerIdx++];
          peer.group.visible = true;
          if (m.avatar) peer.applyAvatar(m.avatar);
          else peer.applyOutfit(outfit);
          peer.setPose(pomoMode, breakActivity, pos);
          peer.setEmote(pomoMode === 'break' ? (m.emote || 'idle') : 'idle');
          this.peerIdMap[m.id] = peer;
        }
      });
    }

    updatePeerTransform(memberId, pos, emote) {
      const peer = this.peerIdMap && this.peerIdMap[memberId];
      if (!peer) return;
      if (pos) {
        peer.group.position.set(pos.x, pos.y, pos.z);
        peer.group.rotation.y = pos.rotY || 0;
        if (this.nameplates[memberId]) {
          this.nameplates[memberId].position.set(pos.x, pos.y + 1.65, pos.z);
        }
        this.memberAnchors[memberId] = new THREE.Vector3(pos.x, pos.y, pos.z);
      }
      if (emote) peer.setEmote(emote);
    }

    updateMyNameplate(myId, pos) {
      if (this.nameplates[myId] && pos) {
        this.nameplates[myId].position.set(pos.x, pos.y + 1.65, pos.z);
        this.memberAnchors[myId] = new THREE.Vector3(pos.x, pos.y, pos.z);
      }
    }

    spawnReaction(senderId, emoji) {
      const anchor = this.memberAnchors[senderId];
      if (!anchor) return;
      const c = document.createElement('canvas');
      c.width = 96;
      c.height = 96;
      const ctx = c.getContext('2d');
      ctx.font = '60px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 48, 52);

      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      sp.position.set(anchor.x, anchor.y + 2.05, anchor.z);
      sp.scale.set(0.65, 0.65, 1);
      this.root.add(sp);
      this.reactions3D.push({ sprite: sp, life: 0, maxLife: 1.9 });
    }

    update(dt, time, pomoMode, breakActivity) {
      if (!this.root.visible) return;
      this.peerChars.forEach((p, idx) => {
        if (!p.group.visible) return;
        const leftDown = Math.floor(time * 4 + idx) % 2 === 0;
        p.update(dt, time + idx * 1.1, pomoMode, breakActivity, leftDown, !leftDown, 0);
      });
      for (let i = this.reactions3D.length - 1; i >= 0; i--) {
        const r = this.reactions3D[i];
        r.life += dt;
        r.sprite.position.y += dt * 0.65;
        r.sprite.material.opacity = Math.max(0, 1 - r.life / r.maxLife);
        if (r.life >= r.maxLife) {
          this.root.remove(r.sprite);
          this.reactions3D.splice(i, 1);
        }
      }
    }
  }

  CozyGarden.DioramaCoop3D = DioramaCoop3D;
})();
