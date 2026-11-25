/* ==========================================================================
   Cozy Garden — 3D Isometric Cozy Bedroom Corner Diorama (js/scene3d/dioramaRoom.js)
   Full floating cutaway bedroom: hardwood floor, L-walls, starry window,
   cozy bed, wooden study desk + laptop + mug + desk lamp, rug, & 12 room unlocks!
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  class DioramaRoom3D {
    constructor(scene, tagInteractable) {
      this.root = new THREE.Group();
      this.tagInteractable = tagInteractable;
      this.level = 0;
      this.unlockGroups = {};

      this._buildRoomShell();
      this._buildBedAndRug();
      this._buildStudyDesk();
      this._buildUnlocks();

      this.setLevel(0);
      this.root.visible = false;
      scene.add(this.root);
    }

    setVisible(v) {
      this.root.visible = v;
    }

    _buildRoomShell() {
      const floorWood = new THREE.MeshStandardMaterial({ color: 0x87624c, roughness: 0.85 });
      const baseTrim = new THREE.MeshStandardMaterial({ color: 0x45312a, roughness: 0.92 });
      const wallCream = new THREE.MeshStandardMaterial({ color: 0xe6d9c8, roughness: 0.9 });
      const wallBack = new THREE.MeshStandardMaterial({ color: 0xdfd0bd, roughness: 0.9 });

      // Floating hardwood floor slab
      const floor = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.34, 6.6), floorWood);
      floor.position.set(0, 0, 0);
      floor.receiveShadow = true;
      const under = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.22, 6.4), baseTrim);
      under.position.set(0, -0.26, 0);
      this.root.add(floor, under);

      // L-shaped cutaway walls (Back-Z and Left-X)
      const wallZ = new THREE.Mesh(new THREE.BoxGeometry(6.6, 3.6, 0.24), wallCream);
      wallZ.position.set(0, 1.95, -3.18);
      wallZ.receiveShadow = true;
      const wallX = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.6, 6.6), wallBack);
      wallX.position.set(-3.18, 1.95, 0);
      wallX.receiveShadow = true;
      this.root.add(wallZ, wallX);

      // Large Cozy Starry Night Window on Back Wall (clickable for weather!)
      const winFrame = new THREE.MeshStandardMaterial({ color: 0x5c3e30, roughness: 0.8 });
      const winGlass = new THREE.MeshBasicMaterial({ color: 0x202b4f });
      const winGroup = new THREE.Group();
      winGroup.position.set(-0.6, 2.25, -3.02);
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.55), winGlass);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.48, 1.72, 0.08), winFrame);
      frame.position.z = -0.05;
      const barV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.06), winFrame);
      const barH = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.08, 0.06), winFrame);
      // Glowing crescent moon inside window
      const moon = new THREE.Mesh(
        new THREE.CircleGeometry(0.18, 14),
        new THREE.MeshBasicMaterial({ color: 0xfff0c2 })
      );
      moon.position.set(0.65, 0.35, 0.01);
      // Soft curtains on both sides
      const curtMat = new THREE.MeshStandardMaterial({ color: 0x9980a8, roughness: 0.9 });
      [-1.18, 1.18].forEach((cx) => {
        const curt = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.88, 0.14), curtMat);
        curt.position.set(cx, -0.04, 0.06);
        winGroup.add(curt);
      });
      winGroup.add(frame, pane, barV, barH, moon);
      this.tagInteractable(winGroup, 'window');
      this.root.add(winGroup);
    }

    _buildBedAndRug() {
      const wood = new THREE.MeshStandardMaterial({ color: 0x6b4735, roughness: 0.85 });
      const bed = new THREE.Group();
      bed.position.set(1.75, 0.17, -1.65);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.38, 2.55), wood);
      frame.position.y = 0.19;
      frame.castShadow = true;
      const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.05, 0.16), wood);
      headboard.position.set(0, 0.55, -1.22);
      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(2.05, 0.24, 2.4),
        new THREE.MeshStandardMaterial({ color: 0xf7f0e6, roughness: 0.9 })
      );
      mattress.position.y = 0.48;
      const duvet = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.22, 1.75),
        new THREE.MeshStandardMaterial({ color: 0xd99ca8, roughness: 0.92 })
      );
      duvet.position.set(0, 0.52, 0.32);
      duvet.castShadow = true;
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.2, 0.45),
        new THREE.MeshStandardMaterial({ color: 0xfff8f0, roughness: 0.9 })
      );
      pillow.position.set(0, 0.66, -0.82);
      bed.add(frame, headboard, mattress, duvet, pillow);
      this.root.add(bed);

      // Cozy round floor rug in open center-front (safe pet roaming zone!)
      const rug = new THREE.Mesh(
        new THREE.CylinderGeometry(1.45, 1.45, 0.03, 24),
        new THREE.MeshStandardMaterial({ color: 0xf0e1ce, roughness: 0.95 })
      );
      rug.position.set(1.25, 0.185, 1.35);
      rug.receiveShadow = true;
      this.root.add(rug);
    }

    _buildStudyDesk() {
      const wood = new THREE.MeshStandardMaterial({ color: 0x7d5540, roughness: 0.8 });
      const desk = new THREE.Group();
      desk.position.set(-1.35, 0.17, -1.55);

      const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.05), wood);
      top.position.y = 0.78;
      top.castShadow = true;
      top.receiveShadow = true;
      desk.add(top);

      [[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.78, 0.09), wood);
        leg.position.set(lx, 0.39, lz);
        leg.castShadow = true;
        desk.add(leg);
      });

      // Desk Chair (tucked comfortably for chibi typing reach!)
      const chair = new THREE.Group();
      chair.position.set(-0.05, 0, 0.64);
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.09, 0.56),
        new THREE.MeshStandardMaterial({ color: 0x5c4f73 })
      );
      seat.position.y = 0.46;
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.62, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x5c4f73 })
      );
      back.position.set(0, 0.78, 0.25);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.45, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a2d3d })
      );
      stem.position.y = 0.22;
      chair.add(seat, back, stem);
      desk.add(chair);

      // Laptop on Desk
      this.screenCanvas = document.createElement('canvas');
      this.screenCanvas.width = 128;
      this.screenCanvas.height = 84;
      this.screenTex = new THREE.CanvasTexture(this.screenCanvas);
      this._redrawScreen(0);

      const lapBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.03, 0.36),
        new THREE.MeshStandardMaterial({ color: 0xe6e6ee })
      );
      lapBase.position.set(-0.05, 0.845, 0.22);
      this.laptopLidPivot = new THREE.Group();
      this.laptopLidPivot.position.set(-0.05, 0.86, 0.05);
      const lid = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.33, 0.025),
        new THREE.MeshStandardMaterial({ color: 0xd9d9e3 })
      );
      lid.position.y = 0.165;
      const scr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.43, 0.28),
        new THREE.MeshBasicMaterial({ map: this.screenTex })
      );
      scr.position.set(0, 0.165, 0.015);
      this.laptopLidPivot.add(lid, scr);
      this.laptopLidPivot.rotation.x = -0.22;
      this.laptopLight = new THREE.PointLight(0xa3c9ff, 0.5, 2.5);
      this.laptopLight.position.set(-0.05, 1.08, 0.05);
      desk.add(lapBase, this.laptopLidPivot, this.laptopLight);

      // Interactive Mug on Desk
      this.mugGroup = new THREE.Group();
      const mugBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.08, 0.17, 10),
        new THREE.MeshStandardMaterial({ color: 0xf7efe4 })
      );
      this.mugGroup.add(mugBody);
      this.mugHome = new THREE.Vector3(0.42, 0.92, 0.08);
      this.mugGroup.position.copy(this.mugHome);
      this.tagInteractable(this.mugGroup, 'mug');
      desk.add(this.mugGroup);

      // Interactive Warm Desk Lamp
      const lamp = new THREE.Group();
      lamp.position.set(0.76, 0.83, -0.22);
      const lBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.06, 10), new THREE.MeshStandardMaterial({ color: 0x3b425c }));
      const lStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 6), new THREE.MeshStandardMaterial({ color: 0xe0af68 }));
      lStem.position.y = 0.28;
      this.lampShadeMat = new THREE.MeshStandardMaterial({ color: 0xffe4ad, emissive: 0xffa64d, emissiveIntensity: 1.4 });
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.24, 10), this.lampShadeMat);
      shade.position.y = 0.58;
      this.lampLight = new THREE.PointLight(0xffb466, 2.2, 9);
      this.lampLight.position.set(0, 0.5, 0);
      lamp.add(lBase, lStem, shade, this.lampLight);
      this.tagInteractable(lamp, 'lamp');
      desk.add(lamp);

      this.deskGroup = desk;
      this.root.add(desk);
    }

    _redrawScreen(step) {
      const ctx = this.screenCanvas.getContext('2d');
      ctx.fillStyle = '#1f263d';
      ctx.fillRect(0, 0, 128, 84);
      const cols = ['#7aa2f7', '#bb9af7', '#73daca', '#e0af68'];
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

      // Lv 1: Corner Houseplant
      const u1 = mk(1);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.38, 10), new THREE.MeshStandardMaterial({ color: 0xc47254 }));
      pot.position.set(-2.55, 0.36, 1.85);
      const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), new THREE.MeshStandardMaterial({ color: 0x528f61 }));
      leaf.position.set(-2.55, 0.85, 1.85);
      u1.add(pot, leaf);

      // Lv 2: Wall Fairy Lights
      const u2 = mk(2);
      for (let i = 0; i < 9; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffd285 : 0xff9e64 }));
        b.position.set(-2.6 + i * 0.65, 3.2 - Math.sin((i / 8) * Math.PI) * 0.35, -3.0);
        u2.add(b);
      }

      // Lv 3: Cute Teddy Bear on Bed
      const u3 = mk(3);
      const bearMat = new THREE.MeshStandardMaterial({ color: 0xb57a52 });
      const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), bearMat);
      bBody.position.set(1.45, 0.85, -2.05);
      const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), bearMat);
      bHead.position.set(1.45, 1.12, -2.05);
      u3.add(bBody, bHead);

      // Lv 4: Framed Wall Art on Left Wall
      const u4 = mk(4);
      const artFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 0.85), new THREE.MeshStandardMaterial({ color: 0x5c3e30 }));
      artFrame.position.set(-3.02, 2.25, 0.45);
      const artCanvas = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.9), new THREE.MeshBasicMaterial({ color: 0xf0b8a8 }));
      artCanvas.rotation.y = Math.PI / 2;
      artCanvas.position.set(-2.97, 2.25, 0.45);
      u4.add(artFrame, artCanvas);

      // Lv 5: Floating Bookshelf with Colorful Books
      const u5 = mk(5);
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 1.6), new THREE.MeshStandardMaterial({ color: 0x6e4934 }));
      shelf.position.set(-2.9, 1.85, -1.45);
      u5.add(shelf);
      [0x7aa2f7, 0xf7768e, 0xe0af68, 0x73daca, 0xbb9af7].forEach((col, i) => {
        const bk = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32 + (i % 2) * 0.08, 0.14), new THREE.MeshStandardMaterial({ color: col }));
        bk.position.set(-2.9, 2.05, -2.0 + i * 0.22);
        u5.add(bk);
      });

      // Lv 6: Vinyl Record Player on Side Stand
      const u6 = mk(6);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 0.65), new THREE.MeshStandardMaterial({ color: 0x6b4735 }));
      stand.position.set(-2.55, 0.49, 0.65);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 14), new THREE.MeshStandardMaterial({ color: 0x1a1b26 }));
      disc.position.set(-2.55, 0.85, 0.65);
      this.vinylDisc = disc;
      u6.add(stand, disc);

      // Lv 7: Glowing Mini Aquarium
      const u7 = mk(7);
      const tank = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.4, 0.38),
        new THREE.MeshStandardMaterial({ color: 0x73daca, emissive: 0x35968a, emissiveIntensity: 0.7, transparent: true, opacity: 0.78 })
      );
      tank.position.set(2.55, 0.37, 0.45);
      u7.add(tank);

      // Lv 8: Tiny Baby Companion on Rug
      const u8 = mk(8);
      const baby = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff5e6 }));
      baby.position.set(1.95, 0.3, 1.55);
      u8.add(baby);

      // Lv 9 (GRAND): Hanging Vine Canopy across Wall Top
      const u9 = mk(9);
      const vMat = new THREE.MeshStandardMaterial({ color: 0x5ca37b });
      for (let i = 0; i < 8; i++) {
        const vine = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), vMat);
        vine.position.set(-2.4 + i * 0.72, 3.45, -2.95);
        u9.add(vine);
      }

      // Lv 10 (GRAND): Glowing Star Curtain Lights on Window
      const u10 = mk(10);
      for (let i = 0; i < 5; i++) {
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), new THREE.MeshBasicMaterial({ color: 0xffe89e }));
        star.position.set(-1.45 + i * 0.42, 2.55 - (i % 2) * 0.4, -2.85);
        u10.add(star);
      }

      // Lv 11 (GRAND): Nebula Galaxy Projector Lamp
      const u11 = mk(11);
      const neb = new THREE.PointLight(0xbb9af7, 1.8, 9);
      neb.position.set(0.5, 2.8, -1.5);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), new THREE.MeshBasicMaterial({ color: 0xd4b8ff }));
      orb.position.set(2.5, 0.75, 0.45);
      u11.add(neb, orb);

      // Lv 12 (GRAND FINALE): Floating Magic Crystal Globe!
      const u12 = mk(12);
      this.crystalOrb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.38, 1),
        new THREE.MeshStandardMaterial({ color: 0x9ce8dc, emissive: 0x5c85ff, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 })
      );
      this.crystalOrb.position.set(0.2, 3.6, 0.2);
      u12.add(this.crystalOrb);
    }

    setLevel(lv) {
      this.level = Math.max(0, Math.min(12, Number(lv) || 0));
      for (let i = 1; i <= 12; i++) {
        if (this.unlockGroups[i]) this.unlockGroups[i].visible = this.level >= i;
      }
    }

    setLampMode(lampMode) {
      const ints = [2.2, 0.9, 0];
      this.lampLight.intensity = ints[lampMode];
      this.lampShadeMat.emissiveIntensity = lampMode === 2 ? 0 : lampMode === 1 ? 0.55 : 1.4;
    }

    setLaptopOpen(isOpen) {
      this.laptopLidPivot.rotation.x = isOpen ? -0.22 : -1.52;
      this.laptopLight.intensity = isOpen ? 0.5 : 0.04;
    }

    pulseTypingScreen(step) {
      this._redrawScreen(step);
    }

    getCharacterAnchor(pomoMode, breakActivity) {
      if (pomoMode !== 'break') {
        // Seated cleanly ON TOP of chair seat (seat top = 0.675 -> y = 0.51) with hands on laptop!
        return { x: -1.4, y: 0.51, z: -0.95, rotY: 0 };
      }
      // Standing grounded on open bedroom floor facing directly toward camera!
      return { x: -0.2, y: 0.3, z: 0.85, rotY: 3.7 };
    }

    getPetWaypoints() {
      // Strictly on the open front-right rug & clear wooden floor!
      return [
        { x: 1.25, y: 0.20, z: 1.35 },
        { x: 0.45, y: 0.20, z: 1.85 },
        { x: 1.95, y: 0.20, z: 1.95 },
        { x: 1.55, y: 0.20, z: 0.65 },
      ];
    }

    getBottlePosition() {
      // Diary book resting right on top of the cozy bed duvet!
      return { x: 1.75, y: 0.84, z: -1.15 };
    }

    update(dt, time, sipLift) {
      if (sipLift > 0.001) {
        this.mugGroup.position.lerpVectors(this.mugHome, new THREE.Vector3(0.08, 1.15, 0.45), sipLift);
      } else {
        this.mugGroup.position.copy(this.mugHome);
      }
      if (this.level >= 6 && this.vinylDisc) this.vinylDisc.rotation.y += dt * 1.8;
      if (this.level >= 12 && this.crystalOrb) {
        this.crystalOrb.position.y = 3.6 + Math.sin(time * 1.4) * 0.18;
        this.crystalOrb.rotation.y += dt * 0.9;
      }
    }
  }

  CozyGarden.DioramaRoom3D = DioramaRoom3D;
})();
