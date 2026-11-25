/* ==========================================================================
   Cozy Lofi Pixel Island — Spacious 640x360 Multi-Biome Diorama Renderer
   4 Switchable Island Worlds: Starlight, Sunset, Sakura, Snowy Aurora
   Cute miniature chibi pixel character with natural sipping animation.
   ========================================================================== */

const ISLAND_THEMES = {
  starlight: {
    id: 'starlight',
    name: 'Đảo Đêm Sao',
    clearLabel: 'Đêm sao',
    sky: ['#0b0f21', '#111833', '#192447', '#23325c', '#2d4070'],
    skyRain: ['#090c17', '#0f1424', '#161d33', '#1e2742', '#263150'],
    ocean: ['#14203d', '#18284a', '#1d3157', '#223b66', '#1a2d4f'],
    shallow: '#355c7d',
    foam: 'rgba(205, 228, 255, 0.55)',
    sand: '#c9b38c',
    sandShade: '#a68e68',
    grassTop: '#3e7360',
    grassMid: '#2e594c',
    grassDark: '#204038',
    trunk: '#573d32',
    trunkShade: '#3b2821',
    leafDark: '#1c423b',
    leafMid: '#2a5e52',
    leafLight: '#438570',
    leafTip: '#63a88d',
    cloud: '#243154',
    cloudHi: '#32436e',
    sweater: '#f0e4d0',
    sweaterShade: '#d4c3aa',
    scarf: null,
    beanie: false,
    headphoneAccent: '#ff9e64',
    cushion: '#4f4473',
    cushionLight: '#6b5d99',
    catFur: '#e89d5e',
    catLight: '#f7ba82',
    catStripe: '#b86c39',
    catCream: '#fff0db',
    catBlanket: '#41385e',
    lampGlowRGB: '255, 178, 108',
    reflectionRGB: '245, 224, 175',
    particleType: 'firefly',
  },
  sunset: {
    id: 'sunset',
    name: 'Đảo Hoàng Hôn',
    clearLabel: 'Hoàng hôn',
    sky: ['#261c3d', '#4f2c52', '#8f4758', '#d4795d', '#f5b473'],
    skyRain: ['#1f192e', '#36263d', '#543542', '#734747', '#8f5d52'],
    ocean: ['#3b2a47', '#54364f', '#734555', '#5c384a', '#3d263b'],
    shallow: '#a36260',
    foam: 'rgba(255, 224, 185, 0.55)',
    sand: '#e3be8d',
    sandShade: '#bf9565',
    grassTop: '#6b8c4e',
    grassMid: '#4f6e3c',
    grassDark: '#38522b',
    trunk: '#5e3c2c',
    trunkShade: '#40271d',
    leafDark: '#3c572b',
    leafMid: '#587a3b',
    leafLight: '#82a34e',
    leafTip: '#c4ba5e',
    cloud: '#a85a60',
    cloudHi: '#e3906f',
    sweater: '#e6947c',
    sweaterShade: '#c4745e',
    scarf: null,
    beanie: false,
    headphoneAccent: '#ffe08a',
    cushion: '#6e3a42',
    cushionLight: '#8f4d57',
    catFur: '#f2e4d0',
    catLight: '#fff6e8',
    catStripe: '#cc7b49',
    catCream: '#ffffff',
    catBlanket: '#7d443a',
    lampGlowRGB: '255, 196, 118',
    reflectionRGB: '255, 206, 130',
    particleType: 'sparkle',
  },
  sakura: {
    id: 'sakura',
    name: 'Đảo Hoa Anh Đào',
    clearLabel: 'Gió xuân',
    sky: ['#262345', '#443763', '#73537d', '#b37996', '#e6b1bf'],
    skyRain: ['#1d1c33', '#2e2a45', '#473d59', '#61506b', '#7a657d'],
    ocean: ['#333961', '#424c78', '#565f8c', '#48517a', '#353c61'],
    shallow: '#7a8ab0',
    foam: 'rgba(255, 232, 240, 0.6)',
    sand: '#e0d0bd',
    sandShade: '#bda995',
    grassTop: '#6aa374',
    grassMid: '#4f855c',
    grassDark: '#396646',
    trunk: '#523836',
    trunkShade: '#382423',
    leafDark: '#a85476',
    leafMid: '#d6789c',
    leafLight: '#f2a2bf',
    leafTip: '#ffd1e2',
    cloud: '#9e708e',
    cloudHi: '#e0b1c4',
    sweater: '#a7c7ab',
    sweaterShade: '#84a688',
    scarf: null,
    beanie: false,
    headphoneAccent: '#f2a2bf',
    cushion: '#8c4f6b',
    cushionLight: '#b36b8c',
    catFur: '#e8d9c5',
    catLight: '#f7eee1',
    catStripe: '#80695e',
    catCream: '#ffffff',
    catBlanket: '#5c4b75',
    lampGlowRGB: '255, 205, 145',
    reflectionRGB: '255, 212, 226',
    particleType: 'petal',
  },
  winter: {
    id: 'winter',
    name: 'Đảo Tuyết Cực Quang',
    clearLabel: 'Cực quang',
    sky: ['#08101c', '#0d1b2e', '#142942', '#1d3957', '#26496b'],
    skyRain: ['#09101a', '#101a29', '#182538', '#203047', '#293c57'],
    ocean: ['#102236', '#152d45', '#1b3954', '#163047', '#102336'],
    shallow: '#457694',
    foam: 'rgba(232, 246, 255, 0.7)',
    sand: '#c9dae8',
    sandShade: '#9db6cc',
    grassTop: '#e6f1fa',
    grassMid: '#c4d9eb',
    grassDark: '#99b4cc',
    trunk: '#4a362c',
    trunkShade: '#30221c',
    leafDark: '#1c3d3b',
    leafMid: '#2a5954',
    leafLight: '#d4e8f7',
    leafTip: '#f5fbff',
    cloud: '#213852',
    cloudHi: '#345273',
    sweater: '#c95f5f',
    sweaterShade: '#a34646',
    scarf: '#f2e6cf',
    beanie: true,
    headphoneAccent: '#73daca',
    cushion: '#355469',
    cushionLight: '#4c7591',
    catFur: '#f09f5e',
    catLight: '#ffbe85',
    catStripe: '#bf6e36',
    catCream: '#fff4e6',
    catBlanket: '#32524c',
    lampGlowRGB: '255, 192, 118',
    reflectionRGB: '145, 240, 215',
    particleType: 'snow',
  },
};

const OUTFIT_PALETTES = [
  { name: 'Kem', main: '#f0e4d0', shade: '#d4c3aa', accent: '#ff9e64' },
  { name: 'Xanh rêu', main: '#9dbfa3', shade: '#7ba182', accent: '#ffe08a' },
  { name: 'Hồng đào', main: '#ebb0a8', shade: '#c98b83', accent: '#f2e8d8' },
  { name: 'Oải hương', main: '#c5b5e8', shade: '#a18fc9', accent: '#73daca' },
];

const PET_LABELS = {
  cat: 'Mèo đang ngủ',
  corgi: 'Corgi đang nằm chill',
  fox: 'Cáo nhỏ đang cuộn tròn',
  duck: 'Vịt nhỏ đang nghỉ ngơi',
};

class PixelRoomScene {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.W = 640;
    this.H = 360;

    this.callbacks = callbacks;

    // Scene & interactive states
    this.sceneId = 'starlight';
    this.artStyle = 'pixel'; // 'pixel' | 'anime' | 'cyberpunk' | 'watercolor'
    this.sceneFade = 0;
    this.weatherMode = 0; // 0: Clear, 1: Light Rain, 2: Heavy Rain
    this.lampMode = 0; // 0: Warm Bright, 1: Soft Dim, 2: Off
    this.pomoMode = 'focus'; // 'micro' | 'focus' | 'break'
    this.breakActivity = 0; // 0: Fishing, 1: Humming under tree, 2: Stargazing on beach
    this.islandLevel = 0; // 0..12 progressive island unlocks
    this.petType = 'cat'; // 'cat' | 'corgi' | 'fox' | 'duck'
    this.outfitIndex = 0; // 0..3 character sweater palette

    // Message in a bottle state
    this.bottleVisible = true;
    this.bottleCooldown = 0;

    // Animation timers
    this.time = 0;
    this.lastFrameTime = performance.now();

    // Chibi character states
    this.typingTimer = 0;
    this.nextKeyInterval = 0.28;
    this.leftHandDown = false;
    this.rightHandDown = false;
    this.blinkTimer = 3.2;
    this.isBlinking = false;
    this.sipProgress = 0;
    this.isSipping = false;

    // Cat petting state
    this.catHappyTimer = 0;
    this.hearts = [];

    // Clock / Pomodoro display synced from app.js
    this.clockText = '25:00';
    this.pomoRunning = false;

    // Hover state
    this.hoveredId = null;

    // Interactive object hitboxes (640x360 virtual pixels)
    this.hotspots = [
      {
        id: 'window',
        x: 90,
        y: 16,
        w: 460,
        h: 122,
        getLabel: () => {
          const t = this._theme();
          const names = [t.clearLabel, 'Mưa nhẹ', 'Mưa nặng hạt'];
          return `Bầu trời • ${names[this.weatherMode]} (Click đổi thời tiết)`;
        },
      },
      {
        id: 'skyClock',
        x: 248,
        y: 34,
        w: 144,
        h: 46,
        getLabel: () =>
          this.pomoRunning
            ? 'Đồng hồ bầu trời • Đang chạy (Click tạm dừng)'
            : 'Đồng hồ bầu trời • Pomodoro (Click bắt đầu)',
      },
      {
        id: 'clock',
        x: 214,
        y: 206,
        w: 44,
        h: 44,
        getLabel: () =>
          this.pomoRunning
            ? 'Đồng hồ gỗ • Pomodoro đang chạy (Click tạm dừng)'
            : 'Đồng hồ gỗ • Hẹn giờ Pomodoro (Click bắt đầu)',
      },
      {
        id: 'mug',
        x: 329,
        y: 214,
        w: 22,
        h: 22,
        getLabel: () => 'Ly trà nóng (Click để nhâm nhi)',
      },
      {
        id: 'lamp',
        x: 364,
        y: 174,
        w: 36,
        h: 76,
        getLabel: () => {
          const modes = ['Ánh sáng ấm', 'Ánh sáng dịu', 'Đang tắt'];
          return `Đèn lồng • ${modes[this.lampMode]} (Click đổi chế độ)`;
        },
      },
      {
        id: 'cat',
        x: 404,
        y: 226,
        w: 48,
        h: 28,
        getLabel: () => `${PET_LABELS[this.petType] || 'Thú cưng'} (Click để vuốt ve)`,
      },
      {
        id: 'character',
        x: 278,
        y: 206,
        w: 28,
        h: 44,
        getLabel: () => {
          if (this.pomoMode === 'break') {
            const acts = ['Câu cá trên cầu tàu', 'Ngồi gốc cây hát ngâm', 'Đứng bãi cát ngắm trời'];
            return `Đang nghỉ: ${acts[this.breakActivity]} (Click đổi hoạt động)`;
          }
          return 'Nhân vật đang tập trung (Click đổi màu áo)';
        },
      },
      {
        id: 'bottle',
        x: 144,
        y: 268,
        w: 26,
        h: 24,
        getLabel: () => 'Chai thư trôi dạt vào bờ (Click để mở lời nhắn)',
      },
    ];

    // Procedural elements
    this.stars = this._initStars(75);
    this.clouds = this._initClouds(5);
    this.raindrops = this._initRain(190);
    this.ripples = this._initRipples(18);
    this.ambientParticles = this._initAmbientParticles(28);
    this.steamParticles = this._initSteam(8);
    this.waveGlints = this._initWaveGlints(36);

