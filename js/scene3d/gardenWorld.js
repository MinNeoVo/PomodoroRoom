/* ==========================================================================
   Cozy Garden — 3D Floating Garden World (js/scene3d/gardenWorld.js)
   Floating meadow base, pond + duck, willow tree, potted plants, stone patio,
   picnic table + live animated laptop + notebook + mug, checkered blanket,
   lantern post & garden signpost clock.
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  class GardenWorld3D {
    constructor(scene, tagInteractable) {
      this.parentScene = scene;
      this.root = new THREE.Group();
      this.scene = this.root;
      this.tagInteractable = tagInteractable;

      this._buildFloatingBase();
      this._buildPondAndDuck();
      this._buildWillowAndFoliage();
      this._buildPatioAndPicnicTable();
      this._buildCheckeredBlanket();
      this._buildLanternAndSignpost();

      // Apply signature Sakura Garden palette
      this.grassMatMain.color.setHex(0x6c8c58);
      this.grassMatLight.color.setHex(0x8eb072);
      this.grassMatDark.color.setHex(0x4c693e);
      this.pondMat.color.setHex(0x7ab4c7);
      this.pondDeepMat.color.setHex(0x518ca3);
      this.leafMatDark.color.setHex(0xb35d7b);
      this.leafMatMid.color.setHex(0xde87a4);
      this.leafMatLight.color.setHex(0xffbfd4);

      this.parentScene.add(this.root);
    }

    setVisible(v) {
      this.root.visible = v;
    }

    getCharacterAnchor(pomoMode, breakActivity) {
      if (pomoMode !== 'break') {
        // Seated cleanly ON TOP of picnic bench (bench top = 0.665 -> y = 0.50) right at laptop keyboard!
        const bw = new THREE.Vector3(0.05, 0, 0.62).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.55);
        return { x: -1.35 + bw.x, y: 0.50, z: 0.65 + bw.z, rotY: 0.55 };
      }
      // 0 & 1: Standing grounded on patio facing front toward camera (rotY = PI + 0.56 = 3.70)
      if (breakActivity === 0) return { x: -0.25, y: 0.34, z: 1.55, rotY: 3.7 };
      if (breakActivity === 1) return { x: -0.25, y: 0.34, z: 1.55, rotY: 3.7 };
      // 2: Standing grounded on top wooden pond dock step, fishing over the pond!
      return { x: 0.32, y: 0.45, z: 0.48, rotY: -0.45, hasFishingRod: true };
    }

    getPetWaypoints() {
      return [
        { x: 1.25, y: 0.21, z: 1.85 },
        { x: 2.05, y: 0.20, z: 1.95 },
        { x: 1.55, y: 0.20, z: 2.38 },
        { x: 0.62, y: 0.20, z: 2.18 },
        { x: 2.35, y: 0.20, z: 1.38 },
      ];
    }

    getBottlePosition() {
      return { x: 1.05, y: 0.21, z: -0.75 };
    }

    _buildFloatingBase() {
      this.grassMatMain = new THREE.MeshStandardMaterial({ color: 0x6b7a3d, roughness: 0.92 });
      this.grassMatLight = new THREE.MeshStandardMaterial({ color: 0x8fa14c, roughness: 0.92 });
      this.grassMatDark = new THREE.MeshStandardMaterial({ color: 0x4c592a, roughness: 0.95 });
      const soilMat = new THREE.MeshStandardMaterial({ color: 0x5c4338, roughness: 0.96 });

      const lobes = [
        { x: -1.1, z: 0.7, r: 2.85, h: 0.36, mat: this.grassMatLight },
        { x: 1.5, z: -0.6, r: 2.75, h: 0.34, mat: this.grassMatMain },
        { x: 1.4, z: 1.65, r: 2.45, h: 0.35, mat: this.grassMatMain },
        { x: -1.7, z: -1.35, r: 2.3, h: 0.38, mat: this.grassMatDark },
        { x: 3.15, z: 0.45, r: 1.85, h: 0.34, mat: this.grassMatMain },
        { x: -2.4, z: 1.6, r: 1.45, h: 0.33, mat: this.grassMatLight },
      ];

      lobes.forEach((lb) => {
        const top = new THREE.Mesh(new THREE.CylinderGeometry(lb.r, lb.r * 0.96, lb.h, 24), lb.mat);
        top.position.set(lb.x, -0.02, lb.z);
        top.receiveShadow = true;
        this.scene.add(top);

        const under = new THREE.Mesh(new THREE.CylinderGeometry(lb.r * 0.95, lb.r * 0.82, 0.24, 20), soilMat);
        under.position.set(lb.x, -0.28, lb.z);
        this.scene.add(under);
      });

      const sc = document.createElement('canvas');
      sc.width = 128;
      sc.height = 128;
      const sctx = sc.getContext('2d');
      const sg = sctx.createRadialGradient(64, 64, 18, 64, 64, 62);
      sg.addColorStop(0, 'rgba(38, 22, 18, 0.34)');
      sg.addColorStop(1, 'rgba(38, 22, 18, 0)');
      sctx.fillStyle = sg;
      sctx.fillRect(0, 0, 128, 128);
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(12.5, 11.2),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(0.3, -0.44, 0.35);
      this.scene.add(shadow);
    }

    _buildPondAndDuck() {
      const pondX = 1.45;
      const pondZ = -0.65;

      this.pondMat = new THREE.MeshStandardMaterial({
        color: 0x6eb6c9,
        roughness: 0.18,
        metalness: 0.12,
        transparent: true,
        opacity: 0.92,
      });
      const pond = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.0, 0.08, 28), this.pondMat);
      pond.position.set(pondX, 0.14, pondZ);
      pond.scale.set(1.12, 1, 0.88);
      pond.receiveShadow = true;
      this.scene.add(pond);

      this.pondDeepMat = new THREE.MeshBasicMaterial({ color: 0x478da3, transparent: true, opacity: 0.45 });
      const deep = new THREE.Mesh(new THREE.CircleGeometry(1.45, 24), this.pondDeepMat);
      deep.rotation.x = -Math.PI / 2;
      deep.position.set(pondX - 0.1, 0.185, pondZ - 0.05);
      this.scene.add(deep);

      const lilyMat = new THREE.MeshStandardMaterial({ color: 0x5f8c46, roughness: 0.85 });
      [
        [0.8, -1.25, 0.42, 0.4],
        [1.15, -1.45, 0.25, 1.2],
        [2.55, -0.55, 0.38, 2.3],
        [2.3, -0.15, 0.28, 0.8],
        [2.15, -1.15, 0.22, 3.1],
      ].forEach(([x, z, r, rot]) => {
        const pad = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r, 0.03, 14, 1, false, 0.22, Math.PI * 1.88),
          lilyMat
        );
        pad.position.set(x, 0.19, z);
        pad.rotation.y = rot;
        pad.receiveShadow = true;
        this.scene.add(pad);
      });

      const rockMat = new THREE.MeshStandardMaterial({ color: 0x736c69, roughness: 0.92, flatShading: true });
      [
        [0.05, -1.65, 0.55],
        [0.55, -2.0, 0.42],
        [1.05, 0.85, 0.52],
        [1.45, 0.95, 0.34],
        [3.15, -1.1, 0.48],
      ].forEach(([x, z, r]) => {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), rockMat);
        rock.scale.set(1.2, 0.72, 1.0);
        rock.position.set(x, 0.25, z);
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
      });

      // 2-step wooden pond dock
      const dockWood = new THREE.MeshStandardMaterial({ color: 0x8f4e45, roughness: 0.85 });
      const dockSide = new THREE.MeshStandardMaterial({ color: 0x5e342e, roughness: 0.9 });
      const step1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.46), dockWood);
      step1.position.set(0.32, 0.26, 0.48);
      step1.rotation.y = -0.38;
      step1.castShadow = true;
      step1.receiveShadow = true;
      const step2 = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.46), dockWood);
      step2.position.set(0.56, 0.19, 0.14);
      step2.rotation.y = -0.38;
      step2.castShadow = true;
      step2.receiveShadow = true;
      const underStep = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.18, 0.8), dockSide);
      underStep.position.set(0.42, 0.12, 0.32);
      underStep.rotation.y = -0.38;
      this.scene.add(step1, step2, underStep);

      // Swimming white duck
      this.pondDuck = new THREE.Group();
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfaf7f2, roughness: 0.7 });
      const billMat = new THREE.MeshStandardMaterial({ color: 0xf29f4b, roughness: 0.6 });
      const dBody = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), whiteMat);
      dBody.scale.set(1.3, 0.75, 0.95);
      const dHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), whiteMat);
      dHead.position.set(0.18, 0.16, 0);
      const dBill = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.1), billMat);
      dBill.position.set(0.3, 0.14, 0);
      this.pondDuck.add(dBody, dHead, dBill);
      this.pondDuck.position.set(1.75, 0.24, -0.45);
      this.scene.add(this.pondDuck);

      this.duckRipple = new THREE.Mesh(
        new THREE.RingGeometry(0.26, 0.31, 20),
        new THREE.MeshBasicMaterial({ color: 0xe6f8ff, transparent: true, opacity: 0.55 })
      );
      this.duckRipple.rotation.x = -Math.PI / 2;
      this.duckRipple.position.set(1.75, 0.195, -0.45);
      this.scene.add(this.duckRipple);
    }

    _buildWillowAndFoliage() {
      this.treeGroup = new THREE.Group();
      this.treeGroup.position.set(-1.55, 0.18, -1.9);

      const barkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a31, roughness: 0.94, flatShading: true });
      const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 2.7, 9), barkMat);
      mainTrunk.position.y = 1.3;
      mainTrunk.rotation.z = -0.1;
      mainTrunk.castShadow = true;
      const br1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.8, 7), barkMat);
      br1.position.set(-0.65, 2.3, 0.4);
      br1.rotation.z = 0.65;
      br1.castShadow = true;
      const br2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 1.9, 7), barkMat);
      br2.position.set(0.85, 2.4, 0.35);
      br2.rotation.z = -0.68;
      br2.castShadow = true;
      this.treeGroup.add(mainTrunk, br1, br2);

      this.leafMatDark = new THREE.MeshStandardMaterial({ color: 0x355233, roughness: 0.88, flatShading: true });
      this.leafMatMid = new THREE.MeshStandardMaterial({ color: 0x4f753c, roughness: 0.86, flatShading: true });
      this.leafMatLight = new THREE.MeshStandardMaterial({ color: 0x7c9c4a, roughness: 0.84, flatShading: true });

      const canopy = new THREE.Group();
      canopy.position.y = 2.95;
      [
        [0, 0.75, 0, 1.65, this.leafMatMid],
        [-1.35, 0.15, 0.55, 1.25, this.leafMatDark],
        [1.35, 0.25, 0.35, 1.3, this.leafMatMid],
        [-0.45, 1.25, 0.4, 1.15, this.leafMatLight],
        [0.65, 1.1, -0.35, 1.1, this.leafMatLight],
        [-1.85, -0.35, 0.95, 0.95, this.leafMatLight],
      ].forEach(([x, y, z, r, mat]) => {
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), mat);
        m.position.set(x, y, z);
        m.scale.set(1.15, 0.85, 1.05);
        m.castShadow = true;
        canopy.add(m);
      });
      this.treeGroup.add(canopy);
      this.scene.add(this.treeGroup);

      [
        [-2.75, -0.2, 0.95, this.leafMatDark],
        [-2.35, 0.5, 0.78, this.leafMatDark],
        [-3.25, 0.9, 0.65, this.leafMatMid],
        [1.45, -2.15, 0.82, this.leafMatMid],
        [2.35, -1.95, 0.85, this.leafMatDark],
        [3.15, -1.45, 0.82, this.leafMatMid],
        [3.55, -0.75, 0.72, this.leafMatDark],
      ].forEach(([x, z, r, mat]) => {
        const b = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), mat);
        b.position.set(x, 0.45, z);
        b.scale.set(1.1, 0.85, 1.0);
        b.castShadow = true;
        b.receiveShadow = true;
        this.scene.add(b);
      });

      // Right-side sculptural mossy stump
      const stump = new THREE.Group();
      stump.position.set(3.85, 0.16, 0.25);
      const stMain = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.46, 1.95, 7), barkMat);
      stMain.position.y = 0.95;
      stMain.rotation.z = -0.14;
      stMain.castShadow = true;
      const stFork = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.95, 6), barkMat);
      stFork.position.set(0.32, 1.45, 0.1);
      stFork.rotation.z = -0.65;
      stump.add(stMain, stFork);
      this.scene.add(stump);

      const addPot = (x, z, potCol, tall = false) => {
        const pg = new THREE.Group();
        pg.position.set(x, 0.18, z);
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.17, 0.34, 10),
          new THREE.MeshStandardMaterial({ color: potCol, roughness: 0.7 })
        );
        pot.position.y = 0.17;
        pot.castShadow = true;
        pg.add(pot);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x4d8a55, roughness: 0.8 });
        if (tall) {
          for (let i = 0; i < 5; i++) {
            const lf = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.65, 5), pMat);
            lf.position.set(Math.cos(i * 1.25) * 0.08, 0.55, Math.sin(i * 1.25) * 0.08);
            lf.rotation.z = Math.cos(i) * 0.2;
            pg.add(lf);
          }
        } else {
          for (let i = 0; i < 4; i++) {
            const lf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), pMat);
            lf.position.set(Math.cos(i * 1.57) * 0.12, 0.42, Math.sin(i * 1.57) * 0.12);
            pg.add(lf);
          }
        }
        this.scene.add(pg);
      };

      addPot(-3.1, 1.8, 0x4f78c4, false);
      addPot(-3.35, 2.25, 0xc4584f, false);
      addPot(2.75, 0.85, 0x9c6b98, true);
      addPot(-0.1, 2.65, 0xb8744b, true);
    }

    _buildPatioAndPicnicTable() {
      const tc = document.createElement('canvas');
      tc.width = 256;
      tc.height = 256;
      const ctx = tc.getContext('2d');
      ctx.fillStyle = '#c4a678';
      ctx.fillRect(0, 0, 256, 256);
      const cols = ['#d9be8f', '#cfb180', '#e0c79b', '#c7a777'];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          ctx.fillStyle = cols[(r * 3 + c * 5) % cols.length];
          ctx.fillRect(c * 42 + 3, r * 42 + 3, 36, 36);
        }
      }
      const patio = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.05, 2.7),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(tc), roughness: 0.92 })
      );
      patio.position.set(-1.15, 0.185, 1.05);
      patio.rotation.y = 0.35;
      patio.receiveShadow = true;
      this.scene.add(patio);

      // Picnic Table & Benches
      this.picnicGroup = new THREE.Group();
      this.picnicGroup.position.set(-1.35, 0.21, 0.65);
      this.picnicGroup.rotation.y = 0.55;

      const woodTop = new THREE.MeshStandardMaterial({ color: 0x854f3c, roughness: 0.8 });
      const woodBench = new THREE.MeshStandardMaterial({ color: 0x995d47, roughness: 0.82 });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0xb8b8c2, roughness: 0.45, metalness: 0.4 });

      const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.09, 0.95), woodTop);
      tableTop.position.y = 0.72;
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      this.picnicGroup.add(tableTop);

      [-0.68, 0.68].forEach((bz) => {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.07, 0.32), woodBench);
        bench.position.set(0, 0.42, bz);
        bench.castShadow = true;
        bench.receiveShadow = true;
        this.picnicGroup.add(bench);
      });

      [-0.65, 0.65].forEach((lx) => {
        const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.82, 6), metalMat);
        l1.position.set(lx, 0.36, -0.32);
        l1.rotation.x = 0.36;
        const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.82, 6), metalMat);
        l2.position.set(lx, 0.36, 0.32);
        l2.rotation.x = -0.36;
        const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.56, 6), metalMat);
        cr.rotation.x = Math.PI / 2;
        cr.position.set(lx, 0.38, 0);
        this.picnicGroup.add(l1, l2, cr);
      });

      // Laptop with live animated document/code screen!
      this.screenCanvas = document.createElement('canvas');
      this.screenCanvas.width = 128;
      this.screenCanvas.height = 84;
      this.screenTex = new THREE.CanvasTexture(this.screenCanvas);
      this._redrawLaptopScreen(0);

      this.laptopGroup = new THREE.Group();
      this.laptopGroup.position.set(0.05, 0.78, 0.22);
      const lapBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.03, 0.36),
        new THREE.MeshStandardMaterial({ color: 0xe6e6ee, roughness: 0.4 })
      );
      const kbMat = new THREE.MeshBasicMaterial({ color: 0x3b4054 });
      const kb = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), kbMat);
      kb.rotation.x = -Math.PI / 2;
      kb.position.set(0, 0.017, 0.03);

      this.laptopLidPivot = new THREE.Group();
      this.laptopLidPivot.position.set(0, 0.015, -0.17);
      const lid = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.33, 0.025),
        new THREE.MeshStandardMaterial({ color: 0xd9d9e3, roughness: 0.4 })
      );
      lid.position.set(0, 0.165, 0);
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.43, 0.28),
        new THREE.MeshBasicMaterial({ map: this.screenTex })
      );
      screen.position.set(0, 0.165, 0.015);
      this.laptopLidPivot.add(lid, screen);
      this.laptopLidPivot.rotation.x = -0.22;
      this.laptopGroup.add(lapBase, kb, this.laptopLidPivot);

      this.laptopLight = new THREE.PointLight(0xffccd5, 0.48, 2.5);
      this.laptopLight.position.set(0, 0.28, 0.12);
      this.laptopGroup.add(this.laptopLight);
      this.picnicGroup.add(this.laptopGroup);

      // Open Notebook & Pen right beside laptop (reinforces active studying/working!)
      const nb = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.022, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xfff8ed, roughness: 0.9 })
      );
      nb.position.set(-0.42, 0.78, 0.18);
      nb.rotation.y = 0.18;
      const pen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x3d5a80 })
      );
      pen.rotation.z = Math.PI / 2;
      pen.rotation.y = 0.5;
      pen.position.set(-0.36, 0.8, 0.22);
      this.picnicGroup.add(nb, pen);

      // Tiny potted succulent on left corner
      const miniPot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.07, 0.13, 8),
        new THREE.MeshStandardMaterial({ color: 0xe6c86e })
      );
      miniPot.position.set(-0.62, 0.83, -0.18);
      const miniPlant = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.09, 0),
        new THREE.MeshStandardMaterial({ color: 0x5f9c54 })
      );
      miniPlant.position.set(-0.62, 0.94, -0.18);
      this.picnicGroup.add(miniPot, miniPlant);

      // Interactive Mug
      this.mugGroup = new THREE.Group();
      const mugBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.085, 0.18, 10),
        new THREE.MeshStandardMaterial({ color: 0xf2e8dc, roughness: 0.5 })
      );
      const coffee = new THREE.Mesh(
        new THREE.CircleGeometry(0.075, 10),
        new THREE.MeshBasicMaterial({ color: 0x7a4427 })
      );
      coffee.rotation.x = -Math.PI / 2;
      coffee.position.y = 0.092;
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.05, 0.016, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0xf2e8dc })
      );
      handle.position.set(0.09, 0, 0);
      this.mugGroup.add(mugBody, coffee, handle);
      this.mugHomeLocal = new THREE.Vector3(0.48, 0.86, 0.02);
      this.mugGroup.position.copy(this.mugHomeLocal);
      this.tagInteractable(this.mugGroup, 'mug');
      this.picnicGroup.add(this.mugGroup);

      // Rising Steam Puffs
      this.steamPuffs = [];
      const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
      for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.036, 6, 6), pMat.clone());
        this.picnicGroup.add(p);
        this.steamPuffs.push({ mesh: p, offset: i / 4 });
      }

      this.scene.add(this.picnicGroup);
    }

    _redrawLaptopScreen(step) {
      const ctx = this.screenCanvas.getContext('2d');
      ctx.fillStyle = '#ffccd5';
      ctx.fillRect(0, 0, 128, 84);
      ctx.fillStyle = '#fff5f7';
      ctx.fillRect(6, 6, 116, 72);
      const lineCols = ['#6c7a9c', '#d97a9e', '#5ca37b', '#e09a54'];
      for (let i = 0; i < 7; i++) {
        const w = 26 + (((i * 29 + step * 11) % 66));
        ctx.fillStyle = lineCols[i % lineCols.length];
        ctx.fillRect(14, 14 + i * 9, w, 4);
      }
      this.screenTex.needsUpdate = true;
    }

    _buildCheckeredBlanket() {
      const group = new THREE.Group();
      group.position.set(1.25, 0.18, 1.85);
      group.rotation.y = -0.28;

      const bc = document.createElement('canvas');
      bc.width = 128;
      bc.height = 128;
      const bctx = bc.getContext('2d');
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          bctx.fillStyle = (r + c) % 2 === 0 ? '#f5eadc' : '#d49d87';
          bctx.fillRect(c * 16, r * 16, 16, 16);
        }
      }
      const blanket = new THREE.Mesh(
        new THREE.BoxGeometry(2.05, 0.03, 1.55),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(bc), roughness: 0.95 })
      );
      blanket.position.y = 0.015;
      blanket.receiveShadow = true;
      group.add(blanket);

      [0x8c523c, 0x5c7a5c, 0xd49b54].forEach((col, i) => {
        const bk = new THREE.Mesh(
          new THREE.BoxGeometry(0.36, 0.07, 0.26),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 })
        );
        bk.position.set(0.68, 0.06 + i * 0.072, -0.45);
        bk.rotation.y = i * 0.15;
        bk.castShadow = true;
        group.add(bk);
      });

      this.scene.add(group);
    }

    _buildLanternAndSignpost() {
      this.lanternGroup = new THREE.Group();
      this.lanternGroup.position.set(-0.25, 0.18, -0.55);
      const wood = new THREE.MeshStandardMaterial({ color: 0x5c3e30, roughness: 0.9 });
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 2.05, 8), wood);
      post.position.y = 1.02;
      post.castShadow = true;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.07), wood);
      arm.position.set(-0.22, 2.0, 0);

      this.lanternGlassMat = new THREE.MeshStandardMaterial({
        color: 0xffe8ad,
        emissive: 0xffa64d,
        emissiveIntensity: 1.2,
      });
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.24), this.lanternGlassMat);
      glass.position.set(-0.44, 1.74, 0);
      this.lanternLight = new THREE.PointLight(0xffb466, 1.2, 10);
      this.lanternLight.position.set(-0.44, 1.7, 0);
      this.lanternGroup.add(post, arm, glass, this.lanternLight);
      this.tagInteractable(this.lanternGroup, 'lamp');
      this.scene.add(this.lanternGroup);

      // Garden Signpost Clock (compact ground sign — top clock is crisp HTML HUD!)
      this.clockCanvas = document.createElement('canvas');
      this.clockCanvas.width = 256;
      this.clockCanvas.height = 96;
      this.clockTex = new THREE.CanvasTexture(this.clockCanvas);

      const signGroup = new THREE.Group();
      signGroup.position.set(-2.35, 0.18, 2.05);
      signGroup.rotation.y = 0.52;
      const sPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.72, 6), wood);
      sPost.position.y = 0.36;
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.42, 0.08), wood);
      board.position.y = 0.72;
      board.castShadow = true;
      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(0.84, 0.34),
        new THREE.MeshBasicMaterial({ map: this.clockTex, transparent: true })
      );
      face.position.set(0, 0.72, 0.045);
      signGroup.add(sPost, board, face);
      this.tagInteractable(signGroup, 'clock');
      this.scene.add(signGroup);
    }

    updateClockTexture(text, pomoMode, pomoRunning, artStyle) {
      const ctx = this.clockCanvas.getContext('2d');
      ctx.clearRect(0, 0, 256, 96);
      ctx.fillStyle = '#241a17';
      ctx.fillRect(0, 0, 256, 96);
      const col =
        artStyle === 'cyberpunk'
          ? pomoMode === 'break' ? '#39ff9c' : '#00f0ff'
          : pomoMode === 'break' ? '#a8e6cf' : pomoRunning ? '#ffe3a3' : '#fcf5ed';
      ctx.font = 'bold 54px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col;
      ctx.fillText(text, 128, 48);
      this.clockTex.needsUpdate = true;
    }

    applyTheme(t, lampMode) {
      this.grassMatMain.color.setHex(t.grassMain);
      this.grassMatLight.color.setHex(t.grassLight);
      this.grassMatDark.color.setHex(t.grassDark);
      this.pondMat.color.setHex(t.pondWater);
      this.pondDeepMat.color.setHex(t.pondDeep);
      this.leafMatDark.color.setHex(t.leafDark);
      this.leafMatMid.color.setHex(t.leafMid);
      this.leafMatLight.color.setHex(t.leafLight);
      if (lampMode === 0) this.lanternLight.intensity = t.lampInt;
    }

    setLampMode(lampMode, theme) {
      const ints = [Math.max(1.4, theme.lampInt), 0.7, 0];
      this.lanternLight.intensity = ints[lampMode];
      this.lanternGlassMat.emissiveIntensity = lampMode === 2 ? 0 : lampMode === 1 ? 0.5 : 1.3;
    }

    setLaptopOpen(isOpen) {
      this.laptopLidPivot.rotation.x = isOpen ? -0.22 : -1.52;
      this.laptopLight.intensity = isOpen ? 0.48 : 0.04;
    }

    pulseTypingScreen(step) {
      this._redrawLaptopScreen(step);
    }

    update(dt, time, sipLift) {
      this.treeGroup.rotation.z = Math.sin(time * 0.8) * 0.018;

      // Swimming duck on pond
      const duckA = time * 0.35;
      const dx = 1.6 + Math.cos(duckA) * 0.62;
      const dz = -0.6 + Math.sin(duckA * 2) * 0.28;
      const nextDx = 1.6 + Math.cos(duckA + 0.05) * 0.62;
      const nextDz = -0.6 + Math.sin((duckA + 0.05) * 2) * 0.28;
      this.pondDuck.position.set(dx, 0.23 + Math.sin(time * 2.5) * 0.015, dz);
      this.pondDuck.rotation.y = -Math.atan2(nextDz - dz, nextDx - dx);
      this.duckRipple.position.set(dx, 0.195, dz);
      const rip = 1 + ((time * 0.6) % 1) * 0.8;
      this.duckRipple.scale.setScalar(rip);
      this.duckRipple.material.opacity = Math.max(0, 0.55 * (1 - ((time * 0.6) % 1)));

      // Mug sipping lift
      if (sipLift > 0.001) {
        const sipTarget = new THREE.Vector3(0.22, 1.08, 0.45);
        this.mugGroup.position.lerpVectors(this.mugHomeLocal, sipTarget, sipLift);
      } else {
        this.mugGroup.position.copy(this.mugHomeLocal);
      }

      // Steam puffs
      this.steamPuffs.forEach((p) => {
        const cyc = (time * 0.35 + p.offset) % 1;
        p.mesh.position.set(
          this.mugGroup.position.x + Math.sin(cyc * 6) * 0.03,
          this.mugGroup.position.y + 0.12 + cyc * 0.42,
          this.mugGroup.position.z
        );
        p.mesh.material.opacity = Math.sin(cyc * Math.PI) * 0.35;
      });
    }
  }

  CozyGarden.GardenWorld3D = GardenWorld3D;
})();
