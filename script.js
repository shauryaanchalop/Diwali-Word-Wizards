/* ==========================================================================
   WORD WIZARDS • DIWALI CELEBRATION PORTAL
   Dedicated to First Year Student Members of Word Wizards (ADGIPS)
   Interactive Engine: Member Card Gift, Soan Papdi, Gifts, Arena & Dept Wishes
   ========================================================================== */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. NATIVE WEB AUDIO API SYNTHESIZER
  // --------------------------------------------------------------------------
  class DiwaliSoundEngine {
    constructor() {
      this.ctx = null;
      this.isMusicMuted = true;
      this.isSfxMuted = false; // SFX enabled by default so firecracker bursts & interactions always make sound!
      this.masterGain = null;
      this.droneGain = null;
      this.isInitialized = false;
      this.ambientTimer = null;
    }

    init() {
      if (this.isInitialized && this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.isInitialized = true;
      } catch (e) {
        console.warn('Web Audio not supported', e);
      }
    }

    ensureAudioContext() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggleSound() {
      this.ensureAudioContext();
      if (!this.ctx) return false;

      this.isMusicMuted = !this.isMusicMuted;
      if (!this.isMusicMuted) {
        this.startFestiveDrone();
        this.startChimeLoop();
      } else {
        this.stopFestiveDrone();
        if (this.ambientTimer) clearInterval(this.ambientTimer);
      }
      return !this.isMusicMuted;
    }

    startFestiveDrone() {
      if (!this.ctx || this.droneGain) return;

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 3);
      this.droneGain.connect(this.masterGain);

      const freqs = [155.56, 233.08, 311.13, 466.16];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);
        oscGain.gain.setValueAtTime(0.25 / (idx + 1), this.ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(this.droneGain);
        osc.start();
      });
    }

    stopFestiveDrone() {
      if (this.droneGain && this.ctx) {
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
        setTimeout(() => {
          this.droneGain = null;
        }, 1100);
      }
    }

    startChimeLoop() {
      if (this.ambientTimer) clearInterval(this.ambientTimer);
      const notes = [311.13, 349.23, 392.00, 466.16, 523.25, 622.25];
      const playMelody = () => {
        if (this.isMusicMuted || !this.ctx) return;
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.playBellChime(note, 0.15, 3.5);
        if (Math.random() > 0.4) {
          setTimeout(() => {
            if (!this.isMusicMuted) {
              const harmony = notes[Math.floor(Math.random() * notes.length)];
              this.playBellChime(harmony, 0.1, 2.8);
            }
          }, 350);
        }
      };

      this.ambientTimer = setInterval(playMelody, 4200);
      playMelody();
    }

    playBellChime(freq = 523.25, volume = 0.3, duration = 3.0) {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);

        const harmonic = this.ctx.createOscillator();
        const harmGain = this.ctx.createGain();
        harmonic.type = 'triangle';
        harmonic.frequency.setValueAtTime(freq * 2.76, now);
        harmGain.gain.setValueAtTime(volume * 0.3, now);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, now + (duration * 0.6));
        harmonic.connect(harmGain);
        harmGain.connect(this.masterGain);
        harmonic.start(now);
        harmonic.stop(now + duration);
      } catch (e) {}
    }

    playSweetChime() {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const notes = [587.33, 739.99, 880.00];
        notes.forEach((n, idx) => {
          setTimeout(() => {
            this.playBellChime(n, 0.2, 1.8);
          }, idx * 120);
        });
      } catch (e) {}
    }

    playFireworkBoom() {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.7);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.85);

        this.playSparkleBurst(now + 0.08);
      } catch (e) {}
    }

    playSparkleBurst(startTime) {
      if (!this.ctx) return;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(startTime);
    }

    playSparklerCrackle() {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      if (Math.random() > 0.35) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900 + Math.random() * 2200, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {}
    }

    playAnaarSound(duration = 3.8) {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          const t = i / this.ctx.sampleRate;
          const envelope = Math.min(t / 0.4, 1) * (1 - t / duration);
          data[i] = (Math.random() * 2 - 1) * envelope;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.frequency.linearRampToValueAtTime(2900, now + duration * 0.7);
        filter.Q.setValueAtTime(1.6, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
      } catch (e) {}
    }

    playChakriSound(duration = 4.2) {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 1.2);
        osc.frequency.linearRampToValueAtTime(1150, now + 2.5);
        osc.frequency.exponentialRampToValueAtTime(160, now + duration);

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {}
    }

    toggleSfx() {
      this.ensureAudioContext();
      this.isSfxMuted = !this.isSfxMuted;
      return !this.isSfxMuted;
    }

    playIgnitionSound() {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.07);
      } catch (e) {}
    }

    playFirecrackerSnap(volume = 1.0) {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // 1. High-impact gunpowder noise crack
        const snapLen = Math.floor(this.ctx.sampleRate * 0.09);
        const snapBuf = this.ctx.createBuffer(1, snapLen, this.ctx.sampleRate);
        const snapData = snapBuf.getChannelData(0);
        for (let i = 0; i < snapLen; i++) {
          snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapLen * 0.18));
        }
        const snapSrc = this.ctx.createBufferSource();
        snapSrc.buffer = snapBuf;
        const snapFilter = this.ctx.createBiquadFilter();
        snapFilter.type = 'highpass';
        snapFilter.frequency.setValueAtTime(1100, now);
        const snapGain = this.ctx.createGain();
        snapGain.gain.setValueAtTime(volume * 1.3, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        snapSrc.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(this.masterGain);
        snapSrc.start(now);

        // 2. Body punch thump
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360 + Math.random() * 220, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
        oscGain.gain.setValueAtTime(volume * 0.95, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch (e) {}
    }

    playLadiPop() {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      this.playFirecrackerSnap(0.85 + Math.random() * 0.35);
    }

    playFuseSizzle() {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const dur = 1.0;
        const bufferSize = Math.floor(this.ctx.sampleRate * dur);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.45;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.Q.setValueAtTime(2.0, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
      } catch (e) {}
    }

    playSutliBombSound() {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // 1. Initial deafening transient gunpowder crack
        this.playFirecrackerSnap(1.8);

        // 2. Sub-bass heavy shockwave punch (drops from 260Hz down to 25Hz)
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(260, now);
        subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.95);
        subGain.gain.setValueAtTime(1.6, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        subOsc.connect(subGain);
        subGain.connect(this.masterGain);
        subOsc.start(now);
        subOsc.stop(now + 1.2);

        // 3. Low-frequency rumbling reverberation
        const rumbleLen = Math.floor(this.ctx.sampleRate * 1.1);
        const rumbleBuf = this.ctx.createBuffer(1, rumbleLen, this.ctx.sampleRate);
        const rData = rumbleBuf.getChannelData(0);
        for (let i = 0; i < rumbleLen; i++) {
          rData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (rumbleLen * 0.2));
        }
        const rSource = this.ctx.createBufferSource();
        rSource.buffer = rumbleBuf;
        const rFilter = this.ctx.createBiquadFilter();
        rFilter.type = 'lowpass';
        rFilter.frequency.setValueAtTime(900, now);
        rFilter.frequency.exponentialRampToValueAtTime(75, now + 0.9);
        const rGain = this.ctx.createGain();
        rGain.gain.setValueAtTime(1.3, now);
        rGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        rSource.connect(rFilter);
        rFilter.connect(rGain);
        rGain.connect(this.masterGain);
        rSource.start(now);
      } catch (e) {}
    }

    playRocketWhoosh() {
      this.ensureAudioContext();
      if (this.isSfxMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.85);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.65, now + 0.55);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.9);
      } catch (e) {}
    }
  }

  const soundEngine = new DiwaliSoundEngine();

  // Multi-tier AudioContext unlock for iOS Safari, Android Chrome, and Desktop
  const unlockAudio = () => {
    soundEngine.ensureAudioContext();
    if (soundEngine.ctx) {
      try {
        const buf = soundEngine.ctx.createBuffer(1, 1, 22050);
        const src = soundEngine.ctx.createBufferSource();
        src.buffer = buf;
        src.connect(soundEngine.ctx.destination);
        src.start(0);
      } catch (e) {}
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  // --------------------------------------------------------------------------
  // 2. BACKGROUND CANVAS, EMBERS & SKY FIREWORKS
  // --------------------------------------------------------------------------
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
  const sparkCanvas = document.getElementById('sparkler-canvas');
  const sparkCtx = sparkCanvas ? sparkCanvas.getContext('2d') : null;

  let width = window.innerWidth;
  let height = window.innerHeight;

  function resizeCanvases() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (bgCanvas) {
      bgCanvas.width = width;
      bgCanvas.height = height;
    }
    if (sparkCanvas) {
      sparkCanvas.width = width;
      sparkCanvas.height = height;
    }
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  const embers = [];
  const EMBER_COUNT = 45;
  for (let i = 0; i < EMBER_COUNT; i++) {
    embers.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.7 + 0.25,
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      color: Math.random() > 0.4 ? '#ffd24d' : '#ff7e29'
    });
  }

  const fireworks = [];
  const particles = [];
  const PALETTES = [
    ['#ffd700', '#ffae19', '#fff1b0', '#ff5a1f'],
    ['#ff2a6d', '#ff598f', '#ffe0ea', '#ff8400'],
    ['#05d554', '#7dff9e', '#ffd700', '#00ffc8'],
    ['#bf55ec', '#e082ff', '#ffd700', '#9b59b6'],
    ['#fffae0', '#ffbf00', '#ffffff', '#ff9900']
  ];

  class Firework {
    constructor(startX, startY, targetX, targetY) {
      this.x = startX;
      this.y = startY;
      this.startX = startX;
      this.startY = startY;
      this.targetX = targetX;
      this.targetY = targetY;
      this.speed = 4.5;
      this.angle = Math.atan2(targetY - startY, targetX - startX);
      this.velocity = {
        x: Math.cos(this.angle) * this.speed,
        y: Math.sin(this.angle) * this.speed
      };
      this.trail = [];
      this.palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      this.isDead = false;
    }

    update() {
      this.trail.push({ x: this.x, y: this.y, alpha: 1 });
      if (this.trail.length > 7) this.trail.shift();

      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.velocity.x *= 1.015;
      this.velocity.y *= 1.015;

      const remaining = Math.hypot(this.targetX - this.x, this.targetY - this.y);
      if (remaining <= 15 || this.y <= this.targetY) {
        this.explode();
        this.isDead = true;
      }
    }

    draw(ctx) {
      ctx.save();
      for (let i = 0; i < this.trail.length; i++) {
        const pt = this.trail[i];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 120, ${(i / this.trail.length) * 0.8})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffd700';
      ctx.fill();
      ctx.restore();
    }

    explode() {
      soundEngine.playFireworkBoom();
      const count = Math.floor(Math.random() * 40) + 70;
      const isGoldenRain = Math.random() > 0.65;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.2;
        const speed = Math.random() * 5.5 + 1.2;
        particles.push(new Particle(this.x, this.y, angle, speed, this.palette, isGoldenRain));
      }
    }
  }

  class Particle {
    constructor(x, y, angle, speed, palette, isGoldenRain = false) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = isGoldenRain ? Math.random() * 0.012 + 0.008 : Math.random() * 0.02 + 0.014;
      this.gravity = isGoldenRain ? 0.06 : 0.04;
      this.drag = 0.975;
      this.color = palette[Math.floor(Math.random() * palette.length)];
      this.size = Math.random() * 2.4 + 1.2;
      this.history = [];
    }

    update() {
      this.history.push({ x: this.x, y: this.y, a: this.alpha });
      if (this.history.length > 5) this.history.shift();

      this.vx *= this.drag;
      this.vy = this.vy * this.drag + this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      if (this.history.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 1; i < this.history.length; i++) {
          ctx.lineTo(this.history[i].x, this.history[i].y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size * 0.6;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  let sparklerActive = true;
  const sparklerParticles = [];

  function addSparklerEmber(x, y) {
    if (!sparklerActive) return;
    const count = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.0;
      sparklerParticles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 0.05 + 0.03,
        size: Math.random() * 2.0 + 1.0,
        color: Math.random() > 0.3 ? '#fff7a0' : '#ffa500'
      });
    }
    soundEngine.playSparklerCrackle();
  }

  window.addEventListener('mousemove', (e) => {
    addSparklerEmber(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      addSparklerEmber(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('click', (e) => {
    if (e.target.closest('button, input, select, textarea, a, .ceremonial-diya-stage, .patakha-item-card, .patakha-arena-container, .gift-box-card, .soan-cube, .council-card')) {
      return;
    }
    launchRocket(e.clientX, e.clientY);
  });

  function launchRocket(targetX, targetY) {
    const startX = targetX + (Math.random() - 0.5) * 120;
    const startY = height + 10;
    fireworks.push(new Firework(startX, startY, targetX, targetY));
  }

  let autoFireworkTimer = 0;

  function animationLoop() {
    requestAnimationFrame(animationLoop);

    if (bgCtx) {
      bgCtx.clearRect(0, 0, width, height);

      for (let i = 0; i < embers.length; i++) {
        const em = embers[i];
        em.y -= em.speedY;
        em.x += Math.sin(em.y * 0.015) * em.speedX;
        em.alpha += em.pulseSpeed;
        if (em.alpha > 0.9 || em.alpha < 0.2) em.pulseSpeed = -em.pulseSpeed;

        if (em.y < -10) {
          em.y = height + 10;
          em.x = Math.random() * width;
        }

        bgCtx.save();
        bgCtx.globalAlpha = Math.max(0.1, Math.min(1, em.alpha));
        bgCtx.fillStyle = em.color;
        bgCtx.shadowBlur = 10;
        bgCtx.shadowColor = em.color;
        bgCtx.beginPath();
        bgCtx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
        bgCtx.fill();
        bgCtx.restore();
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw(bgCtx);
        if (fireworks[i].isDead) fireworks.splice(i, 1);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(bgCtx);
        if (particles[i].alpha <= 0) particles.splice(i, 1);
      }
    }

    if (sparkCtx) {
      sparkCtx.clearRect(0, 0, width, height);
      for (let i = sparklerParticles.length - 1; i >= 0; i--) {
        const sp = sparklerParticles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.04;
        sp.life -= sp.decay;

        if (sp.life <= 0) {
          sparklerParticles.splice(i, 1);
          continue;
        }

        sparkCtx.save();
        sparkCtx.globalAlpha = Math.max(0, sp.life);
        sparkCtx.fillStyle = sp.color;
        sparkCtx.shadowBlur = 8;
        sparkCtx.shadowColor = sp.color;
        sparkCtx.beginPath();
        sparkCtx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        sparkCtx.fill();
        sparkCtx.restore();
      }
    }

    autoFireworkTimer++;
    if (autoFireworkTimer > 320) {
      autoFireworkTimer = 0;
      const rx = width * 0.15 + Math.random() * (width * 0.7);
      const ry = height * 0.12 + Math.random() * (height * 0.35);
      launchRocket(rx, ry);
    }
  }
  requestAnimationFrame(animationLoop);

  // --------------------------------------------------------------------------
  // 3. CEREMONIAL DIYA LIGHTING
  // --------------------------------------------------------------------------
  const ceremonialStage = document.getElementById('ceremonial-diya-stage');
  const ceremonialBtn = document.getElementById('btn-light-ceremonial');
  const ceremonialPill = document.getElementById('diya-status-pill');
  const blessingBox = document.getElementById('blessing-box');

  let isCeremonialLit = false;

  function lightCeremonialDiya() {
    if (isCeremonialLit) {
      showToast('The Sacred Diya is already radiating wisdom! ✨');
      const rect = ceremonialStage.getBoundingClientRect();
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          launchRocket(rect.left + Math.random() * rect.width, rect.top - 50);
        }, i * 220);
      }
      return;
    }

    isCeremonialLit = true;
    ceremonialStage.classList.add('lit');
    ceremonialBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      Sacred Diya Radiating Brilliance
    `;
    ceremonialPill.textContent = '✨ Radiant & Blessed • Lighting up minds across Word Wizards';
    blessingBox.classList.add('show');

    soundEngine.playBellChime(440, 0.4, 4.0);
    soundEngine.playBellChime(659.25, 0.25, 3.5);

    const rect = ceremonialStage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top;

    launchRocket(centerX, centerY - 100);
    setTimeout(() => launchRocket(centerX - 150, centerY - 80), 300);
    setTimeout(() => launchRocket(centerX + 150, centerY - 80), 600);

    showToast('The Sacred Diya of Word Wizards is ignited! Shubh Deepavali! 🪔✨');
  }

  if (ceremonialStage) ceremonialStage.addEventListener('click', lightCeremonialDiya);
  if (ceremonialBtn) ceremonialBtn.addEventListener('click', lightCeremonialDiya);

  // --------------------------------------------------------------------------
  // 4. MAIN FEATURE: PERSONALIZED MEMBER GREETING CARD STUDIO
  // --------------------------------------------------------------------------
  const greetingCanvas = document.getElementById('greeting-canvas');
  const cardNameInput = document.getElementById('card-name-input');
  const cardQuoteSelect = document.getElementById('card-quote-select');
  const btnDownloadCard = document.getElementById('btn-download-card');
  const btnCopyWish = document.getElementById('btn-copy-wish');

  function getSelectedCardDepartments() {
    const checkboxes = document.querySelectorAll('#card-dept-checkboxes input[type="checkbox"]:checked');
    const depts = Array.from(checkboxes).map(cb => cb.value);
    return depts.length > 0 ? depts : ['Word Wizards'];
  }

  const logoImage = new Image();
  let isLogoLoaded = false;

  logoImage.onload = () => {
    isLogoLoaded = true;
    drawGreetingCard();
  };

  if (window.WORD_WIZARDS_LOGO_B64) {
    logoImage.src = window.WORD_WIZARDS_LOGO_B64;
  } else {
    logoImage.src = 'https://res.cloudinary.com/donf76gql/image/upload/v1791469094/cropped_circle_ww_logo_bxjh0m.png';
  }

  function drawGreetingCard() {
    if (!greetingCanvas) return;
    const ctx = greetingCanvas.getContext('2d');
    const cw = 1200;
    const ch = 800;
    greetingCanvas.width = cw;
    greetingCanvas.height = ch;

    const name = cardNameInput && cardNameInput.value.trim() ? cardNameInput.value.trim() : 'Shaurya Anchal';
    const depts = getSelectedCardDepartments();
    const quote = cardQuoteSelect ? cardQuoteSelect.value : 'May the sacred light of Diwali inspire your voice, elevate your intellect, and bring triumph in all your endeavors.';

    // 1. Midnight Velvet Backdrop
    const bgGrad = ctx.createRadialGradient(cw / 2, ch * 0.38, 80, cw / 2, ch / 2, 700);
    bgGrad.addColorStop(0, '#2d1154');
    bgGrad.addColorStop(0.5, '#140728');
    bgGrad.addColorStop(1, '#080313');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cw, ch);

    // 2. Gold Filigree Borders
    ctx.strokeStyle = '#ffd768';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, cw - 60, ch - 60);

    ctx.strokeStyle = 'rgba(245, 184, 46, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(42, 42, cw - 84, ch - 84);

    drawCornerMotif(ctx, 42, 42);
    drawCornerMotif(ctx, cw - 42, 42, true, false);
    drawCornerMotif(ctx, 42, ch - 42, false, true);
    drawCornerMotif(ctx, cw - 42, ch - 42, true, true);

    // 3. Society Header Title (Word Wizards Primary!)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb326';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.letterSpacing = '5px';
    ctx.fillText('WORD WIZARDS', cw / 2, 85);

    ctx.fillStyle = '#ded1eb';
    ctx.font = '14px system-ui, sans-serif';
    ctx.letterSpacing = '2.5px';
    ctx.fillText('FIRST YEAR STUDENT DEVELOPMENT SOCIETY • ADGIPS', cw / 2, 110);

    // 4. Draw Official Logo with Gold Halo
    const logoRadius = 55;
    const logoCenterX = cw / 2;
    const logoCenterY = 182;

    if (isLogoLoaded && logoImage.complete && logoImage.naturalWidth !== 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoCenterX, logoCenterY, logoRadius + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 184, 46, 0.35)';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 18;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(logoCenterX, logoCenterY, logoRadius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd768';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImage, logoCenterX - logoRadius, logoCenterY - logoRadius, logoRadius * 2, logoRadius * 2);
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd768';
      ctx.fill();
      ctx.restore();
    }

    // 5. Sanskrit Invocation (Premium Devanagari styling)
    ctx.fillStyle = '#ffd24d';
    ctx.font = 'normal 32px "Rozha One", "Tiro Devanagari Hindi", serif';
    ctx.fillText('॥ शुभ दीपावली ॥', cw / 2, 282);

    const titleGrad = ctx.createLinearGradient(cw / 2 - 200, 300, cw / 2 + 200, 360);
    titleGrad.addColorStop(0, '#fff4d1');
    titleGrad.addColorStop(0.4, '#ffd768');
    titleGrad.addColorStop(0.8, '#ff9022');
    titleGrad.addColorStop(1, '#ff4820');
    ctx.fillStyle = titleGrad;
    ctx.font = 'bold 58px Georgia, serif';
    ctx.shadowColor = 'rgba(255, 144, 34, 0.6)';
    ctx.shadowBlur = 22;
    ctx.fillText('HAPPY DIWALI', cw / 2, 345);
    ctx.shadowBlur = 0;

    // 6. Central Brass Diya
    drawCardDiya(ctx, cw / 2, 435);

    // 7. Personalized Member Greeting
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 23px Georgia, serif';
    ctx.fillText('“Warmest Diwali Gift Specially Conferred Upon”', cw / 2, 532);

    ctx.fillStyle = '#ffd768';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.shadowColor = 'rgba(255, 215, 104, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fillText(name, cw / 2, 576);
    ctx.shadowBlur = 0;

    // Department Tag Badge (Multi-department support)
    let deptLabel = '';
    if (depts.length === 1) {
      deptLabel = depts[0] === 'Word Wizards' ? '✦ Word Wizards Member ✦' : `✦ Department of ${depts[0]} ✦`;
    } else {
      deptLabel = `✦ ${depts.join(' • ')} ✦`;
    }

    ctx.fillStyle = '#ffaa44';
    if (deptLabel.length > 55) {
      ctx.font = 'bold 15px system-ui, sans-serif';
    } else if (deptLabel.length > 38) {
      ctx.font = 'bold 17px system-ui, sans-serif';
    } else {
      ctx.font = 'bold 19px system-ui, sans-serif';
    }
    ctx.fillText(deptLabel, cw / 2, 612);

    // 8. Chosen Festive Quote
    ctx.fillStyle = '#ded1eb';
    ctx.font = '19px Georgia, serif';
    wrapText(ctx, `“${quote}”`, cw / 2, 665, 880, 26);

    // 9. Footer Seal
    ctx.fillStyle = '#a68fb8';
    ctx.font = '13.5px system-ui, sans-serif';
    ctx.fillText('Word Wizards Official Member Keepsake • ADGIPS Chapter', cw / 2, 750);
  }

  function drawCornerMotif(ctx, x, y, flipX = false, flipY = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.strokeStyle = '#ffd768';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(35, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 35);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(15, 15, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f5b82e';
    ctx.fill();
    ctx.restore();
  }

  function drawCardDiya(ctx, cx, cy) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy);
    ctx.bezierCurveTo(cx - 55, cy + 40, cx + 55, cy + 40, cx + 70, cy);
    ctx.bezierCurveTo(cx + 38, cy + 14, cx - 38, cy + 14, cx - 70, cy);
    ctx.fillStyle = '#c98514';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffeb80';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, 70, 13, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#915307';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, 55, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff7b1a';
    ctx.fill();

    const flameGrad = ctx.createRadialGradient(cx, cy - 22, 5, cx, cy - 32, 40);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, '#ffea75');
    flameGrad.addColorStop(0.7, '#ff8400');
    flameGrad.addColorStop(1, 'rgba(255, 30, 0, 0)');

    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 5);
    ctx.bezierCurveTo(cx - 22, cy - 36, cx, cy - 68, cx, cy - 68);
    ctx.bezierCurveTo(cx, cy - 68, cx + 22, cy - 36, cx + 16, cy - 5);
    ctx.closePath();
    ctx.fillStyle = flameGrad;
    ctx.shadowColor = '#ffa500';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.restore();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  if (cardNameInput) cardNameInput.addEventListener('input', drawGreetingCard);
  const cardDeptCheckboxes = document.querySelectorAll('#card-dept-checkboxes input[type="checkbox"]');
  cardDeptCheckboxes.forEach(cb => cb.addEventListener('change', drawGreetingCard));
  if (cardQuoteSelect) cardQuoteSelect.addEventListener('change', drawGreetingCard);

  if (btnDownloadCard && greetingCanvas) {
    btnDownloadCard.addEventListener('click', () => {
      soundEngine.ensureAudioContext();
      drawGreetingCard();
      const link = document.createElement('a');
      const sanitizedName = (cardNameInput.value || 'Word-Wizards-Member').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `Diwali_Gift_Word_Wizards_${sanitizedName}.png`;
      link.href = greetingCanvas.toDataURL('image/png');
      link.click();
      soundEngine.playSweetChime();
      showToast('🎁 Word Wizards Member Keepsake Card Downloaded! Share it proudly! ✨');
    });
  }

  if (btnCopyWish) {
    btnCopyWish.addEventListener('click', () => {
      soundEngine.ensureAudioContext();
      const name = cardNameInput && cardNameInput.value.trim() ? cardNameInput.value.trim() : 'Shaurya Anchal';
      const depts = getSelectedCardDepartments();
      const quote = cardQuoteSelect ? cardQuoteSelect.value : 'May the sacred light of Diwali inspire your voice, elevate your intellect, and bring triumph in all your endeavors.';
      const deptStr = depts.join(', ');

      const textToCopy = `🪔✨ *HAPPY DIWALI FROM WORD WIZARDS!* ✨🪔\n\n` +
        `"${quote}"\n\n` +
        `Warmest festive wishes specially presented to: *${name}*\n` +
        `✦ *${deptStr}*\n` +
        `Word Wizards • First Year Student Development Society (ADGIPS) 🌟\n` +
        `Official Instagram: @word.wizards.adgips\n` +
        `Celebrate with us: ${window.location.href}`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        soundEngine.playSweetChime();
        showToast('📋 Diwali greeting copied to clipboard! Share on WhatsApp!');
      }).catch(() => {
        showToast('Greeting text ready!');
      });
    });
  }

  setTimeout(drawGreetingCard, 250);

  // --------------------------------------------------------------------------
  // 5. FEATURE 2: FESTIVE GIFT VAULT (SOAN PAPDI & MEMBER GIFTS)
  // --------------------------------------------------------------------------
  const btnUnboxSoan = document.getElementById('btn-unbox-soan');
  const soanUnboxPanel = document.getElementById('soan-unbox-panel');
  const btnEatSoan = document.getElementById('btn-eat-soan');
  const btnPassSoan = document.getElementById('btn-pass-soan');
  const soanTallySpan = document.getElementById('soan-tally');
  const soanPassTracker = document.getElementById('soan-pass-tracker');

  let soanEatenCount = 0;
  let soanPassChainCount = 1;

  const DEPARTMENTS = [
    'Technical', 'Anchoring', 'Graphics', 'Video Editing',
    'Research & Content', 'Event Management', 'Creative',
    'PR & Sponsorship', 'Social Media'
  ];

  if (btnUnboxSoan) {
    btnUnboxSoan.addEventListener('click', () => {
      soanUnboxPanel.classList.toggle('show');
      if (soanUnboxPanel.classList.contains('show')) {
        soundEngine.playSweetChime();
        showToast('🎁 Soan Papdi box unboxed! Golden flakes, pistachios & pure Diwali love!');
      }
    });
  }

  if (btnEatSoan) {
    btnEatSoan.addEventListener('click', () => {
      soanEatenCount++;
      soundEngine.playSweetChime();
      if (soanTallySpan) soanTallySpan.textContent = `${soanEatenCount} Pieces Relished`;
      showToast('😋 Delicious! Flaky Soan Papdi melting in your mouth! Happy Diwali!');
      launchRocket(width * 0.5, height * 0.3);
    });
  }

  if (btnPassSoan) {
    btnPassSoan.addEventListener('click', () => {
      soanPassChainCount++;
      const fromDept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
      let toDept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
      while (toDept === fromDept) {
        toDept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
      }

      soundEngine.playBellChime(622.25, 0.25, 2.0);
      if (soanPassTracker) {
        soanPassTracker.innerHTML = `📦 <strong>The Sacred Chain:</strong> Passed from <em>${fromDept}</em> to <em>${toDept}</em>! (Total regifts across ADGIPS: ${soanPassChainCount})`;
      }
      showToast(`📦 Passed the Soan Papdi from ${fromDept} to ${toDept}! The legend lives on!`);
    });
  }

  // Fortune Scroll Unroll
  const btnUnrollFortune = document.getElementById('btn-unroll-fortune');
  const fortuneRevealBox = document.getElementById('fortune-reveal-box');
  const fortuneQuoteElem = document.getElementById('fortune-quote-text');
  const fortuneDestinyElem = document.getElementById('fortune-destiny-text');

  const FORTUNES = [
    { quote: "“Your voice will anchor a breakthrough debate this semester and inspire your peers.”", destiny: "Destiny: Master Orator of the First Year" },
    { quote: "“A creative design or video project you craft will trend campus-wide and earn leadership acclaim.”", destiny: "Destiny: Visual Prodigy of Word Wizards" },
    { quote: "“Your technical prowess will solve a critical backstage puzzle when it matters most.”", destiny: "Destiny: Unsung Hero of the Technical Wing" },
    { quote: "“Your pen will capture hearts in the college editorial, sparking profound discussions.”", destiny: "Destiny: Wordsmith of High Distinction" },
    { quote: "“A key sponsorship pitch led by your department will unlock grand festivities for ADGIPS.”", destiny: "Destiny: Strategic Vanguard of PR" }
  ];

  if (btnUnrollFortune) {
    btnUnrollFortune.addEventListener('click', () => {
      const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      fortuneQuoteElem.textContent = f.quote;
      fortuneDestinyElem.textContent = f.destiny;
      fortuneRevealBox.classList.add('show');
      soundEngine.playBellChime(523.25, 0.3, 3.0);
      showToast('📜 Your Word Wizards Diwali Fortune has been revealed!');
    });
  }

  // Department Badge Claim
  const btnClaimBadge = document.getElementById('btn-claim-badge');
  const badgeDeptSelect = document.getElementById('badge-dept-select');

  if (btnClaimBadge) {
    btnClaimBadge.addEventListener('click', () => {
      const dept = badgeDeptSelect ? badgeDeptSelect.value : 'Word Wizards';
      soundEngine.playSweetChime();
      showToast(`🌟 Official 1st Year Badge for ${dept} Department claimed! Happy Diwali!`);
      launchRocket(width * 0.4, height * 0.25);
    });
  }

  // --------------------------------------------------------------------------
  // 6. FEATURE 3: VIRTUAL FIRECRACKER SIMULATOR (PATAKHA ARCADE)
  // --------------------------------------------------------------------------
  const arenaCanvas = document.getElementById('patakha-arena-canvas');
  const arenaCtx = arenaCanvas ? arenaCanvas.getContext('2d') : null;
  const patakhaCards = document.querySelectorAll('.patakha-item-card');
  const btnBurstSelected = document.getElementById('btn-burst-selected');
  const btnDhamakaAll = document.getElementById('btn-chain-dhamaka');
  const btnClearArena = document.getElementById('btn-clear-arena');
  const ecoCrackerCountSpan = document.getElementById('eco-cracker-count');

  let selectedCrackerType = 'anaar';
  let totalCrackersBurst = 0;
  const activeCrackers = [];
  const arenaParticles = [];

  function resizeArena() {
    if (!arenaCanvas) return;
    const rect = arenaCanvas.parentElement.getBoundingClientRect();
    arenaCanvas.width = rect.width;
    arenaCanvas.height = rect.height;
  }
  window.addEventListener('resize', resizeArena);
  setTimeout(resizeArena, 200);

  patakhaCards.forEach((card) => {
    card.addEventListener('click', () => {
      patakhaCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      selectedCrackerType = card.dataset.type;
      const name = card.querySelector('.patakha-name').innerText;
      showToast(`Selected ${name}! Tap the ground or hit 'Burst Selected Patakha'. 🧨`);
    });
  });

  class ArenaCracker {
    constructor(type, x, y) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.timer = 0;
      this.angle = 0;
      this.spinSpeed = 0.05;
      this.isDead = false;

      soundEngine.ensureAudioContext();
      soundEngine.playIgnitionSound();

      if (type === 'anaar') soundEngine.playAnaarSound(3.8);
      else if (type === 'chakri') soundEngine.playChakriSound(4.2);
      else if (type === 'rocket') soundEngine.playRocketWhoosh();
      else if (type === 'bomb') soundEngine.playFuseSizzle();
      else if (type === 'ladi') soundEngine.playFuseSizzle();
      else if (type === 'phuljhadi') soundEngine.playSparklerCrackle();
    }

    update() {
      this.timer++;

      if (this.type === 'anaar') {
        if (this.timer < 220) {
          const intensity = Math.min(this.timer / 30, 1) * (1 - this.timer / 240);
          const sparkCount = Math.floor(intensity * 14) + 4;
          for (let i = 0; i < sparkCount; i++) {
            const spreadAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.95;
            const power = (Math.random() * 7 + 4) * (0.6 + intensity * 0.7);
            const isSilver = Math.random() > 0.6;
            arenaParticles.push({
              x: this.x + (Math.random() - 0.5) * 8,
              y: this.y - 12,
              vx: Math.cos(spreadAngle) * power,
              vy: Math.sin(spreadAngle) * power,
              gravity: 0.18,
              drag: 0.985,
              alpha: 1,
              decay: Math.random() * 0.02 + 0.015,
              size: Math.random() * 2.8 + 1.2,
              color: isSilver ? '#ffffff' : (Math.random() > 0.4 ? '#ffd700' : '#ff7800')
            });
          }
        } else {
          this.isDead = true;
        }
      } else if (this.type === 'chakri') {
        if (this.timer < 240) {
          this.angle += this.spinSpeed;
          this.spinSpeed = Math.min(this.spinSpeed + 0.008, 0.55);
          this.x += Math.sin(this.timer * 0.06) * 1.2;
          this.y += Math.cos(this.timer * 0.06) * 0.6;

          for (let j = 0; j < 3; j++) {
            const jetAngle = this.angle + (j * Math.PI * 2) / 3;
            for (let k = 0; k < 4; k++) {
              const speed = Math.random() * 4.5 + 2.5;
              arenaParticles.push({
                x: this.x + Math.cos(jetAngle) * 14,
                y: this.y + Math.sin(jetAngle) * 7,
                vx: Math.cos(jetAngle) * speed,
                vy: Math.sin(jetAngle) * speed * 0.5,
                gravity: 0.06,
                drag: 0.96,
                alpha: 1,
                decay: Math.random() * 0.04 + 0.02,
                size: Math.random() * 2.4 + 1.2,
                color: Math.random() > 0.3 ? '#ffd700' : '#00ffc8'
              });
            }
          }
        } else {
          this.isDead = true;
        }
      } else if (this.type === 'ladi') {
        if (this.timer % 4 === 0 && this.timer < 180) {
          soundEngine.playLadiPop();
          const popX = this.x + (Math.random() - 0.5) * 60;
          const popY = this.y + (Math.random() - 0.5) * 30;

          for (let i = 0; i < 12; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = Math.random() * 4 + 1;
            const isRedPaper = Math.random() > 0.4;
            arenaParticles.push({
              x: popX,
              y: popY,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 1,
              gravity: 0.09,
              drag: 0.95,
              alpha: 1,
              decay: Math.random() * 0.03 + 0.02,
              size: isRedPaper ? 3.5 : 2,
              color: isRedPaper ? '#e53935' : '#fff176'
            });
          }
        }
        if (this.timer >= 180) this.isDead = true;
      } else if (this.type === 'bomb') {
        if (this.timer < 65) {
          const fuseX = this.x;
          const fuseY = this.y - 18;
          arenaParticles.push({
            x: fuseX,
            y: fuseY,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 2,
            gravity: 0.05,
            drag: 0.95,
            alpha: 1,
            decay: 0.06,
            size: 2,
            color: '#ffd54f'
          });
        } else if (this.timer === 65) {
          soundEngine.playSutliBombSound();
          triggerScreenShake();

          for (let i = 0; i < 90; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = Math.random() * 8 + 2;
            arenaParticles.push({
              x: this.x,
              y: this.y - 10,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 2,
              gravity: 0.12,
              drag: 0.96,
              alpha: 1,
              decay: Math.random() * 0.025 + 0.015,
              size: Math.random() * 4 + 2,
              color: Math.random() > 0.5 ? '#ffeb3b' : (Math.random() > 0.5 ? '#ff5722' : '#76ff03')
            });
          }
          this.isDead = true;
        }
      } else if (this.type === 'rocket') {
        if (this.timer < 50) {
          this.y -= 4.8;
          for (let k = 0; k < 3; k++) {
            arenaParticles.push({
              x: this.x + (Math.random() - 0.5) * 4,
              y: this.y + 12,
              vx: (Math.random() - 0.5) * 1.5,
              vy: Math.random() * 3 + 2,
              gravity: 0.05,
              drag: 0.96,
              alpha: 1,
              decay: 0.05,
              size: 2.5,
              color: '#ff9800'
            });
          }
        } else if (this.timer === 50) {
          soundEngine.playFireworkBoom();
          for (let i = 0; i < 70; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = Math.random() * 6 + 1.5;
            arenaParticles.push({
              x: this.x,
              y: this.y,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              gravity: 0.06,
              drag: 0.97,
              alpha: 1,
              decay: Math.random() * 0.02 + 0.01,
              size: Math.random() * 3 + 1.5,
              color: Math.random() > 0.4 ? '#e040fb' : '#00e5ff'
            });
          }
          this.isDead = true;
        }
      } else if (this.type === 'phuljhadi') {
        if (this.timer < 180) {
          for (let i = 0; i < 6; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = Math.random() * 4 + 1;
            const colors = ['#fff7a0', '#00e5ff', '#ff4081', '#76ff03'];
            arenaParticles.push({
              x: this.x,
              y: this.y - 25,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              gravity: 0.08,
              drag: 0.95,
              alpha: 1,
              decay: 0.04,
              size: Math.random() * 2.2 + 1,
              color: colors[Math.floor(Math.random() * colors.length)]
            });
          }
          soundEngine.playSparklerCrackle();
        } else {
          this.isDead = true;
        }
      }
    }

    draw(ctx) {
      ctx.save();
      if (this.type === 'anaar') {
        ctx.beginPath();
        ctx.moveTo(this.x - 14, this.y);
        ctx.lineTo(this.x + 14, this.y);
        ctx.lineTo(this.x + 4, this.y - 22);
        ctx.lineTo(this.x - 4, this.y - 22);
        ctx.closePath();
        ctx.fillStyle = '#b7410e';
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (this.type === 'chakri') {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#00e676';
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      } else if (this.type === 'ladi') {
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x - 30, this.y);
        ctx.lineTo(this.x + 30, this.y);
        ctx.stroke();
      } else if (this.type === 'bomb') {
        ctx.beginPath();
        ctx.arc(this.x, this.y - 8, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#2e7d32';
        ctx.fill();
        ctx.strokeStyle = '#cddc39';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 18);
        ctx.lineTo(this.x, this.y - 24);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (this.type === 'rocket') {
        ctx.beginPath();
        ctx.rect(this.x - 3, this.y - 20, 6, 20);
        ctx.fillStyle = '#d500f9';
        ctx.fill();
      } else if (this.type === 'phuljhadi') {
        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y - 30);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function spawnCracker(type, x, y) {
    soundEngine.ensureAudioContext();
    if (!arenaCanvas) return;
    const cw = arenaCanvas.width;
    const ch = arenaCanvas.height;

    const placeX = x !== undefined ? x : cw * 0.2 + Math.random() * (cw * 0.6);
    const placeY = y !== undefined ? y : ch * 0.75 + (Math.random() - 0.5) * 35;

    activeCrackers.push(new ArenaCracker(type, placeX, placeY));
    totalCrackersBurst++;
    if (ecoCrackerCountSpan) {
      ecoCrackerCountSpan.textContent = `${totalCrackersBurst} Eco-Crackers Burst! 🌿`;
    }
  }

  function triggerScreenShake() {
    document.body.classList.remove('screen-shake');
    void document.body.offsetWidth;
    document.body.classList.add('screen-shake');
    setTimeout(() => {
      document.body.classList.remove('screen-shake');
    }, 480);
  }

  function handleArenaBurst(clientX, clientY) {
    if (!arenaCanvas) return;
    const rect = arenaCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    spawnCracker(selectedCrackerType, x, y);
  }

  if (arenaCanvas) {
    arenaCanvas.addEventListener('click', (e) => {
      handleArenaBurst(e.clientX, e.clientY);
    });
    arenaCanvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        e.preventDefault();
        handleArenaBurst(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
  }

  if (btnBurstSelected) {
    btnBurstSelected.addEventListener('click', () => {
      spawnCracker(selectedCrackerType);
      showToast(`Ignited ${selectedCrackerType.toUpperCase()}! Enjoy the light show! ✨`);
    });
  }

  const btnToggleSfx = document.getElementById('btn-toggle-sfx');
  const sfxStatusIcon = document.getElementById('sfx-status-icon');
  const sfxStatusLabel = document.getElementById('sfx-status-label');

  if (btnToggleSfx) {
    btnToggleSfx.addEventListener('click', () => {
      const isSfxOn = soundEngine.toggleSfx();
      btnToggleSfx.classList.toggle('active', isSfxOn);
      btnToggleSfx.classList.toggle('muted', !isSfxOn);
      if (sfxStatusIcon) sfxStatusIcon.textContent = isSfxOn ? '🔊' : '🔇';
      if (sfxStatusLabel) sfxStatusLabel.textContent = isSfxOn ? 'Cracker Sound: ON' : 'Cracker Sound: OFF';
      if (isSfxOn) {
        soundEngine.playFirecrackerSnap(1.0);
        showToast('🔊 Firecracker sound effects enabled & tested!');
      } else {
        showToast('🔇 Firecracker sound effects muted.');
      }
    });
  }

  if (btnDhamakaAll) {
    btnDhamakaAll.addEventListener('click', () => {
      const allTypes = ['anaar', 'chakri', 'ladi', 'bomb', 'rocket', 'phuljhadi'];
      allTypes.forEach((t, i) => {
        setTimeout(() => {
          spawnCracker(t);
        }, i * 350);
      });
      showToast('🎆 DIWALI DHAMAKA! Chain reaction firecracker barrage ignited!');
    });
  }

  if (btnClearArena) {
    btnClearArena.addEventListener('click', () => {
      activeCrackers.length = 0;
      arenaParticles.length = 0;
      showToast('Patakha Arena swept clean! 🧹');
    });
  }

  function arenaRenderLoop() {
    requestAnimationFrame(arenaRenderLoop);
    if (!arenaCtx || !arenaCanvas) return;

    const cw = arenaCanvas.width;
    const ch = arenaCanvas.height;

    arenaCtx.clearRect(0, 0, cw, ch);

    const groundGrad = arenaCtx.createLinearGradient(0, ch * 0.65, 0, ch);
    groundGrad.addColorStop(0, 'rgba(28, 12, 54, 0.4)');
    groundGrad.addColorStop(1, 'rgba(10, 4, 20, 0.95)');
    arenaCtx.fillStyle = groundGrad;
    arenaCtx.fillRect(0, ch * 0.65, cw, ch * 0.35);

    arenaCtx.strokeStyle = 'rgba(245, 184, 46, 0.2)';
    arenaCtx.lineWidth = 1;
    arenaCtx.beginPath();
    arenaCtx.ellipse(cw / 2, ch * 0.8, cw * 0.42, ch * 0.14, 0, 0, Math.PI * 2);
    arenaCtx.stroke();

    for (let i = activeCrackers.length - 1; i >= 0; i--) {
      const c = activeCrackers[i];
      c.update();
      c.draw(arenaCtx);
      if (c.isDead) activeCrackers.splice(i, 1);
    }

    for (let i = arenaParticles.length - 1; i >= 0; i--) {
      const p = arenaParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        arenaParticles.splice(i, 1);
        continue;
      }

      arenaCtx.save();
      arenaCtx.globalAlpha = Math.max(0, p.alpha);
      arenaCtx.fillStyle = p.color;
      arenaCtx.shadowBlur = 6;
      arenaCtx.shadowColor = p.color;

      arenaCtx.beginPath();
      arenaCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      arenaCtx.fill();
      arenaCtx.restore();
    }
  }
  requestAnimationFrame(arenaRenderLoop);

  // --------------------------------------------------------------------------
  // 7. FIREWORKS DOCK & CONTROLS
  // --------------------------------------------------------------------------
  const btnLaunchOne = document.getElementById('btn-launch-firework');
  const btnFinale = document.getElementById('btn-grand-finale');
  const btnSparkler = document.getElementById('btn-toggle-sparkler');
  const btnSound = document.getElementById('btn-sound-toggle');
  const btnNavSound = document.getElementById('btn-nav-sound');

  if (btnLaunchOne) {
    btnLaunchOne.addEventListener('click', () => {
      const rx = width * 0.2 + Math.random() * (width * 0.6);
      const ry = height * 0.15 + Math.random() * (height * 0.3);
      launchRocket(rx, ry);
      showToast('Sky Rocket Launched! 🚀✨');
    });
  }

  function triggerGrandFinale() {
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const rx = width * 0.1 + Math.random() * (width * 0.8);
        const ry = height * 0.1 + Math.random() * (height * 0.4);
        launchRocket(rx, ry);
      }, i * 280);
    }
  }

  if (btnFinale) {
    btnFinale.addEventListener('click', () => {
      triggerGrandFinale();
      showToast('🎆 Grand Festive Fireworks Cascade Activated!');
    });
  }

  if (btnSparkler) {
    btnSparkler.addEventListener('click', () => {
      sparklerActive = !sparklerActive;
      btnSparkler.classList.toggle('active', sparklerActive);
      btnSparkler.innerHTML = sparklerActive
        ? `<span>✨</span> Sparkler Wand: On`
        : `<span>🪄</span> Sparkler Wand: Off`;
      showToast(sparklerActive ? 'Sparkler Wand Active! Move your cursor to sparkle.' : 'Sparkler Wand Deactivated.');
    });
  }

  function handleSoundToggle() {
    const isPlaying = soundEngine.toggleSound();
    const label = isPlaying ? 'Festive Music: Playing ♫' : 'Festive Music: Muted 🔇';

    if (btnSound) {
      btnSound.classList.toggle('active', isPlaying);
      btnSound.querySelector('.btn-label').textContent = label;
    }
    if (btnNavSound) {
      btnNavSound.classList.toggle('active', isPlaying);
      btnNavSound.querySelector('.btn-label').textContent = isPlaying ? 'Ambience: On' : 'Sound';
    }

    showToast(isPlaying ? 'Festive Classical Ambience & Chimes Started 🪕' : 'Audio Muted 🔇');
  }

  if (btnSound) btnSound.addEventListener('click', handleSoundToggle);
  if (btnNavSound) btnNavSound.addEventListener('click', handleSoundToggle);

  // --------------------------------------------------------------------------
  // 8. FEATURE 4: LIVE COMMUNITY WISHING WELL (ACTUAL MESSAGES & MULTI-DEPT)
  // --------------------------------------------------------------------------
  const wishForm = document.getElementById('diwali-wish-form');
  const wishesStream = document.getElementById('wishes-stream');
  const wishCountPill = document.getElementById('wish-count-pill');
  const deptFilterButtons = document.querySelectorAll('.dept-pill-btn');

  let currentDeptFilter = 'all';

  function getSelectedWishDepartments() {
    const checkboxes = document.querySelectorAll('#wish-dept-checkboxes input[type="checkbox"]:checked');
    const depts = Array.from(checkboxes).map(cb => cb.value);
    return depts.length > 0 ? depts : ['General'];
  }

  function getStoredDeptWishes() {
    try {
      const stored = localStorage.getItem('ww_live_wishes_v4');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return []; // Start clean with 0 mock messages; only actual messages dropped by users!
  }

  function saveDeptWishes(wishes) {
    try {
      localStorage.setItem('ww_live_wishes_v4', JSON.stringify(wishes));
    } catch (e) {}
  }

  let activeDeptWishes = getStoredDeptWishes();

  // Instant Cross-Viewer Sync via BroadcastChannel
  const wishesChannel = window.BroadcastChannel ? new BroadcastChannel('ww_wishes_broadcast_v4') : null;
  if (wishesChannel) {
    wishesChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'NEW_WISH' && event.data.wish) {
        const incomingWish = event.data.wish;
        if (!activeDeptWishes.some(w => w.id === incomingWish.id)) {
          activeDeptWishes.unshift(incomingWish);
          saveDeptWishes(activeDeptWishes);
          renderDeptWishes();
          const deptsText = Array.isArray(incomingWish.departments) ? incomingWish.departments.join(', ') : (incomingWish.department || 'Word Wizards');
          spawnSkyLantern(incomingWish.author, deptsText);
          soundEngine.playBellChime(587.33, 0.25, 2.5);
          showToast(`🏮 New Diwali Wish dropped by ${incomingWish.author}!`);
        }
      }
    };
  }

  // Cross-Tab fallback sync via localStorage storage event
  window.addEventListener('storage', (e) => {
    if (e.key === 'ww_live_wishes_v4' && e.newValue) {
      try {
        activeDeptWishes = JSON.parse(e.newValue);
        renderDeptWishes();
      } catch (err) {}
    }
  });

  // Optional background fetch sync if running on local python server with /api/wishes
  async function syncWithServer() {
    try {
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const serverWishes = await res.json();
        if (Array.isArray(serverWishes)) {
          const existingIds = new Set(activeDeptWishes.map(w => w.id));
          let hasNew = false;
          serverWishes.forEach(sw => {
            if (!existingIds.has(sw.id)) {
              activeDeptWishes.unshift(sw);
              hasNew = true;
            }
          });
          if (hasNew) {
            saveDeptWishes(activeDeptWishes);
            renderDeptWishes();
          }
        }
      }
    } catch (e) {
      // Offline or static file execution, graceful fallback to BroadcastChannel + localStorage
    }
  }

  setInterval(syncWithServer, 4500);
  syncWithServer();

  function renderDeptWishes() {
    if (!wishesStream) return;
    wishesStream.innerHTML = '';

    const filtered = currentDeptFilter === 'all'
      ? activeDeptWishes
      : activeDeptWishes.filter((w) => {
          if (Array.isArray(w.departments)) {
            return w.departments.some(d => d.toLowerCase() === currentDeptFilter.toLowerCase());
          }
          return (w.department || '').toLowerCase() === currentDeptFilter.toLowerCase();
        });

    if (filtered.length === 0) {
      if (activeDeptWishes.length === 0) {
        wishesStream.innerHTML = `
          <div style="text-align: center; padding: 2.8rem 1.25rem; color: #d0c0e0;">
            <div style="font-size: 3rem; margin-bottom: 0.6rem;">🪔</div>
            <h4 style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--gold-200); margin-bottom: 0.4rem;">No Wishes Dropped Yet</h4>
            <p style="font-size: 0.92rem; color: var(--text-secondary); max-width: 440px; margin: 0 auto 1.25rem; line-height: 1.55;">
              Be the very first first-year Word Wizard to release a Sky Lantern and share your festive Deepavali blessing with the society!
            </p>
            <span style="font-size: 0.78rem; color: var(--marigold); background: rgba(255, 153, 0, 0.12); border: 1px solid rgba(255, 153, 0, 0.3); padding: 0.35rem 0.85rem; border-radius: 9999px;">
              ✨ Live broadcast sync enabled for all visitors
            </span>
          </div>
        `;
      } else {
        wishesStream.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem; color: #a894b8;">
            <p>No wishes yet from the <strong>${escapeHtml(currentDeptFilter)}</strong> department!</p>
            <p style="font-size: 0.85rem; margin-top: 0.5rem; color: #ffd768;">Be the first first-year wizard in ${escapeHtml(currentDeptFilter)} to release a Sky Lantern!</p>
          </div>
        `;
      }
    } else {
      filtered.forEach((w) => {
        const tile = document.createElement('div');
        tile.className = 'wish-tile';
        const depts = Array.isArray(w.departments) ? w.departments : (w.department ? [w.department] : ['Word Wizards']);
        const tagsHtml = depts.map(d => `<span class="wish-dept-tag">✦ ${escapeHtml(d)}</span>`).join(' ');

        tile.innerHTML = `
          <div class="wish-meta">
            <span class="wish-author">${escapeHtml(w.author)}</span>
            <div class="wish-dept-tags-wrap">${tagsHtml}</div>
          </div>
          <p class="wish-body">${escapeHtml(w.body)}</p>
          <div class="wish-time">${escapeHtml(w.time || 'Festive Dispatch')}</div>
        `;
        wishesStream.appendChild(tile);
      });
    }

    if (wishCountPill) {
      wishCountPill.textContent = `${activeDeptWishes.length} Community Wishes`;
    }
  }

  deptFilterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      deptFilterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentDeptFilter = btn.dataset.dept;
      renderDeptWishes();
      showToast(`Filtering wishes for: ${btn.innerText}`);
    });
  });

  function spawnSkyLantern(authorName, deptName) {
    const flyer = document.createElement('div');
    flyer.className = 'sky-lantern-flyer';
    const randomLeft = 10 + Math.random() * 80;
    flyer.style.left = `${randomLeft}vw`;

    flyer.innerHTML = `
      <div class="lantern-orb"></div>
      <span class="lantern-author-tag">🪔 ${escapeHtml(authorName)} (${escapeHtml(deptName)})</span>
    `;
    document.body.appendChild(flyer);

    setTimeout(() => {
      flyer.remove();
    }, 9500);
  }

  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      soundEngine.ensureAudioContext();

      const nameInput = document.getElementById('wish-name');
      const author = nameInput ? nameInput.value.trim() : '';
      const departments = getSelectedWishDepartments();
      const bodyInput = document.getElementById('wish-text');
      const body = bodyInput ? bodyInput.value.trim() : '';

      if (!author || !body) {
        showToast('Please enter your name and festive wish!');
        return;
      }

      const newWish = {
        id: 'ww_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        author,
        departments,
        department: departments.join(' • '),
        body,
        time: 'Just now',
        timestamp: Date.now()
      };

      activeDeptWishes.unshift(newWish);
      saveDeptWishes(activeDeptWishes);
      renderDeptWishes();

      // Broadcast to other tabs/windows in real time
      if (wishesChannel) {
        try {
          wishesChannel.postMessage({ type: 'NEW_WISH', wish: newWish });
        } catch (err) {}
      }

      // Send to local server if running
      try {
        fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newWish)
        }).catch(() => {});
      } catch (err) {}

      spawnSkyLantern(author, departments.join(', '));
      launchRocket(width * 0.5, height * 0.25);
      soundEngine.playBellChime(587.33, 0.35, 3.0);
      showToast(`Thank you, ${author}! Your Sky Lantern has taken flight for ${departments.join(', ')}! 🏮✨`);

      if (bodyInput) bodyInput.value = '';
    });
  }

  renderDeptWishes();

  // --------------------------------------------------------------------------
  // 9. UTILITY TOAST NOTIFICATION
  // --------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 3800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

})();
