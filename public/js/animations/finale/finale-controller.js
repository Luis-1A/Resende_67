import { cl, ez, L, glow, CG, G, TAU, hexToRgb, syncDynamicTextContrast } from '../../utils.js';
import { particleSystem } from '../../visual-engine/particle-system.js';
import { finaleAudioSync } from './finale-audio-sync.js';
import { finaleTimeline, FINALE_SPEED_SCALE } from './finale-timeline.js';
import { FINALE_PALETTES } from './config/finale-effects.js';

import { finaleGoldenParticles } from './effects/golden-particles.js';
import { finaleStars } from './effects/stars.js';
import { finaleButterflies } from './effects/butterflies.js';
import { finaleFlowers } from './effects/flowers.js';
import { finalePetals } from './effects/petals.js';
import { finaleFireworks } from './effects/fireworks.js';
import { finaleBalloons } from './effects/balloons.js';
import { finaleConfetti } from './effects/confetti.js';
import { finaleLanterns } from './effects/lanterns.js';

import act01 from './acts/act-01-surprise.js';
import act02 from './acts/act-02-garden.js';
import act03 from './acts/act-03-fireworks.js';
import act04 from './acts/act-04-stars.js';
import act05 from './acts/act-05-party.js';
import act06 from './acts/act-06-reveal.js';
import act07 from './acts/act-07-friendship.js';
import act08 from './acts/act-08-petals.js';
import act09 from './acts/act-09-grand-fireworks.js';
import act10 from './acts/act-10-birthday-title.js';
import act11 from './acts/act-11-final-message.js';
import act12 from './acts/act-12-last-surprise.js';

function lerpRgbStr(a, b, k) {
  const r = Math.round(L(a[0], b[0], k));
  const g = Math.round(L(a[1], b[1], k));
  const bl = Math.round(L(a[2], b[2], k));
  return `rgb(${r},${g},${bl})`;
}

