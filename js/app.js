/* ==========================================================================
   Cozy Garden — Application Controller (js/app.js)
   Anime-only theme, 3 Full 3D Dioramas (Sakura, Room, Cafe) with per-scene
   12-level unlock lists, Pomodoro, Top Clock Pill, Top 3 Tasks & Brain Dump.
   ========================================================================== */

(() => {
  const C = window.CozyGarden;
  const {
    STORAGE_KEYS,
    SCENE_ORDER,
    SCENE_CLEAR_LABELS,
    WEATHER_LABELS,
    SCENE_UNLOCK_NAMES,
    BOTTLE_MESSAGES,
  } = C;

  const MAX_ISLAND_LEVEL = 12;

  // DOM References
  const canvas = document.getElementById('roomCanvas');
  const tooltip = document.getElementById('hoverTooltip');
  const audioBanner = document.getElementById('audioBanner');

  const skyClockPill = document.getElementById('skyClockPill');
  const skyClockMode = document.getElementById('skyClockMode');
  const skyClockTime = document.getElementById('skyClockTime');

  const btnWeatherToggle = document.getElementById('btnWeatherToggle');
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherBtnLabel = document.getElementById('weatherBtnLabel');
  const btnAudioToggle = document.getElementById('btnAudioToggle');
  const audioIcon = document.getElementById('audioIcon');
  const audioLabel = document.getElementById('audioLabel');
  const btnZenMode = document.getElementById('btnZenMode');
  const zenLabel = document.getElementById('zenLabel');
  const sceneButtons = Array.from(document.querySelectorAll('.scene-btn'));

  const btnIslandPanel = document.getElementById('btnIslandPanel');
  const islandLevelLabel = document.getElementById('islandLevelLabel');
  const islandPanel = document.getElementById('islandPanel');
  const btnCloseIslandPanel = document.getElementById('btnCloseIslandPanel');
  const petButtons = Array.from(document.querySelectorAll('#petOptions .chip'));
  const btnOpenCharCreator = document.getElementById('btnOpenCharCreator');
  const charCreatorModal = document.getElementById('charCreatorModal');
  const creatorPreviewCanvas = document.getElementById('creatorPreviewCanvas');
  const btnCloseCreator = document.getElementById('btnCloseCreator');
  const btnSaveCreator = document.getElementById('btnSaveCreator');
  const creatorGroups = {
    gender: Array.from(document.querySelectorAll('#creatorGender .chip')),
    shirt: Array.from(document.querySelectorAll('#creatorShirt .chip')),
    pants: Array.from(document.querySelectorAll('#creatorPants .chip')),
    hair: Array.from(document.querySelectorAll('#creatorHair .chip')),
    hat: Array.from(document.querySelectorAll('#creatorHat .chip')),
  };
  const islandProgressCount = document.getElementById('islandProgressCount');
  const islandUnlocksList = document.getElementById('islandUnlocksList');
  const btnResetIsland = document.getElementById('btnResetIsland');

  const bottleModal = document.getElementById('bottleModal');
  const bottleHeaderTitle = document.querySelector('#bottleModal .bottle-header span');
  const bottleMessage = document.getElementById('bottleMessage');
  const btnCloseBottle = document.getElementById('btnCloseBottle');
  const btnBottleOk = document.getElementById('btnBottleOk');

  const pomodoroCard = document.getElementById('pomodoroCard');
  const pomoTimeEl = document.getElementById('pomoTime');
  const pomoProgressEl = document.getElementById('pomoProgress');
  const btnPomoStart = document.getElementById('btnPomoStart');
  const btnPomoReset = document.getElementById('btnPomoReset');
  const btnModeMicro = document.getElementById('btnModeMicro');
  const btnModeFocus = document.getElementById('btnModeFocus');
  const btnModeBreak = document.getElementById('btnModeBreak');
  const microPrompt = document.getElementById('microPrompt');
  const btnMicroContinue = document.getElementById('btnMicroContinue');
  const btnMicroBreak = document.getElementById('btnMicroBreak');

  const weatherBadge = document.getElementById('weatherBadge');
  const volRain = document.getElementById('volRain');
  const valRain = document.getElementById('valRain');
  const volKeys = document.getElementById('volKeys');
  const valKeys = document.getElementById('valKeys');
  const volCozy = document.getElementById('volCozy');
  const valCozy = document.getElementById('valCozy');
  const volLofi = document.getElementById('volLofi');
  const valLofi = document.getElementById('valLofi');

  const taskCounter = document.getElementById('taskCounter');
  const taskList = document.getElementById('taskList');
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskLimitNote = document.getElementById('taskLimitNote');
  const brainDump = document.getElementById('brainDump');
  const dumpStatus = document.getElementById('dumpStatus');
  const btnClearDump = document.getElementById('btnClearDump');

  // Break Action Bar
  const breakActionBar = document.getElementById('breakActionBar');
  const emoteButtons = Array.from(document.querySelectorAll('#breakActionBar [data-emote]'));

  // Audio
  const audio = new window.LofiAudioEngine();
  let audioStarted = false;

  function ensureAudioStarted() {
    if (!audioStarted) {
      audio.init();
      audioStarted = true;
      audioBanner.classList.add('hidden');
      updateAudioButtonUI();
    } else if (audio.ctx && audio.ctx.state === 'suspended') {
      audio.ctx.resume();
    }
  }

  function updateAudioButtonUI() {
    if (!audioStarted || audio.isMuted) {
      audioIcon.textContent = '🔇';
      audioLabel.textContent = audioStarted ? 'Đang tắt tiếng' : 'Bật âm thanh';
    } else {
      audioIcon.textContent = '🔊';
      audioLabel.textContent = 'Âm thanh: Bật';
    }
  }

  btnAudioToggle.addEventListener('click', () => {
    if (!audioStarted) { ensureAudioStarted(); return; }
    audio.setMuted(!audio.isMuted);
    updateAudioButtonUI();
  });
  audioBanner.addEventListener('click', ensureAudioStarted);
  audioBanner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ensureAudioStarted(); }
  });
  window.addEventListener('pointerdown', () => { if (!audioStarted) ensureAudioStarted(); }, { once: true });

  /* ------------------------------------------------------------------------
     Zen Mode & 3-Diorama Scene Switcher (Sakura / Room / Cafe)
     ------------------------------------------------------------------------ */
  let isZenMode = false;
  let isEcoMode = false;
  let currentSceneId = 'sakura';
  const ECO_STORAGE_KEY = 'cozy_garden_eco_mode_v1';
  const btnEcoMode = document.getElementById('btnEcoMode');
  const ecoLabel = document.getElementById('ecoLabel');

  function setEcoMode(enabled, save = true) {
    isEcoMode = Boolean(enabled);
    document.body.classList.toggle('eco-mode', isEcoMode);
    if (btnEcoMode) btnEcoMode.classList.toggle('active', isEcoMode);
    if (ecoLabel) ecoLabel.textContent = isEcoMode ? 'Nhẹ máy: Bật' : 'Nhẹ máy';
    if (scene && scene.setEcoMode) scene.setEcoMode(isEcoMode);
    if (save) {
      try { localStorage.setItem(ECO_STORAGE_KEY, isEcoMode ? '1' : '0'); } catch (_) {}
    }
  }
  if (btnEcoMode) {
    btnEcoMode.addEventListener('click', () => setEcoMode(!isEcoMode, true));
  }

  function setZenMode(enabled) {
    isZenMode = enabled;
    document.body.classList.toggle('zen-mode', isZenMode);
    zenLabel.textContent = isZenMode ? 'Hiện công cụ' : 'Zen Mode';
  }
  btnZenMode.addEventListener('click', () => setZenMode(!isZenMode));

  // User Guide Modal (Solo + Co-Working + Shortcuts)
  const btnGuide = document.getElementById('btnGuide');
  const guideModal = document.getElementById('guideModal');
  const btnCloseGuide = document.getElementById('btnCloseGuide');
  const btnGuideGotIt = document.getElementById('btnGuideGotIt');
  const guideTabBtns = Array.from(document.querySelectorAll('[data-guide-tab]'));
  const guidePanels = Array.from(document.querySelectorAll('[data-guide-panel]'));

  function setGuideTab(tabId) {
    guideTabBtns.forEach((b) => b.classList.toggle('active', b.dataset.guideTab === tabId));
    guidePanels.forEach((p) => p.classList.toggle('hidden', p.dataset.guidePanel !== tabId));
  }
  function openGuideModal() {
    if (!guideModal) return;
    guideModal.classList.remove('hidden');
  }
  function closeGuideModal() {
    if (!guideModal) return;
    guideModal.classList.add('hidden');
  }
  if (btnGuide) btnGuide.addEventListener('click', openGuideModal);
  if (btnCloseGuide) btnCloseGuide.addEventListener('click', closeGuideModal);
  if (btnGuideGotIt) btnGuideGotIt.addEventListener('click', closeGuideModal);
  if (guideModal) {
    guideModal.addEventListener('click', (e) => {
      if (e.target === guideModal) closeGuideModal();
    });
  }
  guideTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => setGuideTab(btn.dataset.guideTab));
  });

  function updateWeatherBadge(mode) {
    const label =
      mode === 0 ? SCENE_CLEAR_LABELS[currentSceneId] || WEATHER_LABELS[0] : WEATHER_LABELS[mode];
    const icons = ['🌤️', '🌦️', '🌧️'];
    weatherBadge.textContent = label;
    if (weatherIcon) weatherIcon.textContent = icons[mode] || '🌤️';
    if (weatherBtnLabel) weatherBtnLabel.textContent = label;
  }

  if (btnWeatherToggle) {
    btnWeatherToggle.addEventListener('click', () => {
      ensureAudioStarted();
      if (scene && scene.cycleWeather) {
        scene.cycleWeather();
      } else if (scene) {
        scene.weatherMode = (scene.weatherMode + 1) % 3;
        updateWeatherBadge(scene.weatherMode);
        audio.setWeatherMode(scene.weatherMode);
      }
    });
  }

  function setScene(sceneId, playSound = true) {
    if (!SCENE_ORDER.includes(sceneId)) return;
    currentSceneId = sceneId;
    sceneButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.scene === sceneId));
    if (scene) {
      scene.setScene(sceneId);
      updateWeatherBadge(scene.weatherMode);
    }
    renderIslandUnlocksList();
    try { localStorage.setItem(STORAGE_KEYS.SCENE, sceneId); } catch (_) {}
    if (playSound) {
      ensureAudioStarted();
      audio.playSceneSwitch();
    }
  }
  sceneButtons.forEach((btn) => btn.addEventListener('click', () => setScene(btn.dataset.scene, true)));

  /* ------------------------------------------------------------------------
     Island Meta (Level, Pet, Outfit) & Per-Scene Unlock List
     ------------------------------------------------------------------------ */
  const AVATAR_CREATED_KEY = 'cozy_garden_avatar_created_v1';
  let lastBottleIdx = -1;
  let islandMeta = {
    level: 0,
    pet: 'cat',
    outfit: 0,
    avatar: Object.assign({}, C.DEFAULT_AVATAR),
  };

  function loadIslandMeta() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.ISLAND) || '{}');
      if (typeof saved.level === 'number') islandMeta.level = Math.max(0, Math.min(MAX_ISLAND_LEVEL, saved.level));
      if (typeof saved.pet === 'string') islandMeta.pet = saved.pet;
      if (typeof saved.outfit === 'number') islandMeta.outfit = saved.outfit;
      if (saved.avatar && typeof saved.avatar === 'object') {
        islandMeta.avatar = Object.assign({}, C.DEFAULT_AVATAR, saved.avatar);
      }
    } catch (_) {}
    applyIslandMetaToUIAndScene();
  }

  function saveIslandMeta() {
    try { localStorage.setItem(STORAGE_KEYS.ISLAND, JSON.stringify(islandMeta)); } catch (_) {}
  }

  function renderIslandUnlocksList() {
    const names = SCENE_UNLOCK_NAMES[currentSceneId] || SCENE_UNLOCK_NAMES.sakura;
    islandUnlocksList.innerHTML = '';
    names.forEach((name, idx) => {
      const li = document.createElement('li');
      const unlocked = idx < islandMeta.level;
      li.className = `unlock-item${unlocked ? ' unlocked' : ''}`;
      li.textContent = unlocked ? `✓ ${name}` : `🔒 Lv.${idx + 1}`;
      islandUnlocksList.appendChild(li);
    });
  }

  function syncCreatorChips() {
    const av = islandMeta.avatar;
    Object.entries(creatorGroups).forEach(([key, buttons]) => {
      buttons.forEach((b) => b.classList.toggle('active', String(av[key]) === String(b.dataset.val)));
    });
  }

  function applyIslandMetaToUIAndScene() {
    islandLevelLabel.textContent = `Lv.${islandMeta.level}`;
    islandProgressCount.textContent = `${islandMeta.level} / ${MAX_ISLAND_LEVEL}`;
    petButtons.forEach((b) => b.classList.toggle('active', b.dataset.pet === islandMeta.pet));
    syncCreatorChips();
    renderIslandUnlocksList();

    if (scene) {
      scene.setIslandLevel(islandMeta.level);
      scene.setPetType(islandMeta.pet);
      if (scene.setAvatar) scene.setAvatar(islandMeta.avatar);
    }
  }

  function growIsland() {
    if (islandMeta.level < MAX_ISLAND_LEVEL) {
      islandMeta.level += 1;
      saveIslandMeta();
      applyIslandMetaToUIAndScene();
    }
  }

  let avatarPreview = null;

  function openCharCreator() {
    islandPanel.classList.add('hidden');
    syncCreatorChips();
    charCreatorModal.classList.remove('hidden');
    if (!avatarPreview && creatorPreviewCanvas && window.CozyGarden.AvatarPreview3D) {
      avatarPreview = new window.CozyGarden.AvatarPreview3D(creatorPreviewCanvas);
    }
    if (avatarPreview) {
      avatarPreview.setAvatar(islandMeta.avatar);
      avatarPreview.start();
    }
  }

  function closeCharCreator() {
    charCreatorModal.classList.add('hidden');
    if (avatarPreview) avatarPreview.stop();
    try { localStorage.setItem(AVATAR_CREATED_KEY, '1'); } catch (_) {}
  }

  if (btnOpenCharCreator) btnOpenCharCreator.addEventListener('click', openCharCreator);
  if (btnCloseCreator) btnCloseCreator.addEventListener('click', closeCharCreator);
  if (btnSaveCreator) btnSaveCreator.addEventListener('click', () => {
    ensureAudioStarted();
    audio.playTaskDone();
    closeCharCreator();
  });

  Object.entries(creatorGroups).forEach(([key, buttons]) => {
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        ensureAudioStarted();
        const val = key === 'gender' ? btn.dataset.val : Number(btn.dataset.val);
        islandMeta.avatar[key] = val;
        // Smart gender default: switching to Male swaps pleated skirt (2) to Slacks (0); Female keeps/can pick skirt
        if (key === 'gender') {
          if (val === 'male' && islandMeta.avatar.pants === 2) {
            islandMeta.avatar.pants = 0;
          } else if (val === 'female' && islandMeta.avatar.pants === 0) {
            islandMeta.avatar.pants = 2;
          }
        }
        if (key === 'shirt') islandMeta.outfit = val;
        saveIslandMeta();
        applyIslandMetaToUIAndScene();
        if (avatarPreview) avatarPreview.setAvatar(islandMeta.avatar);
        if (coopUI) coopUI.syncAvatar(islandMeta.avatar);
        audio.playSceneSwitch();
      });
    });
  });

  btnIslandPanel.addEventListener('click', () => islandPanel.classList.toggle('hidden'));
  btnCloseIslandPanel.addEventListener('click', () => islandPanel.classList.add('hidden'));

  petButtons.forEach((b) => {
    b.addEventListener('click', () => {
      ensureAudioStarted();
      islandMeta.pet = b.dataset.pet;
      saveIslandMeta();
      applyIslandMetaToUIAndScene();
      audio.playSceneSwitch();
    });
  });

  btnResetIsland.addEventListener('click', () => {
    islandMeta.level = 0;
    saveIslandMeta();
    applyIslandMetaToUIAndScene();
  });

  function openBottleModal() {
    let idx = Math.floor(Math.random() * BOTTLE_MESSAGES.length);
    if (idx === lastBottleIdx && BOTTLE_MESSAGES.length > 1) idx = (idx + 1) % BOTTLE_MESSAGES.length;
    lastBottleIdx = idx;
    if (bottleHeaderTitle) {
      const titles = {
        sakura: '🍾 LỜI NHẮN TỪ CHAI THƯ',
        room: '📖 TRANG NHẬT KÝ HÔM NAY',
        cafe: '☕ LỜI NHẮN TỪ QUẦY CÀ PHÊ',
      };
      bottleHeaderTitle.textContent = titles[currentSceneId] || titles.sakura;
    }
    bottleMessage.textContent = BOTTLE_MESSAGES[idx];
    bottleModal.classList.remove('hidden');
  }
  function closeBottleModal() { bottleModal.classList.add('hidden'); }
  btnCloseBottle.addEventListener('click', closeBottleModal);
  btnBottleOk.addEventListener('click', closeBottleModal);
  bottleModal.addEventListener('click', (e) => { if (e.target === bottleModal) closeBottleModal(); });

  /* ------------------------------------------------------------------------
     Pomodoro Timer + Floating Top-Center Clock Pill
     ------------------------------------------------------------------------ */
  const MODES = { micro: 5 * 60, focus: 25 * 60, break: 5 * 60 };
  const MODE_BADGES = { micro: 'KHỞI ĐỘNG', focus: 'TẬP TRUNG', break: 'NGHỈ NGƠI' };

  let pomoMode = 'focus';
  let pomoRemaining = MODES.focus;
  let pomoInterval = null;
  let pomoRunning = false;
  let customTotalSec = null;

  function formatTime(sec) {
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  }

  function updatePomodoroUI() {
    const formatted = formatTime(pomoRemaining);
    pomoTimeEl.textContent = formatted;
    skyClockTime.textContent = formatted;
    skyClockMode.textContent = MODE_BADGES[pomoMode] || 'TẬP TRUNG';
    skyClockPill.classList.toggle('running', pomoRunning);

    const total = customTotalSec || MODES[pomoMode];
    pomoProgressEl.style.width = `${(((total - pomoRemaining) / total) * 100).toFixed(1)}%`;

    btnPomoStart.textContent = pomoRunning ? 'Tạm dừng' : 'Bắt đầu';
    btnModeMicro.classList.toggle('active', pomoMode === 'micro');
    btnModeFocus.classList.toggle('active', pomoMode === 'focus');
    btnModeBreak.classList.toggle('active', pomoMode === 'break');
    if (breakActionBar) breakActionBar.classList.toggle('hidden', pomoMode !== 'break');

    if (scene) {
      scene.setClockDisplay(formatted, pomoRunning);
      scene.setPomoMode(pomoMode);
    }

    document.title = pomoRunning
      ? `${formatted} • Cozy Lofi Garden`
      : 'Cozy Lofi Garden — Không gian tập trung cho ADHD';
  }

  function setPomoMode(mode, overrideSeconds = null) {
    stopPomodoro();
    microPrompt.classList.add('hidden');
    pomoMode = mode;
    customTotalSec = overrideSeconds;
    pomoRemaining = overrideSeconds || MODES[mode];
    updatePomodoroUI();
  }

  function startPomodoro() {
    ensureAudioStarted();
    microPrompt.classList.add('hidden');
    if (pomoRunning) return;
    pomoRunning = true;
    updatePomodoroUI();

    pomoInterval = setInterval(() => {
      if (pomoRemaining > 0) {
        pomoRemaining -= 1;
        updatePomodoroUI();
      } else {
        stopPomodoro();
        highlightCard(pomodoroCard);

        if (pomoMode === 'micro') {
          audio.playCelebration();
          microPrompt.classList.remove('hidden');
          if (scene) scene.spawnBottle();
        } else if (pomoMode === 'focus') {
          audio.playCelebration();
          if (coopUI && coopUI.isInRoom()) {
            coopUI.levelUpRoom();
          } else {
            growIsland();
          }
          if (scene) scene.spawnBottle();
          pomoMode = 'break';
          customTotalSec = null;
          pomoRemaining = MODES.break;
          updatePomodoroUI();
        } else {
          audio.playWindChime();
          pomoMode = 'focus';
          customTotalSec = null;
          pomoRemaining = MODES.focus;
          updatePomodoroUI();
        }
      }
    }, 1000);
  }

  function stopPomodoro() {
    pomoRunning = false;
    if (pomoInterval) { clearInterval(pomoInterval); pomoInterval = null; }
    updatePomodoroUI();
  }

  function togglePomodoro() {
    if (pomoRunning) {
      stopPomodoro();
    } else if (coopUI && coopUI.needsPomodoroVote()) {
      ensureAudioStarted();
      coopUI.proposePomodoro(pomoMode);
    } else {
      startPomodoro();
    }
  }

  btnPomoStart.addEventListener('click', togglePomodoro);
  skyClockPill.addEventListener('click', () => { highlightCard(pomodoroCard); togglePomodoro(); });
  btnPomoReset.addEventListener('click', () => {
    stopPomodoro();
    microPrompt.classList.add('hidden');
    customTotalSec = null;
    pomoRemaining = MODES[pomoMode];
    updatePomodoroUI();
  });
  btnModeMicro.addEventListener('click', () => setPomoMode('micro'));
  btnModeFocus.addEventListener('click', () => setPomoMode('focus'));
  btnModeBreak.addEventListener('click', () => setPomoMode('break'));
  btnMicroContinue.addEventListener('click', () => { setPomoMode('focus', 20 * 60); startPomodoro(); });
  btnMicroBreak.addEventListener('click', () => { setPomoMode('break'); startPomodoro(); });

  function highlightCard(el) {
    el.classList.add('pulse-highlight');
    setTimeout(() => el.classList.remove('pulse-highlight'), 1400);
  }

  /* ------------------------------------------------------------------------
     Sound Mixer, Top 3 Tasks & Brain Dump
     ------------------------------------------------------------------------ */
  function loadMixerSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.MIXER) || '{}');
      if (typeof saved.rain === 'number') volRain.value = saved.rain;
      if (typeof saved.keys === 'number') volKeys.value = saved.keys;
      if (typeof saved.cozy === 'number') volCozy.value = saved.cozy;
      if (typeof saved.lofi === 'number') volLofi.value = saved.lofi;
    } catch (_) {}
    applyMixerValues();
  }
  function saveMixerSettings() {
    localStorage.setItem(STORAGE_KEYS.MIXER, JSON.stringify({
      rain: Number(volRain.value), keys: Number(volKeys.value),
      cozy: Number(volCozy.value), lofi: Number(volLofi.value),
    }));
  }
  function applyMixerValues() {
    const r = Number(volRain.value), k = Number(volKeys.value), c = Number(volCozy.value), l = Number(volLofi.value);
    valRain.textContent = `${r}%`; valKeys.textContent = `${k}%`;
    valCozy.textContent = `${c}%`; valLofi.textContent = `${l}%`;
    audio.setVolume('rain', r / 100); audio.setVolume('keys', k / 100);
    audio.setVolume('cozy', c / 100); audio.setVolume('lofi', l / 100);
  }
  [volRain, volKeys, volCozy, volLofi].forEach((s) => {
    s.addEventListener('input', () => { ensureAudioStarted(); applyMixerValues(); saveMixerSettings(); });
  });

  let tasks = [];
  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      if (Array.isArray(saved)) tasks = saved.slice(0, 3);
    } catch (_) { tasks = []; }
    renderTasks();
  }
  function saveTasks() { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }

  function renderTasks() {
    taskList.innerHTML = '';
    const doneCount = tasks.filter((t) => t.done).length;
    taskCounter.textContent = `${doneCount} / ${tasks.length || 3}`;

    tasks.forEach((task, idx) => {
      const li = document.createElement('li');
      li.className = `task-item${task.done ? ' done' : ''}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-check';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => {
        const wasDone = task.done;
        task.done = checkbox.checked;
        if (task.done && !wasDone) {
          audio.playTaskDone();
          // In Co-Working rooms, individual tasks do NOT level up the shared room!
          if (!coopUI || !coopUI.isInRoom()) growIsland();
        }
        saveTasks();
        renderTasks();
      });
      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'task-delete';
      delBtn.textContent = '×';
      delBtn.addEventListener('click', () => { tasks.splice(idx, 1); saveTasks(); renderTasks(); });
      li.append(checkbox, span, delBtn);
      taskList.appendChild(li);
    });

    const isFull = tasks.length >= 3;
    taskForm.classList.toggle('hidden', isFull);
    taskLimitNote.classList.toggle('hidden', !isFull);
  }

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text || tasks.length >= 3) return;
    tasks.push({ text, done: false });
    taskInput.value = '';
    saveTasks();
    renderTasks();
  });

  let dumpSaveTimeout = null;
  function loadBrainDump() {
    const saved = localStorage.getItem(STORAGE_KEYS.DUMP);
    if (saved) brainDump.value = saved;
  }
  brainDump.addEventListener('input', () => {
    dumpStatus.textContent = 'Đang lưu...';
    clearTimeout(dumpSaveTimeout);
    dumpSaveTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.DUMP, brainDump.value);
      dumpStatus.textContent = 'Đã lưu ✓';
    }, 300);
  });
  btnClearDump.addEventListener('click', () => {
    if (!brainDump.value) return;
    brainDump.value = '';
    localStorage.removeItem(STORAGE_KEYS.DUMP);
    dumpStatus.textContent = 'Đã xóa';
  });

  /* ------------------------------------------------------------------------
     Keyboard Shortcuts (Z Zen, M Mute, 1-3 Solo Scenes) & Break Emotes
     ------------------------------------------------------------------------ */
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (e.key === 'Escape') {
      if (guideModal && !guideModal.classList.contains('hidden')) { closeGuideModal(); return; }
      if (isZenMode) { setZenMode(false); return; }
    }
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    const k = e.key.toLowerCase();
    if (k === 'z') setZenMode(!isZenMode);
    else if (k === 'm') btnAudioToggle.click();
    else if (e.key >= '1' && e.key <= '3' && (!coopUI || !coopUI.isInRoom())) {
      const idx = Number(e.key) - 1;
      if (SCENE_ORDER[idx]) setScene(SCENE_ORDER[idx], true);
    }
  });

  emoteButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      ensureAudioStarted();
      const emote = btn.dataset.emote;
      emoteButtons.forEach((b) => b.classList.toggle('active', b === btn));
      if (scene && scene.setBreakEmote) scene.setBreakEmote(emote);
      audio.playSceneSwitch();
    });
  });

  /* ------------------------------------------------------------------------
     Initialize 3D Diorama Engine (with 2D Fallback)
     ------------------------------------------------------------------------ */
  const SceneClass =
    window.THREE && window.IslandScene3D ? window.IslandScene3D : window.PixelRoomScene;
  const scene = new SceneClass(canvas, {
    onHoverChange: (label, clientX, clientY) => {
      if (label) {
        tooltip.textContent = label;
        tooltip.style.left = `${Math.max(110, Math.min(window.innerWidth - 110, clientX))}px`;
        tooltip.style.top = `${Math.max(40, clientY - 8)}px`;
        tooltip.classList.add('visible');
      } else {
        tooltip.classList.remove('visible');
      }
    },
    onWeatherChange: (mode) => { ensureAudioStarted(); updateWeatherBadge(mode); audio.setWeatherMode(mode); },
    onLampChange: () => { ensureAudioStarted(); audio.playLampClick(); },
    onSipMug: () => { ensureAudioStarted(); audio.playSipClink(); },
    onPetCat: () => { ensureAudioStarted(); audio.playPurr(); },
    onClockClick: () => {
      ensureAudioStarted();
      if (isZenMode) setZenMode(false);
      highlightCard(pomodoroCard);
      togglePomodoro();
    },
    onKeystroke: () => { audio.playKeystroke(); },
    onOutfitChange: (idx) => {
      ensureAudioStarted();
      islandMeta.outfit = idx;
      islandMeta.avatar.shirt = idx;
      saveIslandMeta();
      applyIslandMetaToUIAndScene();
      if (coopUI) coopUI.syncAvatar(islandMeta.avatar);
      audio.playSceneSwitch();
    },
    onBreakActivityChange: () => { ensureAudioStarted(); audio.playSceneSwitch(); },
    onBottleClick: () => { ensureAudioStarted(); audio.playBottleChime(); openBottleModal(); },
    onLocalMoveEmote: (pos, emote) => { if (coopUI) coopUI.sendMoveEmote(pos, emote); },
    onAutoEco: () => { if (!isEcoMode) setEcoMode(true, false); },
  });

  // Initialize Co-Working Multiplayer UI
  const coopUI = window.CozyGarden.CoopUI
    ? new window.CozyGarden.CoopUI({
        getOutfit: () => islandMeta.avatar.shirt,
        getAvatar: () => Object.assign({}, islandMeta.avatar),
        onEnterRoom: (coopSceneId, members, myId) => {
          ensureAudioStarted();
          audio.playSceneSwitch();
          if (scene.enterCoopScene) scene.enterCoopScene(coopSceneId, members, myId);
        },
        onUpdateMembers: (members, myId) => {
          if (scene.updateCoopMembers) scene.updateCoopMembers(members, myId);
        },
        onLeaveRoom: () => {
          setScene(currentSceneId, true);
        },
        onReaction: (senderId, emoji) => {
          audio.playTaskDone();
          if (scene.showCoopReaction) scene.showCoopReaction(senderId, emoji);
        },
        onChatSound: () => {
          audio.playChatPop();
        },
        onVoiceSound: (type) => {
          ensureAudioStarted();
          if (type === 'join') audio.playVoiceJoin();
          else if (type === 'leave') audio.playVoiceLeave();
          else audio.playMicToggle(type === 'mute');
        },
        onPeerMoveEmote: (senderId, pos, emote) => {
          if (scene.updatePeerTransform) scene.updatePeerTransform(senderId, pos, emote);
        },
        onRoomLevelChange: (lv) => {
          if (scene.setCoopRoomLevel) scene.setCoopRoomLevel(lv);
        },
        onPomoApproved: (mode) => {
          setPomoMode(mode);
          startPomodoro();
        },
      })
    : null;

  // Boot
  const savedScene = localStorage.getItem(STORAGE_KEYS.SCENE);
  setScene(savedScene && SCENE_ORDER.includes(savedScene) ? savedScene : 'sakura', false);
  setEcoMode(localStorage.getItem(ECO_STORAGE_KEY) === '1', false);
  loadIslandMeta();
  loadMixerSettings();
  loadTasks();
  loadBrainDump();
  updatePomodoroUI();
  updateAudioButtonUI();
  scene.start();

  // Show 3D Character Creator automatically on first visit!
  if (!localStorage.getItem(AVATAR_CREATED_KEY)) {
    openCharCreator();
  }
})();
