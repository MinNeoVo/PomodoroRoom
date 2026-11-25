/* ==========================================================================
   Cozy Garden — Scene-Specific Glowing Collectible (js/scene3d/bottle3d.js)
   - Sakura Garden: Glass Message Bottle floating on the pond
   - Cozy Bedroom: Leather Diary Book resting on the bed
   - Corner Cafe: Take-away Latte Cup on the order counter
   All feature twinkling starburst light rays & orbiting golden sparkles!
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  class Bottle3D {
    constructor(scene, tagInteractable) {
      this.scene = scene;
      this.visible = true;
      this.cooldown = 0;
      this.variant = 'sakura';
      this.basePos = { x: 1.05, y: 0.21, z: -0.75 };

      this.group = new THREE.Group();
      this.group.position.set(1.05, 0.21, -0.75);

      this.itemPivot = new THREE.Group();
      this.group.add(this.itemPivot);

      this.variantModels = {
        sakura: this._buildBottleMesh(),
        room: this._buildDiaryMesh(),
        cafe: this._buildCafeCupMesh(),
      };
      Object.values(this.variantModels).forEach((m) => this.itemPivot.add(m));

      this._buildStarburstAndSparkles();
      this.setVariant('sakura');

      tagInteractable(this.group, 'bottle');
      scene.add(this.group);
    }

    _buildBottleMesh() {
      const g = new THREE.Group();
      g.rotation.z = 0.42;
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.095, 0.28, 12),
        new THREE.MeshStandardMaterial({
          color: 0x8ef0e0,
          emissive: 0x45c4b0,
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.88,
        })
      );
      const scroll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.048, 0.16, 8),
        new THREE.MeshBasicMaterial({ color: 0xfff2cc })
      );
      const cork = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0xb57b4a })
      );
      cork.position.y = 0.17;
      g.add(glass, scroll, cork);
      return g;
    }

    _buildDiaryMesh() {
      // Cozy Leather-bound Diary / Journal resting on the bed!
      const g = new THREE.Group();
      g.rotation.y = 0.35;
      const coverMat = new THREE.MeshStandardMaterial({
        color: 0x9c4d5b,
        emissive: 0x451a24,
        emissiveIntensity: 0.35,
        roughness: 0.72,
      });
      const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfff7e6, roughness: 0.9 });
      const cover = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.075, 0.48), coverMat);
      cover.castShadow = true;
      const pages = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.055, 0.44), pagesMat);
      pages.position.x = 0.02;
      const clasp = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.08, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffd275, metalness: 0.5, roughness: 0.35 })
      );
      clasp.position.set(0.18, 0, 0);
      const ribbon = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.015, 0.16),
        new THREE.MeshBasicMaterial({ color: 0xffe08a })
      );
      ribbon.position.set(0.04, 0.035, 0.27);
      g.add(cover, pages, clasp, ribbon);
      return g;
    }

    _buildCafeCupMesh() {
      // Cozy Cafe Order Cup with Cardboard Sleeve & Dome Lid on the counter!
      const g = new THREE.Group();
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.078, 0.28, 14),
        new THREE.MeshStandardMaterial({ color: 0xfff7ed, roughness: 0.65 })
      );
      cup.position.y = 0.14;
      cup.castShadow = true;
      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.098, 0.088, 0.11, 14),
        new THREE.MeshStandardMaterial({ color: 0xc98a5b, roughness: 0.85 })
      );
      sleeve.position.y = 0.14;
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.112, 0.112, 0.04, 14),
        new THREE.MeshStandardMaterial({ color: 0xf7efe4, roughness: 0.5 })
      );
      lid.position.y = 0.295;
      const straw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6),
        new THREE.MeshStandardMaterial({ color: 0x5ca37b })
      );
      straw.position.set(0.02, 0.35, 0);
      straw.rotation.z = -0.18;
      g.add(cup, sleeve, lid, straw);
      return g;
    }

    _buildStarburstAndSparkles() {
      this.rayGroup = new THREE.Group();
      this.rayGroup.position.y = 0.14;
      this.rays = [];

      const rc = document.createElement('canvas');
      rc.width = 32;
      rc.height = 128;
      const rctx = rc.getContext('2d');
      const rg = rctx.createLinearGradient(16, 128, 16, 0);
      rg.addColorStop(0, 'rgba(255, 240, 175, 0.9)');
      rg.addColorStop(0.5, 'rgba(156, 245, 232, 0.45)');
      rg.addColorStop(1, 'rgba(255, 240, 175, 0)');
      rctx.fillStyle = rg;
      rctx.beginPath();
      rctx.moveTo(12, 128);
      rctx.lineTo(20, 128);
      rctx.lineTo(17, 0);
      rctx.lineTo(15, 0);
      rctx.closePath();
      rctx.fill();
      const rayTex = new THREE.CanvasTexture(rc);

      for (let i = 0; i < 8; i++) {
        const mat = new THREE.MeshBasicMaterial({
          map: rayTex,
          transparent: true,
          opacity: 0.78,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.95), mat);
        const pivot = new THREE.Group();
        plane.position.y = 0.45;
        pivot.add(plane);
        pivot.rotation.y = (i / 8) * Math.PI * 2;
        pivot.rotation.z = i % 2 === 0 ? 0.55 : 0.95;
        this.rayGroup.add(pivot);
        this.rays.push({ mat, plane, phase: i * 0.85 });
      }
      this.group.add(this.rayGroup);

      this.sparkles = [];
      for (let i = 0; i < 6; i++) {
        const spMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xfff2a6 : 0x9cf7eb,
          transparent: true,
          opacity: 0.9,
        });
        const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), spMat);
        this.group.add(sp);
        this.sparkles.push({ mesh: sp, mat: spMat, angle: (i / 6) * Math.PI * 2, phase: i * 1.1 });
      }

      this.glowLight = new THREE.PointLight(0xffe9a6, 0.95, 2.8);
      this.glowLight.position.y = 0.25;
      this.group.add(this.glowLight);

      this.shimmerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.18, 0.24, 20),
        new THREE.MeshBasicMaterial({ color: 0xfff2c2, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      this.shimmerRing.rotation.x = -Math.PI / 2;
      this.shimmerRing.position.y = -0.01;
      this.group.add(this.shimmerRing);
    }

    setVariant(sceneId) {
      this.variant = this.variantModels[sceneId] ? sceneId : 'sakura';
      Object.entries(this.variantModels).forEach(([k, mesh]) => {
        mesh.visible = k === this.variant;
      });
      this.shimmerRing.visible = this.variant === 'sakura';
    }

    setBasePosition(x, y, z) {
      this.basePos = { x, y, z };
      this.group.position.set(x, y, z);
    }

    spawn() {
      this.visible = true;
      this.cooldown = 0;
      this.group.visible = true;
    }

    collect() {
      this.visible = false;
      this.cooldown = 75;
      this.group.visible = false;
    }

    update(dt, time) {
      if (!this.visible) {
        this.cooldown -= dt;
        if (this.cooldown <= 0) this.spawn();
        return;
      }

      if (this.variant === 'sakura') {
        this.group.position.y = this.basePos.y + Math.sin(time * 2.2) * 0.025;
        this.itemPivot.rotation.y += dt * 0.45;
      } else {
        this.group.position.y = this.basePos.y;
        this.itemPivot.rotation.y = 0;
      }

      this.rayGroup.rotation.y += dt * 0.4;
      this.rays.forEach((r) => {
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 4.5 + r.phase));
        r.mat.opacity = twinkle * 0.8;
        r.plane.scale.y = 0.72 + twinkle * 0.45;
      });

      this.sparkles.forEach((s) => {
        s.angle += dt * 1.1;
        const r = 0.3 + Math.sin(time * 2.4 + s.phase) * 0.08;
        s.mesh.position.set(
          Math.cos(s.angle) * r,
          0.22 + Math.sin(time * 3.2 + s.phase) * 0.16,
          Math.sin(s.angle) * r
        );
        const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 5.2 + s.phase));
        s.mesh.scale.setScalar(0.6 + tw * 0.65);
        s.mat.opacity = tw;
      });

      this.glowLight.intensity = 0.65 + 0.45 * Math.sin(time * 3.6);
      if (this.shimmerRing.visible) {
        const ringCycle = (time * 0.55) % 1;
        this.shimmerRing.scale.setScalar(1 + ringCycle * 1.4);
        this.shimmerRing.material.opacity = (1 - ringCycle) * 0.55;
      }
    }
  }

  CozyGarden.Bottle3D = Bottle3D;
})();