export const grandFinaleAnimation = {
  name: 'grandFinale',
  layer: 4,
  worldSpace: false,
  _ctx: null,
  _active: false,
  _completed: false,
  _textActive: false,
  _textWrap: null,
  _timers: [],
  _camZoom: 1,
  _targetCamZoom: 1,
  _atmo: {
    curCols: FINALE_PALETTES.deepNight.map(hexToRgb),
    fromCols: FINALE_PALETTES.deepNight.map(hexToRgb),
    toCols: FINALE_PALETTES.deepNight.map(hexToRgb),
    colBlend: 1,
    horizonGlow: 0.1,
    targetHorizonGlow: 0.1,
    lightRays: 0.05,
    targetLightRays: 0.05,
    dim: 0.2,
    targetDim: 0.2,
    mistShift: 0
  },
  _M0: [],
  _M1: [],
  _lastSizeKey: '',

  init(ctx) {
    this._ctx = ctx;
    this._active = false;
    this._completed = false;
    this._textActive = false;
    this._timers = [];
    this._camZoom = 1;
    this._targetCamZoom = 1;

    finaleTimeline.registerActs({
      act01, act02, act03, act04, act05, act06,
      act07, act08, act09, act10, act11, act12
    });
  },

  play() {
    this.destroy();
    this._active = true;
    this._completed = false;
    this._textActive = false;
    this._camZoom = 1;
    this._targetCamZoom = 1;

    const baseCols = FINALE_PALETTES.deepNight.map(hexToRgb);
    this._atmo = {
      curCols: baseCols.map(c => [...c]),
      fromCols: baseCols.map(c => [...c]),
      toCols: baseCols.map(c => [...c]),
      colBlend: 1,
      horizonGlow: 0.08,
      targetHorizonGlow: 0.08,
      lightRays: 0.04,
      targetLightRays: 0.04,
      dim: 0.25,
      targetDim: 0.25,
      mistShift: 0
    };

    finaleGoldenParticles.init();
    finaleStars.init();
    finaleButterflies.init();
    finaleFlowers.init();
    finalePetals.init();
    finaleFireworks.init();
    finaleBalloons.init();
    finaleConfetti.init();
    finaleLanterns.init();
    finaleTimeline.reset();

    this._ensureStageElement();
  },

  _ensureStageElement() {
    if (!this._ctx || !this._ctx.tx) return;
    const tx = this._ctx.tx;
    tx.innerHTML = '';
    const stage = document.createElement('div');
    stage.className = 'finale-stage';
    tx.appendChild(stage);
    this._textWrap = stage;
  },

  _buildContext() {
    return {
      stars: finaleStars,
      gold: finaleGoldenParticles,
      butterflies: finaleButterflies,
      flowers: finaleFlowers,
      petals: finalePetals,
      fireworks: finaleFireworks,
      balloons: finaleBalloons,
      confetti: finaleConfetti,
      lanterns: finaleLanterns,
      setCameraZoom: z => { this._targetCamZoom = z; },
      setAtmosphere: cfg => {
        if (cfg.skyColors) {
          this._atmo.fromCols = this._atmo.curCols.map(c => [...c]);
          this._atmo.toCols = cfg.skyColors.map(hexToRgb);
          this._atmo.colBlend = 0;
        }
        if (cfg.horizonGlow !== undefined) this._atmo.targetHorizonGlow = cfg.horizonGlow;
        if (cfg.lightRays !== undefined) this._atmo.targetLightRays = cfg.lightRays;
        if (cfg.dim !== undefined) this._atmo.targetDim = cfg.dim;
        if (cfg.mistShift !== undefined) this._atmo.mistShift = cfg.mistShift;
      },
      showText: ({ lines = [], position = 'center' } = {}) => {
        if (!this._textWrap) return;
        this._textActive = lines.length > 0;
        this._textWrap.className = `finale-stage pos-${position}`;
        this._textWrap.innerHTML = '';
        lines.forEach((line, idx) => {
          const el = document.createElement('div');
          el.className = `finale-line ${line.variant || 'poetic'}`;
          el.textContent = line.text;
          this._textWrap.appendChild(el);
          if (!line.variant || !line.variant.includes('hidden')) {
            this._timers.push(setTimeout(() => el.classList.add('vis'), 40 + idx * 140));
          }
        });
      },
      shatterText: () => {
        if (!this._textWrap) return;
        this._textActive = false;
        [...this._textWrap.children].forEach(el => {
          el.classList.remove('vis');
          el.classList.add('shatter');
        });
        this._timers.push(setTimeout(() => {
          if (this._textWrap && !this._textActive) this._textWrap.innerHTML = '';
        }, 900));
      },
      clearText: () => {
        if (!this._textWrap) return;
        this._textActive = false;
        [...this._textWrap.children].forEach(el => el.classList.remove('vis'));
        this._timers.push(setTimeout(() => {
          if (this._textWrap && !this._textActive) this._textWrap.innerHTML = '';
        }, 750));
      }
    };
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
    this._textActive = false;
    this._timers.forEach(clearTimeout);
    this._timers = [];
    finaleTimeline.reset();
    particleSystem.clearPool('finaleGold');
    particleSystem.clearPool('finaleFW');
    if (this._ctx && this._ctx.tx) this._ctx.tx.innerHTML = '';
    this._textWrap = null;
  },

  _ensureMountains(W, H) {
    const key = `${W}x${H}`;
    if (this._lastSizeKey === key && this._M0.length) return;
    this._lastSizeKey = key;
    const sample = (base, amp, seed) => {
      const pts = [];
      for (let i = 0; i <= W + 24; i += 20) {
        pts.push([i, H * base - H * amp * (Math.sin(i * 0.004 + seed) + 0.5 * Math.sin(i * 0.011 + seed * 2) + 1.5) / 3]);
      }
      return pts;
    };
    this._M0 = sample(0.66, 0.14, 1);
    this._M1 = sample(0.79, 0.1, 4);
  },

  update(dt, env) {
    if (!this._active) return;

    const sDt = Math.min(0.05, Math.max(0, dt)) * FINALE_SPEED_SCALE;
    const api = this._buildContext();
    finaleTimeline.step(dt, api);

    // Smooth atmosphere interpolation
    const a = this._atmo;
    if (a.colBlend < 1) {
      a.colBlend = cl(a.colBlend + sDt * 0.42);
      const ek = ez(a.colBlend);
      for (let i = 0; i < 3; i++) {
        a.curCols[i] = [
          L(a.fromCols[i][0], a.toCols[i][0], ek),
          L(a.fromCols[i][1], a.toCols[i][1], ek),
          L(a.fromCols[i][2], a.toCols[i][2], ek)
        ];
      }
    }
    a.horizonGlow = L(a.horizonGlow, a.targetHorizonGlow, cl(sDt * 1.4));
    a.lightRays = L(a.lightRays, a.targetLightRays, cl(sDt * 1.4));
    a.dim = L(a.dim, a.targetDim, cl(sDt * 1.6));
    this._camZoom = L(this._camZoom, this._targetCamZoom, cl(sDt * 1.6));

    // Sync typography.css dynamic contrast variables live to the interpolated Canvas sky & glow
    syncDynamicTextContrast(a.curCols[1], cl(a.horizonGlow + a.lightRays * 1.4 - a.dim * 0.4));

    // Update all continuous effects cleanly (never reset across act transitions)
    finaleStars.update(sDt);
    finaleGoldenParticles.update(sDt, env);
    finaleFireworks.update(sDt);
    finaleLanterns.update(sDt, env);
    finaleFlowers.update(sDt);
    finaleBalloons.update(sDt, env);
    finaleConfetti.update(sDt, env);
    finaleButterflies.update(sDt, env);
    finalePetals.update(sDt, env);

    if (finaleTimeline.finished && !this._completed) {
      this._completed = true;
      if (this._ctx && typeof this._ctx.onFinish === 'function') {
        this._ctx.onFinish();
      }
    }
  },

  render(x, env) {
    if (!this._active) return;
    const { W, H, cx, R, RM } = env;
    this._ensureMountains(W, H);

    const a = this._atmo;
    const t = finaleTimeline.elapsed;
    const rhythm = finaleAudioSync.getIntensity(t);
    const beat = RM ? 0 : finaleAudioSync.getBeatPulse(t);

    // 1. Continuous Sky Backdrop
    const sky = x.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, lerpRgbStr(a.curCols[0], a.curCols[0], 1));
    sky.addColorStop(0.56, lerpRgbStr(a.curCols[1], a.curCols[1], 1));
    sky.addColorStop(1, lerpRgbStr(a.curCols[2], a.curCols[2], 1));
    x.fillStyle = sky;
    x.fillRect(0, 0, W, H);

    // Horizon radial luminescence modulated gently by silent beat curve & dimmed under active text
    const textDim = this._textActive ? 0.55 : 1;
    const hAlpha = cl(a.horizonGlow * (0.88 + 0.14 * rhythm + 0.06 * beat) * textDim);
    if (hAlpha > 0.01) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      glow(x, cx, H * 0.62, Math.max(W, H) * 0.78, hAlpha, G);
      x.restore();
    }

    // 2. Distant Stars & Shooting Stars
    finaleStars.render(x, env);

    // 3. Light Rays & Fireworks (behind mountains & garden depth)
    const rayAlpha = a.lightRays * textDim;
    if (rayAlpha > 0.01) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const bx = W * (0.2 + i * 0.2) + (RM ? 0 : Math.sin(R * 0.25 + i) * W * 0.03);
        const rg = x.createLinearGradient(bx, 0, bx + W * 0.08, H * 0.84);
        rg.addColorStop(0, `rgba(255,228,175,${rayAlpha})`);
        rg.addColorStop(1, 'rgba(255,228,175,0)');
        x.fillStyle = rg;
        x.beginPath();
        x.moveTo(bx - W * 0.03, 0);
        x.lineTo(bx + W * 0.03, 0);
        x.lineTo(bx + W * 0.16, H * 0.85);
        x.lineTo(bx - W * 0.04, H * 0.85);
        x.closePath();
        x.fill();
      }
      x.restore();
    }
    finaleFireworks.render(x, env);

    // 4. World-space camera zoom (mountains, distant lanterns, garden, balloons, golden particles)
    x.save();
    if (!RM && Math.abs(this._camZoom - 1) > 0.001) {
      x.translate(cx, H * 0.82);
      x.scale(this._camZoom, this._camZoom);
      x.translate(-cx, -H * 0.82);
    }

    // Distant mountain silhouettes + drifting mist
    const drawRidge = (col, pts) => {
      x.fillStyle = col;
      x.beginPath();
      x.moveTo(0, H);
      for (let i = 0; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
      x.lineTo(W, H);
      x.closePath();
      x.fill();
    };
    drawRidge('rgba(11,22,50,0.85)', this._M0);
    drawRidge('rgba(6,13,32,0.94)', this._M1);

    // Subtle mist band across horizon
    x.save();
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.09 + a.mistShift * 0.08;
    const mistX = ((R * (10 + a.mistShift * 18)) % (W * 1.5)) - W * 0.45;
    x.drawImage(CG, mistX, H * 0.64, W * 0.9, H * 0.15);
    x.restore();

    // Soft garden ground slope
    const gg = x.createLinearGradient(0, H * 0.82, 0, H);
    gg.addColorStop(0, 'rgba(10,36,30,0.92)');
    gg.addColorStop(1, '#030C0A');
    x.fillStyle = gg;
    x.fillRect(0, H * 0.84, W, H * 0.16);

    finaleLanterns.render(x, env);
    finaleFlowers.render(x, env);
    finaleBalloons.render(x, env);
    finaleGoldenParticles.render(x, env, this._textActive);
    x.restore();

    // 5. Foreground butterflies, confetti, petals & quiet atmospheric dim
    finaleConfetti.render(x, env);
    finaleButterflies.render(x, env);
    finalePetals.render(x, env, this._textActive);

    if (a.dim > 0.005) {
      x.fillStyle = `rgba(3,5,12,${cl(a.dim)})`;
      x.fillRect(0, 0, W, H);
    }
    x.globalAlpha = 1;
  }
};

export default grandFinaleAnimation;
