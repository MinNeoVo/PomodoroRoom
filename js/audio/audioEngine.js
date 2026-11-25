/* ==========================================================================
   Cozy Lofi Pixel Room — Procedural Web Audio Synthesizer (audio.js)
   100% Web Audio API, zero external audio files.
   ========================================================================== */

class LofiAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isMuted = false;

    // Volume levels (0.0 to 1.0)
    this.volumes = {
      rain: 0.45,
      keys: 0.35,
      cozy: 0.40,
      lofi: 0.35,
    };

    // Weather state: 0 = Starry Night, 1 = Light Rain, 2 = Heavy Rain
    this.weatherMode = 0;

    // Graph nodes
    this.masterGain = null;
    this.rainGain = null;
    this.rainFilter = null;
    this.rainPatterGain = null;
    this.rainPatterFilter = null;
    this.cozyGain = null;
    this.hearthGain = null;
    this.keysGain = null;
    this.lofiGain = null;

    // Reusable noise buffers
    this.whiteBuffer = null;
    this.brownBuffer = null;

    // Scheduler timers
    this.crackleTimer = null;
    this.dropletTimer = null;
    this.lofiTimer = null;
    this.lofiStep = 0;
  }

  /**
   * Initialize AudioContext on first user gesture (browser autoplay compliance).
   */
  init() {
    if (this.isInitialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.isInitialized = true;

    // Master bus with gentle lowpass warmth to prevent any harsh high frequencies
    const masterWarmth = this.ctx.createBiquadFilter();
    masterWarmth.type = 'lowpass';
    masterWarmth.frequency.value = 6500;
    masterWarmth.Q.value = 0.5;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : 0.9;

    masterWarmth.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Pre-generate seamless noise buffers
    this.brownBuffer = this._createBrownNoiseBuffer(6);
    this.whiteBuffer = this._createWhiteNoiseBuffer(3);

    // 1. Rain & Brown Noise Layer
    this._setupRainLayer(masterWarmth);

    // 2. Hearth / Candle Warmth + Crackle Bus
    this._setupCozyLayer(masterWarmth);

    // 3. Mechanical Keyboard Bus
    this.keysGain = this.ctx.createGain();
    this.keysGain.gain.value = this.volumes.keys * 0.55;
    this.keysGain.connect(masterWarmth);

    // 4. Generative Lofi Rhodes Piano Bus
    this.lofiGain = this.ctx.createGain();
    this.lofiGain.gain.value = this.volumes.lofi * 0.42;
    this.lofiGain.connect(masterWarmth);

    // Apply initial weather & volume settings
    this.setWeatherMode(this.weatherMode);
    this._startAmbientSchedulers();
  }

  /**
   * Generates a seamless stereo Brown Noise buffer (smooth 1/f^2 spectrum).
   */
  _createBrownNoiseBuffer(durationSec) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * durationSec;
    const buffer = this.ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let lastOut = 0.0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        // Leaky integrator for warm, drift-free brown noise
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.2;
      }
      // Crossfade last 0.1s into start for seamless looping
      const fadeSamples = Math.floor(sampleRate * 0.1);
      for (let i = 0; i < fadeSamples; i++) {
        const t = i / fadeSamples;
        const endIdx = length - fadeSamples + i;
        data[endIdx] = data[endIdx] * (1 - t) + data[i] * t;
      }
    }
    return buffer;
  }

  /**
   * Generates a stereo White Noise buffer for crackles, droplets, and key clicks.
   */
  _createWhiteNoiseBuffer(durationSec) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * durationSec;
    const buffer = this.ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  }

  _setupRainLayer(destination) {
    // Deep Brown Noise base
    const brownSrc = this.ctx.createBufferSource();
    brownSrc.buffer = this.brownBuffer;
    brownSrc.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = 'lowpass';
    this.rainFilter.frequency.value = 340;
    this.rainFilter.Q.value = 0.7;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0;

    brownSrc.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(destination);
    brownSrc.start();

    // Soft rain patter layer (filtered pink/white shimmer)
    const patterSrc = this.ctx.createBufferSource();
    patterSrc.buffer = this.whiteBuffer;
    patterSrc.loop = true;

    this.rainPatterFilter = this.ctx.createBiquadFilter();
    this.rainPatterFilter.type = 'bandpass';
    this.rainPatterFilter.frequency.value = 1200;
    this.rainPatterFilter.Q.value = 0.8;

    this.rainPatterGain = this.ctx.createGain();
    this.rainPatterGain.gain.value = 0;

    patterSrc.connect(this.rainPatterFilter);
    this.rainPatterFilter.connect(this.rainPatterGain);
    this.rainPatterGain.connect(destination);
    patterSrc.start();
  }

  _setupCozyLayer(destination) {
    this.cozyGain = this.ctx.createGain();
    this.cozyGain.gain.value = this.volumes.cozy;
    this.cozyGain.connect(destination);

    // Subtle warm hearth low rumble
    const hearthSrc = this.ctx.createBufferSource();
    hearthSrc.buffer = this.brownBuffer;
    hearthSrc.loop = true;

    const hearthFilter = this.ctx.createBiquadFilter();
    hearthFilter.type = 'lowpass';
    hearthFilter.frequency.value = 140;

    this.hearthGain = this.ctx.createGain();
    this.hearthGain.gain.value = 0.16;

    hearthSrc.connect(hearthFilter);
    hearthFilter.connect(this.hearthGain);
    this.hearthGain.connect(this.cozyGain);
    hearthSrc.start();
  }

  _startAmbientSchedulers() {
    // Stochastic fireplace / candle crackle generator
    const scheduleCrackle = () => {
      if (this.isInitialized && !this.isMuted && this.volumes.cozy > 0.02) {
        this._triggerCandleCrackle();
      }
      const nextDelay = 180 + Math.random() * 950;
      this.crackleTimer = setTimeout(scheduleCrackle, nextDelay);
    };
    scheduleCrackle();

    // Occasional soft raindrop taps on window glass during rain modes
    const scheduleDroplet = () => {
      if (
        this.isInitialized &&
        !this.isMuted &&
        this.weatherMode > 0 &&
        this.volumes.rain > 0.02
      ) {
        this._triggerWindowDroplet();
      }
      const base = this.weatherMode === 2 ? 220 : 520;
      const nextDelay = base + Math.random() * (base * 1.8);
      this.dropletTimer = setTimeout(scheduleDroplet, nextDelay);
    };
    scheduleDroplet();

    // Generative Lofi Electric Piano / Rhodes chord progression
    const scheduleLofiChord = () => {
      if (
        this.isInitialized &&
        !this.isMuted &&
        this.volumes.lofi > 0.01 &&
        this.ctx &&
        this.ctx.state === 'running'
      ) {
        this._playLofiChord();
      }
      const nextDelay = 3400 + Math.random() * 1400;
      this.lofiTimer = setTimeout(scheduleLofiChord, nextDelay);
    };
    this.lofiTimer = setTimeout(scheduleLofiChord, 900);
  }

  /**
   * Warm Rhodes-like Lofi chord with gentle staggered arpeggio & optional melody note.
   */
  _playLofiChord() {
    if (!this.ctx || !this.lofiGain) return;
    const now = this.ctx.currentTime;

    // Dreamy Jazz/Lofi voicings (Hz): Cmaj9, Am9, Fmaj9, G13, Dm9, Em7
    const chords = [
      [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
      [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
      [174.61, 220.0, 261.63, 329.63, 392.0],  // Fmaj9
      [196.0, 246.94, 329.63, 349.23, 440.0],  // G13
      [293.66, 349.23, 440.0, 523.25, 659.25], // Dm9
      [164.81, 246.94, 293.66, 392.0, 493.88], // Em7
    ];

    // Pick next chord smoothly (mostly progression, occasionally gentle variation)
    const idx =
      Math.random() < 0.72
        ? this.lofiStep % chords.length
        : Math.floor(Math.random() * chords.length);
    this.lofiStep++;
    const notes = chords[idx];

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1150;
    filter.Q.value = 0.6;
    filter.connect(this.lofiGain);

    notes.forEach((freq, i) => {
      const t = now + i * 0.055 + Math.random() * 0.015;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      // Subtle vintage tape pitch warmth
      osc.frequency.setValueAtTime(freq * (0.998 + Math.random() * 0.004), t);

      const tine = this.ctx.createOscillator();
      tine.type = 'triangle';
      tine.frequency.setValueAtTime(freq * 2, t);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.11, t + 0.06);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

      const tineEnv = this.ctx.createGain();
      tineEnv.gain.setValueAtTime(0.0001, t);
      tineEnv.gain.linearRampToValueAtTime(0.018, t + 0.02);
      tineEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

      osc.connect(env);
      tine.connect(tineEnv);
      env.connect(filter);
      tineEnv.connect(filter);

      osc.start(t);
      tine.start(t);
      osc.stop(t + 3.3);
      tine.stop(t + 0.7);
    });

    // Occasional soft pentatonic melody sparkle on top
    if (Math.random() < 0.6) {
      const melodyPool = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77];
      const mFreq = melodyPool[Math.floor(Math.random() * melodyPool.length)];
      const mt = now + 1.2 + Math.random() * 0.8;
      const mOsc = this.ctx.createOscillator();
      mOsc.type = 'sine';
      mOsc.frequency.setValueAtTime(mFreq, mt);

      const mEnv = this.ctx.createGain();
      mEnv.gain.setValueAtTime(0.0001, mt);
      mEnv.gain.linearRampToValueAtTime(0.075, mt + 0.04);
      mEnv.gain.exponentialRampToValueAtTime(0.0001, mt + 1.8);

      mOsc.connect(mEnv);
      mEnv.connect(filter);
      mOsc.start(mt);
      mOsc.stop(mt + 1.9);
    }
  }

  /**
   * Single gentle fireplace/candle crackle impulse.
   */
  _triggerCandleCrackle() {
    if (!this.ctx || !this.cozyGain) return;
    const now = this.ctx.currentTime;

    const src = this.ctx.createBufferSource();
    src.buffer = this.whiteBuffer;
    const offset = Math.random() * 2.5;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800 + Math.random() * 2800;
    filter.Q.value = 2.2 + Math.random() * 2.5;

    const env = this.ctx.createGain();
    const peak = (0.04 + Math.random() * 0.09);
    const dur = 0.012 + Math.random() * 0.022;

    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(peak, now + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(filter);
    filter.connect(env);
    env.connect(this.cozyGain);

    src.start(now, offset, dur + 0.01);
  }

  /**
   * Subtle water droplet tap on glass during rain.
   */
  _triggerWindowDroplet() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const startFreq = 750 + Math.random() * 700;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.55, now + 0.045);

    const env = this.ctx.createGain();
    const level = this.volumes.rain * (this.weatherMode === 2 ? 0.022 : 0.014);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(Math.max(level, 0.0002), now + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(env);
    env.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  /**
   * Update audio texture based on weather mode:
   * 0 = Starry Night (ultra-soft warm brown noise floor)
   * 1 = Light Rain (gentle soothing rain)
   * 2 = Heavy Rain (deep enveloping rain)
   */
  setWeatherMode(mode) {
    this.weatherMode = mode;
    if (!this.isInitialized || !this.ctx) return;

    const now = this.ctx.currentTime;
    const vol = this.volumes.rain;

    if (mode === 0) {
      // Cozy deep brown noise bed
      this.rainFilter.frequency.setTargetAtTime(260, now, 0.45);
      this.rainGain.gain.setTargetAtTime(vol * 0.28, now, 0.45);
      this.rainPatterGain.gain.setTargetAtTime(0.0001, now, 0.45);
    } else if (mode === 1) {
      // Light steady rain
      this.rainFilter.frequency.setTargetAtTime(560, now, 0.45);
      this.rainGain.gain.setTargetAtTime(vol * 0.48, now, 0.45);
      this.rainPatterFilter.frequency.setTargetAtTime(1450, now, 0.45);
      this.rainPatterGain.gain.setTargetAtTime(vol * 0.045, now, 0.45);
    } else {
      // Heavy immersive rain
      this.rainFilter.frequency.setTargetAtTime(980, now, 0.45);
      this.rainGain.gain.setTargetAtTime(vol * 0.72, now, 0.45);
      this.rainPatterFilter.frequency.setTargetAtTime(1050, now, 0.45);
      this.rainPatterGain.gain.setTargetAtTime(vol * 0.095, now, 0.45);
    }
  }

  /**
   * Adjust mixer channel volume (0..1).
   */
  setVolume(channel, value) {
    const clamped = Math.max(0, Math.min(1, value));
    this.volumes[channel] = clamped;

    if (!this.isInitialized || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (channel === 'rain') {
      this.setWeatherMode(this.weatherMode);
    } else if (channel === 'keys' && this.keysGain) {
      this.keysGain.gain.setTargetAtTime(clamped * 0.55, now, 0.08);
    } else if (channel === 'cozy' && this.cozyGain) {
      this.cozyGain.gain.setTargetAtTime(clamped, now, 0.08);
    } else if (channel === 'lofi' && this.lofiGain) {
      this.lofiGain.gain.setTargetAtTime(clamped * 0.42, now, 0.12);
    }
  }

  /**
   * Toggle global mute smoothly.
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (!this.isInitialized || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.9, now, 0.12);
  }

  /**
   * Synthesized warm tactile mechanical keyboard sound (Cherry MX Brown / thocky vibe).
   * Called in sync with the character's typing animation.
   */
  playKeystroke() {
    if (!this.isInitialized || this.isMuted || this.volumes.keys <= 0.01) return;
    if (this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    const pitchVar = 0.9 + Math.random() * 0.22;
    const velVar = 0.72 + Math.random() * 0.35;

    // 1. Warm bottom-out "thock" body
    const bodyOsc = this.ctx.createOscillator();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(165 * pitchVar, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(58 * pitchVar, now + 0.032);

    const bodyEnv = this.ctx.createGain();
    bodyEnv.gain.setValueAtTime(0.0001, now);
    bodyEnv.gain.exponentialRampToValueAtTime(0.24 * velVar, now + 0.003);
    bodyEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

    bodyOsc.connect(bodyEnv);
    bodyEnv.connect(this.keysGain);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.045);

    // 2. Soft tactile switch bump (filtered noise burst)
    const clickSrc = this.ctx.createBufferSource();
    clickSrc.buffer = this.whiteBuffer;

    const clickFilter = this.ctx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 1900 * pitchVar;
    clickFilter.Q.value = 2.4;

    const clickEnv = this.ctx.createGain();
    clickEnv.gain.setValueAtTime(0.0001, now);
    clickEnv.gain.exponentialRampToValueAtTime(0.11 * velVar, now + 0.002);
    clickEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

    clickSrc.connect(clickFilter);
    clickFilter.connect(clickEnv);
    clickEnv.connect(this.keysGain);
    clickSrc.start(now, Math.random() * 2.5, 0.02);
  }

  /**
   * Low-frequency warm cat purr (~26 Hz vibration modulated by slow breathing).
   */
  playPurr() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 3.6;

    // Fundamental purr vibration
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(25.5, now);

    // Subtle warm harmonic
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(51, now);

    // Warm lowpass filter to round off harshness
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 145;
    filter.Q.value = 1.4;

    // Breathing amplitude LFO (~0.45 Hz = inhale/exhale purr cycles)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.55;

    const lfoDepth = this.ctx.createGain();
    lfoDepth.gain.value = 0.09;

    const purrAmp = this.ctx.createGain();
    const baseLevel = Math.max(0.16, this.volumes.cozy * 0.35);
    purrAmp.gain.setValueAtTime(0.0001, now);
    purrAmp.gain.linearRampToValueAtTime(baseLevel, now + 0.35);
    purrAmp.gain.setValueAtTime(baseLevel, now + duration - 0.8);
    purrAmp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    lfo.connect(lfoDepth);
    lfoDepth.connect(purrAmp.gain);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(purrAmp);
    purrAmp.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);

    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
    lfo.stop(now + duration + 0.05);
  }

  /**
   * Gentle pentatonic wind chime for Pomodoro completion.
   */
  playWindChime() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Soft dreamy C major 9 pentatonic notes
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.16;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      // Gentle bell shimmer overtone
      const overtone = this.ctx.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.003, start);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, start);
      env.gain.exponentialRampToValueAtTime(0.09, start + 0.025);
      env.gain.exponentialRampToValueAtTime(0.0001, start + 2.3);

      const overEnv = this.ctx.createGain();
      overEnv.gain.setValueAtTime(0.0001, start);
      overEnv.gain.exponentialRampToValueAtTime(0.022, start + 0.02);
      overEnv.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);

      osc.connect(env);
      overtone.connect(overEnv);
      env.connect(this.masterGain);
      overEnv.connect(this.masterGain);

      osc.start(start);
      overtone.start(start);
      osc.stop(start + 2.4);
      overtone.stop(start + 1.2);
    });
  }

  /**
   * Soft rewarding two-note chime when checking off a Top 3 Task.
   */
  playTaskDone() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 880.0]; // D5 -> A5 warm fifth

    notes.forEach((freq, i) => {
      const t = now + i * 0.085;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.085, t + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);

      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  /**
   * Crisp subtle lamp toggle click.
   */
  playLampClick() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.018);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.055, now);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * Gentle ceramic mug clink when sipping coffee/tea.
   */
  playSipClink() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1120, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.045, now + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Soft warm two-tone chime when switching room scene/environment.
   */
  playSceneSwitch() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [440.0, 554.37]; // A4 -> C#5 warm major third
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.07;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.055, t + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  /**
   * Magical glass-bottle sparkle chime when opening Message in a Bottle.
   */
  playBottleChime() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.09;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.07, t + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);

      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.8);
    });
  }

  /**
   * Joyful warm celebration fanfare when completing a Pomodoro focus session!
   */
  playCelebration() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Ascending C major 9 celebration arpeggio + warm chord bloom
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.11;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const shimmer = this.ctx.createOscillator();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(freq * 2, t);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.11, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

      const sEnv = this.ctx.createGain();
      sEnv.gain.setValueAtTime(0.0001, t);
      sEnv.gain.exponentialRampToValueAtTime(0.03, t + 0.02);
      sEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

      osc.connect(env);
      shimmer.connect(sEnv);
      env.connect(this.masterGain);
      sEnv.connect(this.masterGain);

      osc.start(t);
      shimmer.start(t);
      osc.stop(t + 1.7);
      shimmer.stop(t + 1.0);
    });
  }

  /**
   * Soft cozy bubble pop when receiving or sending a chat message.
   */
  playChatPop() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.065);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.065, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Warm ascending 2-note chime when someone joins the voice call.
   */
  playVoiceJoin() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    [440, 659.25].forEach((freq, idx) => {
      const t = now + idx * 0.085;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.08, t + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);

      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  /**
   * Soft descending 2-note chime when someone leaves the voice call.
   */
  playVoiceLeave() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    [523.25, 349.23].forEach((freq, idx) => {
      const t = now + idx * 0.085;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.075, t + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);

      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  /**
   * Crisp Discord-like mic mute / unmute tone.
   */
  playMicToggle(isMuted) {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    if (isMuted) {
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.08);
    } else {
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
    }

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.075, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Gentle yet noticeable warm resonant bell when a roommate sends a "need to talk" alert.
   */
  playGentleAlert() {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Soft warm marimba/kalimba triad (G4 -> B4 -> D5 -> G5), slightly louder than chat pop, never harsh!
    const notes = [392.0, 493.88, 587.33, 783.99];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.11;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const over = this.ctx.createOscillator();
      over.type = 'triangle';
      over.frequency.setValueAtTime(freq * 2, t);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      const oEnv = this.ctx.createGain();
      oEnv.gain.setValueAtTime(0.0001, t);
      oEnv.gain.exponentialRampToValueAtTime(0.035, t + 0.015);
      oEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(env);
      over.connect(oEnv);
      env.connect(this.masterGain);
      oEnv.connect(this.masterGain);

      osc.start(t);
      over.start(t);
      osc.stop(t + 0.9);
      over.stop(t + 0.4);
    });
  }

  /**
   * Playful soft sound for member-to-member interactions (bonk / hug / poke).
   */
  playInteract(action) {
    this.init();
    if (!this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    if (action === 'bonk') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.13);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(0.14, now + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    } else if (action === 'hug') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.16);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.07);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(0.085, now + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    }

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }
}

window.LofiAudioEngine = LofiAudioEngine;
