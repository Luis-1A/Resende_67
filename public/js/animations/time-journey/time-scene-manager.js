import { cl, ez, L, rnd, syncDynamicTextContrast } from '../../utils.js';
import { BIRTH_DATE, calculateExactAge } from './calendar-animation.js';
import { ParticleEngine } from './particle-engine.js';
import { starAnimation } from './star-animation.js';
import { flowerAnimation } from './flower-animation.js';
import { timelineAnimation } from './timeline-animation.js';
import { numberAnimation } from './number-animation.js';
import { gardenAnimation } from './garden-animation.js';
import { butterflyAnimation } from './butterfly-animation.js';
import { cameraAnimation } from './camera-animation.js';
import { transitionAnimation } from './transition-animation.js';

export const TIME_JOURNEY_DURATION = 55;

export const timeSceneManager = {
  elapsed: 0,
  finished: false,
  _paused: false,
  _engine: new ParticleEngine(720),
  _age: null,
  _cues: new Set(),
  _stageEl: null,
  _timers: [],
  _lastYearIdx: -1,
  _lastMonthIdx: -1,
  _lastDayVal: -1,
  _ambientTimer: 0,
  _portalParticleTimer: 0,

  init(txEl, { reducedMotion = false } = {}) {
    this.elapsed = 0;
    this.finished = false;
    this._paused = false;
    this._cues.clear();
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._lastYearIdx = -1;
    this._lastMonthIdx = -1;
    this._lastDayVal = -1;
    this._ambientTimer = 0;
    this._portalParticleTimer = 0;

    // Adaptive quality check for mobile/low-core devices while preserving hero elements
    const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
    const isNarrow = typeof window !== 'undefined' ? window.innerWidth <= 420 : false;
    const lowPower = reducedMotion || cores <= 4 || isNarrow;

    this._engine.configureQuality({ lowPower, maxCap: lowPower ? 360 : 720 });
    this._engine.clear();

    this._age = calculateExactAge(BIRTH_DATE, new Date());

    starAnimation.init(lowPower ? 65 : 105);
    flowerAnimation.init();
    timelineAnimation.init();
    numberAnimation.init(lowPower ? 140 : 220);
    gardenAnimation.init();
    butterflyAnimation.init();
    cameraAnimation.init();
    transitionAnimation.init();

    if (txEl) {
      txEl.innerHTML = '';
      const stage = document.createElement('div');
      stage.className = 'tj-stage';
      txEl.appendChild(stage);
      this._stageEl = stage;
    } else {
      this._stageEl = null;
    }

    syncDynamicTextContrast([6, 17, 46], 0.16, 'deep');
  },

  pause() {
    this._paused = true;
  },

  resume() {
    this._paused = false;
  },

  destroy(txEl) {
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._engine.clear();
    if (txEl) txEl.innerHTML = '';
    this._stageEl = null;
  },

  _showHtml(html, posClass = 'pos-center') {
    if (!this._stageEl) return;
    this._stageEl.className = `tj-stage ${posClass}`;
    this._stageEl.innerHTML = html;
  },

  _clearHtml() {
    if (!this._stageEl) return;
    [...this._stageEl.children].forEach(el => el.classList.remove('vis'));
    this._timers.push(setTimeout(() => {
      if (this._stageEl) this._stageEl.innerHTML = '';
    }, 650));
  },

  update(dt, env) {
    if (this._paused || this.finished) return;
    const safeDt = Math.min(0.05, Math.max(0, dt));
    this.elapsed = Math.min(TIME_JOURNEY_DURATION, this.elapsed + safeDt);
    const t = this.elapsed;

    // ------------------------------------------------------------------------
    // Continuous subtle ambient depth dust (separate decorative budget)
    // ------------------------------------------------------------------------
    this._ambientTimer += safeDt;
    if (this._ambientTimer >= (this._engine.lowPower ? 0.22 : 0.11) && t < 51) {
      this._ambientTimer = 0;
      const dawnQuiet = t > 32 && t < 40 ? 0.45 : 1;
      if (rnd() < dawnQuiet) {
        this._engine.spawn(rnd() < 0.55 ? 'luminousDust' : 'ambient', {
          sceneId: 'ambient',
          x: rnd(),
          y: 0.12 + rnd() * 0.78,
          z: 0.6 + rnd() * 0.9,
          vx: (rnd() < 0.35 ? 0.014 : 0) + (rnd() - 0.5) * 0.008,
          vy: -0.012 - rnd() * 0.018,
          maxLife: 4.0 + rnd() * 2.5
        });
      }
    }

    // ------------------------------------------------------------------------
    // PHASE 1 (0 - 7s): O CÉU E A PRIMEIRA LUZ
    // ------------------------------------------------------------------------
    if (t >= 0.8 && !this._cues.has('seedLight')) {
      this._cues.add('seedLight');
      // 1st particle appears slowly (0 -> 0.8 over 500ms) slightly above center
      this._engine.spawn('primaryGold', {
        sceneId: 'opening',
        x: 0.5,
        y: 0.43,
        maxLife: 2.8,
        fadeInDur: 0.5,
        alpha: 0.8,
        size: 3.0
      });
      // 2nd & 3rd orbiting particles staggered 120ms apart
      for (let i = 0; i < 2; i++) {
        this._engine.spawn('primaryGold', {
          sceneId: 'opening',
          behavior: 'orbit',
          tx: 0.5,
          ty: 0.43,
          orbitRadius: 0.032 + i * 0.022,
          orbitAngle: i * Math.PI,
          orbitSpeed: 1.5,
          delay: 0.14 + i * 0.12,
          maxLife: 3.2,
          size: 2.2
        });
      }
      // Staggered gathering particle groups (80-150ms apart)
      for (let g = 0; g < 18; g++) {
        const ang = (g / 18) * Math.PI * 2;
        this._engine.spawn(g % 3 === 0 ? 'primaryGold' : 'whiteSpark', {
          sceneId: 'opening',
          behavior: 'converge',
          x: 0.5 + Math.cos(ang) * (0.18 + rnd() * 0.12),
          y: 0.43 + Math.sin(ang) * (0.14 + rnd() * 0.1),
          tx: 0.5,
          ty: 0.43,
          delay: 0.45 + g * 0.11,
          maxLife: 2.4
        });
      }
    }

    if (t >= 3.0 && t < 7.0) {
      const k = ez(cl((t - 3.0) / 1.8));
      starAnimation.setStarState({ x: 0.5, y: 0.43, alpha: k, size: L(2, 10, k) });
    }

    if (t >= 5.0 && !this._cues.has('starPulse1')) {
      this._cues.add('starPulse1');
      starAnimation.triggerPulseWave({ x: 0.5, y: 0.43, maxR: 0.42, duration: 1.4, maxAlpha: 0.36 });
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        this._engine.spawn('dispersion', {
          sceneId: 'opening',
          x: 0.5 + Math.cos(a) * 0.02,
          y: 0.43 + Math.sin(a) * 0.02,
          vx: Math.cos(a) * 0.045,
          vy: Math.sin(a) * 0.035,
          maxLife: 1.2
        });
      }
    }

    if (t >= 5.9 && !this._cues.has('textStart')) {
      this._cues.add('textStart');
      this._showHtml('<div class="tj-line tj-mask vis">Toda história tem um começo...</div>', 'pos-low');
      for (let i = 0; i < 12; i++) {
        this._engine.spawn('whiteSpark', {
          sceneId: 'opening',
          x: L(0.28, 0.72, i / 11),
          y: 0.62 + (rnd() - 0.5) * 0.025,
          vx: 0.025,
          vy: -0.008,
          delay: i * 0.08,
          maxLife: 1.2
        });
      }
    }

    if (t >= 8.0 && !this._cues.has('textStartHide')) {
      this._cues.add('textStartHide');
      if (this._stageEl && this._stageEl.firstElementChild) {
        this._stageEl.firstElementChild.classList.add('fade-out');
      }
    }

    // ------------------------------------------------------------------------
    // PHASE 2 (7 - 14s): O NASCIMENTO — ESTRELA DESCE E VIRA FLOR
    // ------------------------------------------------------------------------
    let emitStarTrail = false;
    if (t >= 7.0 && t < 8.85) {
      emitStarTrail = true;
      const k = ez(cl((t - 7.0) / 1.85));
      const curveX = 0.5 + Math.sin(k * Math.PI) * 0.045;
      const curveY = L(0.43, 0.86, k);
      starAnimation.setStarState({ x: curveX, y: curveY, alpha: 1 - cl((t - 8.55) / 0.3), size: L(10, 6.5, k) });
    }

    if (t >= 8.8 && !this._cues.has('groundHit')) {
      this._cues.add('groundHit');
      starAnimation.triggerGroundContact(0.5, 0.86);
      starAnimation.setStarState({ alpha: 0, size: 0 });
      for (let i = 0; i < 18; i++) {
        this._engine.spawn('dispersion', {
          sceneId: 'birth',
          x: 0.5 + (rnd() - 0.5) * 0.03,
          y: 0.86,
          vx: (rnd() - 0.5) * 0.055,
          vy: -0.05 - rnd() * 0.06,
          maxLife: 1.1 + rnd() * 0.5
        });
      }
      // Birth hero flower begins rising right where the star touched soil
      flowerAnimation.addFlower({
        nx: 0.5,
        rootNy: 0.86,
        headNy: 0.56,
        headSize: 34,
        color: '#FFF9F4',
        innerColor: '#FFE1EE',
        delay: 0.1,
        growDuration: 3.4,
        curveBias: 0.14,
        isHero: true
      });
      gardenAnimation.setGardenGrowth(0.08);
    }

    if (t >= 11.9 && !this._cues.has('birthDateHtml')) {
      this._cues.add('birthDateHtml');
      this._showHtml(`
        <div class="tj-date-outline vis">22 DE NOVEMBRO · 2008</div>
        <div class="tj-line tj-caption vis">Tudo começou em ${this._age.birthLabel}.</div>
      `, 'pos-upper');
    }

    // ------------------------------------------------------------------------
    // PHASE 3 (14 - 25s): A PASSAGEM DOS ANOS
    // ------------------------------------------------------------------------
    if (t >= 14.0 && !this._cues.has('flowerDissolve')) {
      this._cues.add('flowerDissolve');
      this._clearHtml();
      flowerAnimation.startDissolveToTimeline(this._engine);
      timelineAnimation.activateLine();
    }

    if (t >= 14.5 && t < 25.0) {
      const buildK = cl((t - 14.5) / 2.2);
      const energy = cl(0.75 + (t - 15) / 14);
      timelineAnimation.setLineBuild(buildK, energy);
    }

    if (t >= 15.8 && t < 24.4) {
      const years = this._age.timelineYears;
      const totalY = years.length;
      const norm = cl((t - 15.8) / 8.3);
      // Accelerating time curve (starts leisurely ~1s, speeds smoothly toward current year)
      const accelNorm = Math.pow(norm, 1.38);
      const yIdx = Math.min(totalY - 1, Math.floor(accelNorm * totalY));
      if (yIdx !== this._lastYearIdx) {
        this._lastYearIdx = yIdx;
        numberAnimation.setYear(years[yIdx], { scale: 1, alpha: 1 });
        if (yIdx > 0 && (yIdx % 4 === 0 || yIdx === totalY - 1)) {
          timelineAnimation.triggerMilestoneSweep();
        }
      }
    }

    if (t >= 24.4 && t < 25.1) {
      const pulseK = cl((t - 24.4) / 0.6);
      numberAnimation.setYear(this._age.currentYear, { scale: L(1, 1.12, Math.sin(pulseK * Math.PI)), alpha: 1 - pulseK * 0.85 });
    }

    // ------------------------------------------------------------------------
    // PHASE 4 (25 - 32s): A PASSAGEM DOS MESES
    // ------------------------------------------------------------------------
    if (t >= 25.0 && !this._cues.has('monthsRing')) {
      this._cues.add('monthsRing');
      numberAnimation.hide();
      timelineAnimation.transitionLineToCircle(this._engine);
    }

    if (t >= 25.0 && t < 32.0) {
      const localM = t - 25.0;
      const ringProg = cl(localM / 1.6);
      const detachK = localM > 5.8 ? cl((localM - 5.8) / 1.2) : 0;
      const seq = this._age.elapsedMonthSequence;
      const monthCount = Math.max(1, seq.length);
      const monthPhase = localM > 1.5 ? cl((localM - 1.5) / 4.2) : 0;
      const mIdx = Math.min(monthCount - 1, Math.floor(monthPhase * monthCount));
      const activeObj = seq[mIdx] || { name: 'Novembro', monthIndex: 10 };

      timelineAnimation.setCircleState({
        ringProgress: ringProg,
        activeMonthIdx: activeObj.monthIndex,
        detachK,
        spinSpeed: L(0.35, 1.8, detachK)
      });

      if (localM >= 1.5 && detachK < 0.25 && mIdx !== this._lastMonthIdx) {
        this._lastMonthIdx = mIdx;
        this._showHtml(`
          <div class="tj-kicker vis">O TEMPO NÃO PAROU</div>
          <div class="tj-month vis">${activeObj.name}</div>
        `, 'pos-center');
      }
      if (detachK >= 0.35 && !this._cues.has('monthsClear')) {
        this._cues.add('monthsClear');
        this._clearHtml();
      }
    }

    // ------------------------------------------------------------------------
    // PHASE 5 (32 - 39s): A PASSAGEM DOS DIAS + AMANHECER DO CÉU
    // ------------------------------------------------------------------------
    if (t >= 32.0 && !this._cues.has('daysStart')) {
      this._cues.add('daysStart');
      timelineAnimation.hideAll();
      numberAnimation.startDaysCounter(0);
      this._showHtml('<div class="tj-kicker vis">DIAS QUE FORMARAM SUA HISTÓRIA</div>', 'pos-upper');
    }

    const skyBri = t >= 32.0 ? cl((t - 32.0) / 12.0) : 0;
    const rayAmt = t >= 33.5 ? cl((t - 33.5) / 7.5) * 0.72 : 0;
    gardenAnimation.setDawn(skyBri, rayAmt);

    if (t >= 32.0 && t < 38.7) {
      const dk = cl((t - 32.0) / 6.4);
      const targetDays = Math.max(1, this._age.days);
      const val = Math.min(this._age.days, Math.round(ez(dk) * targetDays));
      if (val !== this._lastDayVal || dk === 0) {
        this._lastDayVal = val;
        numberAnimation.setDayValue(val, this._engine);
      }
    }

    if (t >= 38.7 && !this._cues.has('daysStop')) {
      this._cues.add('daysStop');
      numberAnimation.setDayValue(this._age.days, null);
      this._clearHtml();
    }

    // ------------------------------------------------------------------------
    // PHASE 6 (39 - 47s): A CHEGADA AO PRESENTE + JARDIM + BORBOLETAS
    // ------------------------------------------------------------------------
    if (t >= 39.3 && !this._cues.has('presentStar')) {
      this._cues.add('presentStar');
      // Converge distant particles into central star (farther ones earlier)
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const dist = 0.2 + (i % 3) * 0.1;
        this._engine.spawn('primaryGold', {
          sceneId: 'present',
          behavior: 'converge',
          x: cl(0.5 + Math.cos(a) * dist, 0.04, 0.96),
          y: cl(0.28 + Math.sin(a) * dist * 0.65, 0.06, 0.65),
          tx: 0.5,
          ty: 0.28,
          delay: (1 - dist / 0.4) * 0.25,
          maxLife: 1.5
        });
      }
      starAnimation.setStarState({ x: 0.5, y: 0.28, alpha: 0.95, size: 11 });
      starAnimation.triggerPulseWave({ x: 0.5, y: 0.28, maxR: 0.68, duration: 1.6, maxAlpha: 0.34 });

      // Staggered garden flowers sprouting center-outward from soil
      const spots = [
        { nx: 0.50, delay: 0.6, sz: 24, col: '#FFF9F4' },
        { nx: 0.38, delay: 0.9, sz: 22, col: '#FFD9E8' },
        { nx: 0.62, delay: 1.0, sz: 22, col: '#FFF2CC' },
        { nx: 0.26, delay: 1.35, sz: 20, col: '#DCEBFF' },
        { nx: 0.74, delay: 1.45, sz: 20, col: '#FFD9E8' },
        { nx: 0.14, delay: 1.8, sz: 18, col: '#FFF9F4' },
        { nx: 0.86, delay: 1.9, sz: 18, col: '#F2DCFF' }
      ];
      spots.forEach(sp => {
        flowerAnimation.addFlower({
          nx: sp.nx,
          rootNy: 0.88 + rnd() * 0.04,
          headNy: 0.72 + rnd() * 0.06,
          headSize: sp.sz,
          color: sp.col,
          innerColor: '#FFFFFF',
          delay: sp.delay,
          growDuration: 2.6,
          curveBias: (sp.nx - 0.5) * 0.4
        });
      });

      // Multi-wing butterflies crossing at varied depths + 1 landing softly on center-right flower
      butterflyAnimation.spawn({ p0: { x: -0.05, y: 0.64 }, p1: { x: 0.32, y: 0.44 }, p2: { x: 1.06, y: 0.32 }, duration: 7.2, z: 0.88 });
      butterflyAnimation.spawn({ p0: { x: 1.05, y: 0.48 }, p1: { x: 0.68, y: 0.34 }, p2: { x: -0.06, y: 0.58 }, duration: 7.5, colorPrimary: '#FFE0EE', colorSecondary: '#FFF4DC', z: 1.15 });
      butterflyAnimation.spawn({
        p0: { x: 1.02, y: 0.36 },
        p1: { x: 0.78, y: 0.52 },
        p2: { x: 0.62, y: 0.71 },
        duration: 4.8,
        landing: true,
        colorPrimary: '#FFFFFF',
        colorSecondary: '#FFEEC6',
        z: 1.05
      });
    }

    if (t >= 39.5 && t < 47.0) {
      gardenAnimation.setGardenGrowth(cl((t - 39.5) / 4.2));
      starAnimation.setStarState({ alpha: cl(1 - (t - 44.5) / 2.2) * 0.92 });
    }

    if (t >= 41.2 && !this._cues.has('presentStatsHtml')) {
      this._cues.add('presentStatsHtml');
      numberAnimation.hide();
      const { years, months, days, currentLabel, elapsedSummary } = this._age;
      this._showHtml(`
        <div class="tj-kicker vis">HOJE · ${currentLabel.toUpperCase()}</div>
        <div class="tj-stats">
          <div class="tj-stat vis" style="transition-delay:0s">
            <span class="tj-stat-num">${years}</span>
            <span class="tj-stat-lbl">${years === 1 ? 'ANO' : 'ANOS'}</span>
          </div>
          <div class="tj-stat vis" style="transition-delay:0.45s">
            <span class="tj-stat-num">${months}</span>
            <span class="tj-stat-lbl">${months === 1 ? 'MÊS' : 'MESES'}</span>
          </div>
          <div class="tj-stat vis" style="transition-delay:0.9s">
            <span class="tj-stat-num">${days}</span>
            <span class="tj-stat-lbl">${days === 1 ? 'DIA' : 'DIAS'}</span>
          </div>
        </div>
        <div class="tj-line vis" style="transition-delay:1.25s">E olha só... quanto tempo já passou desde aquele dia.</div>
        <div class="tj-caption-strong vis" style="transition-delay:1.7s">${elapsedSummary}.</div>
      `, 'pos-center-high');
    }

    if (t >= 45.2 && !this._cues.has('notOverText')) {
      this._cues.add('notOverText');
      this._showHtml('<div class="tj-line vis">E a história ainda está longe de terminar.</div>', 'pos-center-high');
    }

    // ------------------------------------------------------------------------
    // PHASE 7 (47 - 55s): CAMINHO DOURADO, CÂMERA E PORTAL PARA O GRANDE ENCERRAMENTO
    // ------------------------------------------------------------------------
    if (t >= 47.0 && !this._cues.has('pathStart')) {
      this._cues.add('pathStart');
      this._clearHtml();
      numberAnimation.dissolveToPath(this._engine);
      butterflyAnimation.spawn({ p0: { x: 0.08, y: 0.72 }, p1: { x: 0.42, y: 0.56 }, p2: { x: 0.88, y: 0.42 }, duration: 6.0, z: 1.25 });
    }

    if (t >= 47.4) {
      const pathK = cl((t - 47.4) / 2.4);
      gardenAnimation.setPathState(pathK, 1);
    }

    if (t >= 48.5) {
      cameraAnimation.setAdvance(cl((t - 48.5) / 5.4));
    }

    if (t >= 51.0 && !this._cues.has('chapterHtml')) {
      this._cues.add('chapterHtml');
      this._showHtml('<div class="tj-chapter vis">Hoje celebramos mais um capítulo da sua história.</div>', 'pos-center');
    }

    if (t >= 51.4) {
      const portalOpen = cl((t - 51.4) / 2.8);
      const bloomFill = cl((t - 53.6) / 1.4);
      transitionAnimation.setPortalState(portalOpen, bloomFill);

      // Gentle portal edge sparks
      this._portalParticleTimer += safeDt;
      if (this._portalParticleTimer >= 0.14 && portalOpen < 0.95) {
        this._portalParticleTimer = 0;
        const a = rnd() * Math.PI * 2;
        this._engine.spawn('whiteSpark', {
          sceneId: 'portal',
          x: 0.5 + Math.cos(a) * L(0.06, 0.24, portalOpen),
          y: 0.54 + Math.sin(a) * L(0.08, 0.28, portalOpen),
          vx: Math.cos(a) * 0.025,
          vy: Math.sin(a) * 0.025 - 0.015,
          maxLife: 1.1
        });
      }
    }

    // Dynamic CSS text contrast tracking against dawn / night sky brightness
    const skyRgb = [
      Math.round(L(6, 36, skyBri)),
      Math.round(L(17, 74, skyBri)),
      Math.round(L(46, 134, skyBri))
    ];
    syncDynamicTextContrast(skyRgb, cl(0.16 + skyBri * 0.35 + rayAmt * 0.28));

    // Update all unified animation engines
    this._engine.update(safeDt, t);
    starAnimation.update(safeDt, {
      engine: this._engine,
      emitTrail: emitStarTrail,
      starSpeedScale: t >= 15.8 && t < 25 ? 3.5 : 1,
      skyBrightness: skyBri
    });
    flowerAnimation.update(safeDt, this._engine);
    timelineAnimation.update(safeDt, this._engine);
    numberAnimation.update(safeDt, {
      morphSpeed: t >= 15.8 ? L(1.4, 3.6, cl((t - 15.8) / 8.5)) : 2.0,
      scrollSpeed: 5.2
    });
    butterflyAnimation.update(safeDt, t);

    if (t >= TIME_JOURNEY_DURATION) {
      this.finished = true;
    }
  },

  render(x, env) {
    const cam = cameraAnimation.getTransform(env);

    gardenAnimation.renderSky(x, env);
    starAnimation.renderBackgroundStars(x, env);
    gardenAnimation.renderGroundAndPath(x, env, cam.scale, cam.offsetY);
    flowerAnimation.render(x, env, cam.scale, cam.offsetY);
    timelineAnimation.render(x, env);
    numberAnimation.render(x, env);
    starAnimation.render(x, env);
    butterflyAnimation.render(x, env, cam.scale, cam.offsetY);
    this._engine.render(x, env);
    transitionAnimation.render(x, env);
  }
};

export default timeSceneManager;
