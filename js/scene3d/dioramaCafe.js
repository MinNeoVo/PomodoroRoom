/* ==========================================================================
   Cozy Garden — 3D Isometric Corner Cafe Diorama (js/scene3d/dioramaCafe.js)
   Floating cutaway cafe: warm checkered/wood floor, brick/wood L-walls,
   striped awning window, espresso counter, pastry display, window study table,
   pendant lamp, safe pet rug zone, & 12 cafe-specific unlock rewards!
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  class DioramaCafe3D {
    constructor(scene, tagInteractable) {
      this.root = new THREE.Group();
      this.tagInteractable = tagInteractable;
      this.level = 0;
      this.unlockGroups = {};

      this._buildCafeShell();
      this._buildEspressoBar();
      this._buildWindowStudyTable();
      this._buildUnlocks();

      this.setLevel(0);
      this.root.visible = false;
      scene.add(this.root);
    }

    setVisible(v) {
      this.root.visible = v;
    }

    _buildCafeShell() {
      // Warm cafe tile floor
      const fc = document.createElement('canvas');
      fc.width = 256;
      fc.height = 256;
      const ctx = fc.getContext('2d');
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#b58d6b' : '#9c7556';
          ctx.fillRect(c * 32, r * 32, 32, 32);
        }
      }
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(6.6, 0.34, 6.6),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(fc), roughness: 0.85 })
      );
      floor.receiveShadow = true;
      const under = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 0.22, 6.4),
        new THREE.MeshStandardMaterial({ color: 0x3b2820 })
      );
      under.position.y = -0.26;
      this.root.add(floor, under);

      // Warm espresso-brick & cream cafe walls
      const wallWarm = new THREE.MeshStandardMaterial({ color: 0xd9c2ab, roughness: 0.9 });
      const wainscot = new THREE.MeshStandardMaterial({ color: 0x5c3c2e, roughness: 0.85 });

      const wallZ = new THREE.Mesh(new THREE.BoxGeometry(6.6, 3.6, 0.24), wallWarm);
      wallZ.position.set(0, 1.95, -3.18);
      wallZ.receiveShadow = true;
      const trimZ = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.1, 0.28), wainscot);
      trimZ.position.set(0, 0.72, -3.16);

      const wallX = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.6, 6.6), wallWarm);
      wallX.position.set(-3.18, 1.95, 0);
      wallX.receiveShadow = true;
      const trimX = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.1, 6.6), wainscot);
      trimX.position.set(-3.16, 0.72, 0);

      this.root.add(wallZ, trimZ, wallX, trimX);

      // Large Cafe Storefront Window on Left Wall with Red-Cream Striped Awning
      const win = new THREE.Group();
      win.position.set(-3.02, 2.2, 0.4);
      win.rotation.y = Math.PI / 2;
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshBasicMaterial({ color: 0x7aa4bf }));
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.76, 1.75, 0.08), wainscot);
      frame.position.z = -0.05;
      win.add(frame, glass);
      for (let i = 0; i < 6; i++) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.34, 0.28),
          new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xa84438 : 0xf5ebd8 })
        );
        stripe.position.set(-1.05 + i * 0.42, 0.85, 0.14);
        stripe.rotation.x = 0.28;
        win.add(stripe);
      }
      this.tagInteractable(win, 'window');
      this.root.add(win);

      // Cozy cafe floor rug (safe pet zone!)
      const rug = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.03, 1.9),
        new THREE.MeshStandardMaterial({ color: 0x7d4b3c, roughness: 0.95 })
      );
      rug.position.set(1.35, 0.185, 1.55);
      rug.receiveShadow = true;
      this.root.add(rug);
    }

    _buildEspressoBar() {
      const wood = new THREE.MeshStandardMaterial({ color: 0x5c3a2a, roughness: 0.82 });
      const topMat = new THREE.MeshStandardMaterial({ color: 0xe8dfd3, roughness: 0.65 });
      const bar = new THREE.Group();
      bar.position.set(0.85, 0.17, -2.05);

      const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 0.95), wood);
      body.position.y = 0.5;
      body.castShadow = true;
      const top = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.09, 1.08), topMat);
      top.position.y = 1.04;
      top.receiveShadow = true;

      // Retro Espresso Machine
      const mach = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.55, 0.55),
        new THREE.MeshStandardMaterial({ color: 0xb84a3c, metalness: 0.35, roughness: 0.4 })
      );
      mach.position.set(-0.95, 1.36, 0);
      mach.castShadow = true;

      // Glass Pastry Case
      const pCase = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.48, 0.52),
        new THREE.MeshStandardMaterial({ color: 0xfff5e6, transparent: true, opacity: 0.45 })
      );
      pCase.position.set(0.85, 1.32, 0.05);

      bar.add(body, top, mach, pCase);
      this.root.add(bar);
    }

    _buildWindowStudyTable() {
      const wood = new THREE.MeshStandardMaterial({ color: 0x7a4f38, roughness: 0.8 });
      const tbl = new THREE.Group();
      tbl.position.set(-1.35, 0.17, 0.55);

      const top = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.1, 1.05), wood);
      top.position.y = 0.78;
      top.castShadow = true;
      top.receiveShadow = true;
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.76, 10), new THREE.MeshStandardMaterial({ color: 0x2b2625 }));
      ped.position.y = 0.38;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.48, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0x2b2625 }));
      base.position.y = 0.03;

      // Cafe Chair (tucked comfortably for chibi typing reach!)
      const ch = new THREE.Group();
      ch.position.set(0, 0, 0.64);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), wood);
      seat.position.y = 0.46;
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.58, 0.07), wood);
      back.position.set(0, 0.76, 0.24);
      [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]].forEach(([lx, lz]) => {
        const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.46, 6), wood);
        l.position.set(lx, 0.23, lz);
        ch.add(l);
      });
      ch.add(seat, back);

      // Laptop on Cafe Table
      this.screenCanvas = document.createElement('canvas');
      this.screenCanvas.width = 128;
      this.screenCanvas.height = 84;
      this.screenTex = new THREE.CanvasTexture(this.screenCanvas);
      this._redrawScreen(0);

      const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.36), new THREE.MeshStandardMaterial({ color: 0xe6e6ee }));
      lapBase.position.set(-0.04, 0.845, 0.22);
      this.laptopLidPivot = new THREE.Group();
      this.laptopLidPivot.position.set(-0.04, 0.86, 0.05);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.33, 0.025), new THREE.MeshStandardMaterial({ color: 0xd9d9e3 }));
      lid.position.y = 0.165;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.28), new THREE.MeshBasicMaterial({ map: this.screenTex }));
      scr.position.set(0, 0.165, 0.015);
      this.laptopLidPivot.add(lid, scr);
      this.laptopLidPivot.rotation.x = -0.22;
      this.laptopLight = new THREE.PointLight(0xffd2a6, 0.45, 2.5);
      this.laptopLight.position.set(-0.08, 1.08, 0.05);

      // Interactive Coffee Mug
      this.mugGroup = new THREE.Group();
      this.mugGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.17, 10), new THREE.MeshStandardMaterial({ color: 0xf7efe4 })));
      this.mugHome = new THREE.Vector3(0.4, 0.92, 0.06);
      this.mugGroup.position.copy(this.mugHome);
      this.tagInteractable(this.mugGroup, 'mug');

      // Warm Hanging Pendant Lamp above Table
      const lamp = new THREE.Group();
      lamp.position.set(0, 2.7, 0);
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 6), new THREE.MeshBasicMaterial({ color: 0x241d1b }));
      cord.position.y = 0.45;
      this.lampShadeMat = new THREE.MeshStandardMaterial({ color: 0xffe4ad, emissive: 0xffa64d, emissiveIntensity: 1.4 });
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.28, 12), this.lampShadeMat);
      this.lampLight = new THREE.PointLight(0xffbe73, 2.4, 10);
      this.lampLight.position.y = -0.15;
      lamp.add(cord, shade, this.lampLight);
      this.tagInteractable(lamp, 'lamp');

      tbl.add(top, ped, base, ch, lapBase, this.laptopLidPivot, this.laptopLight, this.mugGroup, lamp);
      this.root.add(tbl);
    }

    _redrawScreen(step) {
      const ctx = this.screenCanvas.getContext('2d');
      ctx.fillStyle = '#fff5ea';
      ctx.fillRect(0, 0, 128, 84);
      const cols = ['#8c5a3c', '#5ca37b', '#d97a9e', '#6c7a9c'];
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = cols[i % cols.length];
        ctx.fillRect(12, 12 + i * 10, 24 + ((i * 23 + step * 11) % 72), 4);
      }
      this.screenTex.needsUpdate = true;
    }

    _buildUnlocks() {
      const mk = (lv) => {
        const g = new THREE.Group();
        this.root.add(g);
        this.unlockGroups[lv] = g;
        return g;
      };

      // Lv 1: Corner Monstera
      const u1 = mk(1);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.38, 10), new THREE.MeshStandardMaterial({ color: 0xb86b4b }));
      pot.position.set(-2.45, 0.36, 2.35);
      const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), new THREE.MeshStandardMaterial({ color: 0x458559 }));
      leaf.position.set(-2.45, 0.88, 2.35);
      u1.add(pot, leaf);

      // Lv 2: Chalkboard Menu on Back Wall
      const u2 = mk(2);
      const menu = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 0.08), new THREE.MeshStandardMaterial({ color: 0x242e29 }));
      menu.position.set(0.85, 2.35, -3.0);
      u2.add(menu);

      // Lv 3: Pour-Over Kettle & Ceramic Mugs Shelf
      const u3 = mk(3);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.3), new THREE.MeshStandardMaterial({ color: 0x6e4934 }));
      sh.position.set(-1.35, 2.15, -2.92);
      const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.24, 10), new THREE.MeshStandardMaterial({ color: 0x2d3238 }));
      kettle.position.set(-1.55, 2.3, -2.92);
      u3.add(sh, kettle);

      // Lv 4: Croissant Pastry Plate on Counter
      const u4 = mk(4);
      const cr = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.05, 6, 10, Math.PI), new THREE.MeshStandardMaterial({ color: 0xe6a15c }));
      cr.position.set(1.7, 1.32, -2.0);
      u4.add(cr);

      // Lv 5: Warm Edison Bulb String
      const u5 = mk(5);
      for (let i = 0; i < 8; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffd285 }));
        b.position.set(-2.5 + i * 0.72, 3.25 - Math.sin((i / 7) * Math.PI) * 0.3, -2.95);
        u5.add(b);
      }

      // Lv 6: Wooden Lofi Speaker
      const u6 = mk(6);
      const spk = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.35), new THREE.MeshStandardMaterial({ color: 0x5c3e2e }));
      spk.position.set(2.65, 0.5, -1.95);
      u6.add(spk);

      // Lv 7: Herb Planter Box under Window
      const u7 = mk(7);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 1.5), new THREE.MeshStandardMaterial({ color: 0x7a543f }));
      box.position.set(-2.85, 1.15, 0.4);
      const herbs = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 1.38), new THREE.MeshStandardMaterial({ color: 0x5ca37b }));
      herbs.position.set(-2.85, 1.35, 0.4);
      u7.add(box, herbs);

      // Lv 8: Tiny Baby Companion on Cafe Rug
      const u8 = mk(8);
      const baby = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff5e6 }));
      baby.position.set(2.05, 0.3, 1.75);
      u8.add(baby);

      // Lv 9 (GRAND): Vintage Brass Coffee Roaster
      const u9 = mk(9);
      const roaster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.42, 0.95, 12),
        new THREE.MeshStandardMaterial({ color: 0xd4a254, metalness: 0.55, roughness: 0.35 })
      );
      roaster.position.set(2.55, 0.65, -0.55);
      u9.add(roaster);

      // Lv 10 (GRAND): Hanging Warm Paper Lanterns
      const u10 = mk(10);
      [-0.2, 1.5].forEach((lx) => {
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd98e }));
        l.position.set(lx, 3.1, -0.8);
        u10.add(l);
      });

      // Lv 11 (GRAND): Floating Warm Firefly Orbs around Cafe
      const u11 = mk(11);
      this.cafeOrbs = [];
      for (let i = 0; i < 4; i++) {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe49e }));
        u11.add(orb);
        this.cafeOrbs.push({ mesh: orb, angle: (i / 4) * Math.PI * 2 });
      }

      // Lv 12 (GRAND FINALE): Glowing "LOFI CAFE" Sign above Counter!
      const u12 = mk(12);
      const sc = document.createElement('canvas');
      sc.width = 256;
      sc.height = 64;
      const sctx = sc.getContext('2d');
      sctx.fillStyle = '#241815';
      sctx.fillRect(0, 0, 256, 64);
      sctx.strokeStyle = '#ffbe73';
      sctx.lineWidth = 4;
      sctx.strokeRect(4, 4, 248, 56);
      sctx.font = 'bold 34px "Segoe UI", sans-serif';
      sctx.fillStyle = '#ffe3a3';
      sctx.textAlign = 'center';
      sctx.textBaseline = 'middle';
      sctx.fillText('☕ LOFI CAFE', 128, 34);
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 0.48),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc) })
      );
      sign.position.set(0.85, 3.25, -2.96);
      u12.add(sign);
    }

    setLevel(lv) {
      this.level = Math.max(0, Math.min(12, Number(lv) || 0));
      for (let i = 1; i <= 12; i++) {
        if (this.unlockGroups[i]) this.unlockGroups[i].visible = this.level >= i;
      }
    }

    setLampMode(lampMode) {
      const ints = [2.4, 1.0, 0];
      this.lampLight.intensity = ints[lampMode];
      this.lampShadeMat.emissiveIntensity = lampMode === 2 ? 0 : lampMode === 1 ? 0.55 : 1.4;
    }

    setLaptopOpen(isOpen) {
      this.laptopLidPivot.rotation.x = isOpen ? -0.22 : -1.52;
      this.laptopLight.intensity = isOpen ? 0.45 : 0.04;
    }

    pulseTypingScreen(step) {
      this._redrawScreen(step);
    }

    getCharacterAnchor(pomoMode, breakActivity) {
      if (pomoMode !== 'break') {
        // Seated cleanly ON TOP of cafe chair (seat top = 0.67 -> y = 0.505) with hands on laptop!
        return { x: -1.39, y: 0.505, z: 1.15, rotY: 0 };
      }
      // Standing grounded on open cafe floor facing directly toward camera!
      return { x: 0.15, y: 0.3, z: 0.25, rotY: 3.7 };
    }

    getPetWaypoints() {
      // Strictly on the open cafe rug & clear floor away from bar & table!
      return [
        { x: 1.35, y: 0.20, z: 1.55 },
        { x: 0.65, y: 0.20, z: 2.05 },
        { x: 2.15, y: 0.20, z: 1.85 },
        { x: 1.55, y: 0.20, z: 0.65 },
      ];
    }

    getBottlePosition() {
      // Glowing cafe order coffee cup sitting right on the espresso counter!
      return { x: 0.35, y: 1.26, z: -1.85 };
    }

    update(dt, time, sipLift) {
      if (sipLift > 0.001) {
        this.mugGroup.position.lerpVectors(this.mugHome, new THREE.Vector3(0.05, 1.15, 0.45), sipLift);
      } else {
        this.mugGroup.position.copy(this.mugHome);
      }
      if (this.level >= 11 && this.cafeOrbs) {
        this.cafeOrbs.forEach((o) => {
          o.angle += dt * 0.35;
          o.mesh.position.set(Math.cos(o.angle) * 3.8, 2.2 + Math.sin(time * 1.8 + o.angle) * 0.25, Math.sin(o.angle) * 3.8);
        });
      }
    }
  }

  CozyGarden.DioramaCafe3D = DioramaCafe3D;
})();
