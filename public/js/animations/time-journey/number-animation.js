import { cl, ez, L, rnd, glow, G, TAU } from '../../utils.js';

const maskCache = new Map();

export function sampleNumberTargets(text, { w = 360, h = 150, font = '800 104px "Cinzel", "Playfair Display", Georgia, serif', step = 4, maxPoints = 220 } = {}) {
  const key = `${text}|${font}|${step}|${maxPoints}`;
  if (maskCache.has(key)) return maskCache.get(key);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), w / 2, h / 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const raw = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 110) {
        raw.push([(x - w / 2) / (w / 2), (y - h / 2) / (h / 2)]);
      }
    }
  }
  const stride = Math.max(1, Math.ceil(raw.length / maxPoints));
  const out = [];
  for (let i = 0; i < raw.length && out.length < maxPoints; i += stride) {
    out.push(raw[i]);
  }
  maskCache.set(key, out);
  return out;
}

export const numberAnimation = {
  _mode: 'hidden', // 'hidden' | 'years' | 'days' | 'dissolve'
  _pts: [],
  _currentYear: 2008,
  _morphProgress: 1,
  _contourSweep: 0,
  _yearAlpha: 0,
  _yearScale: 1,
  _dayValue: 0,
  _prevDayValue: 0,
  _dayScrollT: 1,
  _dayAlpha: 0,
  _maxPoints: 220,
  _sparkCooldown: 0,

  init(maxPoints = 220) {
    this._mode = 'hidden';
    this._pts = [];
    this._currentYear = 2008;
    this._morphProgress = 1;
    this._contourSweep = -0.2;
    this._yearAlpha = 0;
    this._yearScale = 1;
    this._dayValue = 0;
    this._prevDayValue = 0;
    this._dayScrollT = 1;
    this._dayAlpha = 0;
    this._maxPoints = maxPoints;
    this._sparkCooldown = 0;
  },

  setYear(year, { scale = 1, alpha = 1 } = {}) {
    this._mode = 'years';
    this._yearScale = scale;
    this._yearAlpha = alpha;
    if (this._currentYear === year && this._pts.length) return;

    const prevPts = this._pts;
    this._currentYear = year;
    const targets = sampleNumberTargets(String(year), { maxPoints: this._maxPoints });
    const count = targets.length;
    const nextPts = [];

    for (let i = 0; i < count; i++) {
      const target = targets[i];
      const prev = prevPts.length
        ? prevPts[i % prevPts.length]
        : {
            x: 0.5 + (rnd() - 0.5) * 0.28,
            y: 0.36 + (rnd() - 0.5) * 0.16
          };
      const ang = (i / Math.max(1, count)) * TAU + rnd() * 0.5;
      nextPts.push({
        sx: prev.x ?? 0.5,
        sy: prev.y ?? 0.36,
        mx: 0.5 + Math.cos(ang) * (0.14 + rnd() * 0.08),
        my: 0.36 + Math.sin(ang) * (0.07 + rnd() * 0.05),
        tx: 0.5 + target[0] * 0.24,
        ty: 0.36 + target[1] * 0.10,
        x: prev.x ?? 0.5,
        y: prev.y ?? 0.36,
        normX: (target[0] + 1) * 0.5,
        size: 1.5 + rnd() * 1.1,
        seed: rnd() * TAU
      });
    }

    this._pts = nextPts;
    this._morphProgress = 0;
    this._contourSweep = -0.15;
  },

  startDaysCounter(initialDay = 0) {
    this._mode = 'days';
    this._dayValue = initialDay;
    this._prevDayValue = initialDay;
    this._dayScrollT = 1;
    this._dayAlpha = 1;
    this._yearAlpha = 0;
  },

  setDayValue(dayVal, engine) {
    this._mode = 'days';
    if (dayVal !== this._dayValue) {
      this._prevDayValue = this._dayValue;
      this._dayValue = dayVal;
      this._dayScrollT = 0;
      if (engine) {
        // Edge-born vertical and diagonal sparks during day scroll
        for (let i = 0; i < 6; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          engine.spawn(i % 3 === 0 ? 'trail' : 'dispersion', {
            sceneId: 'days',
            x: 0.5 + side * (0.04 + rnd() * 0.04),
            y: 0.44 + (rnd() - 0.5) * 0.05,
            vx: side * (0.015 + rnd() * 0.025),
            vy: -0.055 - rnd() * 0.045,
            maxLife: 0.45 + rnd() * 0.35,
            size: 1.2 + rnd() * 1.1
          });
        }
      }
    }
  },

  dissolveToPath(engine) {
    this._mode = 'dissolve';
    this._dayAlpha = 0;
    this._yearAlpha = 0;
    if (engine) {
      // Bright particles detach from edges to form golden pathway along lower center
      for (let i = 0; i < 42; i++) {
        const edgeSide = i % 2 === 0 ? -1 : 1;
        const dist = 0.04 + rnd() * 0.14;
        const lane = rnd();
        engine.spawn(i < 16 ? 'primaryGold' : 'dispersion', {
          sceneId: 'numDissolve',
          behavior: 'curvePath',
          x: 0.5 + edgeSide * dist,
          y: 0.38 + (rnd() - 0.5) * 0.14,
          cx: 0.5 + edgeSide * (0.14 + rnd() * 0.12),
          cy: 0.62,
          tx: 0.5 + (lane - 0.5) * 0.24,
          ty: L(0.72, 0.96, rnd()),
          delay: (1 - dist / 0.18) * 0.35,
          maxLife: 1.5 + rnd() * 0.5,
          size: 1.8 + rnd() * 1.4
        });
      }
    }
  },

  hide() {
    this._mode = 'hidden';
    this._yearAlpha = 0;
    this._dayAlpha = 0;
  },

  update(dt, { morphSpeed = 1.9, scrollSpeed = 4.5 } = {}) {
    if (this._mode === 'years' && this._pts.length) {
      this._morphProgress = cl(this._morphProgress + dt * morphSpeed);
      this._contourSweep = (this._contourSweep + dt * 1.35) % 1.3;
      const k = ez(this._morphProgress);
      for (const p of this._pts) {
        // Curved two-stage scatter -> re-form trajectory
        if (k < 0.38) {
          const kk = k / 0.38;
          p.x = L(p.sx, p.mx, kk);
          p.y = L(p.sy, p.my, kk);
        } else {
          const kk = ez((k - 0.38) / 0.62);
          p.x = L(p.mx, p.tx, kk);
          p.y = L(p.my, p.ty, kk);
        }
      }
    }

    if (this._mode === 'days') {
      this._dayScrollT = cl(this._dayScrollT + dt * scrollSpeed);
    }
  },

  render(x, env) {
    const { W, H, cx, u, R, RM } = env;

    if (this._mode === 'years' && this._yearAlpha > 0.01 && this._pts.length) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (const p of this._pts) {
        const px = W * 0.5 + (p.x - 0.5) * W * this._yearScale;
        const py = H * 0.36 + (p.y - 0.36) * H * this._yearScale;
        const sweepBoost = Math.abs(p.normX - this._contourSweep) < 0.1 ? 0.42 : 0;
        const pulse = RM ? 0 : 0.14 * Math.sin(R * 3.5 + p.seed);
        const al = this._yearAlpha * (0.62 + sweepBoost + pulse);
        glow(x, px, py, (p.size * 2.2 + sweepBoost * 2.5) * u, al, G);
      }
      x.restore();
    }

    if (this._mode === 'days' && this._dayAlpha > 0.01) {
      const colH = H * 0.28;
      const cy = H * 0.44;
      const k = ez(this._dayScrollT);
      const numSize = Math.round(Math.min(W * 0.22, 92));

      x.save();
      // Subtle vertical illuminated column behind scrolling day counter
      const colGrad = x.createLinearGradient(cx, cy - colH * 0.65, cx, cy + colH * 0.65);
      colGrad.addColorStop(0, 'rgba(255,226,154,0)');
      colGrad.addColorStop(0.5, `rgba(255,226,154,${0.16 * this._dayAlpha})`);
      colGrad.addColorStop(1, 'rgba(255,226,154,0)');
      x.fillStyle = colGrad;
      x.fillRect(cx - numSize * 0.85, cy - colH * 0.65, numSize * 1.7, colH * 1.3);

      // Clip mask so numbers enter from bottom and exit through top cleanly
      x.beginPath();
      x.rect(0, cy - colH * 0.55, W, colH * 1.1);
      x.clip();

      x.font = `800 ${numSize}px "Cinzel", "Playfair Display", Georgia, serif`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';

      const drawNum = (val, yOff, al) => {
        if (al <= 0.02) return;
        const str = String(val).padStart(2, '0');
        x.save();
        x.globalAlpha = al * this._dayAlpha;
        x.shadowColor = 'rgba(255,224,142,0.85)';
        x.shadowBlur = 18 * u;
        x.fillStyle = '#FFFDF5';
        x.fillText(str, cx, cy + yOff);
        x.restore();
      };

      if (k < 0.99 && this._prevDayValue !== this._dayValue) {
        drawNum(this._prevDayValue, L(0, -colH * 0.52, k), 1 - k);
        drawNum(this._dayValue, L(colH * 0.52, 0, k), k);
      } else {
        drawNum(this._dayValue, 0, 1);
      }
      x.restore();
    }
    x.globalAlpha = 1;
  }
};

export default numberAnimation;
