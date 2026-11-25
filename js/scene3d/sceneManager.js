/* ==========================================================================
   Cozy Garden — 3D Scene Manager Orchestrator (js/scene3d/sceneManager.js)
   Manages 3 full isometric 3D dioramas: Sakura Garden, Cozy Room, Corner Cafe
   with Anime lighting, smooth orbit camera, raycasting & collision-free pets.
   ========================================================================== */

(function () {
  if (!window.THREE) return;
  const THREE = window.THREE;
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  class IslandScene3D {
    constructor(canvas, callbacks = {}) {
      this.canvas = canvas;
      this.callbacks = callbacks;

      // States
      this.sceneId = 'sakura';
      this.weatherMode = 0;
      this.lampMode = 0;
      this.pomoMode = 'focus';
      this.breakActivity = 0;
      this.islandLevel = 0;
      this.outfitIndex = 0;
      this.clockText = '25:00';
      this.pomoRunning = false;

      // Timers
      this.time = 0;
      this.lastFrameTime = performance.now();
      this.typingTimer = 0;
      this.typingStep = 0;
      this.nextKeyInterval = 0.28;
      this.leftHandDown = false;
      this.rightHandDown = false;
      this.isSipping = false;
      this.sipProgress = 0;

      // Performance & Eco Mode state (auto-throttles GPU + Edge adaptive quality!)
      this.ecoMode = false;
      this.isEdge = typeof navigator !== 'undefined' && /\bEdg\//.test(navigator.userAgent || '');
      this.isWindowFocused = typeof document !== 'undefined' ? document.hasFocus() : true;
      this.lastRenderTime = 0;
      this.lastHoverRaycast = 0;
      this.shadowFrameCount = 0;
      this.renderCostSum = 0;
      this.renderCostSamples = 0;
      this.autoEcoTriggered = false;

      // Smooth Isometric Orbit Camera
      this.camTheta = 0.56;
      this.camPhi = 0.62;
      this.camRadius = 15.6;
      this.targetTheta = 0.56;
      this.targetPhi = 0.62;
      this.targetRadius = 15.6;
      this.lookTarget = new THREE.Vector3(0.05, 0.75, 0.05);

      // Raycasting & Drag
      this.raycaster = new THREE.Raycaster();
      this.pointer = new THREE.Vector2();
      this.interactables = [];
      this.isDragging = false;
      this.dragMoved = false;
      this.dragStart = { x: 0, y: 0 };
      this.lastPointer = { x: 0, y: 0 };

      this._initRendererAndLights();

      const tag = (obj, id) => this._tagInteractable(obj, id);

      // 3 Full Isometric 3D Dioramas + Shared 4-Seat Co-Working Dioramas
      this.sakuraWorld = new CozyGarden.GardenWorld3D(this.scene, tag);
      this.sakuraProg = new CozyGarden.Progression3D(this.scene);
      this.roomDiorama = new CozyGarden.DioramaRoom3D(this.scene, tag);
      this.cafeDiorama = new CozyGarden.DioramaCafe3D(this.scene, tag);
      this.coopDiorama = new CozyGarden.DioramaCoop3D(this.scene, tag);
      this.coopSceneId = null;
      this.coopMembers = [];
      this.myCoopId = null;

      this.character = new CozyGarden.Character3D(this.scene, tag);
      this.pets = new CozyGarden.Pets3D(this.scene, tag);
      this.bottle = new CozyGarden.Bottle3D(this.scene, tag);

      this._buildParticlesAndWeather();
      this.setScene('sakura');
      this._bindEvents();
      this._onResize();
    }

    _activeDiorama() {
      if (this.sceneId === 'room') return this.roomDiorama;
      if (this.sceneId === 'cafe') return this.cafeDiorama;
      return this.sakuraWorld;
    }

    _initRendererAndLights() {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        powerPreference: 'default',
      });
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      this.renderer.shadowMap.autoUpdate = false;
      this.renderer.shadowMap.needsUpdate = true;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.08;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xb08991);

      this.camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 120);
      this._updateCameraPosition(true);

      this.ambientLight = new THREE.HemisphereLight(0xffe4ec, 0x75525c, 0.96);
      this.scene.add(this.ambientLight);

      this.sunLight = new THREE.DirectionalLight(0xffe4c4, 1.32);
      this.sunLight.position.set(-7.2, 11.5, 6.2);
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(512, 512);
      this.sunLight.shadow.bias = -0.0008;
      this.sunLight.shadow.camera.near = 1;
      this.sunLight.shadow.camera.far = 32;
      this.sunLight.shadow.camera.left = -7.5;
      this.sunLight.shadow.camera.right = 7.5;
      this.sunLight.shadow.camera.top = 7.5;
      this.sunLight.shadow.camera.bottom = -7.5;
      this.scene.add(this.sunLight);

      const fill = new THREE.DirectionalLight(0xffd7c2, 0.38);
      fill.position.set(7, 5, 6);
      this.scene.add(fill);
    }

    _buildParticlesAndWeather() {
      const count = 55;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      this.ambientData = [];
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 10;
        pos[i * 3 + 1] = 0.5 + Math.random() * 4.8;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        this.ambientData.push({ phase: Math.random() * Math.PI * 2, speed: 0.35 + Math.random() * 0.6 });
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.ambientMat = new THREE.PointsMaterial({ color: 0xffc7dc, size: 0.14, transparent: true, opacity: 0.8 });
      this.ambientPoints = new THREE.Points(geo, this.ambientMat);
      this.scene.add(this.ambientPoints);

      const rCount = 300;
      const rGeo = new THREE.BufferGeometry();
      const rPos = new Float32Array(rCount * 3);
      for (let i = 0; i < rCount; i++) {
        rPos[i * 3] = (Math.random() - 0.5) * 16;
        rPos[i * 3 + 1] = Math.random() * 11;
        rPos[i * 3 + 2] = (Math.random() - 0.5) * 16;
      }
      rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
      this.rainMat = new THREE.PointsMaterial({ color: 0xd6eaff, size: 0.12, transparent: true, opacity: 0.55 });
      this.rainPoints = new THREE.Points(rGeo, this.rainMat);
      this.rainPoints.visible = false;
      this.scene.add(this.rainPoints);

      // Gentle 5-Minute Break Relaxing Floating Golden-Pastel Aura Particles!
      const bCount = 48;
      const bGeo = new THREE.BufferGeometry();
      const bPos = new Float32Array(bCount * 3);
      this.breakAuraData = [];
      for (let i = 0; i < bCount; i++) {
        bPos[i * 3] = (Math.random() - 0.5) * 9;
        bPos[i * 3 + 1] = 0.4 + Math.random() * 4.5;
        bPos[i * 3 + 2] = (Math.random() - 0.5) * 9;
        this.breakAuraData.push({ phase: Math.random() * Math.PI * 2, speed: 0.35 + Math.random() * 0.45 });
      }
      bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
      this.breakAuraMat = new THREE.PointsMaterial({
        color: 0xffe8a3,
        size: 0.22,
        transparent: true,
        opacity: 0.72,
      });
      this.breakAuraPoints = new THREE.Points(bGeo, this.breakAuraMat);
      this.breakAuraPoints.visible = false;
      this.scene.add(this.breakAuraPoints);

      // Ground plane for Break Mode click-to-move!
      this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.2);
      this.lastMoveSync = 0;
    }

    _onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      const maxDpr = this.ecoMode || this.isEdge ? 1.0 : 1.25;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      this.renderer.setSize(w, h, false);
    }

    setEcoMode(enabled) {
      this.ecoMode = Boolean(enabled);
      this.renderer.shadowMap.enabled = !this.ecoMode;
      this.sunLight.castShadow = !this.ecoMode;
      this.renderer.shadowMap.needsUpdate = true;
      this._onResize();
    }

    _updateCameraPosition(instant = false) {
      if (instant) {
        this.camTheta = this.targetTheta;
        this.camPhi = this.targetPhi;
        this.camRadius = this.targetRadius;
      } else {
        this.camTheta += (this.targetTheta - this.camTheta) * 0.1;
        this.camPhi += (this.targetPhi - this.camPhi) * 0.1;
        this.camRadius += (this.targetRadius - this.camRadius) * 0.1;
      }
      const cosPhi = Math.cos(this.camPhi);
      this.camera.position.set(
        this.lookTarget.x + this.camRadius * cosPhi * Math.sin(this.camTheta),
        this.lookTarget.y + this.camRadius * Math.sin(this.camPhi),
        this.lookTarget.z + this.camRadius * cosPhi * Math.cos(this.camTheta)
      );
      this.camera.lookAt(this.lookTarget);
    }

    /* ----------------------------------------------------------------------
       Public API
       ---------------------------------------------------------------------- */
    setScene(sceneId) {
      if (!CozyGarden.DIORAMA_THEMES[sceneId]) return;
      this.coopSceneId = null;
      this.coopDiorama.setActiveCoop(null);
      this.pets.root.visible = true;
      this.bottle.group.visible = this.bottle.visible;

      this.sceneId = sceneId;
      const t = CozyGarden.DIORAMA_THEMES[sceneId];

      // Toggle full 3D dioramas cleanly
      this.sakuraWorld.setVisible(sceneId === 'sakura');
      this.sakuraProg.setVisible(sceneId === 'sakura');
      this.roomDiorama.setVisible(sceneId === 'room');
      this.cafeDiorama.setVisible(sceneId === 'cafe');

      // Sync backdrop, lighting & ambient particles
      this.scene.background.setHex(t.backdrop);
      this.ambientLight.color.setHex(t.ambientSky);
      this.ambientLight.groundColor.setHex(t.ambientGround);
      this.ambientLight.intensity = t.ambientInt;
      this.sunLight.color.setHex(t.sunColor);
      this.sunLight.intensity = t.sunInt;
      this.sunLight.position.set(...t.sunPos);
      this.ambientMat.color.setHex(t.particleColor);

      // Sync character, collision-free pet waypoints, scene-specific collectible & unlocks
      const active = this._activeDiorama();
      this.character.setPose(this.pomoMode, this.breakActivity, active.getCharacterAnchor(this.pomoMode, this.breakActivity));
      this.pets.setWaypoints(active.getPetWaypoints());
      this.bottle.setVariant(sceneId);
      const bp = active.getBottlePosition();
      this.bottle.setBasePosition(bp.x, bp.y, bp.z);
      this.setIslandLevel(this.islandLevel);
      this.setPomoMode(this.pomoMode);
    }

    enterCoopScene(coopSceneId, members, myId) {
      const t = CozyGarden.COOP_SCENES[coopSceneId] || CozyGarden.COOP_SCENES.coop_library;
      this.coopSceneId = t.id;
      this.coopMembers = members || [];
      this.myCoopId = myId;

      // Hide solo dioramas & show 4-seat co-working diorama
      this.sakuraWorld.setVisible(false);
      this.sakuraProg.setVisible(false);
      this.roomDiorama.setVisible(false);
      this.cafeDiorama.setVisible(false);
      this.pets.root.visible = false;
      this.bottle.group.visible = false;

      this.coopDiorama.setActiveCoop(t.id);
      this.scene.background.setHex(t.backdrop);
      this.ambientLight.color.setHex(t.ambientSky);
      this.ambientLight.groundColor.setHex(t.ambientGround);
      this.ambientLight.intensity = t.ambientInt;
      this.sunLight.color.setHex(t.sunColor);
      this.sunLight.intensity = t.sunInt;
      this.sunLight.position.set(...t.sunPos);
      this.ambientMat.color.setHex(t.particleColor);

      this.coopDiorama.syncMembers(this.coopMembers, this.myCoopId, this.character, this.pomoMode, this.breakActivity);
    }

    updateCoopMembers(members, myId) {
      this.coopMembers = members || [];
      this.myCoopId = myId;
      if (this.coopSceneId) {
        this.coopDiorama.syncMembers(this.coopMembers, this.myCoopId, this.character, this.pomoMode, this.breakActivity);
      }
    }

    showCoopReaction(senderId, emoji) {
      if (this.coopSceneId) this.coopDiorama.spawnReaction(senderId, emoji);
    }

    setCoopRoomLevel(level) {
      this.coopDiorama.setRoomLevel(level);
    }

    updatePeerTransform(senderId, pos, emote) {
      if (this.coopSceneId && senderId !== this.myCoopId) {
        this.coopDiorama.updatePeerTransform(senderId, pos, emote);
      }
    }

    setBreakEmote(emote) {
      this.character.setEmote(emote);
      if (this.callbacks.onLocalMoveEmote) {
        const p = this.character.group.position;
        this.callbacks.onLocalMoveEmote(
          { x: p.x, y: p.y, z: p.z, rotY: this.character.group.rotation.y },
          emote
        );
      }
    }

    setClockDisplay(text, isRunning) {
      this.clockText = text;
      this.pomoRunning = isRunning;
      this.sakuraWorld.updateClockTexture(text, this.pomoMode, isRunning, 'anime');
    }

    setPomoMode(mode) {
      this.pomoMode = mode;
      if (this.breakAuraPoints) this.breakAuraPoints.visible = mode === 'break';
      if (mode !== 'break') {
        this.character.setEmote('idle');
        this.character.clearWalkTarget();
      }
      if (this.coopSceneId) {
        this.coopDiorama.syncMembers(this.coopMembers, this.myCoopId, this.character, mode, this.breakActivity);
        return;
      }
      const open = mode !== 'break';
      this.sakuraWorld.setLaptopOpen(open);
      this.roomDiorama.setLaptopOpen(open);
      this.cafeDiorama.setLaptopOpen(open);

      const active = this._activeDiorama();
      this.character.setPose(mode, this.breakActivity, active.getCharacterAnchor(mode, this.breakActivity));
      this.sakuraWorld.updateClockTexture(this.clockText, mode, this.pomoRunning, 'anime');
    }

    setIslandLevel(level) {
      this.islandLevel = Math.max(0, Math.min(12, Number(level) || 0));
      this.sakuraProg.setLevel(this.islandLevel);
      this.roomDiorama.setLevel(this.islandLevel);
      this.cafeDiorama.setLevel(this.islandLevel);
    }

    setPetType(pet) {
      this.pets.setPetType(pet);
    }

    setOutfitIndex(idx) {
      const len = CozyGarden.OUTFITS_3D.length;
      this.outfitIndex = ((Number(idx) || 0) % len + len) % len;
      this.character.applyOutfit(CozyGarden.OUTFITS_3D[this.outfitIndex]);
    }

    setAvatar(avatar) {
      this.avatar = avatar;
      this.character.applyAvatar(avatar);
    }

    spawnBottle() {
      this.bottle.spawn();
    }

    cycleWeather() {
      this.weatherMode = (this.weatherMode + 1) % 3;
      this.rainPoints.visible = this.weatherMode > 0;
      if (this.callbacks.onWeatherChange) this.callbacks.onWeatherChange(this.weatherMode);
      return this.weatherMode;
    }

    /* ----------------------------------------------------------------------
       Raycasting & Orbit Controls
       ---------------------------------------------------------------------- */
    _tagInteractable(obj, id) {
      obj.traverse((child) => {
        child.userData.interactId = id;
      });
      this.interactables.push(obj);
    }

    _isObjectVisibleInHierarchy(obj) {
      let cur = obj;
      while (cur) {
        if (!cur.visible) return false;
        cur = cur.parent;
      }
      return true;
    }

    _getHoverLabel(id) {
      const t = CozyGarden.DIORAMA_THEMES[this.sceneId] || CozyGarden.DIORAMA_THEMES.sakura;
      if (id === 'window') {
        return null;
      }
      if (id === 'clock') {
        return this.pomoRunning
          ? 'Đồng hồ • Đang chạy (Click tạm dừng)'
          : 'Đồng hồ • Pomodoro (Click bắt đầu)';
      }
      if (id === 'mug') return 'Ly trà nóng (Click để nhâm nhi)';
      if (id === 'lamp') {
        const modes = ['Ánh sáng ấm', 'Ánh sáng dịu', 'Đang tắt'];
        return `Đèn • ${modes[this.lampMode]} (Click đổi chế độ)`;
      }
      if (id === 'cat') return `${CozyGarden.PET_LABELS[this.pets.petType] || 'Thú cưng'} (Click để vuốt ve)`;
      if (id === 'character') {
        if (this.pomoMode === 'break') {
          const acts =
            this.sceneId === 'sakura'
              ? ['Tập thể dục vươn vai', 'Nhún nhảy nghe nhạc', 'Câu cá bên hồ']
              : ['Tập thể dục vươn vai', 'Nhún nhảy nghe nhạc', 'Hít thở sâu thư giãn'];
          return `Đang nghỉ: ${acts[this.breakActivity]} (Click đổi hoạt động)`;
        }
        return 'Nhân vật đang làm việc (Click đổi màu áo)';
      }
      if (id === 'bottle') {
        if (this.sceneId === 'room') return 'Cuốn nhật ký phát sáng trên giường (Click để đọc)';
        if (this.sceneId === 'cafe') return 'Ly cà phê order phát sáng trên quầy (Click để mở lời nhắn)';
        return 'Chai thư phát sáng trên mặt hồ (Click để mở lời nhắn)';
      }
      return null;
    }

    _raycast(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      // Only test currently visible interactable roots (skips hidden dioramas!)
      const visibleTargets = this.interactables.filter((o) => this._isObjectVisibleInHierarchy(o));
      const hits = this.raycaster.intersectObjects(visibleTargets, true);
      for (const hit of hits) {
        if (!this._isObjectVisibleInHierarchy(hit.object)) continue;
        const id = hit.object.userData.interactId;
        if (!id) continue;
        if (id === 'bottle' && !this.bottle.visible) continue;
        return id;
      }
      return null;
    }

    _bindEvents() {
      window.addEventListener('resize', () => this._onResize());

      this.canvas.addEventListener('pointerdown', (e) => {
        this.isDragging = true;
        this.dragMoved = false;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
        this.lastPointer.x = e.clientX;
        this.lastPointer.y = e.clientY;
      });

      window.addEventListener('pointermove', (e) => {
        if (this.isDragging) {
          const dx = e.clientX - this.lastPointer.x;
          const dy = e.clientY - this.lastPointer.y;
          this.lastPointer.x = e.clientX;
          this.lastPointer.y = e.clientY;
          if (Math.hypot(e.clientX - this.dragStart.x, e.clientY - this.dragStart.y) > 5) {
            this.dragMoved = true;
          }
          this.targetTheta -= dx * 0.007;
          this.targetPhi = Math.max(0.2, Math.min(1.25, this.targetPhi + dy * 0.005));
          return;
        }

        // Skip expensive 3D raycasting when hovering over HTML HUD panels or within 90ms throttle window
        if (e.target !== this.canvas) {
          if (this.callbacks.onHoverChange) this.callbacks.onHoverChange(null, e.clientX, e.clientY);
          return;
        }
        const now = performance.now();
        if (now - this.lastHoverRaycast < 90) return;
        this.lastHoverRaycast = now;

        const hitId = this._raycast(e.clientX, e.clientY);
        this.canvas.style.cursor = hitId && hitId !== 'window' ? 'pointer' : 'grab';
        if (this.callbacks.onHoverChange) {
          this.callbacks.onHoverChange(hitId ? this._getHoverLabel(hitId) : null, e.clientX, e.clientY);
        }
      });

      window.addEventListener('pointerup', (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (!this.dragMoved) {
          const hitId = this._raycast(e.clientX, e.clientY);
          // In Break Mode, clicking on the floor walks the character to that spot!
          if (this.pomoMode === 'break' && (!hitId || hitId === 'window')) {
            const pt = new THREE.Vector3();
            if (this.raycaster.ray.intersectPlane(this.groundPlane, pt)) {
              if (Math.abs(pt.x) <= 2.9 && Math.abs(pt.z) <= 2.6) {
                this.character.setWalkTarget(pt.x, pt.z);
                return;
              }
            }
          }
          if (hitId) {
            this._handleObjectClick(hitId);
            if (this.callbacks.onHoverChange) {
              this.callbacks.onHoverChange(this._getHoverLabel(hitId), e.clientX, e.clientY);
            }
          }
        }
      });

      this.canvas.addEventListener(
        'wheel',
        (e) => {
          e.preventDefault();
          this.targetRadius = Math.max(8.5, Math.min(24, this.targetRadius + e.deltaY * 0.008));
        },
        { passive: false }
      );
    }

    _handleObjectClick(id) {
      if (id === 'window') {
        // Window clicks no longer toggle weather accidentally; use the Weather button!
        return;
      } else if (id === 'lamp') {
        this.lampMode = (this.lampMode + 1) % 3;
        this.sakuraWorld.setLampMode(this.lampMode, { lampInt: 1.0 });
        this.roomDiorama.setLampMode(this.lampMode);
        this.cafeDiorama.setLampMode(this.lampMode);
        if (this.callbacks.onLampChange) this.callbacks.onLampChange(this.lampMode);
      } else if (id === 'mug') {
        if (!this.isSipping) {
          this.isSipping = true;
          this.sipProgress = 0;
          if (this.callbacks.onSipMug) this.callbacks.onSipMug();
        }
      } else if (id === 'cat') {
        this.pets.triggerPetHappy();
        if (this.callbacks.onPetCat) this.callbacks.onPetCat();
      } else if (id === 'clock') {
        if (this.callbacks.onClockClick) this.callbacks.onClockClick();
      } else if (id === 'character') {
        if (this.pomoMode === 'break') {
          this.breakActivity = (this.breakActivity + 1) % 3;
          const active = this._activeDiorama();
          this.character.setPose(this.pomoMode, this.breakActivity, active.getCharacterAnchor(this.pomoMode, this.breakActivity));
          if (this.callbacks.onBreakActivityChange) this.callbacks.onBreakActivityChange(this.breakActivity);
        } else {
          this.setOutfitIndex(this.outfitIndex + 1);
          if (this.callbacks.onOutfitChange) this.callbacks.onOutfitChange(this.outfitIndex);
        }
      } else if (id === 'bottle' && this.bottle.visible) {
        this.bottle.collect();
        if (this.callbacks.onBottleClick) this.callbacks.onBottleClick();
      }
    }

    /* ----------------------------------------------------------------------
       Main Loop (Focus-Aware FPS Throttling — super light on dual monitors!)
       ---------------------------------------------------------------------- */
    start() {
      window.addEventListener('focus', () => { this.isWindowFocused = true; });
      window.addEventListener('blur', () => { this.isWindowFocused = false; });

      const loop = (now) => {
        requestAnimationFrame(loop);
        // Pause 3D rendering completely when browser tab is minimized/hidden
        if (document.hidden) {
          this.lastFrameTime = now;
          return;
        }
        // Smart FPS cap:
        // - Unfocused (working on main monitor): 8 FPS (Eco) / 12 FPS (Normal) -> ~85% less GPU load!
        // - Focused (interacting with app): 20 FPS (Eco) / 40 FPS (Normal)
        const targetFps = this.isWindowFocused
          ? (this.ecoMode ? 20 : 40)
          : (this.ecoMode ? 8 : 12);
        const minInterval = 1000 / targetFps;
        if (now - this.lastRenderTime < minInterval) return;

        const dt = Math.min(0.14, (now - this.lastFrameTime) / 1000);
        this.lastFrameTime = now;
        this.lastRenderTime = now;

        this.update(dt);
        // Refresh shadow map at 1/4 rate (~10 Hz) to slash GPU shadow pass cost by 75%
        if (!this.ecoMode && this.renderer.shadowMap.enabled) {
          this.shadowFrameCount++;
          if (this.shadowFrameCount % 4 === 0) this.renderer.shadowMap.needsUpdate = true;
        }

        const t0 = performance.now();
        this.renderer.render(this.scene, this.camera);
        const renderMs = performance.now() - t0;

        // Adaptive Auto-Eco: if GPU/Edge takes > 22ms per render on average, auto-enable lightweight Eco Mode!
        if (!this.ecoMode && !this.autoEcoTriggered && this.isWindowFocused) {
          this.renderCostSum += renderMs;
          this.renderCostSamples++;
          if (this.renderCostSamples >= 25) {
            const avg = this.renderCostSum / this.renderCostSamples;
            this.renderCostSum = 0;
            this.renderCostSamples = 0;
            if (avg > 22) {
              this.autoEcoTriggered = true;
              this.setEcoMode(true);
              if (this.callbacks.onAutoEco) this.callbacks.onAutoEco();
            }
          }
        }
      };
      requestAnimationFrame(loop);
    }

    update(dt) {
      this.time += dt;
      this._updateCameraPosition(false);

      // Sipping & Typing
      let sipLift = 0;
      if (this.isSipping) {
        this.sipProgress += dt / 2.6;
        if (this.sipProgress >= 1) {
          this.isSipping = false;
          this.sipProgress = 0;
        } else {
          sipLift = Math.sin(this.sipProgress * Math.PI);
        }
      } else if (this.pomoMode !== 'break') {
        this.typingTimer += dt;
        if (this.typingTimer >= this.nextKeyInterval) {
          this.typingTimer = 0;
          if (Math.random() < 0.16) {
            this.nextKeyInterval = 0.75 + Math.random() * 0.85;
            this.leftHandDown = false;
            this.rightHandDown = false;
          } else {
            this.nextKeyInterval = 0.2 + Math.random() * 0.25;
            this.leftHandDown = !this.leftHandDown;
            this.rightHandDown = !this.leftHandDown;
            this.typingStep++;
            this._activeDiorama().pulseTypingScreen(this.typingStep);
            if (this.callbacks.onKeystroke) this.callbacks.onKeystroke();
          }
        }
      }

      // Update active diorama & entities
      if (this.coopSceneId) {
        this.coopDiorama.update(dt, this.time, this.pomoMode, this.breakActivity);
      } else if (this.sceneId === 'sakura') {
        this.sakuraWorld.update(dt, this.time, sipLift);
        this.sakuraProg.update(dt, this.time);
      } else if (this.sceneId === 'room') {
        this.roomDiorama.update(dt, this.time, sipLift);
      } else {
        this.cafeDiorama.update(dt, this.time, sipLift);
      }

      // Break mode click-to-move walking + live sync to coop peers
      if (this.pomoMode === 'break') {
        const moved = this.character.stepTowardTarget(dt, this.time);
        if (moved && this.coopSceneId) {
          const p = this.character.group.position;
          this.coopDiorama.updateMyNameplate(this.myCoopId, p);
          if (this.time - this.lastMoveSync > 0.14 && this.callbacks.onLocalMoveEmote) {
            this.lastMoveSync = this.time;
            this.callbacks.onLocalMoveEmote(
              { x: p.x, y: p.y, z: p.z, rotY: this.character.group.rotation.y },
              this.character.emote
            );
          }
        }
        // Animate gentle 5-minute break relaxing golden aura particles
        if (this.breakAuraPoints && this.breakAuraPoints.visible) {
          const bAttr = this.breakAuraPoints.geometry.attributes.position;
          for (let i = 0; i < this.breakAuraData.length; i++) {
            const d = this.breakAuraData[i];
            let y = bAttr.getY(i) + d.speed * dt * 0.6;
            const x = bAttr.getX(i) + Math.sin(this.time * 0.9 + d.phase) * dt * 0.22;
            if (y > 5.0) y = 0.35;
            bAttr.setXYZ(i, x, y, bAttr.getZ(i));
          }
          bAttr.needsUpdate = true;
          this.breakAuraMat.opacity = 0.55 + 0.25 * Math.sin(this.time * 1.5);
        }
      }

      this.character.update(dt, this.time, this.pomoMode, this.breakActivity, this.leftHandDown, this.rightHandDown, sipLift);
      if (!this.coopSceneId) {
        this.pets.update(dt, this.time);
        this.bottle.update(dt, this.time);
      }

      // Ambient particles & 3D Rain
      const pAttr = this.ambientPoints.geometry.attributes.position;
      const pType = (CozyGarden.DIORAMA_THEMES[this.sceneId] || CozyGarden.DIORAMA_THEMES.sakura).particleType;
      for (let i = 0; i < this.ambientData.length; i++) {
        const d = this.ambientData[i];
        let x = pAttr.getX(i);
        let y = pAttr.getY(i);
        if (pType === 'petal') {
          y -= d.speed * dt * 0.9;
          x += Math.sin(this.time + d.phase) * dt * 0.35;
          if (y < 0.2) y = 5.4;
        } else {
          y += Math.sin(this.time * d.speed + d.phase) * dt * 0.2;
        }
        pAttr.setXYZ(i, x, y, pAttr.getZ(i));
      }
      pAttr.needsUpdate = true;

      if (this.weatherMode > 0) {
        const rAttr = this.rainPoints.geometry.attributes.position;
        const speed = this.weatherMode === 2 ? 16 : 10;
        for (let i = 0; i < rAttr.count; i++) {
          let y = rAttr.getY(i) - speed * dt;
          if (y < -0.2) y = 10.5;
          rAttr.setY(i, y);
        }
        rAttr.needsUpdate = true;
      }
    }
  }

  window.IslandScene3D = IslandScene3D;
})();
