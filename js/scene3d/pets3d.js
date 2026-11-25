/* ==========================================================================
   Cozy Garden — Detailed 3D Pets with Roaming & Napping AI (js/scene3d/pets3d.js)
   4 Detailed Pets (Cat, Corgi, Fox, Duck) with articulated legs, snouts,
   collars, wagging tails, wandering waypoints, and rising 3D hearts on pet.
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  // Default collision-free front-right meadow strip (completely clear of pond, boulders, & table!)
  const DEFAULT_WAYPOINTS = [
    new THREE.Vector3(1.25, 0.21, 1.85), // Checkered picnic blanket (Nap spot)
    new THREE.Vector3(2.05, 0.20, 1.95), // Open front-right meadow
    new THREE.Vector3(1.55, 0.20, 2.38), // Front sunlit grass
    new THREE.Vector3(0.62, 0.20, 2.18), // Near front stone edge (clear of table)
    new THREE.Vector3(2.35, 0.20, 1.38), // Open side grass (clear of pond & rocks)
  ];

  class Pets3D {
    constructor(scene, tagInteractable) {
      this.scene = scene;
      this.petType = 'cat';
      this.happyTimer = 0;
      this.hearts = [];
      this.waypoints = DEFAULT_WAYPOINTS;

      // Autonomous Roam / Nap AI state
      this.aiState = 'nap'; // 'nap' | 'walk' | 'idle'
      this.aiTimer = 6.5;
      this.waypointIdx = 0;
      this.targetPos = this.waypoints[0].clone();
      this.walkCycle = 0;

      this.root = new THREE.Group();
      this.root.position.copy(this.waypoints[0]);

      this.models = {
        cat: this._buildQuadruped({
          body: 0x734a3a,
          chest: 0xf0dfd1,
          head: 0x633d2e,
          earOuter: 0x4a2c20,
          earInner: 0xf5a6a6,
          collar: 0xe65c5c,
          tailLen: 0.34,
          earSize: 0.14,
        }),
        corgi: this._buildQuadruped({
          body: 0xe89d54,
          chest: 0xfff7eb,
          head: 0xe89d54,
          earOuter: 0xd9873d,
          earInner: 0xf5a6a6,
          collar: 0x4f9cd4,
          tailLen: 0.11,
          earSize: 0.18,
        }),
        fox: this._buildQuadruped({
          body: 0xd96b38,
          chest: 0xfff5e6,
          head: 0xd96b38,
          earOuter: 0x241a18,
          earInner: 0xf2c9a0,
          collar: 0x5ca37b,
          tailLen: 0.42,
          tailTip: 0xfff5e6,
          earSize: 0.17,
        }),
        duck: this._buildDuck(),
      };

      Object.values(this.models).forEach((m) => this.root.add(m.group));
      tagInteractable(this.root, 'cat');
      scene.add(this.root);

      this.setPetType('cat');
    }

    _buildQuadruped(cfg) {
      const group = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: cfg.body, roughness: 0.84 });
      const chestMat = new THREE.MeshStandardMaterial({ color: cfg.chest, roughness: 0.88 });
      const headMat = new THREE.MeshStandardMaterial({ color: cfg.head, roughness: 0.82 });
      const earOutMat = new THREE.MeshStandardMaterial({ color: cfg.earOuter, roughness: 0.85 });
      const earInMat = new THREE.MeshStandardMaterial({ color: cfg.earInner, roughness: 0.85 });
      const darkMat = new THREE.MeshBasicMaterial({ color: 0x1a1520 });

      // Main torso + fluffy chest puff
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.34, 6, 12), bodyMat);
      torso.rotation.x = Math.PI / 2;
      torso.position.set(0, 0.25, 0);
      torso.castShadow = true;

      const chest = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), chestMat);
      chest.position.set(0, 0.24, 0.17);
      group.add(torso, chest);

      // Cute Collar + Tiny Golden Bell
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.135, 0.025, 6, 14),
        new THREE.MeshStandardMaterial({ color: cfg.collar, roughness: 0.6 })
      );
      collar.position.set(0, 0.31, 0.21);
      collar.rotation.x = 0.65;
      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd275, metalness: 0.6, roughness: 0.3 })
      );
      bell.position.set(0, 0.23, 0.31);
      group.add(collar, bell);

      // 4 Articulated Legs + Paws
      const legs = [];
      [
        [-0.1, 0.16],
        [0.1, 0.16],
        [-0.1, -0.16],
        [0.1, -0.16],
      ].forEach(([lx, lz], idx) => {
        const legPivot = new THREE.Group();
        legPivot.position.set(lx, 0.22, lz);
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.13, 4, 8), bodyMat);
        leg.position.y = -0.09;
        leg.castShadow = true;
        const paw = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), chestMat);
        paw.position.set(0, -0.18, 0.02);
        legPivot.add(leg, paw);
        group.add(legPivot);
        legs.push({ pivot: legPivot, phase: idx === 0 || idx === 3 ? 0 : Math.PI });
      });

      // Sculpted Head + Snout + Nose + Eyes + Ears (facing +Z)
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.38, 0.27);
      const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.165, 14, 12), headMat);
      cranium.castShadow = true;
      const snout = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), chestMat);
      snout.scale.set(1.0, 0.78, 1.15);
      snout.position.set(0, -0.04, 0.14);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), darkMat);
      nose.position.set(0, -0.015, 0.22);

      [-0.068, 0.068].forEach((ex) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), darkMat);
        eye.position.set(ex, 0.025, 0.145);
        const glint = new THREE.Mesh(
          new THREE.SphereGeometry(0.009, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        glint.position.set(ex + 0.008, 0.035, 0.168);

        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.065, cfg.earSize, 4), earOutMat);
        ear.position.set(ex * 1.4, 0.16, -0.01);
        ear.rotation.z = ex > 0 ? -0.18 : 0.18;
        const earIn = new THREE.Mesh(new THREE.ConeGeometry(0.036, cfg.earSize * 0.65, 4), earInMat);
        earIn.position.set(ex * 1.4, 0.15, 0.015);
        earIn.rotation.z = ex > 0 ? -0.18 : 0.18;
        headGroup.add(eye, glint, ear, earIn);
      });
      headGroup.add(cranium, snout, nose);
      group.add(headGroup);

      // Wagging Fluffy Tail
      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 0.28, -0.24);
      const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, cfg.tailLen, 5, 8), bodyMat);
      tail.position.set(0, 0.06, -cfg.tailLen * 0.55);
      tail.rotation.x = 0.75;
      tailPivot.add(tail);
      if (cfg.tailTip) {
        const tip = new THREE.Mesh(
          new THREE.SphereGeometry(0.058, 8, 8),
          new THREE.MeshStandardMaterial({ color: cfg.tailTip })
        );
        tip.position.set(0, 0.14, -cfg.tailLen * 0.95);
        tailPivot.add(tip);
      }
      group.add(tailPivot);

      return { group, legs, headGroup, tailPivot };
    }

    _buildDuck() {
      const group = new THREE.Group();
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfbf7f0, roughness: 0.75 });
      const billMat = new THREE.MeshStandardMaterial({ color: 0xff9e4a, roughness: 0.6 });
      const darkMat = new THREE.MeshBasicMaterial({ color: 0x1a1520 });

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), whiteMat);
      body.scale.set(0.92, 0.8, 1.3);
      body.position.set(0, 0.22, 0);
      body.castShadow = true;

      // Folded wings on both sides
      [-0.17, 0.17].forEach((wx) => {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), whiteMat);
        wing.scale.set(0.45, 0.75, 1.25);
        wing.position.set(wx, 0.24, -0.02);
        group.add(wing);
      });

      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.42, 0.18);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), whiteMat);
      const bill = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.045, 0.14), billMat);
      bill.position.set(0, -0.015, 0.15);
      [-0.055, 0.055].forEach((ex) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), darkMat);
        eye.position.set(ex, 0.025, 0.11);
        headGroup.add(eye);
      });
      headGroup.add(head, bill);

      const legs = [];
      [-0.08, 0.08].forEach((lx, idx) => {
        const pivot = new THREE.Group();
        pivot.position.set(lx, 0.1, 0);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.14), billMat);
        foot.position.set(0, -0.08, 0.03);
        pivot.add(foot);
        group.add(pivot);
        legs.push({ pivot, phase: idx === 0 ? 0 : Math.PI });
      });

      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 0.26, -0.25);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 6), whiteMat);
      tail.rotation.x = -0.8;
      tailPivot.add(tail);

      group.add(body, headGroup, tailPivot);
      return { group, legs, headGroup, tailPivot };
    }

    setPetType(pet) {
      if (!this.models[pet]) return;
      this.petType = pet;
      Object.entries(this.models).forEach(([k, m]) => {
        m.group.visible = k === pet;
      });
    }

    setWaypoints(points) {
      if (!Array.isArray(points) || points.length === 0) return;
      this.waypoints = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
      this.waypointIdx = 0;
      this.targetPos.copy(this.waypoints[0]);
      this.root.position.copy(this.waypoints[0]);
      this.aiState = 'nap';
      this.aiTimer = 5.5;
    }

    triggerPetHappy() {
      this.happyTimer = 3.5;
      this.aiState = 'idle';
      this.aiTimer = 3.8;
      for (let i = 0; i < 4; i++) {
        const h = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.09, 0),
          new THREE.MeshBasicMaterial({ color: 0xf7768e, transparent: true, opacity: 1 })
        );
        h.position.set(
          this.root.position.x + (Math.random() - 0.5) * 0.55,
          this.root.position.y + 0.65,
          this.root.position.z + (Math.random() - 0.5) * 0.55
        );
        this.scene.add(h);
        this.hearts.push({ mesh: h, life: 0, maxLife: 1.5 + Math.random() * 0.45 });
      }
    }

    update(dt, time) {
      const m = this.models[this.petType];
      if (!m) return;

      // 1. Autonomous Roaming & Napping State Machine
      this.aiTimer -= dt;
      if (this.aiState === 'walk') {
        const toTarget = new THREE.Vector3().subVectors(this.targetPos, this.root.position);
        toTarget.y = 0;
        const dist = toTarget.length();
        if (dist < 0.08) {
          this.root.position.copy(this.targetPos);
          this.aiState = this.waypointIdx === 0 ? 'nap' : 'idle';
          this.aiTimer = this.waypointIdx === 0 ? 7 + Math.random() * 6 : 3.5 + Math.random() * 4;
        } else {
          const speed = 0.65;
          toTarget.normalize();
          this.root.position.addScaledVector(toTarget, Math.min(dist, speed * dt));
          // Smoothly rotate to face walking direction (+Z)
          const targetYaw = Math.atan2(toTarget.x, toTarget.z);
          let diff = targetYaw - this.root.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          this.root.rotation.y += diff * Math.min(1, dt * 6);

          // Cute walking leg cycle & gentle bounce
          this.walkCycle += dt * 9.5;
          m.legs.forEach((l) => {
            l.pivot.rotation.x = Math.sin(this.walkCycle + l.phase) * 0.48;
          });
          m.group.position.y = Math.abs(Math.sin(this.walkCycle)) * 0.04;
          m.tailPivot.rotation.y = Math.sin(time * 7) * 0.32;
        }
      } else {
        // Resting / Napping or Idle
        m.legs.forEach((l) => {
          l.pivot.rotation.x *= 0.85;
        });
        const isNap = this.aiState === 'nap';
        m.group.position.y = isNap ? -0.08 : 0;
        m.headGroup.rotation.x = isNap ? 0.28 : Math.sin(time * 1.2) * 0.06;
        m.tailPivot.rotation.y = Math.sin(time * (this.happyTimer > 0 ? 11 : 2.2)) * 0.25;

        if (this.aiTimer <= 0 && this.waypoints.length > 1) {
          // Pick a safe collision-free waypoint in the current diorama!
          let next = Math.floor(Math.random() * this.waypoints.length);
          if (next === this.waypointIdx) next = (next + 1) % this.waypoints.length;
          this.waypointIdx = next;
          this.targetPos.copy(this.waypoints[next]);
          this.aiState = 'walk';
        }
      }

      // 2. Happy Petting Bounce & Rising 3D Hearts
      if (this.happyTimer > 0) {
        this.happyTimer = Math.max(0, this.happyTimer - dt);
        m.group.position.y += Math.abs(Math.sin(time * 9)) * 0.07;
      }

      for (let i = this.hearts.length - 1; i >= 0; i--) {
        const h = this.hearts[i];
        h.life += dt;
        h.mesh.position.y += dt * 0.85;
        h.mesh.rotation.y += dt * 3.2;
        h.mesh.material.opacity = Math.max(0, 1 - h.life / h.maxLife);
        if (h.life >= h.maxLife) {
          this.scene.remove(h.mesh);
          this.hearts.splice(i, 1);
        }
      }
    }
  }

  CozyGarden.Pets3D = Pets3D;
})();