    this._bindPointerEvents();
  }

  _theme() {
    return ISLAND_THEMES[this.sceneId] || ISLAND_THEMES.starlight;
  }

  setScene(sceneId) {
    if (!ISLAND_THEMES[sceneId] || sceneId === this.sceneId) return;
    this.sceneId = sceneId;
    this.sceneFade = 0.65;
  }

  setArtStyle(style) {
    const valid = ['pixel', 'anime', 'cyberpunk', 'watercolor'];
    if (!valid.includes(style) || style === this.artStyle) return;
    this.artStyle = style;
    this.ctx.imageSmoothingEnabled = style === 'anime' || style === 'watercolor';
    this.sceneFade = 0.45;
  }

  setPomoMode(mode) {
    this.pomoMode = mode;
    this._syncCharacterHotspot();
  }

  _syncCharacterHotspot() {
    const charSpot = this.hotspots.find((h) => h.id === 'character');
    if (!charSpot) return;
    if (this.pomoMode === 'break') {
      if (this.breakActivity === 0) {
        charSpot.x = 486;
        charSpot.y = 228;
      } else if (this.breakActivity === 1) {
        charSpot.x = 180;
        charSpot.y = 204;
      } else {
        charSpot.x = 162;
        charSpot.y = 224;
      }
    } else {
      charSpot.x = 278;
      charSpot.y = 206;
    }
  }

  setIslandLevel(level) {
    this.islandLevel = Math.max(0, Math.min(12, Number(level) || 0));
  }

  setPetType(pet) {
    if (PET_LABELS[pet]) {
      this.petType = pet;
    }
  }

  setOutfitIndex(idx) {
    this.outfitIndex = ((Number(idx) || 0) % OUTFIT_PALETTES.length + OUTFIT_PALETTES.length) % OUTFIT_PALETTES.length;
  }

  spawnBottle() {
    this.bottleVisible = true;
    this.bottleCooldown = 0;
  }

  /* ------------------------------------------------------------------------
     Procedural Particles Initialization
     ------------------------------------------------------------------------ */
  _initStars(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.floor(Math.random() * this.W),
        y: 8 + Math.floor(Math.random() * 145),
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.2,
        size: Math.random() > 0.85 ? 2 : 1,
      });
    }
    return arr;
  }

  _initClouds(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: i * 140 + Math.random() * 40,
        y: 34 + (i % 3) * 28 + Math.random() * 10,
        w: 44 + Math.floor(Math.random() * 34),
        speed: 2.2 + Math.random() * 2.4,
      });
    }
    return arr;
  }

  _initRain(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * (this.W + 80),
        y: Math.random() * this.H,
        speed: 135 + Math.random() * 75,
        len: 6 + Math.floor(Math.random() * 5),
      });
    }
    return arr;
  }

  _initRipples(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: 20 + Math.random() * (this.W - 40),
        y: 220 + Math.random() * 130,
        phase: Math.random(),
        speed: 0.45 + Math.random() * 0.35,
      });
    }
    return arr;
  }

  _initAmbientParticles(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * this.W,
        y: 60 + Math.random() * 200,
        phase: Math.random() * Math.PI * 2,
        speed: 8 + Math.random() * 14,
        drift: 0.5 + Math.random() * 0.9,
      });
    }
    return arr;
  }

  _initSteam(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        offset: i / count,
        drift: (Math.random() - 0.5) * 2.2,
      });
    }
    return arr;
  }

  _initWaveGlints(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * this.W,
        y: 216 + Math.floor(Math.random() * 136),
        w: 6 + Math.floor(Math.random() * 14),
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
      });
    }
    return arr;
  }

  /* ------------------------------------------------------------------------
     Mouse Coordinate Mapping
     ------------------------------------------------------------------------ */
  _getCanvasPixelCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const aspectCanvas = this.W / this.H;
    const aspectElem = rect.width / rect.height;

    let renderW = rect.width;
    let renderH = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (aspectElem > aspectCanvas) {
      renderW = rect.height * aspectCanvas;
      offsetX = (rect.width - renderW) / 2;
    } else {
      renderH = rect.width / aspectCanvas;
      offsetY = (rect.height - renderH) / 2;
    }

    const px = ((clientX - rect.left - offsetX) / renderW) * this.W;
    const py = ((clientY - rect.top - offsetY) / renderH) * this.H;
    return { x: px, y: py };
  }

  _hitTest(px, py) {
    for (let i = this.hotspots.length - 1; i >= 0; i--) {
      const h = this.hotspots[i];
      if (h.id === 'bottle' && !this.bottleVisible) continue;
      if (px >= h.x && px <= h.x + h.w && py >= h.y && py <= h.y + h.h) {
        return h;
      }
    }
    return null;
  }

  _bindPointerEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const { x, y } = this._getCanvasPixelCoords(e.clientX, e.clientY);
      const hit = this._hitTest(x, y);
      this.hoveredId = hit ? hit.id : null;
      this.canvas.style.cursor = hit ? 'pointer' : 'default';

      if (this.callbacks.onHoverChange) {
        this.callbacks.onHoverChange(hit ? hit.getLabel() : null, e.clientX, e.clientY);
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredId = null;
      this.canvas.style.cursor = 'default';
      if (this.callbacks.onHoverChange) {
        this.callbacks.onHoverChange(null, 0, 0);
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const { x, y } = this._getCanvasPixelCoords(e.clientX, e.clientY);
      const hit = this._hitTest(x, y);
      if (!hit) return;

      this._handleObjectClick(hit.id);

      if (this.callbacks.onHoverChange) {
        this.callbacks.onHoverChange(hit.getLabel(), e.clientX, e.clientY);
      }
    });
  }

  _handleObjectClick(id) {
    if (id === 'window') {
      this.weatherMode = (this.weatherMode + 1) % 3;
      if (this.callbacks.onWeatherChange) {
        this.callbacks.onWeatherChange(this.weatherMode);
      }
    } else if (id === 'lamp') {
      this.lampMode = (this.lampMode + 1) % 3;
      if (this.callbacks.onLampChange) {
        this.callbacks.onLampChange(this.lampMode);
      }
    } else if (id === 'mug') {
      if (!this.isSipping) {
        this.isSipping = true;
        this.sipProgress = 0;
        if (this.callbacks.onSipMug) {
          this.callbacks.onSipMug();
        }
      }
    } else if (id === 'cat') {
      this.catHappyTimer = 3.8;
      for (let i = 0; i < 4; i++) {
        this.hearts.push({
          x: 416 + Math.random() * 20,
          y: 228 + Math.random() * 6,
          vy: -12 - Math.random() * 7,
          drift: (Math.random() - 0.5) * 6,
          life: 0,
          maxLife: 1.6 + Math.random() * 0.7,
        });
      }
      if (this.callbacks.onPetCat) {
        this.callbacks.onPetCat();
      }
    } else if (id === 'clock' || id === 'skyClock') {
      if (this.callbacks.onClockClick) {
        this.callbacks.onClockClick();
      }
    } else if (id === 'character') {
      if (this.pomoMode === 'break') {
        this.breakActivity = (this.breakActivity + 1) % 3;
        this._syncCharacterHotspot();
        if (this.callbacks.onBreakActivityChange) {
          this.callbacks.onBreakActivityChange(this.breakActivity);
        }
      } else {
        this.outfitIndex = (this.outfitIndex + 1) % OUTFIT_PALETTES.length;
        if (this.callbacks.onOutfitChange) {
          this.callbacks.onOutfitChange(this.outfitIndex);
        }
      }
    } else if (id === 'bottle' && this.bottleVisible) {
      this.bottleVisible = false;
      this.bottleCooldown = 75;
      if (this.callbacks.onBottleClick) {
        this.callbacks.onBottleClick();
      }
    }
  }

  setClockDisplay(text, isRunning) {
    this.clockText = text;
    this.pomoRunning = isRunning;
  }

  /* ------------------------------------------------------------------------
     Main Loop
     ------------------------------------------------------------------------ */
  start() {
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
      this.lastFrameTime = now;
      this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(dt) {
    this.time += dt;

    if (this.sceneFade > 0) {
      this.sceneFade = Math.max(0, this.sceneFade - dt * 2.4);
    }

    // 1. Drifting Clouds
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > this.W + 40) {
        c.x = -c.w - 30;
      }
    }

    // 2. Rain & Water Ripples
    if (this.weatherMode > 0) {
      const activeCount = this.weatherMode === 2 ? this.raindrops.length : 72;
      const speedMult = this.weatherMode === 2 ? 1.35 : 0.88;
      for (let i = 0; i < activeCount; i++) {
        const r = this.raindrops[i];
        r.x -= r.speed * 0.24 * speedMult * dt;
        r.y += r.speed * speedMult * dt;
        if (r.y > this.H || r.x < -10) {
          r.x = Math.random() * (this.W + 100);
          r.y = -12 - Math.random() * 24;
        }
      }
      for (const rp of this.ripples) {
        rp.phase += rp.speed * speedMult * dt;
        if (rp.phase >= 1) {
          rp.phase = 0;
          rp.x = 20 + Math.random() * (this.W - 40);
          rp.y = 220 + Math.random() * 130;
        }
      }
    }

    // 3. Ambient Biome Particles (petals, snow, fireflies)
    const pType = this._theme().particleType;
    for (const p of this.ambientParticles) {
      if (pType === 'petal' || pType === 'snow') {
        p.y += p.speed * (pType === 'snow' ? 0.85 : 1.0) * dt;
        p.x += Math.sin(this.time * p.drift + p.phase) * 10 * dt + (pType === 'petal' ? 6 * dt : 0);
        if (p.y > 310 || p.x > this.W + 10) {
          p.y = -6 - Math.random() * 40;
          p.x = Math.random() * this.W;
        }
      }
    }

    // 4. Cute Blink Timer
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      if (this.isBlinking) {
        this.isBlinking = false;
        this.blinkTimer = 2.6 + Math.random() * 3.4;
      } else {
        this.isBlinking = true;
        this.blinkTimer = 0.14;
      }
    }

    // 5. Cozy Chibi Sipping Animation (2.8s — neat & natural!)
    if (this.isSipping) {
      this.sipProgress += dt / 2.8;
      if (this.sipProgress >= 1) {
        this.isSipping = false;
        this.sipProgress = 0;
      }
    }

    // 5.5 Message in a bottle respawn timer
    if (!this.bottleVisible) {
      this.bottleCooldown -= dt;
      if (this.bottleCooldown <= 0) {
        this.bottleVisible = true;
      }
    }

    // 6. Relaxed Typing Cadence (paused during Break fishing mode or sipping)
    if (!this.isSipping && this.pomoMode !== 'break') {
      this.typingTimer += dt;
      if (this.typingTimer >= this.nextKeyInterval) {
        this.typingTimer = 0;
        if (Math.random() < 0.16) {
          this.nextKeyInterval = 0.75 + Math.random() * 0.9;
          this.leftHandDown = false;
          this.rightHandDown = false;
        } else {
          this.nextKeyInterval = 0.22 + Math.random() * 0.28;
          if (Math.random() > 0.5) {
            this.leftHandDown = !this.leftHandDown;
            this.rightHandDown = false;
          } else {
            this.rightHandDown = !this.rightHandDown;
            this.leftHandDown = false;
          }
          if (this.callbacks.onKeystroke) {
            this.callbacks.onKeystroke();
          }
        }
      }
    } else {
      this.leftHandDown = false;
      this.rightHandDown = false;
    }

    // 7. Cat Happy Timer & Hearts
    if (this.catHappyTimer > 0) {
      this.catHappyTimer = Math.max(0, this.catHappyTimer - dt);
    }
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i];
      h.life += dt;
      h.y += h.vy * dt;
      h.x += Math.sin(h.life * 4) * h.drift * dt;
      if (h.life >= h.maxLife) {
        this.hearts.splice(i, 1);
      }
    }
  }

  /* ------------------------------------------------------------------------
     Rendering Pipeline
     ------------------------------------------------------------------------ */
  render() {
    const ctx = this.ctx;
    const t = this._theme();
    const breath60 = Math.sin(this.time * Math.PI * 2 * 0.5);
    const bob60 = Math.sin(this.time * Math.PI * 2 * 1.0);

    // 1. Wide Open Sky, Stars/Aurora, Sun/Moon, Drifting Clouds
    this._drawSky(ctx, t);

    // 1.5 Grand Sky Elements (Lv.11 Shooting Stars, Lv.12 Hot-Air Balloon) & Center Sky Clock
    this._drawSkyProgression(ctx, t);
    this._drawSkyClock(ctx, t);

    // 2. Vast Shimmering Ocean, Reflections, Horizon Silhouette, Rain Ripples
    this._drawOcean(ctx, t);

    // 3. The Cozy Small Island (Water Halo, Foam, Beach, Grass Mound, Pier & Rowboat)
    this._drawIslandTerrain(ctx, t);

    // 3.5 Message in a Bottle floating near left shoreline
    if (this.bottleVisible) {
      this._drawMessageBottle(ctx);
    }

    // 4. Island Tree (Left of study nook, swaying softly in breeze)
    this._drawIslandTree(ctx, t);

    // 4.5 Progressive Island Growth Unlocks (Lv.1..Lv.8)
    this._drawIslandProgression(ctx, t);

    // 5. Wooden Signpost Pomodoro Clock (Left-front of island)
    this._drawSignpostClock(ctx, t);

    // 6. Hanging Wooden Lantern Post (Right-center of island)
    this._drawLanternPost(ctx, t);

    // 7. Cozy Study Nook: Picnic Blanket, Chibi Character (or Fishing in Break!), Table, Laptop & Mug
    const holdingMug = this.isSipping && this.sipProgress > 0.1 && this.sipProgress < 0.9;
    this._drawStudyNook(ctx, t, breath60, bob60, holdingMug);

    // 8. Companion Pet on Cozy Blanket (Cat / Corgi / Fox / Duck + Lv.8 baby companion)
    this._drawSleepingCat(ctx, t, breath60);

    // 9. Biome Ambient Particles (Fireflies / Sakura Petals / Snow / Sparkles)
    this._drawAmbientParticles(ctx, t);

    // 10. Warm Lantern Glow & Laptop Glow Overlay
    this._drawLighting(ctx, t);

    // 11. Rain Overlay (when weatherMode > 0)
    if (this.weatherMode > 0) {
      this._drawRain(ctx);
    }

    // 11.5 Art Style Post-Processing Atmosphere (Anime bloom/bokeh, Cyberpunk grid/scanlines, Watercolor wash)
    this._drawArtStyleOverlay(ctx, t);

    // 12. Floating Pixel Hearts
    this._drawHearts(ctx);

    // 13. Hover Highlight Outline
    if (this.hoveredId) {
      this._drawHoverOutline(ctx, this.hoveredId);
    }

    // 14. Smooth Scene Transition Fade
    if (this.sceneFade > 0.01) {
      ctx.fillStyle = `rgba(12, 14, 22, ${this.sceneFade.toFixed(2)})`;
      ctx.fillRect(0, 0, this.W, this.H);
    }
  }

  /* ------------------------------------------------------------------------
     Drawing Helpers
     ------------------------------------------------------------------------ */
  _rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  _outlinedRect(ctx, x, y, w, h, fill, outline = '#1a1824') {
    this._rect(ctx, x - 1, y - 1, w + 2, h + 2, outline);
    this._rect(ctx, x, y, w, h, fill);
  }

  /* ------------------------------------------------------------------------
     1. Wide Open Sky
     ------------------------------------------------------------------------ */
  _drawSky(ctx, t) {
    const horizonY = 208;
    const palette = this.weatherMode === 2 ? t.skyRain : t.sky;

    if (this.artStyle === 'anime' || this.artStyle === 'watercolor') {
      // Smooth lush multi-stop sky gradient for Anime & Watercolor styles
      const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
      palette.forEach((col, i) => {
        grad.addColorStop(i / Math.max(1, palette.length - 1), col);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.W, horizonY + 1);
    } else if (this.artStyle === 'cyberpunk') {
      // Deep Synthwave / Cyberpunk Neon Sky Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
      grad.addColorStop(0, '#090418');
      grad.addColorStop(0.42, '#1c0b3d');
      grad.addColorStop(0.78, '#54125e');
      grad.addColorStop(1, '#c91c78');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.W, horizonY + 1);
    } else {
      const bandH = Math.ceil(horizonY / palette.length);
      palette.forEach((col, i) => {
        this._rect(ctx, 0, i * bandH, this.W, bandH + 1, col);
      });
    }

    // Stars (Starlight, Winter, and subtle top stars in Sakura)
    if (this.sceneId === 'starlight' || this.sceneId === 'winter' || this.sceneId === 'sakura') {
      const baseVis =
        this.sceneId === 'sakura'
          ? 0.45
          : this.weatherMode === 2
            ? 0.2
            : this.weatherMode === 1
              ? 0.55
              : 1.0;
      for (const s of this.stars) {
        if (this.sceneId === 'sakura' && s.y > 75) continue;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this.time * s.speed + s.phase));
        ctx.fillStyle = `rgba(235, 242, 255, ${(tw * baseVis).toFixed(2)})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
    }

    // Northern Lights Aurora Ribbons in Winter Biome!
    if (this.sceneId === 'winter' && this.weatherMode < 2) {
      for (let x = 0; x < this.W; x += 6) {
        const wave = Math.sin(x * 0.015 + this.time * 0.5) * 14 + Math.cos(x * 0.008 - this.time * 0.3) * 10;
        const y = 62 + wave;
        const alpha = 0.12 + 0.07 * Math.sin(x * 0.02 + this.time * 0.8);
        ctx.fillStyle = `rgba(115, 224, 198, ${alpha.toFixed(2)})`;
        ctx.fillRect(x, Math.round(y), 6, 26);
        ctx.fillStyle = `rgba(145, 165, 255, ${(alpha * 0.65).toFixed(2)})`;
        ctx.fillRect(x, Math.round(y - 12), 6, 14);
      }
    }

    // Celestial Body (Moon or Setting Sun)
    if (this.sceneId === 'sunset') {
      // Glowing Sunset Sun touching the horizon
      const sx = 468;
      const sy = 186;
      const g = ctx.createRadialGradient(sx, sy, 8, sx, sy, 68);
      g.addColorStop(0, 'rgba(255, 232, 168, 0.72)');
      g.addColorStop(0.5, 'rgba(255, 162, 108, 0.25)');
      g.addColorStop(1, 'rgba(255, 140, 100, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(sx - 68, sy - 68, 136, 100);
      this._rect(ctx, sx - 16, sy - 16, 32, 32, '#ffe4a1');
      this._rect(ctx, sx - 18, sy - 12, 36, 24, '#ffe4a1');
      this._rect(ctx, sx - 12, sy - 18, 24, 36, '#ffe4a1');
    } else {
      // Soft Glowing Crescent Moon
      const mx = 472;
      const my = 52;
      const moonAlpha = this.weatherMode === 2 ? 0.3 : 0.94;
      const g = ctx.createRadialGradient(mx + 6, my + 8, 4, mx + 6, my + 8, 36);
      g.addColorStop(0, `rgba(248, 234, 196, ${(0.22 * moonAlpha).toFixed(2)})`);
      g.addColorStop(1, 'rgba(248, 234, 196, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(mx - 32, my - 32, 76, 76);

      const moonCol = `rgba(250, 238, 205, ${moonAlpha})`;
      this._rect(ctx, mx, my, 14, 16, moonCol);
      this._rect(ctx, mx - 2, my + 2, 18, 12, moonCol);
      const cutCol = palette[1];
      this._rect(ctx, mx + 6, my + 1, 11, 12, cutCol);
      this._rect(ctx, mx + 8, my, 8, 14, cutCol);
    }

    // Soft Drifting Clouds (Puffy smooth Ghibli clouds in Anime/Watercolor, crisp pixel in Pixel/Cyber)
    for (const c of this.clouds) {
      const cx = Math.round(c.x);
      const cy = Math.round(c.y);
      if (this.artStyle === 'anime' || this.artStyle === 'watercolor') {
        ctx.save();
        ctx.fillStyle = this.artStyle === 'anime' ? 'rgba(255, 240, 248, 0.28)' : 'rgba(255, 246, 230, 0.25)';
        ctx.beginPath();
        ctx.arc(cx + c.w * 0.25, cy + 8, 10, 0, Math.PI * 2);
        ctx.arc(cx + c.w * 0.5, cy + 4, 14, 0, Math.PI * 2);
        ctx.arc(cx + c.w * 0.75, cy + 8, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.artStyle === 'anime' ? 'rgba(255, 250, 255, 0.42)' : 'rgba(255, 250, 240, 0.35)';
        ctx.beginPath();
        ctx.arc(cx + c.w * 0.48, cy + 1, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        const cMain = this.artStyle === 'cyberpunk' ? '#2c1147' : t.cloud;
        const cHi = this.artStyle === 'cyberpunk' ? '#ff2a85' : t.cloudHi;
        this._rect(ctx, cx, cy + 6, c.w, 8, cMain);
        this._rect(ctx, cx + 8, cy + 2, c.w - 16, 6, cHi);
        this._rect(ctx, cx + 16, cy - 2, c.w - 32, 5, cHi);
      }
    }
  }

  /* ------------------------------------------------------------------------
     2. Vast Shimmering Ocean
     ------------------------------------------------------------------------ */
  _drawOcean(ctx, t) {
    const horizonY = 208;
    const oceanH = this.H - horizonY;

    if (this.artStyle === 'anime' || this.artStyle === 'watercolor') {
      const grad = ctx.createLinearGradient(0, horizonY, 0, this.H);
      t.ocean.forEach((col, i) => {
        grad.addColorStop(i / Math.max(1, t.ocean.length - 1), col);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, horizonY, this.W, oceanH);
    } else if (this.artStyle === 'cyberpunk') {
      const grad = ctx.createLinearGradient(0, horizonY, 0, this.H);
      grad.addColorStop(0, '#1e0836');
      grad.addColorStop(0.45, '#120726');
      grad.addColorStop(1, '#090418');
      ctx.fillStyle = grad;
      ctx.fillRect(0, horizonY, this.W, oceanH);

      // Perspective Neon Synthwave Grid across the ocean!
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.24)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const progress = ((i / 8) + ((this.time * 0.14) % (1 / 8)));
        const y = horizonY + Math.pow(progress, 1.65) * oceanH;
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(this.W, Math.round(y) + 0.5);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255, 42, 133, 0.18)';
      for (let x = -220; x <= this.W + 220; x += 64) {
        ctx.beginPath();
        ctx.moveTo(320 + (x - 320) * 0.25, horizonY);
        ctx.lineTo(x, this.H);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      const bandH = Math.ceil(oceanH / t.ocean.length);
      t.ocean.forEach((col, i) => {
        this._rect(ctx, 0, horizonY + i * bandH, this.W, bandH + 1, col);
      });
    }

    // Subtle Horizon Glow Line
    this._rect(ctx, 0, horizonY, this.W, 2, `rgba(${t.reflectionRGB}, 0.25)`);

    // Distant tiny islets on far horizon for vast open-sea scale
    this._rect(ctx, 42, horizonY - 5, 36, 5, t.ocean[0]);
    this._rect(ctx, 50, horizonY - 8, 18, 4, t.ocean[0]);
    this._rect(ctx, 560, horizonY - 4, 44, 4, t.ocean[0]);
    this._rect(ctx, 572, horizonY - 7, 20, 4, t.ocean[0]);

    // Shimmering Moon / Sun Reflection Path on Ocean (right side)
    const refX = 474;
    for (let y = horizonY + 4; y < this.H - 8; y += 6) {
      const spread = 8 + (y - horizonY) * 0.18;
      const sway = Math.sin(this.time * 1.8 + y * 0.15) * 4;
      const alpha = Math.max(0.06, 0.36 - (y - horizonY) * 0.002);
      ctx.fillStyle = `rgba(${t.reflectionRGB}, ${alpha.toFixed(2)})`;
      ctx.fillRect(Math.round(refX - spread / 2 + sway), y, Math.round(spread), 2);
    }

    // Gentle Animated Wave Glints
    for (const w of this.waveGlints) {
      const shimmer = 0.5 + 0.5 * Math.sin(this.time * w.speed + w.phase);
      ctx.fillStyle = `rgba(235, 244, 255, ${(0.06 + shimmer * 0.14).toFixed(2)})`;
      ctx.fillRect(Math.round(w.x + Math.sin(this.time + w.phase) * 2), w.y, w.w, 1);
    }

    // Raindrop Ripples on Ocean when raining
    if (this.weatherMode > 0) {
      const count = this.weatherMode === 2 ? this.ripples.length : 8;
      for (let i = 0; i < count; i++) {
        const rp = this.ripples[i];
        const radius = Math.round(rp.phase * 14);
        const alpha = (1 - rp.phase) * 0.42;
        ctx.fillStyle = `rgba(210, 232, 255, ${alpha.toFixed(2)})`;
        ctx.fillRect(Math.round(rp.x - radius), Math.round(rp.y), radius * 2, 1);
      }
    }
  }

  /* ------------------------------------------------------------------------
     3. The Small Cozy Island Terrain, Shoreline Foam, & Mini-Pier
     ------------------------------------------------------------------------ */
  _drawIslandTerrain(ctx, t) {
    const wavePulse = Math.sin(this.time * 1.6) * 2;

    // 1. Shallow turquoise water glow halo around island
    this._rect(ctx, 118 - wavePulse, 266, 404 + wavePulse * 2, 28, t.shallow);
    this._rect(ctx, 138 - wavePulse, 260, 364 + wavePulse * 2, 38, t.shallow);

    // 2. Animated soft white seafoam lapping at shoreline
    ctx.fillStyle = t.foam;
    ctx.fillRect(Math.round(126 - wavePulse), 278, Math.round(388 + wavePulse * 2), 3);
    ctx.fillRect(Math.round(146 - wavePulse), 286, Math.round(348 + wavePulse * 2), 2);
    ctx.fillRect(Math.round(176 + wavePulse), 292, Math.round(288 - wavePulse * 2), 2);

    // 3. Sandy Beach / Snow Shore Base (layered rounded pixel ellipse)
    this._rect(ctx, 140, 262, 360, 18, t.sandShade);
    this._rect(ctx, 154, 254, 332, 24, t.sand);
    this._rect(ctx, 174, 248, 292, 26, t.sand);

    // Tiny beach pebbles & shells
    this._rect(ctx, 166, 268, 4, 2, t.sandShade);
    this._rect(ctx, 212, 272, 3, 2, t.sandShade);
    this._rect(ctx, 438, 270, 4, 2, t.sandShade);
    this._rect(ctx, 466, 264, 3, 2, '#f5e8d5');

    // 4. Lush Grassy / Snowy Island Mound (stepped organic pixel hills)
    this._rect(ctx, 162, 246, 316, 18, t.grassDark);
    this._rect(ctx, 172, 238, 296, 20, t.grassMid);
    this._rect(ctx, 186, 232, 268, 18, t.grassTop);
    // Gentle left hillock under the tree
    this._rect(ctx, 182, 226, 94, 12, t.grassTop);

    // Cute tiny wildflowers / grass tufts on the island
    const tufts = [
      { x: 184, y: 244, col: '#ffe08a' },
      { x: 256, y: 256, col: '#f2a2bf' },
      { x: 398, y: 254, col: '#ffe08a' },
      { x: 454, y: 246, col: '#a8e6cf' },
    ];
    for (const tf of tufts) {
      this._rect(ctx, tf.x, tf.y, 2, 2, this.sceneId === 'winter' ? '#ffffff' : tf.col);
    }

    // 5. Tiny Wooden Mini-Pier & Bobbing Rowboat on right shoreline
    const pierX = 478;
    const pierY = 264;
    // Pier posts
    this._rect(ctx, pierX + 4, pierY + 4, 3, 12, '#3b2821');
    this._rect(ctx, pierX + 22, pierY + 4, 3, 12, '#3b2821');
    this._rect(ctx, pierX + 38, pierY + 4, 3, 12, '#3b2821');
    // Pier planks
    this._outlinedRect(ctx, pierX, pierY, 44, 5, '#785540', '#2b1c16');
    for (let px = pierX + 6; px < pierX + 42; px += 6) {
      this._rect(ctx, px, pierY, 1, 5, '#4a3225');
    }

    // Tiny cozy wooden rowboat bobbing softly beside pier
    const boatY = Math.round(268 + Math.sin(this.time * 1.9) * 1.4);
    const bx = 528;
    this._outlinedRect(ctx, bx + 4, boatY + 4, 24, 5, '#6e4934', '#241712');
    this._outlinedRect(ctx, bx, boatY, 32, 5, '#8c5e43', '#241712');
    this._rect(ctx, bx + 11, boatY + 1, 10, 2, '#b07b5a'); // bench
  }

  /* ------------------------------------------------------------------------
     4. Cozy Island Tree (Left side, gently swaying)
     ------------------------------------------------------------------------ */
  _drawIslandTree(ctx, t) {
    const sway = Math.round(Math.sin(this.time * 1.1) * 1.2);
    const tx = 204;
    const baseY = 236;

    // Tree Shadow on grass
    this._rect(ctx, tx - 22, baseY - 2, 58, 7, 'rgba(12, 16, 26, 0.28)');

    // Trunk & Roots
    this._outlinedRect(ctx, tx, baseY - 56, 14, 56, t.trunk, '#1c1514');
    this._rect(ctx, tx + 9, baseY - 54, 4, 52, t.trunkShade);
    this._rect(ctx, tx - 5, baseY - 5, 24, 6, t.trunk);

    if (this.sceneId === 'winter') {
      // Layered Snowy Evergreen Pine Tree
      const tiers = [
        { y: baseY - 46, w: 68, h: 18 },
        { y: baseY - 66, w: 56, h: 18 },
        { y: baseY - 84, w: 42, h: 18 },
        { y: baseY - 100, w: 26, h: 16 },
        { y: baseY - 112, w: 12, h: 12 },
      ];
      tiers.forEach((tr, idx) => {
        const cx = tx + 7 - Math.floor(tr.w / 2) + (idx > 1 ? sway : 0);
        this._outlinedRect(ctx, cx, tr.y, tr.w, tr.h, t.leafDark, '#122124');
        this._rect(ctx, cx + 2, tr.y + 2, tr.w - 4, tr.h - 6, t.leafMid);
        // Snow cap on top of each pine tier
        this._rect(ctx, cx + 4, tr.y, tr.w - 8, 5, t.leafLight);
        this._rect(ctx, cx + 8, tr.y, tr.w - 16, 2, t.leafTip);
      });
      // Tiny warm fairy lights on pine tree
      const lights = [
        { x: tx - 14, y: baseY - 38 },
        { x: tx + 16, y: baseY - 42 },
        { x: tx - 6, y: baseY - 58 },
        { x: tx + 12, y: baseY - 62 },
        { x: tx + 2, y: baseY - 78 },
      ];
      lights.forEach((l, i) => {
        const glow = 0.6 + 0.4 * Math.sin(this.time * 2 + i);
        ctx.fillStyle = `rgba(255, 210, 120, ${glow.toFixed(2)})`;
        ctx.fillRect(l.x + sway, l.y, 2, 2);
      });
      return;
    }

    // Lush Rounded Canopy (Starlight, Sunset, Sakura)
    const cx = tx + 7 + sway;
    const cy = baseY - 74;
    // Branches peeking into canopy
    this._rect(ctx, tx - 8, baseY - 64, 12, 4, t.trunk);
    this._rect(ctx, tx + 10, baseY - 60, 14, 4, t.trunk);

    // Multi-cluster pixel foliage (organic, lush, cozy!)
    this._outlinedRect(ctx, cx - 44, cy - 10, 88, 34, t.leafDark, '#161b24');
    this._outlinedRect(ctx, cx - 36, cy - 26, 72, 32, t.leafMid, '#161b24');
    this._outlinedRect(ctx, cx - 22, cy - 36, 46, 24, t.leafLight, '#161b24');
    // Side clusters
    this._rect(ctx, cx - 40, cy - 8, 28, 22, t.leafMid);
    this._rect(ctx, cx + 12, cy - 12, 30, 24, t.leafMid);
    // Sunlit / Moonlit canopy highlights
    this._rect(ctx, cx - 18, cy - 33, 36, 9, t.leafTip);
    this._rect(ctx, cx - 30, cy - 20, 20, 8, t.leafLight);
    this._rect(ctx, cx + 10, cy - 18, 22, 8, t.leafLight);
  }

  /* ------------------------------------------------------------------------
     5. Wooden Signpost Pomodoro Clock
     ------------------------------------------------------------------------ */
  _drawSignpostClock(ctx, t) {
    const cx = 218;
    const cy = 212;
    // Wooden post anchored into grass
    this._outlinedRect(ctx, cx + 16, cy + 18, 6, 20, '#5c3f30', '#1c1514');
    // Signboard frame
    this._outlinedRect(ctx, cx, cy, 38, 19, '#4f3629', '#1c1514');
    this._rect(ctx, cx + 3, cy + 3, 32, 13, '#141521');

    const digitColor = this.pomoRunning ? '#ff9e64' : '#f2c879';
    this._drawTinyPixelText(ctx, this.clockText, cx + 7, cy + 7, digitColor);
  }

  _drawTinyPixelText(ctx, text, startX, startY, color) {
    const font = {
      '0': ['111', '101', '101', '101', '111'],
      '1': ['010', '110', '010', '010', '111'],
      '2': ['111', '001', '111', '100', '111'],
      '3': ['111', '001', '111', '001', '111'],
      '4': ['101', '101', '111', '001', '001'],
      '5': ['111', '100', '111', '001', '111'],
      '6': ['111', '100', '111', '101', '111'],
      '7': ['111', '001', '001', '010', '010'],
      '8': ['111', '101', '111', '101', '111'],
      '9': ['111', '101', '111', '001', '111'],
      ':': ['0', '1', '0', '1', '0'],
    };

    ctx.fillStyle = color;
    let cursorX = startX;
    for (const ch of text) {
      const glyph = font[ch];
      if (!glyph) {
        cursorX += 2;
        continue;
      }
      const skipColon =
        ch === ':' && this.pomoRunning && Math.floor(this.time * 2) % 2 === 1;
      if (!skipColon) {
        for (let r = 0; r < glyph.length; r++) {
          for (let c = 0; c < glyph[r].length; c++) {
            if (glyph[r][c] === '1') {
              ctx.fillRect(cursorX + c, startY + r, 1, 1);
            }
          }
        }
      }
      cursorX += glyph[0].length + 2;
    }
  }

  /* ------------------------------------------------------------------------
     6. Hanging Wooden Lantern Post (Interactive Lamp)
     ------------------------------------------------------------------------ */
  _drawLanternPost(ctx, t) {
    const px = 384;
    const baseY = 248;
    // Vertical wooden post
    this._outlinedRect(ctx, px, baseY - 68, 5, 68, '#5c3f30', '#1c1514');
    // Curved/angled hanger arm pointing left toward study table
    this._outlinedRect(ctx, px - 14, baseY - 68, 19, 4, '#5c3f30', '#1c1514');
    // Lantern chain
    this._rect(ctx, px - 10, baseY - 64, 2, 5, '#2b2626');

    // Hanging Lantern Housing (gentle breeze sway)
    const lSway = Math.round(Math.sin(this.time * 1.4) * 0.6);
    const lx = px - 15 + lSway;
    const ly = baseY - 59;
    this._outlinedRect(ctx, lx, ly, 12, 3, '#2d3142', '#141521'); // cap
    const glassCol =
      this.lampMode === 2 ? '#363b4d' : this.lampMode === 0 ? '#ffe099' : '#e0af68';
    this._outlinedRect(ctx, lx + 1, ly + 3, 10, 12, glassCol, '#1f2230');
    if (this.lampMode !== 2) {
      this._rect(ctx, lx + 4, ly + 5, 4, 8, '#fff7d6'); // bright core
    }
    this._outlinedRect(ctx, lx, ly + 15, 12, 3, '#2d3142', '#141521'); // base
  }

  /* ------------------------------------------------------------------------
     7. Cozy Study Nook: Chibi Pixel Character + Small Table + Laptop + Mug
     Clean, cute 16-bit sprite! Zero stretched limbs when sipping!
     ------------------------------------------------------------------------ */
  _drawStudyNook(ctx, t, breath, bob, holdingMug) {
    const out = '#1a1824';

    // Cozy outdoor mat under study spot
    this._outlinedRect(ctx, 266, 244, 114, 14, t.cushion, out);
    this._rect(ctx, 270, 246, 106, 10, t.cushionLight);

    // 1. Cute Chibi Pixel Character (at desk during focus/micro, OR 3 cozy break activities!)
    if (this.pomoMode === 'break') {
      this._drawBreakCharacter(ctx, t, bob, holdingMug);
    } else {
      this._drawChibiCharacter(ctx, t, breath, bob, holdingMug);
    }

    // 2. Small Cozy Low Wooden Study Table (right in front of chibi character!)
    const tx = 301;
    const ty = 232;
    // Table legs
    this._outlinedRect(ctx, tx + 4, ty + 6, 4, 16, '#573b2d', out);
    this._outlinedRect(ctx, tx + 48, ty + 6, 4, 16, '#573b2d', out);
    // Tabletop
    this._outlinedRect(ctx, tx, ty, 56, 6, '#7a543f', out);
    this._rect(ctx, tx, ty, 56, 2, '#966b52');

    // 3. Tiny Laptop on Table (open & glowing in focus; neatly closed during Break!)
    const lx = tx + 5;
    const ly = ty - 12;
    if (this.pomoMode === 'break') {
      this._outlinedRect(ctx, lx, ty - 3, 22, 4, '#3c435e', out);
      this._rect(ctx, lx + 2, ty - 2, 18, 1, '#586285');
    } else {
      this._outlinedRect(ctx, lx, ty - 2, 22, 3, '#3c435e', out);
      this._outlinedRect(ctx, lx + 16, ly, 5, 11, '#2b3045', out);
      this._rect(ctx, lx + 15, ly + 1, 2, 9, '#82b4ff');
    }

    // 4. Warm Coffee/Tea Mug on Table (hidden while chibi is holding it!)
    if (!holdingMug) {
      this._drawTinyMug(ctx, 335, 224, true);
    }
  }

  _drawMessageBottle(ctx) {
    const bob = Math.round(Math.sin(this.time * 2.2) * 1.4);
    const bx = 152;
    const by = 276 + bob;

    // Gentle water ring under bottle
    ctx.fillStyle = 'rgba(220, 240, 255, 0.45)';
    ctx.fillRect(bx - 3, by + 7, 16, 2);

    // Glass bottle body (angled slightly)
    this._outlinedRect(ctx, bx, by + 2, 10, 6, '#73daca', '#1a2b2e');
    this._rect(ctx, bx + 2, by + 3, 5, 3, '#f2e4c4'); // rolled parchment note inside!
    // Bottle neck & cork
    this._outlinedRect(ctx, bx + 10, by + 3, 3, 4, '#9ce8dc', '#1a2b2e');
    this._rect(ctx, bx + 13, by + 3, 2, 4, '#b57b4a'); // cork

    // Subtle sparkle glint so user notices the bottle
    const glint = Math.sin(this.time * 3.5);
    if (glint > 0.35) {
      this._rect(ctx, bx + 2, by - 3, 1, 3, '#fff3b8');
      this._rect(ctx, bx + 1, by - 2, 3, 1, '#fff3b8');
    }
  }

  _drawIslandProgression(ctx, t) {
    const lv = this.islandLevel;
    const out = '#1a1824';

    // Lv 1: Colorful wildflower garden bed
    if (lv >= 1) {
      const flowers = [
        { x: 174, y: 240, col: '#ff9e64' },
        { x: 180, y: 243, col: '#f7768e' },
        { x: 187, y: 238, col: '#ffe08a' },
        { x: 254, y: 248, col: '#bb9af7' },
        { x: 261, y: 251, col: '#73daca' },
        { x: 458, y: 242, col: '#f7768e' },
        { x: 465, y: 245, col: '#ffe08a' },
      ];
      for (const fl of flowers) {
        this._rect(ctx, fl.x, fl.y + 2, 1, 3, '#3b734e');
        this._rect(ctx, fl.x - 1, fl.y, 3, 2, fl.col);
      }
    }

    // Lv 2: Glowing fairy mushrooms near tree base
    if (lv >= 2) {
      const mush = [
        { x: 190, y: 233 },
        { x: 196, y: 236 },
        { x: 222, y: 236 },
      ];
      const glow = 0.4 + 0.3 * Math.sin(this.time * 2.4);
      for (const m of mush) {
        ctx.fillStyle = `rgba(115, 218, 202, ${glow.toFixed(2)})`;
        ctx.fillRect(m.x - 2, m.y - 2, 8, 7);
        this._rect(ctx, m.x + 1, m.y + 2, 2, 3, '#ebe1d1');
        this._rect(ctx, m.x, m.y, 4, 2, '#73daca');
      }
    }

    // Lv 3: Cute wooden rope swing hanging from left tree branch
    if (lv >= 3 && this.sceneId !== 'winter') {
      const swingSway = Math.round(Math.sin(this.time * 1.5) * 1.5);
      const sx = 176;
      this._rect(ctx, sx, 178, 1, 30, '#d4c3aa');
      this._rect(ctx, sx + 10, 178, 1, 30, '#d4c3aa');
      this._outlinedRect(ctx, sx - 2 + swingSway, 207, 15, 3, '#8c5e43', out);
    }

    // Lv 4: Cozy crackling mini-campfire on the right-front sandy beach
    if (lv >= 4) {
      const fx = 448;
      const fy = 260;
      // Stone ring & logs
      this._rect(ctx, fx - 4, fy + 4, 16, 4, '#5c6170');
      this._rect(ctx, fx - 1, fy + 3, 10, 3, '#5c3a28');
      // Animated pixel flame
      const flick = Math.floor(this.time * 8) % 2;
      ctx.fillStyle = 'rgba(255, 158, 100, 0.22)';
      ctx.fillRect(fx - 10, fy - 12, 28, 24);
      this._rect(ctx, fx + 1, fy - 2 - flick, 6, 6 + flick, '#ff7b47');
      this._rect(ctx, fx + 2, fy - flick, 4, 4, '#ffd275');
      // Tiny rising spark
      const sparkY = fy - 5 - ((this.time * 14) % 14);
      this._rect(ctx, fx + 3 + (flick ? 1 : -1), Math.round(sparkY), 1, 1, '#ffe699');
    }

    // Lv 5: Cute little songbird perched on Pomodoro signpost
    if (lv >= 5) {
      const hop = Math.sin(this.time * 2.5) > 0.88 ? -2 : 0;
      const bx = 244;
      const by = 206 + hop;
      this._outlinedRect(ctx, bx, by, 7, 5, '#7aa2f7', out);
      this._rect(ctx, bx + 5, by + 1, 3, 2, '#ffe08a'); // beak
      this._rect(ctx, bx + 4, by + 1, 1, 1, '#141521'); // eye
      this._rect(ctx, bx - 2, by + 2, 2, 2, '#5a82d6'); // tail
    }

    // Lv 6: Warm string of fairy lights from tree to lantern post
    if (lv >= 6) {
      const pts = [
        { x: 244, y: 170 },
        { x: 274, y: 180 },
        { x: 304, y: 185 },
        { x: 334, y: 184 },
        { x: 364, y: 180 },
        { x: 384, y: 180 },
      ];
      ctx.fillStyle = '#24202b';
      for (let i = 0; i < pts.length - 1; i++) {
        for (let s = 0; s <= 12; s++) {
          ctx.fillRect(
            Math.round(pts[i].x + ((pts[i + 1].x - pts[i].x) * s) / 12),
            Math.round(pts[i].y + ((pts[i + 1].y - pts[i].y) * s) / 12),
            1,
            1
          );
        }
      }
      pts.forEach((p, idx) => {
        const g = 0.65 + 0.35 * Math.sin(this.time * 1.8 + idx);
        ctx.fillStyle = `rgba(255, 200, 120, ${(0.25 * g).toFixed(2)})`;
        ctx.fillRect(p.x - 2, p.y - 1, 6, 6);
        this._rect(ctx, p.x, p.y + 1, 2, 2, idx % 2 === 0 ? '#ffd285' : '#ff9e64');
      });
    }

    // Lv 7: Playful jumping pixel fish arcing out of the ocean periodically!
    if (lv >= 7) {
      const cycle = this.time % 7.5;
      if (cycle < 1.3) {
        const u = cycle / 1.3;
        const fx = Math.round(78 + u * 34);
        const fy = Math.round(274 - Math.sin(u * Math.PI) * 24);
        this._outlinedRect(ctx, fx, fy, 7, 4, '#73daca', '#162933');
        this._rect(ctx, fx - 2, fy + 1, 2, 2, '#73daca');
        if (u < 0.25 || u > 0.78) {
          this._rect(ctx, fx - 3, 274, 2, 2, '#dff2ff');
          this._rect(ctx, fx + 7, 273, 2, 2, '#dff2ff');
        }
      }
    }

    // Lv 9 (GRAND): Mini Coastal Lighthouse with sweeping golden light beam!
    if (lv >= 9) {
      const lx = 136;
      const baseY = 256;
      // Rocky base
      this._outlinedRect(ctx, lx - 6, baseY - 6, 26, 9, '#4c5468', out);
      // Striped lighthouse tower
      this._outlinedRect(ctx, lx, baseY - 56, 14, 52, '#f2ede4', out);
      this._rect(ctx, lx, baseY - 46, 14, 9, '#d95b5b');
      this._rect(ctx, lx, baseY - 28, 14, 9, '#d95b5b');
      this._rect(ctx, lx + 5, baseY - 12, 4, 8, '#3b2821'); // tiny door
      // Observation balcony & lantern room
      this._outlinedRect(ctx, lx - 3, baseY - 60, 20, 4, '#363b4d', out);
      this._outlinedRect(ctx, lx + 1, baseY - 70, 12, 10, '#ffe8a3', out);
      this._outlinedRect(ctx, lx - 1, baseY - 75, 16, 5, '#d95b5b', out);
      this._rect(ctx, lx + 6, baseY - 79, 2, 4, '#ffd275'); // spire
      // Sweeping golden lighthouse beam!
      const sweep = Math.sin(this.time * 0.75);
      const beamDir = sweep >= 0 ? 1 : -1;
      const beamLen = 50 + Math.abs(sweep) * 95;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lx + 7, baseY - 66);
      ctx.lineTo(lx + 7 + beamDir * beamLen, baseY - 82);
      ctx.lineTo(lx + 7 + beamDir * beamLen, baseY - 46);
      ctx.closePath();
      const grad = ctx.createLinearGradient(lx + 7, baseY - 66, lx + 7 + beamDir * beamLen, baseY - 66);
      grad.addColorStop(0, 'rgba(255, 232, 163, 0.34)');
      grad.addColorStop(1, 'rgba(255, 232, 163, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    // Lv 10 (GRAND): Cozy Wooden Gazebo Roof & Glowing Paper Lanterns over Study Nook!
    if (lv >= 10) {
      const gx = 258;
      const gy = 172;
      const gw = 132;
      // Supporting timber pillars
      this._outlinedRect(ctx, gx + 4, gy + 16, 5, 58, '#5e3e2d', out);
      this._outlinedRect(ctx, gx + gw - 9, gy + 16, 5, 58, '#5e3e2d', out);
      // Sloped cozy shingle roof
      this._outlinedRect(ctx, gx - 6, gy + 10, gw + 12, 7, '#6e4533', out);
      this._outlinedRect(ctx, gx + 4, gy + 4, gw - 8, 7, '#82523d', out);
      this._outlinedRect(ctx, gx + 18, gy - 1, gw - 36, 6, '#966148', out);
      // Climbing vines on left pillar
      this._rect(ctx, gx + 3, gy + 24, 3, 18, '#4a8c62');
      this._rect(ctx, gx + 6, gy + 32, 3, 12, '#6cb882');
      // Hanging warm paper lanterns under roof eaves
      const lats = [gx + 22, gx + 66, gx + 110];
      for (const lx of lats) {
        this._rect(ctx, lx, gy + 17, 1, 5, '#241c1a');
        this._outlinedRect(ctx, lx - 3, gy + 22, 7, 8, '#ffd98e', '#4f2c22');
        ctx.fillStyle = 'rgba(255, 200, 115, 0.16)';
        ctx.fillRect(lx - 9, gy + 16, 19, 19);
      }
    }

    // Lv 11 (GRAND): Glowing Paper Lantern Boats drifting across the ocean!
    if (lv >= 11) {
      const boats = [
        { offset: 0, y: 312, speed: 6 },
        { offset: 220, y: 328, speed: 4.5 },
        { offset: 440, y: 304, speed: 5.5 },
      ];
      for (const b of boats) {
        const bx = ((this.time * b.speed + b.offset) % (this.W + 40)) - 20;
        const bob = Math.sin(this.time * 2 + b.offset) * 1.2;
        const by = Math.round(b.y + bob);
        ctx.fillStyle = 'rgba(255, 206, 120, 0.22)';
        ctx.fillRect(Math.round(bx) - 5, by - 4, 20, 14);
        this._outlinedRect(ctx, bx, by + 3, 10, 3, '#f2e6d0', '#382a24');
        this._rect(ctx, bx + 2, by - 2, 6, 5, '#ffd485');
        ctx.fillStyle = 'rgba(255, 214, 138, 0.35)';
        ctx.fillRect(Math.round(bx) + 1, by + 7, 8, 2);
      }
    }
  }

  _drawSkyProgression(ctx, t) {
    // Lv 11: Periodic shimmering shooting stars streaking across the sky!
    if (this.islandLevel >= 11) {
      const cycle = this.time % 6.2;
      if (cycle < 0.75) {
        const u = cycle / 0.75;
        const sx = Math.round(520 - u * 150);
        const sy = Math.round(28 + u * 52);
        for (let k = 0; k < 14; k++) {
          const alpha = (1 - k / 14) * (1 - u * 0.6);
          ctx.fillStyle = `rgba(255, 245, 210, ${alpha.toFixed(2)})`;
          ctx.fillRect(sx + k * 2, sy - Math.floor(k * 0.7), 2, 1);
        }
      }
    }

    // Lv 12 (GRAND FINALE): Charming Pastel Hot-Air Balloon floating in the sky!
    if (this.islandLevel >= 12) {
      const bx = Math.round(108 + Math.sin(this.time * 0.35) * 12);
      const by = Math.round(78 + Math.sin(this.time * 0.9) * 4);
      const out = '#1e1a29';
      // Balloon envelope
      this._outlinedRect(ctx, bx - 10, by - 14, 20, 20, '#f7768e', out);
      this._outlinedRect(ctx, bx - 13, by - 10, 26, 12, '#f7768e', out);
      this._rect(ctx, bx - 4, by - 14, 8, 20, '#ffe08a'); // center golden stripe
      this._rect(ctx, bx - 12, by - 6, 24, 3, '#73daca'); // horizontal ribbon
      // Burner glow
      ctx.fillStyle = 'rgba(255, 185, 100, 0.45)';
      ctx.fillRect(bx - 4, by + 6, 8, 5);
      // Ropes & wicker basket
      this._rect(ctx, bx - 4, by + 6, 1, 6, '#d4c3aa');
      this._rect(ctx, bx + 3, by + 6, 1, 6, '#d4c3aa');
      this._outlinedRect(ctx, bx - 5, by + 11, 10, 6, '#8c5e43', out);
    }
  }

  _drawSkyClock(ctx, t) {
    // Large, crystal-clear pixel-art Pomodoro clock centered in the upper sky!
    const font = {
      '0': ['111', '101', '101', '101', '111'],
      '1': ['010', '110', '010', '010', '111'],
      '2': ['111', '001', '111', '100', '111'],
      '3': ['111', '001', '111', '001', '111'],
      '4': ['101', '101', '111', '001', '001'],
      '5': ['111', '100', '111', '001', '111'],
      '6': ['111', '100', '111', '101', '111'],
      '7': ['111', '001', '001', '010', '010'],
      '8': ['111', '101', '111', '101', '111'],
      '9': ['111', '101', '111', '001', '111'],
      ':': ['0', '1', '0', '1', '0'],
    };

    const scale = 4;
    const text = this.clockText || '25:00';
    // Measure total pixel width
    let totalW = 0;
    for (let i = 0; i < text.length; i++) {
      const g = font[text[i]];
      totalW += (g ? g[0].length : 2) * scale + (i < text.length - 1 ? 6 : 0);
    }

    const startX = Math.round((this.W - totalW) / 2);
    const startY = 42;

    // Soft atmospheric glow behind sky clock
    const glowGrad = ctx.createRadialGradient(320, startY + 12, 8, 320, startY + 12, 84);
    glowGrad.addColorStop(0, this.pomoRunning ? 'rgba(255, 178, 108, 0.22)' : 'rgba(235, 224, 190, 0.14)');
    glowGrad.addColorStop(1, 'rgba(255, 178, 108, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(220, startY - 22, 200, 76);

    const mainCol =
      this.artStyle === 'cyberpunk'
        ? this.pomoMode === 'break'
          ? '#39ff9c'
          : '#00f0ff'
        : this.pomoMode === 'break'
          ? '#9ce8dc'
          : this.pomoRunning
            ? '#ffd48a'
            : 'rgba(247, 242, 232, 0.92)';

    let cursorX = startX;
    for (const ch of text) {
      const glyph = font[ch];
      if (!glyph) {
        cursorX += 8;
        continue;
      }
      const skipColon = ch === ':' && this.pomoRunning && Math.floor(this.time * 2) % 2 === 1;
      if (!skipColon) {
        for (let r = 0; r < glyph.length; r++) {
          for (let c = 0; c < glyph[r].length; c++) {
            if (glyph[r][c] === '1') {
              const px = cursorX + c * scale;
              const py = startY + r * scale;
              // Crisp dark drop shadow for high contrast against any sky biome
              ctx.fillStyle = 'rgba(14, 15, 26, 0.55)';
              ctx.fillRect(px + 2, py + 2, scale, scale);
              ctx.fillStyle = mainCol;
              ctx.fillRect(px, py, scale, scale);
            }
          }
        }
      }
      cursorX += glyph[0].length * scale + 6;
    }

    // Subtle status underline bar
    ctx.fillStyle = 'rgba(255, 232, 185, 0.28)';
    ctx.fillRect(286, startY + 26, 68, 1);
  }

  _drawKawaiiHead(ctx, hx, hy, t, outfit, happyEyes) {
    const out = '#1a1824';
    const skin = '#f9d5b8';
    const skinShade = '#e3b08d';
    const hairDark = '#2d212b';
    const hairMid = '#473442';
    const hairHi = '#694e5f';

    // Cute bouncy ahoge (little hair sprout on top!)
    const ahogeSway = Math.sin(this.time * 2.5) > 0.3 ? 1 : 0;
    this._rect(ctx, hx + 8 + ahogeSway, hy - 3, 2, 3, hairMid);
    this._rect(ctx, hx + 9 + ahogeSway, hy - 4, 2, 2, hairHi);

    // Cute tiny ponytail / side fluff
    this._outlinedRect(ctx, hx - 3, hy + 5, 4, 6, hairDark, out);

    // Soft rounded chibi face (skip outer corners for rounder kawaii shape!)
    this._rect(ctx, hx + 1, hy + 1, 16, 16, out);
    this._rect(ctx, hx, hy + 2, 18, 14, out);
    this._rect(ctx, hx + 1, hy + 2, 16, 14, skin);
    this._rect(ctx, hx + 2, hy + 14, 14, 2, skinShade);

    // Hair Crown, Side & Soft Bangs
    this._rect(ctx, hx + 1, hy - 1, 16, 7, out);
    this._rect(ctx, hx, hy, 18, 6, hairMid);
    this._rect(ctx, hx + 3, hy + 1, 11, 2, hairHi);
    this._rect(ctx, hx, hy + 4, 6, 11, hairDark);
    this._rect(ctx, hx + 6, hy + 4, 12, 3, hairDark);
    this._rect(ctx, hx + 10, hy + 6, 3, 2, hairMid); // cute center bang lock

    // Cute Cat-Ear Headphones OR Winter Pom-Pom Beanie
    if (t.beanie) {
      this._outlinedRect(ctx, hx, hy - 3, 18, 6, '#c95f5f', out);
      this._rect(ctx, hx + 1, hy + 1, 16, 2, '#f2e6cf');
      this._outlinedRect(ctx, hx + 7, hy - 6, 4, 3, '#f2e6cf', out);
    } else {
      // Adorable subtle cat-ear headphones!
      this._outlinedRect(ctx, hx + 5, hy - 2, 4, 9, '#3d4563', out);
      this._rect(ctx, hx + 4, hy - 4, 2, 2, outfit.accent); // tiny cat-ear nub
      this._rect(ctx, hx + 9, hy - 4, 2, 2, outfit.accent);
      this._outlinedRect(ctx, hx + 4, hy + 6, 5, 6, '#262b3d', out);
      this._rect(ctx, hx + 5, hy + 8, 3, 2, outfit.accent);
    }

    // Extra-cute sparkling eyes & rosy cheeks
    if (happyEyes) {
      this._rect(ctx, hx + 9, hy + 9, 3, 1, '#1f1b26');
      this._rect(ctx, hx + 10, hy + 8, 1, 1, '#1f1b26');
      this._rect(ctx, hx + 14, hy + 9, 3, 1, '#1f1b26');
      this._rect(ctx, hx + 15, hy + 8, 1, 1, '#1f1b26');
      // Tiny happy smile
      this._rect(ctx, hx + 12, hy + 12, 2, 1, '#b86c63');
    } else if (this.isBlinking) {
      this._rect(ctx, hx + 10, hy + 9, 2, 1, '#1f1b26');
      this._rect(ctx, hx + 14, hy + 9, 2, 1, '#1f1b26');
    } else {
      // Big sparkling kawaii eyes
      this._rect(ctx, hx + 9, hy + 8, 3, 3, '#1f1b26');
      this._rect(ctx, hx + 9, hy + 8, 1, 1, '#ffffff');
      this._rect(ctx, hx + 11, hy + 10, 1, 1, '#7a5c8a');
      this._rect(ctx, hx + 14, hy + 8, 3, 3, '#1f1b26');
      this._rect(ctx, hx + 14, hy + 8, 1, 1, '#ffffff');
      this._rect(ctx, hx + 16, hy + 10, 1, 1, '#7a5c8a');
    }
    // Soft pastel rosy blush cheeks
    this._rect(ctx, hx + 8, hy + 11, 2, 1, 'rgba(255, 138, 155, 0.85)');
    this._rect(ctx, hx + 15, hy + 11, 2, 1, 'rgba(255, 138, 155, 0.85)');
  }

  _drawBreakCharacter(ctx, t, bob, holdingMug) {
    const out = '#1a1824';
    const skin = '#f9d5b8';
    const outfit = OUTFIT_PALETTES[this.outfitIndex] || OUTFIT_PALETTES[0];
    const headBob = Math.round(bob * 0.7);

    // Activity 0: Fishing on the pier
    if (this.breakActivity === 0) {
      const cx = 492;
      const cy = 229;
      this._outlinedRect(ctx, cx + 6, cy + 31, 6, 10, '#2b324a', out);
      this._outlinedRect(ctx, cx + 13, cy + 31, 6, 10, '#2b324a', out);
      this._rect(ctx, cx + 7, cy + 40, 5, 3, '#f0e6d8');
      this._rect(ctx, cx + 14, cy + 40, 5, 3, '#f0e6d8');

      const ty = cy + 18;
      this._outlinedRect(ctx, cx + 2, ty, 15, 14, outfit.main, out);
      this._rect(ctx, cx + 3, ty + 1, 4, 12, outfit.shade);
      if (t.scarf) this._outlinedRect(ctx, cx + 2, ty - 1, 15, 4, t.scarf, out);
      this._drawKawaiiHead(ctx, cx + 1, cy + 2 + headBob, t, outfit, true);

      if (holdingMug) {
        const sipLift = Math.round(Math.sin(this.sipProgress * Math.PI) * 2);
        this._outlinedRect(ctx, cx + 10, ty + 3 - sipLift, 8, 5, outfit.main, out);
        this._outlinedRect(ctx, cx + 16, cy + 19 - sipLift + headBob, 4, 4, skin, out);
        this._drawTinyMug(ctx, cx + 18, cy + 16 - sipLift + headBob, true);
      } else {
        this._outlinedRect(ctx, cx + 10, ty + 5, 8, 5, outfit.main, out);
        this._outlinedRect(ctx, cx + 17, ty + 6, 4, 4, skin, out);
        for (let i = 0; i < 24; i++) {
          this._rect(ctx, cx + 20 + i, ty + 7 - Math.floor(i * 0.55), 2, 1, '#8c6142');
        }
        const tipX = cx + 44;
        const tipY = ty - 6;
        const bobberY = Math.round(288 + Math.sin(this.time * 2.4) * 1.5);
        ctx.fillStyle = 'rgba(230, 240, 255, 0.65)';
        ctx.fillRect(tipX, tipY, 1, bobberY - tipY);
        this._rect(ctx, tipX - 1, bobberY - 2, 3, 2, '#f7768e');
        this._rect(ctx, tipX - 1, bobberY, 3, 2, '#ffffff');
        ctx.fillStyle = 'rgba(220, 240, 255, 0.4)';
        ctx.fillRect(tipX - 5, bobberY + 2, 11, 1);
      }
      return;
    }

    // Activity 1: Sitting under the tree trunk, swaying & humming peacefully!
    if (this.breakActivity === 1) {
      const swayX = Math.round(Math.sin(this.time * 1.8) * 1.2);
      const cx = 186;
      const cy = 207;

      // Cozy seated legs tucked on the grass under the tree
      this._outlinedRect(ctx, cx + 2, cy + 31, 16, 6, '#2b324a', out);
      this._rect(ctx, cx + 14, cy + 33, 5, 4, '#f0e6d8');

      // Gentle swaying torso leaning by the tree trunk
      const ty = cy + 18;
      this._outlinedRect(ctx, cx + 2 + swayX, ty, 15, 14, outfit.main, out);
      this._rect(ctx, cx + 3 + swayX, ty + 1, 4, 12, outfit.shade);
      if (t.scarf) {
        this._outlinedRect(ctx, cx + 2 + swayX, ty - 1, 15, 4, t.scarf, out);
      }

      // Cozy hands resting on lap
      this._outlinedRect(ctx, cx + 8 + swayX, ty + 8, 8, 4, outfit.main, out);
      this._outlinedRect(ctx, cx + 14 + swayX, ty + 9, 4, 3, skin, out);

      // Happy swaying head with closed humming eyes
      this._drawKawaiiHead(ctx, cx + 1 + swayX, cy + 2 + headBob, t, outfit, true);

      // Cute floating pixel music notes drifting up from character!
      for (let i = 0; i < 2; i++) {
        const cycle = (this.time * 0.42 + i * 0.5) % 1;
        const nx = Math.round(cx + 20 + Math.sin(cycle * Math.PI * 2 + i) * 4);
        const ny = Math.round(cy + 8 - cycle * 22);
        const alpha = Math.sin(cycle * Math.PI) * 0.92;
        ctx.fillStyle = i === 0
          ? `rgba(255, 224, 138, ${alpha.toFixed(2)})`
          : `rgba(115, 218, 202, ${alpha.toFixed(2)})`;
        // Tiny pixel musical note ♪
        ctx.fillRect(nx, ny + 3, 2, 2);
        ctx.fillRect(nx + 1, ny, 1, 4);
        ctx.fillRect(nx + 2, ny, 2, 1);
      }
      return;
    }

    // Activity 2: Standing peacefully on the left sandy beach gazing up at the sky!
    const cx = 166;
    const cy = 228;
    const breezeBob = Math.round(Math.sin(this.time * 1.4) * 0.6);

    // Soft shadow on the sand
    this._rect(ctx, cx + 2, cy + 39, 16, 3, 'rgba(18, 16, 26, 0.25)');

    // Standing legs on the sandy beach
    this._outlinedRect(ctx, cx + 4, cy + 30, 5, 9, '#2b324a', out);
    this._outlinedRect(ctx, cx + 11, cy + 30, 5, 9, '#2b324a', out);
    this._rect(ctx, cx + 4, cy + 38, 5, 2, '#f0e6d8');
    this._rect(ctx, cx + 11, cy + 38, 5, 2, '#f0e6d8');

    // Torso
    const ty = cy + 17;
    this._outlinedRect(ctx, cx + 2, ty, 15, 14, outfit.main, out);
    this._rect(ctx, cx + 3, ty + 1, 4, 12, outfit.shade);
    if (t.scarf) {
      this._outlinedRect(ctx, cx + 2, ty - 1, 15, 4, t.scarf, out);
      this._rect(ctx, cx + 12, ty + 2, 4, 6, t.scarf);
    }

    // Relaxed arms resting gently at sides
    this._outlinedRect(ctx, cx + 6, ty + 5, 5, 7, outfit.main, out);
    this._outlinedRect(ctx, cx + 7, ty + 11, 3, 3, skin, out);

    // Head tilted slightly up gazing peacefully at the sky
    this._drawKawaiiHead(ctx, cx + 1, cy + 1 + breezeBob, t, outfit, false);

    // Gentle sky-gazing sparkle above character
    if (Math.sin(this.time * 2.4) > 0.25) {
      const sx = cx + 20;
      const sy = cy - 4 + breezeBob;
      this._rect(ctx, sx, sy, 1, 3, '#ffe89e');
      this._rect(ctx, sx - 1, sy + 1, 3, 1, '#ffe89e');
    }
  }

  _drawChibiCharacter(ctx, t, breath, bob, holdingMug) {
    const out = '#1a1824';
    const skin = '#f9d5b8';
    const headBob = Math.round(bob * 0.7);
    const cx = 282;
    const cy = 208;

    // 1. Cozy Floor Cushion under character
    this._outlinedRect(ctx, cx - 3, cy + 34, 24, 7, t.cushion, out);
    this._rect(ctx, cx - 1, cy + 35, 20, 3, t.cushionLight);

    // 2. Seated Legs (tucked neatly on cushion)
    this._outlinedRect(ctx, cx + 2, cy + 31, 16, 6, '#2b324a', out);
    this._rect(ctx, cx + 14, cy + 33, 5, 4, '#f0e6d8');

    // 3. Cute Chibi Torso / Sweater
    const outfit = OUTFIT_PALETTES[this.outfitIndex] || OUTFIT_PALETTES[0];
    const ty = cy + 18;
    this._outlinedRect(ctx, cx + 2, ty, 15, 14, outfit.main, out);
    this._rect(ctx, cx + 3, ty + 1, 4, 12, outfit.shade);
    if (t.scarf) {
      this._outlinedRect(ctx, cx + 2, ty - 1, 15, 4, t.scarf, out);
      this._rect(ctx, cx + 12, ty + 2, 4, 6, t.scarf);
    }

    // 4. Extra-Cute Rounded Kawaii Head
    this._drawKawaiiHead(ctx, cx + 1, cy + 2 + headBob, t, outfit, holdingMug);

    // 5. Cute Short Arms & Hands (Typing vs Natural Cozy Sip!)
    if (holdingMug) {
      const sipLift = Math.round(Math.sin(this.sipProgress * Math.PI) * 2);
      const mugX = cx + 17;
      const mugY = cy + 16 - sipLift + headBob;
      this._outlinedRect(ctx, cx + 10, ty + 3 - sipLift, 8, 5, outfit.main, out);
      this._outlinedRect(ctx, mugX - 1, mugY + 3, 4, 4, skin, out);
      this._drawTinyMug(ctx, mugX + 1, mugY, true);
    } else {
      const lhY = this.leftHandDown ? 1 : 0;
      const rhY = this.rightHandDown ? 1 : 0;
      this._outlinedRect(ctx, cx + 17, ty + 7 + lhY, 4, 3, skin, out);
      this._outlinedRect(ctx, cx + 9, ty + 5, 9, 5, outfit.main, out);
      this._outlinedRect(ctx, cx + 16, ty + 9 + rhY, 4, 3, skin, out);
    }
  }

  _drawTinyMug(ctx, x, y, showSteam) {
    this._outlinedRect(ctx, x, y, 7, 7, '#f2e8dc', '#1a1824');
    this._rect(ctx, x + 1, y + 1, 5, 2, '#8a5233'); // warm coffee/tea
    this._rect(ctx, x + 7, y + 2, 2, 3, '#f2e8dc'); // tiny handle

    if (showSteam) {
      for (const s of this.steamParticles) {
        const cycle = (this.time * 0.34 + s.offset) % 1;
        const sy = y - 2 - cycle * 12;
        const sx = x + 3 + Math.sin(cycle * Math.PI * 2 + s.drift) * 1.8;
        const alpha = Math.sin(cycle * Math.PI) * 0.5;
        ctx.fillStyle = `rgba(245, 248, 255, ${alpha.toFixed(2)})`;
        ctx.fillRect(Math.round(sx), Math.round(sy), 1, 2);
      }
    }
  }

  /* ------------------------------------------------------------------------
     8. Companion Pet on Cozy Blanket (Cat / Corgi / Fox / Duck + Lv.8 Baby!)
     ------------------------------------------------------------------------ */
  _drawSleepingCat(ctx, t, breath) {
    const cx = 408;
    const cy = 236;
    const breathePx = breath > 0.25 ? -1 : 0;
    const tailWag =
      this.catHappyTimer > 0 && Math.floor(this.time * 4) % 2 === 0 ? -1 : 0;

    // Cozy blanket
    this._outlinedRect(ctx, cx - 2, cy + 7, 40, 7, t.catBlanket, '#1a1824');

    if (this.petType === 'corgi') {
      // Adorable loafing Corgi
      this._outlinedRect(ctx, cx + 7, cy + 1 + breathePx, 24, 9 - breathePx, '#e89d54', '#1e1614');
      this._rect(ctx, cx + 8, cy + 6, 22, 4, '#fff7eb'); // fluffy white belly
      this._rect(ctx, cx + 30, cy + 4 + tailWag, 4, 3, '#fff7eb'); // tiny fluffy nub tail
      const hx = cx + 1;
      const hy = cy - 1;
      this._outlinedRect(ctx, hx, hy, 12, 10, '#e89d54', '#1e1614');
      this._rect(ctx, hx + 2, hy + 5, 8, 5, '#fff7eb'); // white muzzle
      // Big perked corgi ears
      this._outlinedRect(ctx, hx, hy - 4, 4, 5, '#e89d54', '#1e1614');
      this._rect(ctx, hx + 1, hy - 3, 2, 3, '#f5a6a6');
      this._outlinedRect(ctx, hx + 8, hy - 4, 4, 5, '#e89d54', '#1e1614');
      this._rect(ctx, hx + 9, hy - 3, 2, 3, '#f5a6a6');
      this._drawPetFace(ctx, hx, hy, '#1e1614');
    } else if (this.petType === 'fox') {
      // Curled orange Woodland Fox with big white-tipped tail
      this._outlinedRect(ctx, cx + 7, cy + 1 + breathePx, 23, 8 - breathePx, '#d96b38', '#1e1614');
      // Big fluffy tail wrapping around
      this._outlinedRect(ctx, cx + 22, cy + 4 + tailWag, 14, 5, '#d96b38', '#1e1614');
      this._rect(ctx, cx + 30, cy + 4 + tailWag, 6, 5, '#fff5e6');
      const hx = cx + 1;
      const hy = cy;
      this._outlinedRect(ctx, hx, hy, 11, 9, '#d96b38', '#1e1614');
      this._rect(ctx, hx + 1, hy + 5, 9, 4, '#fff5e6'); // white cheeks
      // Dark-tipped fox ears
      this._outlinedRect(ctx, hx + 1, hy - 3, 3, 4, '#241a18', '#1e1614');
      this._outlinedRect(ctx, hx + 7, hy - 3, 3, 4, '#241a18', '#1e1614');
      this._drawPetFace(ctx, hx, hy, '#1e1614');
    } else if (this.petType === 'duck') {
      // Plump Cozy Duck resting on blanket
      this._outlinedRect(ctx, cx + 8, cy + 2 + breathePx, 22, 8 - breathePx, '#faf6eb', '#1e1614');
      this._rect(ctx, cx + 13, cy + 4 + breathePx, 11, 4, '#e6dec8'); // folded wing
      this._rect(ctx, cx + 29, cy + 2 + tailWag, 4, 3, '#faf6eb'); // tail feather
      const hx = cx + 4;
      const hy = cy - 4;
      this._outlinedRect(ctx, hx, hy, 10, 9, '#faf6eb', '#1e1614');
      // Cute orange duck bill
      this._outlinedRect(ctx, hx - 4, hy + 4, 5, 3, '#ff9e4a', '#1e1614');
      if (this.catHappyTimer > 0) {
        this._rect(ctx, hx + 3, hy + 3, 2, 1, '#1e1614');
        this._rect(ctx, hx + 5, hy + 5, 2, 1, '#f7768e');
      } else {
        this._rect(ctx, hx + 3, hy + 3, 2, 2, '#1e1614');
      }
    } else {
      // Classic Sleeping Cat
      this._outlinedRect(
        ctx,
        cx + 6,
        cy + 1 + breathePx,
        25,
        8 - breathePx,
        t.catFur,
        '#1e1614'
      );
      this._rect(ctx, cx + 10, cy + breathePx, 17, 3, t.catLight);
      this._rect(ctx, cx + 14, cy + 1 + breathePx, 2, 4, t.catStripe);
      this._rect(ctx, cx + 20, cy + 1 + breathePx, 2, 4, t.catStripe);
      this._outlinedRect(ctx, cx + 29, cy + 5 + tailWag, 7, 3, t.catFur, '#1e1614');
      this._rect(ctx, cx + 33, cy + 4 + tailWag, 3, 3, t.catCream);

      const hx = cx + 1;
      const hy = cy;
      this._outlinedRect(ctx, hx, hy, 11, 9, t.catLight, '#1e1614');
      this._rect(ctx, hx + 2, hy + 5, 7, 4, t.catCream);
      const earTwitch = Math.sin(this.time * 0.7) > 0.96 ? 1 : 0;
      this._outlinedRect(ctx, hx + 1, hy - 2 + earTwitch, 3, 3, t.catFur, '#1e1614');
      this._outlinedRect(ctx, hx + 7, hy - 2, 3, 3, t.catFur, '#1e1614');
      this._drawPetFace(ctx, hx, hy, '#f5a6a6');
    }

    // Lv.8 Island Unlock: Adorable tiny baby companion curled up beside the main pet!
    if (this.islandLevel >= 8) {
      const bx = cx + 38;
      const by = cy + 6;
      this._outlinedRect(ctx, bx, by, 10, 6, '#fff5e6', '#1e1614');
      this._rect(ctx, bx + 1, by - 2, 2, 2, '#f7ba82');
      this._rect(ctx, bx + 6, by - 2, 2, 2, '#f7ba82');
      this._rect(ctx, bx + 2, by + 2, 1, 1, '#1e1614');
      this._rect(ctx, bx + 6, by + 2, 1, 1, '#1e1614');
    }
  }

  _drawPetFace(ctx, hx, hy, noseCol) {
    if (this.catHappyTimer > 0) {
      this._rect(ctx, hx + 2, hy + 3, 2, 1, '#2a1e1d');
      this._rect(ctx, hx + 7, hy + 3, 2, 1, '#2a1e1d');
      this._rect(ctx, hx + 1, hy + 5, 2, 1, '#f7768e');
      this._rect(ctx, hx + 8, hy + 5, 2, 1, '#f7768e');
    } else {
      this._rect(ctx, hx + 2, hy + 4, 2, 1, '#2a1e1d');
      this._rect(ctx, hx + 7, hy + 4, 2, 1, '#2a1e1d');
    }
    this._rect(ctx, hx + 5, hy + 5, 1, 1, noseCol);
  }

  /* ------------------------------------------------------------------------
     9. Biome Ambient Particles (Fireflies / Sakura Petals / Snow / Sparkles)
     ------------------------------------------------------------------------ */
  _drawAmbientParticles(ctx, t) {
    const type = t.particleType;
    for (const p of this.ambientParticles) {
      if (type === 'firefly') {
        const fx = 155 + ((p.x * 0.55) % 330) + Math.sin(this.time * p.drift + p.phase) * 10;
        const fy = 140 + ((p.y * 0.55) % 115) + Math.cos(this.time * p.drift * 0.8 + p.phase) * 6;
        const glow = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(this.time * 2.1 + p.phase));
        ctx.fillStyle = `rgba(245, 232, 130, ${(glow * 0.85).toFixed(2)})`;
        ctx.fillRect(Math.round(fx), Math.round(fy), 2, 2);
      } else if (type === 'petal') {
        ctx.fillStyle = 'rgba(255, 198, 220, 0.85)';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 2);
      } else if (type === 'snow') {
        ctx.fillStyle = 'rgba(240, 248, 255, 0.8)';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      } else {
        // Warm golden sunset dust sparkles
        const fx = 160 + ((p.x * 0.55) % 320) + Math.sin(this.time * p.drift + p.phase) * 8;
        const fy = 150 + ((p.y * 0.5) % 100) + Math.cos(this.time * p.drift + p.phase) * 5;
        const alpha = 0.18 + 0.35 * (0.5 + 0.5 * Math.sin(this.time * 1.6 + p.phase));
        ctx.fillStyle = `rgba(255, 224, 165, ${alpha.toFixed(2)})`;
        ctx.fillRect(Math.round(fx), Math.round(fy), 2, 2);
      }
    }
  }

  /* ------------------------------------------------------------------------
     10. Warm Lantern & Laptop Lighting Overlay
     ------------------------------------------------------------------------ */
  _drawLighting(ctx, t) {
    // 1. Soft Laptop Screen Glow onto Chibi Character (only when working at laptop)
    if (this.pomoMode !== 'break') {
      const lapGrad = ctx.createRadialGradient(316, 226, 3, 308, 228, 42);
      lapGrad.addColorStop(0, 'rgba(135, 185, 255, 0.22)');
      lapGrad.addColorStop(1, 'rgba(135, 185, 255, 0)');
      ctx.fillStyle = lapGrad;
      ctx.fillRect(268, 184, 96, 86);
    }

    // 2. Hanging Lantern Warm Pool across Study Table & Cat
    if (this.lampMode !== 2) {
      const intensity = this.lampMode === 0 ? 0.34 : 0.16;
      const rgb = t.lampGlowRGB;
      const lx = 375;
      const ly = 198;
      const g = ctx.createRadialGradient(lx, ly, 4, lx, ly + 22, 108);
      g.addColorStop(0, `rgba(${rgb}, ${intensity})`);
      g.addColorStop(0.55, `rgba(${rgb}, ${(intensity * 0.38).toFixed(2)})`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(lx - 110, ly - 80, 220, 200);
    } else {
      ctx.fillStyle = 'rgba(10, 14, 26, 0.16)';
      ctx.fillRect(0, 0, this.W, this.H);
    }
  }

  /* ------------------------------------------------------------------------
     11. Rain Overlay
     ------------------------------------------------------------------------ */
  _drawRain(ctx) {
    const activeCount = this.weatherMode === 2 ? this.raindrops.length : 72;
    ctx.fillStyle =
      this.artStyle === 'cyberpunk'
        ? 'rgba(0, 240, 255, 0.45)'
        : this.weatherMode === 2
          ? 'rgba(190, 218, 255, 0.48)'
          : 'rgba(190, 218, 255, 0.30)';
    for (let i = 0; i < activeCount; i++) {
      const r = this.raindrops[i];
      const rx = Math.round(r.x);
      const ry = Math.round(r.y);
      for (let k = 0; k < r.len; k++) {
        ctx.fillRect(rx - Math.floor(k * 0.28), ry + k, 1, 1);
      }
    }
  }

  /* ------------------------------------------------------------------------
     11.5 Art Style Atmospheric Post-Processing
     ------------------------------------------------------------------------ */
  _drawArtStyleOverlay(ctx, t) {
    if (this.artStyle === 'pixel') return;

    if (this.artStyle === 'anime') {
      // Makoto Shinkai / Ghibli warm sunlit bloom + dreamy floating bokeh orbs!
      const sunBloom = ctx.createRadialGradient(470, 88, 12, 470, 88, 250);
      sunBloom.addColorStop(0, 'rgba(255, 224, 238, 0.16)');
      sunBloom.addColorStop(0.5, 'rgba(255, 198, 165, 0.07)');
      sunBloom.addColorStop(1, 'rgba(255, 198, 165, 0)');
      ctx.fillStyle = sunBloom;
      ctx.fillRect(0, 0, this.W, this.H);

      // Soft translucent anime bokeh circles
      for (let i = 0; i < 8; i++) {
        const bx = ((i * 89 + this.time * (4 + i * 0.6)) % (this.W + 40)) - 20;
        const by = 70 + ((i * 47) % 180) + Math.sin(this.time * 0.8 + i) * 10;
        const r = 4 + (i % 3) * 3;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 232, 245, 0.12)' : 'rgba(255, 235, 185, 0.11)';
        ctx.fill();
      }
      return;
    }

    if (this.artStyle === 'cyberpunk') {
      // Neon magenta-cyan edge glow + subtle CRT scanlines!
      const neonHorizon = ctx.createLinearGradient(0, 175, 0, 235);
      neonHorizon.addColorStop(0, 'rgba(255, 42, 133, 0)');
      neonHorizon.addColorStop(0.5, 'rgba(255, 42, 133, 0.18)');
      neonHorizon.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = neonHorizon;
      ctx.fillRect(0, 175, this.W, 60);

      // Subtle CRT scanlines
      ctx.fillStyle = 'rgba(6, 4, 16, 0.14)';
      for (let y = 0; y < this.H; y += 3) {
        ctx.fillRect(0, y, this.W, 1);
      }

      // Holographic cyber accent bracket around the sky clock
      ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.fillRect(246, 36, 12, 1);
      ctx.fillRect(246, 36, 1, 10);
      ctx.fillRect(382, 36, 12, 1);
      ctx.fillRect(393, 36, 1, 10);
      ctx.fillStyle = 'rgba(255, 42, 133, 0.45)';
      ctx.fillRect(246, 72, 12, 1);
      ctx.fillRect(246, 63, 1, 10);
      ctx.fillRect(382, 72, 12, 1);
      ctx.fillRect(393, 63, 1, 10);
      return;
    }

    if (this.artStyle === 'watercolor') {
      // Soft warm cream paper wash + gentle vignette
      const wash = ctx.createRadialGradient(320, 180, 90, 320, 180, 380);
      wash.addColorStop(0, 'rgba(255, 246, 228, 0.06)');
      wash.addColorStop(0.75, 'rgba(235, 214, 188, 0.08)');
      wash.addColorStop(1, 'rgba(42, 32, 26, 0.32)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, this.W, this.H);
    }
  }

  /* ------------------------------------------------------------------------
     12. Floating Pixel Hearts
     ------------------------------------------------------------------------ */
  _drawHearts(ctx) {
    for (const h of this.hearts) {
      const alpha = Math.max(0, 1 - h.life / h.maxLife);
      const x = Math.round(h.x);
      const y = Math.round(h.y);
      ctx.fillStyle = `rgba(247, 118, 142, ${alpha.toFixed(2)})`;
      ctx.fillRect(x + 1, y, 1, 1);
      ctx.fillRect(x + 3, y, 1, 1);
      ctx.fillRect(x, y + 1, 5, 1);
      ctx.fillRect(x + 1, y + 2, 3, 1);
      ctx.fillRect(x + 2, y + 3, 1, 1);
    }
  }

  /* ------------------------------------------------------------------------
     13. Pixel Hover Outline
     ------------------------------------------------------------------------ */
  _drawHoverOutline(ctx, id) {
    const h = this.hotspots.find((item) => item.id === id);
    if (!h) return;

    const pulse = 0.55 + 0.35 * Math.sin(this.time * 4.5);
    const col = `rgba(255, 206, 128, ${pulse.toFixed(2)})`;

    const x = h.x - 1;
    const y = h.y - 1;
    const w = h.w + 2;
    const hgt = h.h + 2;

    ctx.fillStyle = col;
    for (let px = x; px < x + w; px += 4) {
      ctx.fillRect(px, y, 2, 1);
      ctx.fillRect(px, y + hgt - 1, 2, 1);
    }
    for (let py = y; py < y + hgt; py += 4) {
      ctx.fillRect(x, py, 1, 2);
      ctx.fillRect(x + w - 1, py, 1, 2);
    }

    ctx.fillStyle = '#ff9e64';
    const c = 5;
    ctx.fillRect(x, y, c, 1);
    ctx.fillRect(x, y, 1, c);
    ctx.fillRect(x + w - c, y, c, 1);
    ctx.fillRect(x + w - 1, y, 1, c);
    ctx.fillRect(x, y + hgt - 1, c, 1);
    ctx.fillRect(x, y + hgt - c, 1, c);
    ctx.fillRect(x + w - c, y + hgt - 1, c, 1);
    ctx.fillRect(x + w - 1, y + hgt - c, 1, c);
  }
}

window.PixelRoomScene = PixelRoomScene;
