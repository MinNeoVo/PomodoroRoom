/* ==========================================================================
   Cozy Garden — Anime Super-Chibi (SD) 3D Character (js/scene3d/character3d.js)
   Cohesive continuous-shell anime chibi hair (zero gaps!), 4 distinct uniform
   tops (Shirt+Tie, Blazer Vest, T-Shirt, Cozy Sweater), 4 distinct bottoms
   (Slacks, Shorts, Pleated Plaid Skirt, Jeans), gender-aware hair & defaults,
   wide anime glasses / headphones / beanie / cap, click-to-move & 4 emotes.
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  // Soft 3-step anime toon gradient map (pastel shadows, no harsh dark bands)
  let sharedToonGrad = null;
  function getToonGradient() {
    if (sharedToonGrad) return sharedToonGrad;
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 1;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#cac4cf';
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = '#eae6ef';
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 0, 2, 1);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    sharedToonGrad = tex;
    return tex;
  }

  // Procedural Anime Hair Texture (soft glossy highlight halo + subtle strands)
  function createHairTexture(baseHex, hiHex, tipHex) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    const colBase = '#' + baseHex.toString(16).padStart(6, '0');
    const colHi = '#' + (hiHex || baseHex).toString(16).padStart(6, '0');
    const colTip = '#' + (tipHex || baseHex).toString(16).padStart(6, '0');

    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0.0, colTip);
    grad.addColorStop(0.26, colBase);
    grad.addColorStop(0.42, colHi);
    grad.addColorStop(0.54, colBase);
    grad.addColorStop(1.0, colTip);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    for (let x = 0; x < 128; x += 7) {
      ctx.fillRect(x, 34, 2, 32);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let x = 3; x < 128; x += 9) {
      ctx.fillRect(x, 0, 2, 128);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  // Procedural Plaid Tartan Skirt Texture
  function createPlaidTexture(baseHex) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#' + baseHex.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = 'rgba(12, 10, 20, 0.25)';
    for (let i = 0; i < 128; i += 32) {
      ctx.fillRect(i, 0, 12, 128);
      ctx.fillRect(0, i, 128, 12);
    }
    ctx.fillStyle = 'rgba(225, 225, 245, 0.36)';
    for (let i = 0; i < 128; i += 32) {
      ctx.fillRect(i + 16, 0, 2, 128);
      ctx.fillRect(i + 21, 0, 2, 128);
      ctx.fillRect(0, i + 16, 128, 2);
      ctx.fillRect(0, i + 21, 128, 2);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3.5, 1.2);
    return tex;
  }

  // Procedural Striped Anime Tie Texture
  function createTieTexture(accentHex) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#252936';
    ctx.fillRect(0, 0, 64, 64);

    ctx.strokeStyle = '#' + accentHex.toString(16).padStart(6, '0');
    ctx.lineWidth = 6;
    for (let i = -64; i < 128; i += 18) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 64, 64);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // Smooth, hugging anime bang lock (curves gently inward to sit flush on forehead!)
  function createBangGeo(length, width, thickness, curveIn) {
    const geo = new THREE.ConeGeometry(width, length, 6, 5);
    geo.translate(0, -length * 0.5, 0);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = Math.max(0, Math.min(1, -y / length));
      const x = pos.getX(i);
      const z = pos.getZ(i) * (thickness / width);
      const arch = Math.sin(t * Math.PI) * 0.022;
      const tipCurve = Math.pow(t, 1.6) * curveIn;
      const widthProfile = Math.sin(t * Math.PI * 0.85) * 0.45 + (1 - t * 0.85);
      pos.setXYZ(i, x * widthProfile, y, z + arch + tipCurve);
    }
    geo.computeVertexNormals();
    return geo;
  }

  class Character3D {
    constructor(scene, tagInteractable) {
      this.scene = scene;
      this.group = new THREE.Group();
      this.bodyPivot = new THREE.Group();
      this.group.add(this.bodyPivot);

      const grad = getToonGradient();
      this.skinMat = new THREE.MeshToonMaterial({ color: 0xfff1e8, gradientMap: grad });
      this.hairMat = new THREE.MeshToonMaterial({
        color: 0xffffff,
        map: createHairTexture(0x6ba680, 0x9fd4b0, 0x4d8260),
        gradientMap: grad,
        side: THREE.DoubleSide,
      });
      this.hairSolidMat = new THREE.MeshToonMaterial({ color: 0x6ba680, gradientMap: grad });
      this.sweaterMat = new THREE.MeshToonMaterial({ color: 0xf7f8fc, gradientMap: grad });
      this.innerShirtMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad });
      this.cuffMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad });
      this.accentMat = new THREE.MeshToonMaterial({ color: 0x3b6068, gradientMap: grad });
      this.tieMat = new THREE.MeshToonMaterial({
        color: 0xffffff,
        map: createTieTexture(0x4c8a8a),
        gradientMap: grad,
      });
      this.skirtMat = new THREE.MeshToonMaterial({
        color: 0xffffff,
        map: createPlaidTexture(0x3a3748),
        gradientMap: grad,
        side: THREE.DoubleSide,
      });
      this.pantsMat = new THREE.MeshToonMaterial({ color: 0x2d3142, gradientMap: grad });
      this.legMat = new THREE.MeshToonMaterial({ color: 0x2a2a30, gradientMap: grad });
      this.shoeMat = new THREE.MeshToonMaterial({ color: 0x26262e, gradientMap: grad });

      this._buildChibiBody();
      this._buildChibiHead();
      this._buildBreakProps();

      this.emote = 'idle';
      this.actionAnim = null; // { kind: 'bonk'|'bonked'|'hug'|'poke', t: 0, dur: 1.0 }
      this.walkPhase = 0;
      this.isWalking = false;
      this.walkTarget = null;

      this.walkMarker = new THREE.Mesh(
        new THREE.RingGeometry(0.16, 0.24, 20),
        new THREE.MeshBasicMaterial({ color: 0xa8e6cf, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
      );
      this.walkMarker.rotation.x = -Math.PI / 2;
      this.walkMarker.visible = false;
      scene.add(this.walkMarker);

      tagInteractable(this.group, 'character');
      scene.add(this.group);
    }

    _buildChibiBody() {
      // Smooth rounded chibi pelvis (matches pants color!)
      this.pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 12), this.pantsMat);
      this.pelvis.scale.set(1.06, 0.74, 0.86);
      this.pelvis.position.set(0, 0.28, 0);
      this.pelvis.castShadow = true;
      this.bodyPivot.add(this.pelvis);

      // Bottom Style 2: Pleated Flared Plaid Skirt (ONLY shown when pants === 2!)
      const skirtGeo = new THREE.CylinderGeometry(0.155, 0.29, 0.21, 32, 3, true);
      const sp = skirtGeo.attributes.position;
      for (let i = 0; i < sp.count; i++) {
        const vx = sp.getX(i);
        const vy = sp.getY(i);
        const vz = sp.getZ(i);
        const angle = Math.atan2(vz, vx);
        const bottomFactor = Math.max(0, (0.105 - vy) / 0.21);
        const pleat = Math.sin(angle * 16) * 0.017 * bottomFactor;
        const r = Math.hypot(vx, vz) + pleat;
        sp.setXYZ(i, Math.cos(angle) * r, vy, Math.sin(angle) * r * 0.9);
      }
      skirtGeo.computeVertexNormals();
      this.skirtMesh = new THREE.Mesh(skirtGeo, this.skirtMat);
      this.skirtMesh.position.set(0, 0.245, 0);
      this.skirtMesh.castShadow = true;
      this.bodyPivot.add(this.skirtMesh);

      // Cute Articulated Chibi Legs (feet bottom cleanly at y = -0.133!)
      // Supports Slacks/Jeans (full pants), Shorts (thighs in pantsMat, calves in skinMat), Skirt (tights)
      this.legs = [];
      [-0.086, 0.086].forEach((lx) => {
        const hipJoint = new THREE.Group();
        hipJoint.position.set(lx, 0.26, 0);

        const hipBall = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), this.pantsMat);
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.18, 12), this.pantsMat);
        thigh.position.set(0, -0.09, 0);
        thigh.castShadow = true;

        // Cute cuff for Shorts style
        const shortCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.072, 0.055, 12), this.pantsMat);
        shortCuff.position.set(0, -0.135, 0);
        shortCuff.visible = false;

        const kneeJoint = new THREE.Group();
        kneeJoint.position.set(0, -0.18, 0);

        const calfPoints = [
          new THREE.Vector2(0.001, -0.213),
          new THREE.Vector2(0.032, -0.205),
          new THREE.Vector2(0.044, -0.155),
          new THREE.Vector2(0.062, -0.085),
          new THREE.Vector2(0.056, 0.0),
        ];
        const calf = new THREE.Mesh(new THREE.LatheGeometry(calfPoints, 12), this.legMat);
        calf.castShadow = true;

        const kneeBall = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 8), this.legMat);

        // Cute rounded sneakers (visible for Pants / Shorts / Jeans!)
        const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.06, 5, 8), this.shoeMat);
        shoe.rotation.x = Math.PI / 2;
        shoe.scale.set(1.0, 1.0, 0.8);
        shoe.position.set(0, -0.185, -0.025);
        shoe.visible = false;

        kneeJoint.add(kneeBall, calf, shoe);
        hipJoint.add(hipBall, thigh, shortCuff, kneeJoint);
        this.bodyPivot.add(hipJoint);
        this.legs.push({ hipJoint, kneeJoint, hipBall, thigh, shortCuff, kneeBall, calf, shoe });
      });

      // Upper Body Pivot (compact chibi torso with 4 distinct uniform tops!)
      this.upperBody = new THREE.Group();
      this.upperBody.position.set(0, 0.34, 0);
      this.bodyPivot.add(this.upperBody);

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.182, 0.34, 16), this.sweaterMat);
      torso.scale.set(1.06, 1, 0.82);
      torso.position.y = 0.16;
      torso.castShadow = true;

      const hem = new THREE.Mesh(new THREE.SphereGeometry(0.182, 14, 10), this.sweaterMat);
      hem.scale.set(1.06, 0.35, 0.82);
      hem.position.y = 0.01;

      this.shoulderBridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.078, 0.22, 6, 10), this.sweaterMat);
      this.shoulderBridge.rotation.z = Math.PI / 2;
      this.shoulderBridge.scale.set(1, 1, 0.84);
      this.shoulderBridge.position.set(0, 0.31, 0);
      this.shoulderBridge.castShadow = true;

      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.084, 0.022, 8, 16), this.cuffMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 0.34, 0);

      // Uniform Detail 1: Striped Necktie (for Shirt & Vest!)
      this.tieGroup = new THREE.Group();
      const tieKnot = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.04, 0.026), this.tieMat);
      tieKnot.position.set(0, 0.30, -0.132);
      const tieBody = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.21, 0.016), this.tieMat);
      tieBody.position.set(0.005, 0.18, -0.148);
      tieBody.rotation.z = 0.04;
      tieBody.rotation.x = -0.14;
      const tieTip = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.05, 4), this.tieMat);
      tieTip.rotation.z = Math.PI + 0.04;
      tieTip.rotation.y = Math.PI / 4;
      tieTip.scale.set(1, 1, 0.35);
      tieTip.position.set(0.01, 0.058, -0.162);
      this.tieGroup.add(tieKnot, tieBody, tieTip);

      // Uniform Detail 2: Tailored Blazer Vest V-Front & Gold Buttons (for Vest!)
      this.vestGroup = new THREE.Group();
      const vShirt = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.20, 4), this.innerShirtMat);
      vShirt.rotation.z = Math.PI;
      vShirt.scale.set(1, 1, 0.32);
      vShirt.position.set(0, 0.24, -0.132);
      const lapelMat = new THREE.MeshToonMaterial({ color: 0x202738, gradientMap: getToonGradient() });
      [-1, 1].forEach((side) => {
        const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.20, 0.02), lapelMat);
        lapel.position.set(side * 0.055, 0.23, -0.138);
        lapel.rotation.z = side * 0.28;
        lapel.rotation.x = -0.12;
        this.vestGroup.add(lapel);
      });
      const btnMat = new THREE.MeshToonMaterial({ color: 0xf2c96b, gradientMap: getToonGradient() });
      [0.12, 0.06].forEach((by) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), btnMat);
        b.position.set(0.038, by, -0.158);
        this.vestGroup.add(b);
      });
      this.vestGroup.add(vShirt);
      this.vestGroup.visible = false;

      // Uniform Detail 3: T-Shirt Chest Stripe & Pocket (for T-Shirt!)
      this.tshirtGroup = new THREE.Group();
      const tStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.172, 0.045, 16), this.innerShirtMat);
      tStripe.scale.set(1.06, 1, 0.83);
      tStripe.position.y = 0.19;
      this.tshirtGroup.add(tStripe);
      this.tshirtGroup.visible = false;

      // Uniform Detail 4: Cozy Knit Sweater Ribbed Collar & Hem (for Sweater!)
      this.sweaterTrimGroup = new THREE.Group();
      const swCollar = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.034, 8, 16), this.cuffMat);
      swCollar.rotation.x = Math.PI / 2;
      swCollar.position.set(0, 0.33, 0);
      const swHem = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.025, 8, 18), this.cuffMat);
      swHem.rotation.x = Math.PI / 2;
      swHem.scale.set(1.06, 0.82, 1);
      swHem.position.set(0, 0.01, 0);
      this.sweaterTrimGroup.add(swCollar, swHem);
      this.sweaterTrimGroup.visible = false;

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.056, 0.12, 10), this.skinMat);
      neck.position.set(0, 0.39, 0);

      this.torsoMesh = torso;
      this.upperBody.add(
        torso,
        hem,
        this.shoulderBridge,
        collar,
        this.tieGroup,
        this.vestGroup,
        this.tshirtGroup,
        this.sweaterTrimGroup,
        neck
      );

      // Cute Chibi Arms (supports both Short/Rolled Sleeves and Long Sleeves!)
      this.arms = {};
      [
        { key: 'left', side: -1 },
        { key: 'right', side: 1 },
      ].forEach(({ key, side }) => {
        const shoulder = new THREE.Group();
        shoulder.position.set(side * 0.175, 0.295, 0);

        const shBall = new THREE.Mesh(new THREE.SphereGeometry(0.066, 10, 8), this.sweaterMat);
        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.056, 0.15, 10), this.sweaterMat);
        upperArm.position.set(0, -0.075, 0);
        upperArm.castShadow = true;

        const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.017, 8, 12), this.cuffMat);
        cuff.rotation.x = Math.PI / 2;
        cuff.position.set(0, -0.145, 0);

        const elbow = new THREE.Group();
        elbow.position.set(0, -0.15, 0);

        const elBall = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), this.skinMat);
        const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.035, 0.15, 10), this.skinMat);
        forearm.position.set(0, -0.075, 0);
        forearm.castShadow = true;

        const wristCuff = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.013, 8, 12), this.cuffMat);
        wristCuff.rotation.x = Math.PI / 2;
        wristCuff.position.set(0, -0.14, 0);
        wristCuff.visible = false;

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), this.skinMat);
        hand.scale.set(0.95, 1.15, 0.85);
        hand.position.set(0, -0.165, 0);
        hand.castShadow = true;

        elbow.add(elBall, forearm, wristCuff, hand);
        shoulder.add(shBall, upperArm, cuff, elbow);
        this.upperBody.add(shoulder);
        this.arms[key] = { shoulder, elbow, hand, elBall, forearm, cuff, wristCuff };
      });
    }

    _buildChibiHead() {
      this.headGroup = new THREE.Group();
      this.headGroup.position.set(0, 0.67, 0);
      this.upperBody.add(this.headGroup);

      // Soft wide chubby anime head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.325, 24, 20), this.skinMat);
      head.scale.set(1.06, 0.96, 0.94);
      head.castShadow = true;
      this.headGroup.add(head);

      // === ICONIC CUTE CHIBI FACE (facing -Z) ===
      const inkMat = new THREE.MeshBasicMaterial({ color: 0x1e1a24 });
      const blushMat = new THREE.MeshBasicMaterial({ color: 0xf9b2ac, transparent: true, opacity: 0.78 });

      [-0.098, 0.098].forEach((ex) => {
        const eye = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.068, 6, 10), inkMat);
        eye.scale.set(1.0, 1.0, 0.45);
        eye.position.set(ex, -0.025, -0.302);
        eye.rotation.y = ex > 0 ? -0.18 : 0.18;
        this.headGroup.add(eye);

        const blush = new THREE.Mesh(new THREE.CircleGeometry(0.046, 14), blushMat);
        blush.scale.set(1.18, 0.76, 1);
        blush.rotation.y = Math.PI + (ex > 0 ? -0.28 : 0.28);
        blush.position.set(ex * 1.48, -0.11, -0.286);
        this.headGroup.add(blush);
      });

      const smile = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.0085, 8, 16, Math.PI * 0.72),
        inkMat
      );
      smile.rotation.z = Math.PI + Math.PI * 0.14;
      smile.position.set(0, -0.088, -0.306);
      this.headGroup.add(smile);

      // === COHESIVE, CONTINUOUS ANIME CHIBI HAIR (Zero Gaps!) ===
      this.hairGroup = new THREE.Group();
      this.headGroup.add(this.hairGroup);

      // 1. Continuous Smooth Crown Dome (wraps top & upper sides seamlessly)
      const hairCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.352, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.62),
        this.hairMat
      );
      hairCrown.scale.set(1.06, 0.99, 0.97);
      hairCrown.position.set(0, 0.022, 0.012);
      hairCrown.rotation.x = 0.15;
      hairCrown.castShadow = true;
      this.hairGroup.add(hairCrown);

      // 2. Continuous Sculpted Back+Sides Bob Shell (Female: full flared anime bob; zero gaps!)
      const bobPts = [
        new THREE.Vector2(0.358, 0.08),
        new THREE.Vector2(0.372, -0.04),
        new THREE.Vector2(0.382, -0.18),
        new THREE.Vector2(0.415, -0.29), // Cute subtle outward flare at bottom!
        new THREE.Vector2(0.385, -0.33),
      ];
      // phiStart & phiLength cover left side -> back -> right side continuously (leaving front face cleanly open!)
      const bobGeo = new THREE.LatheGeometry(bobPts, 28, -Math.PI * 0.76, Math.PI * 1.52);
      this.femaleBobShell = new THREE.Mesh(bobGeo, this.hairMat);
      this.femaleBobShell.scale.set(1.06, 1.0, 0.96);
      this.femaleBobShell.position.set(0, 0.02, 0.018);
      this.femaleBobShell.castShadow = true;
      this.hairGroup.add(this.femaleBobShell);

      // Subtle overlapping feathery bottom tips fused right along the bob rim
      this.femaleBobTips = new THREE.Group();
      const tipGeo = createBangGeo(0.18, 0.085, 0.04, -0.055);
      for (let i = 0; i < 10; i++) {
        const ang = 0.95 + (i / 9) * (Math.PI * 2 - 1.9);
        const tip = new THREE.Mesh(tipGeo, this.hairMat);
        tip.position.set(Math.sin(ang) * 0.375, -0.20, -Math.cos(ang) * 0.345);
        tip.rotation.y = -ang + Math.PI;
        tip.rotation.x = 0.25;
        this.femaleBobTips.add(tip);
      }
      this.hairGroup.add(this.femaleBobTips);

      // 3. Continuous Short Neat Back+Sides Shell (Male: tidy anime short cut!)
      const shortPts = [
        new THREE.Vector2(0.356, 0.08),
        new THREE.Vector2(0.362, -0.04),
        new THREE.Vector2(0.345, -0.15),
        new THREE.Vector2(0.285, -0.22),
      ];
      const shortGeo = new THREE.LatheGeometry(shortPts, 24, -Math.PI * 0.74, Math.PI * 1.48);
      this.maleShortShell = new THREE.Mesh(shortGeo, this.hairMat);
      this.maleShortShell.scale.set(1.06, 1.0, 0.96);
      this.maleShortShell.position.set(0, 0.02, 0.018);
      this.maleShortShell.castShadow = true;
      this.maleShortShell.visible = false;
      this.hairGroup.add(this.maleShortShell);

      // 4. Connected Overlapping Front Bangs (embedded cleanly into hairline, hugging forehead!)
      const bangGeo = createBangGeo(0.25, 0.082, 0.036, 0.048);
      const bangSpecs = [
        { ang: -0.68, len: 1.15, zTilt: -0.18 },
        { ang: -0.50, len: 0.96, zTilt: -0.10 },
        { ang: -0.32, len: 1.04, zTilt: -0.05 },
        { ang: -0.16, len: 0.88, zTilt: -0.02 },
        { ang: 0.0, len: 1.02, zTilt: 0.03 },
        { ang: 0.16, len: 0.86, zTilt: 0.02 },
        { ang: 0.32, len: 1.04, zTilt: 0.06 },
        { ang: 0.50, len: 0.96, zTilt: 0.10 },
        { ang: 0.68, len: 1.15, zTilt: 0.18 },
      ];
      bangSpecs.forEach((b) => {
        const strand = new THREE.Mesh(bangGeo, this.hairMat);
        const r = 0.338;
        strand.position.set(Math.sin(b.ang) * r * 1.04, 0.215, -Math.cos(b.ang) * r * 0.91);
        strand.rotation.y = -b.ang;
        strand.rotation.x = 0.08;
        strand.rotation.z = b.zTilt;
        strand.scale.set(1.05, b.len, 1.0);
        this.hairGroup.add(strand);
      });

      // Soft cheek-framing side locks (hugging both cheeks smoothly into the shell!)
      const cheekGeo = createBangGeo(0.32, 0.095, 0.042, 0.035);
      [-1, 1].forEach((side) => {
        const cheekLock = new THREE.Mesh(cheekGeo, this.hairMat);
        cheekLock.position.set(side * 0.31, 0.14, -0.165);
        cheekLock.rotation.y = side * -1.05;
        cheekLock.rotation.z = side * 0.12;
        this.hairGroup.add(cheekLock);
      });

      // Cute Curled Loop Anime Ahoge
      const ahogeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.03, 0.34, 0.0),
        new THREE.Vector3(0.14, 0.48, -0.02),
        new THREE.Vector3(0.30, 0.44, -0.02),
        new THREE.Vector3(0.37, 0.25, -0.02),
        new THREE.Vector3(0.33, 0.17, -0.02),
        new THREE.Vector3(0.28, 0.21, -0.02),
        new THREE.Vector3(0.35, 0.22, -0.02),
      ]);
      this.ahoge = new THREE.Mesh(
        new THREE.TubeGeometry(ahogeCurve, 28, 0.008, 6, false),
        this.hairSolidMat
      );
      this.headGroup.add(this.ahoge);

      // === 4 ACCESSORIES / HATS ===

      // Option 0: Wide Plum-Purple Anime Glasses
      this.glasses = new THREE.Group();
      const glassMat = new THREE.MeshToonMaterial({ color: 0x5d3d64, gradientMap: getToonGradient() });
      const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 });
      [-0.108, 0.108].forEach((gx) => {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.015, 8, 22), glassMat);
        rim.scale.set(1.14, 0.88, 1);
        rim.position.set(gx, -0.028, -0.335);
        rim.rotation.y = gx > 0 ? -0.14 : 0.14;
        rim.rotation.z = gx > 0 ? 0.08 : -0.08;
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.082, 18), lensMat);
        lens.scale.set(1.12, 0.86, 1);
        lens.rotation.y = Math.PI + (gx > 0 ? -0.14 : 0.14);
        lens.position.set(gx, -0.028, -0.334);
        this.glasses.add(rim, lens);

        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.016, 0.24), glassMat);
        arm.position.set(gx > 0 ? 0.215 : -0.215, -0.01, -0.21);
        this.glasses.add(arm);
      });
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.016, 0.016), glassMat);
      bridge.position.set(0, -0.018, -0.34);
      this.glasses.add(bridge);
      this.headGroup.add(this.glasses);

      // Option 1: Cozy Over-Ear Chibi Headphones
      this.headphones = new THREE.Group();
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.39, 0.028, 8, 22, Math.PI),
        new THREE.MeshToonMaterial({ color: 0x3b425c, gradientMap: getToonGradient() })
      );
      band.position.y = 0.02;
      const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.065, 14), this.accentMat);
      earL.rotation.z = Math.PI / 2;
      earL.position.set(-0.392, 0.0, 0);
      const earR = earL.clone();
      earR.position.x = 0.392;
      this.headphones.add(band, earL, earR);
      this.headphones.visible = false;
      this.headGroup.add(this.headphones);

      // Option 2: Cozy Knitted Pom-Pom Beanie
      this.beanie = new THREE.Group();
      const bHat = new THREE.Mesh(
        new THREE.SphereGeometry(0.402, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56),
        new THREE.MeshToonMaterial({ color: 0xc95f5f, gradientMap: getToonGradient() })
      );
      bHat.scale.set(1.06, 1.0, 0.98);
      bHat.position.set(0, 0.04, 0.012);
      const bCuff = new THREE.Mesh(
        new THREE.TorusGeometry(0.392, 0.044, 10, 24),
        new THREE.MeshToonMaterial({ color: 0xf5ebd6, gradientMap: getToonGradient() })
      );
      bCuff.rotation.x = Math.PI / 2;
      bCuff.scale.set(1.06, 0.98, 1);
      bCuff.position.set(0, 0.065, 0.012);
      const pom = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 12, 10),
        new THREE.MeshToonMaterial({ color: 0xf5ebd6, gradientMap: getToonGradient() })
      );
      pom.position.set(0, 0.455, 0.012);
      this.beanie.add(bHat, bCuff, pom);
      this.beanie.visible = false;
      this.headGroup.add(this.beanie);

      // Option 3: Casual Chibi Baseball Cap
      this.baseballCap = new THREE.Group();
      const capMat = new THREE.MeshToonMaterial({ color: 0x3b5998, gradientMap: getToonGradient() });
      const capCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.398, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.54),
        capMat
      );
      capCrown.scale.set(1.06, 1.0, 0.98);
      capCrown.position.set(0, 0.045, 0.012);
      const capBtn = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 8, 8),
        new THREE.MeshToonMaterial({ color: 0xf5ebd6, gradientMap: getToonGradient() })
      );
      capBtn.position.set(0, 0.445, 0.012);
      const capBrim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.26, 0.028, 16, 1, false, -Math.PI * 0.4, Math.PI * 0.8),
        capMat
      );
      capBrim.position.set(0, 0.085, -0.34);
      capBrim.rotation.x = 0.14;
      this.baseballCap.add(capCrown, capBtn, capBrim);
      this.baseballCap.visible = false;
      this.headGroup.add(this.baseballCap);
    }

    _buildBreakProps() {
      this.fishingRod = new THREE.Group();
      const rodStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.02, 1.85, 6),
        new THREE.MeshStandardMaterial({ color: 0x8c6142 })
      );
      rodStick.rotation.x = -1.05;
      rodStick.position.set(0.18, 0.82, -0.85);
      this.bobber = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xf7768e })
      );
      this.bobber.position.set(0.18, -0.25, -1.65);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.18, 1.28, -1.62),
        new THREE.Vector3(0.18, -0.25, -1.65),
      ]);
      this.fishingLine = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 })
      );
      this.fishingRod.add(rodStick, this.bobber, this.fishingLine);
      this.fishingRod.visible = false;
      this.group.add(this.fishingRod);

      this.musicNotes = [];
      const nCols = [0xffe08a, 0x73daca, 0xff9ec4];
      for (let i = 0; i < 3; i++) {
        const n = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.065, 0),
          new THREE.MeshBasicMaterial({ color: nCols[i], transparent: true, opacity: 0.9 })
        );
        n.visible = false;
        this.group.add(n);
        this.musicNotes.push({ mesh: n, offset: i / 3 });
      }

      this.handCup = new THREE.Group();
      const cupBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.048, 0.125, 10),
        new THREE.MeshStandardMaterial({ color: 0xfff5e8, roughness: 0.5 })
      );
      const cupLid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.062, 0.062, 0.022, 10),
        new THREE.MeshStandardMaterial({ color: 0xc98a5b })
      );
      cupLid.position.y = 0.07;
      this.handCup.add(cupBody, cupLid);
      this.handCup.position.set(0, -0.21, -0.02);
      this.handCup.visible = false;
      this.arms.right.elbow.add(this.handCup);
    }

    setEmote(emote) {
      this.emote = emote || 'idle';
      this.handCup.visible = this.emote === 'coffee';
      this.musicNotes.forEach((n) => {
        n.mesh.visible = this.emote === 'dance' || this.emote === 'laugh';
      });
    }

    triggerAction(kind) {
      this.actionAnim = { kind: kind || 'bonk', t: 0, dur: 0.95 };
    }

    setWalkTarget(x, z) {
      const cx = Math.max(-2.6, Math.min(2.6, x));
      const cz = Math.max(-2.1, Math.min(2.3, z));
      this.walkTarget = new THREE.Vector3(cx, this.group.position.y, cz);
      this.walkMarker.position.set(cx, 0.21, cz);
      this.walkMarker.visible = true;
    }

    clearWalkTarget() {
      this.walkTarget = null;
      this.isWalking = false;
      this.walkMarker.visible = false;
    }

    stepTowardTarget(dt, time) {
      if (!this.walkTarget) {
        this.isWalking = false;
        this.walkMarker.visible = false;
        return false;
      }
      const dx = this.walkTarget.x - this.group.position.x;
      const dz = this.walkTarget.z - this.group.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.08) {
        this.group.position.x = this.walkTarget.x;
        this.group.position.z = this.walkTarget.z;
        this.clearWalkTarget();
        return false;
      }
      this.isWalking = true;
      const speed = 2.2;
      const step = Math.min(dist, speed * dt);
      const nx = (dx / dist) * step;
      const nz = (dz / dist) * step;
      this.group.position.x += nx;
      this.group.position.z += nz;

      const targetYaw = Math.atan2(-dx, -dz);
      let diff = targetYaw - this.group.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.group.rotation.y += diff * Math.min(1, dt * 10);

      this.walkPhase += dt * 10;
      const pulse = 1 + Math.sin(time * 6) * 0.14;
      this.walkMarker.scale.setScalar(pulse);
      return true;
    }

    applyOutfit(outfit) {
      this.sweaterMat.color.setHex(outfit.main);
      this.accentMat.color.setHex(outfit.accent);
    }

    applyAvatar(avatar) {
      const opts = CozyGarden.AVATAR_OPTIONS;
      if (!opts || !avatar) return;
      const isMale = avatar.gender === 'male';

      const shirtIdx = (Number(avatar.shirt) || 0) % opts.shirts.length;
      const pantsIdx = (Number(avatar.pants) || 0) % opts.pants.length;
      const hairIdx = (Number(avatar.hair) || 0) % opts.hairs.length;

      const shirt = opts.shirts[shirtIdx] || opts.shirts[0];
      const pants = opts.pants[pantsIdx] || opts.pants[0];
      const hair = opts.hairs[hairIdx] || opts.hairs[0];

      // 1. Uniform Top Style (0: Shirt+Tie, 1: Blazer Vest, 2: T-Shirt, 3: Cozy Sweater)
      this.sweaterMat.color.setHex(shirt.color);
      this.accentMat.color.setHex(shirt.accent);
      if (this.tieMat.map) this.tieMat.map.dispose();
      this.tieMat.map = createTieTexture(shirt.accent);
      this.tieMat.needsUpdate = true;

      const isShirt = shirtIdx === 0;
      const isVest = shirtIdx === 1;
      const isTshirt = shirtIdx === 2;
      const isSweater = shirtIdx === 3;
      const isLongSleeve = isVest || isSweater;

      this.tieGroup.visible = isShirt || isVest;
      this.vestGroup.visible = isVest;
      this.tshirtGroup.visible = isTshirt;
      this.sweaterTrimGroup.visible = isSweater;

      // Toggle Long Sleeves vs Short/Rolled Sleeves on both arms!
      Object.values(this.arms).forEach((arm) => {
        arm.elBall.material = isLongSleeve ? this.sweaterMat : this.skinMat;
        arm.forearm.material = isLongSleeve ? this.sweaterMat : this.skinMat;
        arm.cuff.visible = isShirt || isTshirt;
        arm.wristCuff.visible = isLongSleeve;
      });

      // 2. Bottom Style (0: Slacks, 1: Shorts, 2: Pleated Skirt, 3: Jeans)
      const isSkirt = pantsIdx === 2;
      const isShorts = pantsIdx === 1;

      this.skirtMesh.visible = isSkirt;
      this.pantsMat.color.setHex(pants.color);
      this.legMat.color.setHex(pants.tight || pants.color);

      if (isSkirt) {
        if (this.skirtMat.map) this.skirtMat.map.dispose();
        this.skirtMat.map = createPlaidTexture(pants.color);
        this.skirtMat.needsUpdate = true;
      }

      this.legs.forEach((leg) => {
        // Skirt uses tights on thigh & calf; Shorts uses pants on thigh & skin on calf; Slacks/Jeans uses pants on both!
        leg.hipBall.material = isSkirt ? this.legMat : this.pantsMat;
        leg.thigh.material = isSkirt ? this.legMat : this.pantsMat;
        leg.shortCuff.visible = isShorts;
        leg.kneeBall.material = this.legMat;
        leg.calf.material = this.legMat;
        leg.shoe.visible = !isSkirt; // Show crisp sneakers for Slacks, Shorts, and Jeans!
      });
      this.pelvis.material = isSkirt ? this.legMat : this.pantsMat;

      // 3. Cohesive Hair Style & Color (Male = Short tidy shell, Female = Continuous flared bob!)
      if (this.hairMat.map) this.hairMat.map.dispose();
      this.hairMat.map = createHairTexture(hair.color, hair.highlight, hair.tip);
      this.hairMat.needsUpdate = true;
      this.hairSolidMat.color.setHex(hair.color);

      this.femaleBobShell.visible = !isMale;
      this.femaleBobTips.visible = !isMale;
      this.maleShortShell.visible = isMale;
      this.torsoMesh.scale.set(isMale ? 1.12 : 1.04, 1, isMale ? 0.86 : 0.8);

      // 4. Accessories / Hats (0: Anime Glasses, 1: Headphones, 2: Beanie, 3: Baseball Cap)
      const hat = Number(avatar.hat) || 0;
      this.glasses.visible = hat === 0;
      this.headphones.visible = hat === 1;
      this.beanie.visible = hat === 2;
      this.baseballCap.visible = hat === 3;
      this.ahoge.visible = hat === 0 || hat === 1;
    }

    setPose(pomoMode, breakActivity, anchor) {
      this.currentAnchor = anchor || { x: 0, y: 0.2, z: 0, rotY: 0 };
      const isBreak = pomoMode === 'break';
      this.fishingRod.visible = false;
      this.musicNotes.forEach((n) => (n.mesh.visible = false));

      this.group.position.set(this.currentAnchor.x, this.currentAnchor.y, this.currentAnchor.z);
      this.group.rotation.set(0, this.currentAnchor.rotY || 0, 0);
      this.bodyPivot.position.set(0, 0, 0);
      this.bodyPivot.rotation.set(0, 0, 0);

      const setSeated = (seated) => {
        this.legs.forEach(({ hipJoint, kneeJoint }) => {
          hipJoint.rotation.set(seated ? Math.PI / 2 : 0, 0, 0);
          kneeJoint.rotation.set(seated ? -Math.PI / 2 : 0, 0, 0);
        });
      };

      if (!isBreak) {
        setSeated(true);
        this.upperBody.rotation.set(-0.08, 0, 0);
        this.headGroup.rotation.set(-0.14, 0, 0);
        this.arms.left.shoulder.rotation.set(0.88, 0, 0.18);
        this.arms.right.shoulder.rotation.set(0.88, 0, -0.18);
        this.arms.left.elbow.rotation.set(0.72, 0, -0.18);
        this.arms.right.elbow.rotation.set(0.72, 0, 0.18);
      } else if (breakActivity === 0) {
        setSeated(false);
        this.upperBody.rotation.set(0, 0, 0);
        this.headGroup.rotation.set(0.04, 0, 0);
      } else if (breakActivity === 1) {
        setSeated(false);
        this.upperBody.rotation.set(0, 0, 0);
        this.headGroup.rotation.set(0, 0, 0);
        this.musicNotes.forEach((n) => (n.mesh.visible = true));
      } else {
        const hasRod = Boolean(this.currentAnchor.hasFishingRod);
        setSeated(false);
        this.fishingRod.visible = hasRod;
        this.upperBody.rotation.set(0, 0, 0);
        this.headGroup.rotation.set(hasRod ? -0.08 : 0.1, 0, 0);
      }
    }

    update(dt, time, pomoMode, breakActivity, leftDown, rightDown, sipLift) {
      this.ahoge.rotation.z = Math.sin(time * 3.0) * 0.08;

      // Transient playful interaction animation (bonk / bonked / hug / poke)
      if (this.actionAnim) {
        this.actionAnim.t += dt;
        const p = Math.min(1, this.actionAnim.t / this.actionAnim.dur);
        const wave = Math.sin(p * Math.PI);
        const fast = Math.sin(p * Math.PI * 3);
        const k = this.actionAnim.kind;
        if (k === 'bonk') {
          this.bodyPivot.position.y = wave * 0.08;
          this.upperBody.rotation.set(-0.22 * wave, 0.35 * fast, 0);
          this.arms.right.shoulder.rotation.set(1.65 * wave, 0, -0.2);
          this.arms.right.elbow.rotation.set(0.35, 0, 0);
        } else if (k === 'bonked') {
          this.bodyPivot.position.y = wave * 0.14;
          this.upperBody.rotation.set(0.28 * wave, 0, 0.25 * fast);
          this.headGroup.rotation.set(0.22 * wave, 0, -0.28 * fast);
          this.arms.left.shoulder.rotation.set(0.4, 0, -1.6 * wave);
          this.arms.right.shoulder.rotation.set(0.4, 0, 1.6 * wave);
        } else if (k === 'hug') {
          this.bodyPivot.position.y = wave * 0.06;
          this.upperBody.rotation.set(-0.12 * wave, 0, 0.1 * fast);
          this.arms.left.shoulder.rotation.set(1.1 * wave, 0, -0.55 * wave);
          this.arms.right.shoulder.rotation.set(1.1 * wave, 0, 0.55 * wave);
        } else {
          this.upperBody.rotation.set(-0.15 * wave, 0, 0);
          this.arms.right.shoulder.rotation.set(1.45 * wave, 0, -0.1);
          this.arms.right.elbow.rotation.set(0.25, 0, 0);
        }
        if (p >= 1) {
          this.actionAnim = null;
          this.bodyPivot.position.y = 0;
          this.upperBody.rotation.set(0, 0, 0);
          this.headGroup.rotation.set(0, 0, 0);
        }
        return;
      }

      if (pomoMode !== 'break') {
        this.bodyPivot.position.y = 0;
        this.bodyPivot.rotation.set(0, 0, 0);
        this.upperBody.position.y = 0.34 + Math.sin(time * Math.PI) * 0.007;
        this.headGroup.rotation.y = Math.sin(time * 0.85) * 0.08;

        this.arms.left.elbow.rotation.x = leftDown ? 0.56 : 0.78;
        if (sipLift > 0.01) {
          this.arms.right.shoulder.rotation.x = 0.88 + sipLift * 0.45;
          this.arms.right.elbow.rotation.x = 0.72 + sipLift * 0.65;
        } else {
          this.arms.right.shoulder.rotation.x = 0.88;
          this.arms.right.elbow.rotation.x = rightDown ? 0.56 : 0.78;
        }
        return;
      }

      if (this.isWalking) {
        const sw = Math.sin(this.walkPhase);
        this.bodyPivot.position.y = Math.abs(sw) * 0.045;
        this.bodyPivot.rotation.set(0, 0, 0);
        this.upperBody.rotation.set(-0.05, 0, sw * 0.05);
        this.headGroup.rotation.set(0, 0, sw * 0.04);
        this.legs[0].hipJoint.rotation.x = sw * 0.52;
        this.legs[1].hipJoint.rotation.x = -sw * 0.52;
        this.legs[0].kneeJoint.rotation.x = Math.max(0, -sw) * -0.45;
        this.legs[1].kneeJoint.rotation.x = Math.max(0, sw) * -0.45;
        this.arms.left.shoulder.rotation.set(-sw * 0.45, 0, -0.15);
        this.arms.right.shoulder.rotation.set(sw * 0.45, 0, 0.15);
        this.arms.left.elbow.rotation.set(0.22, 0, 0);
        this.arms.right.elbow.rotation.set(0.22, 0, 0);
        return;
      }

      if (this.emote === 'wave') {
        this.bodyPivot.position.y = Math.sin(time * 3) * 0.015;
        this.upperBody.rotation.set(0, 0, -0.05);
        this.headGroup.rotation.set(0.05, Math.sin(time * 2) * 0.1, 0.08);
        this.legs.forEach(({ hipJoint, kneeJoint }) => {
          hipJoint.rotation.x = 0;
          kneeJoint.rotation.x = 0;
        });
        this.arms.left.shoulder.rotation.set(0.1, 0, -0.2);
        this.arms.left.elbow.rotation.set(0.2, 0, 0);
        this.arms.right.shoulder.rotation.set(0.2, 0, 2.45 + Math.sin(time * 9) * 0.28);
        this.arms.right.elbow.rotation.set(0.35 + Math.sin(time * 9) * 0.25, 0, 0);
        return;
      }

      if (this.emote === 'laugh') {
        const gig = Math.sin(time * 11);
        this.bodyPivot.position.y = Math.abs(gig) * 0.055;
        this.upperBody.rotation.set(0.06 + gig * 0.05, 0, Math.sin(time * 4) * 0.07);
        this.headGroup.rotation.set(0.12 + gig * 0.07, 0, 0);
        this.legs.forEach(({ hipJoint, kneeJoint }) => {
          hipJoint.rotation.x = 0;
          kneeJoint.rotation.x = 0;
        });
        this.arms.left.shoulder.rotation.set(0.75, 0, -0.35);
        this.arms.right.shoulder.rotation.set(0.75, 0, 0.35);
        this.arms.left.elbow.rotation.set(1.25 + gig * 0.15, 0, 0);
        this.arms.right.elbow.rotation.set(1.25 - gig * 0.15, 0, 0);
        this.musicNotes.forEach((n) => {
          const cyc = (time * 0.55 + n.offset) % 1;
          n.mesh.position.set(Math.sin(cyc * 6) * 0.24, 1.38 + cyc * 0.85, 0);
          n.mesh.material.opacity = Math.sin(cyc * Math.PI);
        });
        return;
      }

      if (this.emote === 'coffee') {
        const sip = 0.5 + 0.5 * Math.sin(time * 1.6);
        this.bodyPivot.position.y = Math.sin(time * 1.6) * 0.012;
        this.upperBody.rotation.set(0, 0, Math.sin(time * 0.9) * 0.04);
        this.headGroup.rotation.set(-0.04 + sip * 0.1, 0, 0);
        this.legs.forEach(({ hipJoint, kneeJoint }) => {
          hipJoint.rotation.x = 0;
          kneeJoint.rotation.x = 0;
        });
        this.arms.left.shoulder.rotation.set(0.1, 0, -0.2);
        this.arms.left.elbow.rotation.set(0.25, 0, 0);
        this.arms.right.shoulder.rotation.set(0.55 + sip * 0.35, 0, 0.15);
        this.arms.right.elbow.rotation.set(1.0 + sip * 0.5, 0, 0);
        return;
      }

      if (this.emote === 'dance' || breakActivity === 1) {
        const beat = time * Math.PI * 2;
        const groove = Math.sin(beat);
        const halfGroove = Math.sin(beat * 0.5);
        this.bodyPivot.position.y = Math.abs(groove) * 0.06;
        this.bodyPivot.rotation.y = halfGroove * 0.28;
        this.upperBody.rotation.z = halfGroove * 0.12;
        this.headGroup.rotation.x = -0.04 + groove * 0.1;
        this.headGroup.rotation.y = -halfGroove * 0.14;
        this.arms.left.shoulder.rotation.set(0.65 + groove * 0.35, 0, -0.4 - halfGroove * 0.3);
        this.arms.right.shoulder.rotation.set(0.65 - groove * 0.35, 0, 0.4 - halfGroove * 0.3);
        this.arms.left.elbow.rotation.set(1.15 + groove * 0.3, 0, 0);
        this.arms.right.elbow.rotation.set(1.15 - groove * 0.3, 0, 0);
        const kb = Math.max(0, -groove) * 0.24;
        this.legs.forEach(({ hipJoint, kneeJoint }) => {
          hipJoint.rotation.x = kb;
          kneeJoint.rotation.x = -kb * 1.7;
        });
        this.musicNotes.forEach((n) => {
          const cyc = (time * 0.48 + n.offset) % 1;
          n.mesh.position.set(Math.sin(cyc * 6.5) * 0.28, 1.38 + cyc * 0.95, Math.cos(cyc * 4) * 0.12);
          n.mesh.rotation.y += dt * 2.8;
          n.mesh.material.opacity = Math.sin(cyc * Math.PI);
        });
        return;
      }

      if (breakActivity === 0) {
        const phase = time * 1.9;
        const stretch = 0.5 + 0.5 * Math.sin(phase);
        const sideBend = Math.sin(phase * 0.5) * 0.12;
        const bounce = Math.abs(Math.sin(phase)) * 0.04;

        this.bodyPivot.position.y = bounce;
        this.upperBody.rotation.z = sideBend;
        this.upperBody.rotation.x = -0.04 + stretch * 0.06;
        this.headGroup.rotation.z = -sideBend * 0.35;
        this.headGroup.rotation.x = stretch * 0.1;

        const armRaise = 0.45 + stretch * 2.15;
        this.arms.left.shoulder.rotation.set(0.15, 0, -armRaise);
        this.arms.right.shoulder.rotation.set(0.15, 0, armRaise);
        this.arms.left.elbow.rotation.set(0.25, 0, 0.22 * stretch);
        this.arms.right.elbow.rotation.set(0.25, 0, -0.22 * stretch);

        const kneeFlex = (1 - stretch) * 0.2;
        this.legs.forEach(({ hipJoint, kneeJoint }) => {
          hipJoint.rotation.x = kneeFlex;
          kneeJoint.rotation.x = -kneeFlex * 1.6;
        });
      } else {
        if (this.fishingRod.visible) {
          this.upperBody.rotation.z = Math.sin(time * 1.2) * 0.05;
          this.headGroup.rotation.y = Math.sin(time * 0.7) * 0.14;
          this.arms.right.shoulder.rotation.set(0.65 + Math.sin(time * 1.8) * 0.08, 0, -0.05);
          this.arms.right.elbow.rotation.set(0.85, 0, 0);
          this.arms.left.shoulder.rotation.set(0.35, 0, 0.1);
          this.arms.left.elbow.rotation.set(0.9, 0, 0);
          this.bobber.position.y = -0.25 + Math.sin(time * 2.5) * 0.04;
        } else {
          const inhale = 0.5 + 0.5 * Math.sin(time * 0.78);
          this.bodyPivot.position.y = inhale * 0.025;
          this.upperBody.rotation.x = -0.04 + inhale * 0.08;
          this.headGroup.rotation.x = 0.04 + inhale * 0.12;
          this.arms.left.shoulder.rotation.set(0.25, 0, -0.25 - inhale * 0.95);
          this.arms.right.shoulder.rotation.set(0.25, 0, 0.25 + inhale * 0.95);
          this.arms.left.elbow.rotation.set(0.3, 0, 0);
          this.arms.right.elbow.rotation.set(0.3, 0, 0);
        }
      }
    }
  }

  CozyGarden.Character3D = Character3D;
})();
