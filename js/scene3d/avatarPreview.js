/* ==========================================================================
   Cozy Garden — Live 3D Avatar Preview Canvas (js/scene3d/avatarPreview.js)
   Close-up turntable 3D preview inside the Character Creator modal (drag to spin!)
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  class AvatarPreview3D {
    constructor(canvas) {
      this.canvas = canvas;
      this.running = false;
      this.rafId = null;
      this.yaw = Math.PI; // Start facing directly toward the camera!
      this.dragging = false;
      this.lastX = 0;

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(canvas.width, canvas.height, false);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(34, canvas.width / canvas.height, 0.1, 30);
      this.camera.position.set(0, 0.95, 3.05);
      this.camera.lookAt(0, 0.80, 0);

      // Bright soft anime studio lighting
      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9c8ea6, 1.35));
      const key = new THREE.DirectionalLight(0xfff4e6, 0.95);
      key.position.set(2.2, 4, 3.8);
      this.scene.add(key);

      // Cute mini pedestal
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.62, 0.1, 24),
        new THREE.MeshStandardMaterial({ color: 0x5c4640, roughness: 0.85 })
      );
      ped.position.y = -0.05;
      this.scene.add(ped);

      // Reuse the exact Character3D model!
      this.character = new CozyGarden.Character3D(this.scene, () => {});
      this.character.setPose('break', 0, { x: 0, y: 0.14, z: 0, rotY: this.yaw });

      // Drag to rotate preview 360°
      canvas.addEventListener('pointerdown', (e) => {
        this.dragging = true;
        this.lastX = e.clientX;
      });
      window.addEventListener('pointermove', (e) => {
        if (!this.dragging) return;
        this.yaw += (e.clientX - this.lastX) * 0.014;
        this.lastX = e.clientX;
      });
      window.addEventListener('pointerup', () => {
        this.dragging = false;
      });
    }

    setAvatar(avatar) {
      this.character.applyAvatar(avatar);
    }

    start() {
      if (this.running) return;
      this.running = true;
      let t = 0;
      const loop = () => {
        if (!this.running) return;
        t += 0.016;
        if (!this.dragging) this.yaw += 0.006;
        this.character.group.rotation.y = this.yaw;
        // Gentle standing idle breath & cute chibi hand-on-hip / relaxed stance
        this.character.upperBody.position.y = 0.34 + Math.sin(t * 2.5) * 0.008;
        this.character.ahoge.rotation.z = Math.sin(t * 3.0) * 0.08;
        this.character.arms.left.shoulder.rotation.set(0.08, 0, -0.22);
        this.character.arms.right.shoulder.rotation.set(0.08, 0, 0.22);
        this.character.arms.left.elbow.rotation.set(0.22, 0, 0);
        this.character.arms.right.elbow.rotation.set(0.22, 0, 0);
        this.renderer.render(this.scene, this.camera);
        this.rafId = requestAnimationFrame(loop);
      };
      loop();
    }

    stop() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  CozyGarden.AvatarPreview3D = AvatarPreview3D;
})();
