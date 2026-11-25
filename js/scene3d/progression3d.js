/* ==========================================================================
   Cozy Garden — 12-Level Progressive 3D Unlocks (js/scene3d/progression3d.js)
   Lv.1–8 Cozy garden details + Lv.9–12 Grand transformations!
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  class Progression3D {
    constructor(scene) {
      this.parentScene = scene;
      this.root = new THREE.Group();
      this.scene = this.root;
      this.level = 0;
      this.groups = {};
      this._buildAll();
      this.setLevel(0);
      this.parentScene.add(this.root);
    }

    setVisible(v) {
      this.root.visible = v;
    }

    _makeGroup(lv) {
      const grp = new THREE.Group();
      this.scene.add(grp);
      this.groups[lv] = grp;
      return grp;
    }

    _buildAll() {
      // Lv 1: Wildflower Clusters
      const lv1 = this._makeGroup(1);
      const flCols = [0xffb74d, 0xf06292, 0xfff176, 0xba68c8, 0x80cbc4];
      [[-2.7, 2.1], [-2.4, 2.3], [3.3, 0.9], [3.7, 0.7], [2.4, 2.1], [0.2, 2.2]].forEach(([x, z], i) => {
        const fl = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.095, 0),
          new THREE.MeshBasicMaterial({ color: flCols[i % flCols.length] })
        );
        fl.position.set(x, 0.22, z);
        lv1.add(fl);
      });

      // Lv 2: Glowing Fairy Mushrooms
      const lv2 = this._makeGroup(2);
      const mMat = new THREE.MeshStandardMaterial({ color: 0x73daca, emissive: 0x45c4b0, emissiveIntensity: 1.1 });
      [[-1.95, -1.2], [-1.65, -1.05], [-0.95, -1.65]].forEach(([x, z]) => {
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.11, 8), mMat);
        cap.position.set(x, 0.34, z);
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.04, 0.14, 6),
          new THREE.MeshStandardMaterial({ color: 0xf5efe6 })
        );
        stem.position.set(x, 0.24, z);
        lv2.add(cap, stem);
      });

      // Lv 3: Hanging Wooden Swing
      const lv3 = this._makeGroup(3);
      this.swingPivot = new THREE.Group();
      this.swingPivot.position.set(-2.45, 2.1, -1.35);
      const rMat = new THREE.MeshBasicMaterial({ color: 0xd4c3aa });
      [-0.2, 0.2].forEach((rx) => {
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 4), rMat);
        rope.position.set(rx, -0.55, 0);
        this.swingPivot.add(rope);
      });
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.05, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x8c5e43 })
      );
      seat.position.y = -1.1;
      this.swingPivot.add(seat);
      lv3.add(this.swingPivot);

      // Lv 4: Cozy Stone Firepit
      const lv4 = this._makeGroup(4);
      const fp = new THREE.Vector3(2.85, 0.2, 1.65);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const rk = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.09, 0),
          new THREE.MeshStandardMaterial({ color: 0x6b6765, flatShading: true })
        );
        rk.position.set(fp.x + Math.cos(a) * 0.26, fp.y, fp.z + Math.sin(a) * 0.26);
        lv4.add(rk);
      }
      this.campfireFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.42, 6),
        new THREE.MeshBasicMaterial({ color: 0xff8c42 })
      );
      this.campfireFlame.position.set(fp.x, fp.y + 0.22, fp.z);
      this.campfireLight = new THREE.PointLight(0xff7b42, 1.5, 5.5);
      this.campfireLight.position.set(fp.x, fp.y + 0.48, fp.z);
      lv4.add(this.campfireFlame, this.campfireLight);

      // Lv 5: Blue Songbird on Signpost
      const lv5 = this._makeGroup(5);
      this.birdGroup = new THREE.Group();
      this.birdGroup.position.set(-2.05, 1.18, 1.9);
      const bb = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x7aa2f7 })
      );
      const bk = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.09, 4),
        new THREE.MeshBasicMaterial({ color: 0xffe08a })
      );
      bk.rotation.z = -Math.PI / 2;
      bk.position.set(0.12, 0.02, 0);
      this.birdGroup.add(bb, bk);
      lv5.add(this.birdGroup);

      // Lv 6: Warm Fairy Lights
      const lv6 = this._makeGroup(6);
      for (let i = 0; i <= 6; i++) {
        const u = i / 6;
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 6, 6),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffd285 : 0xff9e64 })
        );
        bulb.position.set(-1.3 + u * 1.05, 2.4 - Math.sin(u * Math.PI) * 0.35, -1.6 + u * 1.05);
        lv6.add(bulb);
      }

      // Lv 7: Jumping Koi Fish in Pond
      const lv7 = this._makeGroup(7);
      this.jumpingFish = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.32, 6),
        new THREE.MeshStandardMaterial({ color: 0xff7b47, emissive: 0xb8461e, emissiveIntensity: 0.3 })
      );
      lv7.add(this.jumpingFish);

      // Lv 8: Tiny Baby Companion on Blanket
      const lv8 = this._makeGroup(8);
      const baby = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xfff5e6 })
      );
      baby.position.set(1.75, 0.32, 2.05);
      lv8.add(baby);

      // Lv 9 (GRAND): Mini Lighthouse with Rotating Volumetric Beam
      const lv9 = this._makeGroup(9);
      const lh = new THREE.Group();
      lh.position.set(3.4, 0.18, -1.55);
      const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.36, 2.1, 10),
        new THREE.MeshStandardMaterial({ color: 0xf2ede4, roughness: 0.8 })
      );
      tower.position.y = 1.05;
      tower.castShadow = true;
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.29, 0.33, 0.5, 10),
        new THREE.MeshStandardMaterial({ color: 0xd95b5b })
      );
      stripe.position.y = 1.2;
      const room = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.32, 8),
        new THREE.MeshBasicMaterial({ color: 0xffe8a3 })
      );
      room.position.y = 2.25;
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.34, 0.42, 8),
        new THREE.MeshStandardMaterial({ color: 0xd95b5b })
      );
      roof.position.y = 2.6;
      this.lhBeamPivot = new THREE.Group();
      this.lhBeamPivot.position.y = 2.25;
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(1.1, 5.5, 12, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xffe8a3,
          transparent: true,
          opacity: 0.14,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      beam.rotation.z = Math.PI / 2;
      beam.position.x = 2.75;
      this.lhBeamPivot.add(beam);
      lh.add(tower, stripe, room, roof, this.lhBeamPivot);
      lv9.add(lh);

      // Lv 10 (GRAND): Cozy Wooden Garden Pergola
      const lv10 = this._makeGroup(10);
      const pg = new THREE.Group();
      pg.position.set(-1.35, 0.2, 0.65);
      pg.rotation.y = 0.55;
      const pWood = new THREE.MeshStandardMaterial({ color: 0x6e4533, roughness: 0.85 });
      [[-1.15, -0.95], [1.15, -0.95], [-1.15, 0.95], [1.15, 0.95]].forEach(([px, pz]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.2, 6), pWood);
        post.position.set(px, 1.1, pz);
        post.castShadow = true;
        pg.add(post);
      });
      for (let i = -2; i <= 2; i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 0.12), pWood);
        slat.position.set(0, 2.22, i * 0.46);
        slat.castShadow = true;
        pg.add(slat);
      }
      [[-0.65, 0], [0.65, 0]].forEach(([lx, lz]) => {
        const lant = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffd98e })
        );
        lant.position.set(lx, 2.0, lz);
        pg.add(lant);
      });
      lv10.add(pg);

      // Lv 11 (GRAND): Floating Paper Lanterns circling garden
      const lv11 = this._makeGroup(11);
      this.lanternBoats = [];
      for (let i = 0; i < 4; i++) {
        const lb = new THREE.Group();
        const glow = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.09, 0.24, 8),
          new THREE.MeshBasicMaterial({ color: 0xffd485 })
        );
        lb.add(glow);
        lv11.add(lb);
        this.lanternBoats.push({ group: lb, angle: (i / 4) * Math.PI * 2, radius: 5.2 + (i % 2) * 0.9 });
      }

      // Lv 12 (GRAND FINALE): Floating Pastel Hot-Air Balloon
      const lv12 = this._makeGroup(12);
      this.balloonGroup = new THREE.Group();
      this.balloonGroup.position.set(-4.2, 4.4, -3.4);
      const env = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 14, 12),
        new THREE.MeshStandardMaterial({ color: 0xf7768e, roughness: 0.7, flatShading: true })
      );
      env.scale.set(0.95, 1.15, 0.95);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.1, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xffe08a })
      );
      ring.rotation.x = Math.PI / 2;
      const basket = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.28, 0.34),
        new THREE.MeshStandardMaterial({ color: 0x8c5e43 })
      );
      basket.position.y = -1.25;
      this.balloonGroup.add(env, ring, basket);
      lv12.add(this.balloonGroup);
    }

    setLevel(level) {
      this.level = Math.max(0, Math.min(12, Number(level) || 0));
      for (let lv = 1; lv <= 12; lv++) {
        if (this.groups[lv]) this.groups[lv].visible = this.level >= lv;
      }
    }

    update(dt, time) {
      if (this.level >= 3) this.swingPivot.rotation.x = Math.sin(time * 1.4) * 0.15;
      if (this.level >= 4) {
        this.campfireFlame.scale.y = 0.85 + Math.sin(time * 12) * 0.2;
        this.campfireLight.intensity = 1.4 + Math.sin(time * 10) * 0.3;
      }
      if (this.level >= 5) {
        this.birdGroup.position.y = 1.18 + (Math.sin(time * 2.8) > 0.85 ? 0.08 : 0);
      }
      if (this.level >= 7) {
        const cyc = time % 6.5;
        if (cyc < 1.1) {
          const u = cyc / 1.1;
          this.jumpingFish.visible = true;
          this.jumpingFish.position.set(1.2 + u * 0.8, 0.2 + Math.sin(u * Math.PI) * 0.75, -0.5);
          this.jumpingFish.rotation.z = (0.5 - u) * 1.5;
        } else {
          this.jumpingFish.visible = false;
        }
      }
      if (this.level >= 9) this.lhBeamPivot.rotation.y += dt * 0.65;
      if (this.level >= 11) {
        this.lanternBoats.forEach((b) => {
          b.angle += dt * 0.14;
          b.group.position.set(
            Math.cos(b.angle) * b.radius,
            1.6 + Math.sin(time * 1.5 + b.angle) * 0.35,
            Math.sin(b.angle) * b.radius
          );
        });
      }
      if (this.level >= 12) {
        this.balloonGroup.position.y = 4.4 + Math.sin(time * 0.8) * 0.22;
        this.balloonGroup.rotation.y += dt * 0.15;
      }
    }
  }

  CozyGarden.Progression3D = Progression3D;
})();
