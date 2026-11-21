import { cl, ez, L, rnd, glow, star4, G, TAU } from '../../../utils.js';
import { getFinaleQuality } from '../config/finale-quality.js';

export const finaleStars = {
  _stars: [],
  _shooting: [],
  _centerStar: { visible: false, nx: 0.5, ny: 0.5, size: 2, alpha: 0, riseY: null },
  _density: 0.35,

  init() {
    this._stars = [];
    this._shooting = [];
    this._centerStar = { visible: false, nx: 0.5, ny: 0.5, size: 2, alpha: 0, riseY: null };
    this._density = 0.35;
    this.ensureCount(50);
  },

  ensureCount(target) {
    const cap = Math.min(target, getFinaleQuality().starsMax);
    while (this._stars.length < cap) {
      this._stars.push({
        nx: rnd(),
        ny: rnd() * 0.44,
        sz: 0.8 + rnd() * 2.0,
        phase: rnd() * TAU,
        period: 1.0 + rnd() * 2.2,
        alpha: 0,
        targetAlpha: 0.45 + rnd() * 0.55,
        color: rnd() < 0.2 ? '#DCEBFF' : rnd() < 0.35 ? '#FFF1C8' : '#FFFFFF'
      });
    }
  },

  setDensity(d) {
    this._density = cl(d);
  },

  spawnShootingStar(opts = {}) {
    const fromLeft = opts.fromLeft ?? (rnd() < 0.55);
    this._shooting.push({
      x0: opts.x0 ?? (fromLeft ? 0.08 + rnd() * 0.25 : 0.68 + rnd() * 0.25),
      y0: opts.y0 ?? (0.05 + rnd() * 0.18),
      x1: opts.x1 ?? (fromLeft ? 0.65 + rnd() * 0.28 : 0.1 + rnd() * 0.25),
      y1: opts.y1 ?? (0.24 + rnd() * 0.18),
      t: 0,
      dur: opts.dur ?? (0.65 + rnd() * 0.55),
      trailLen: opts.trailLen ?? (45 + rnd() * 55)
    });
  },

  setCenterStar({ visible, nx = 0.5, ny = 0.5, size = 5, alpha = 1 } = {}) {
    this._centerStar.visible = Boolean(visible);
    this._centerStar.nx = nx;
    this._centerStar.ny = ny;
    this._centerStar.size = size;
    this._centerStar.alpha = alpha;
  },

  update(dt) {
    for (const s of this._stars) {
      s.alpha = L(s.alpha, s.targetAlpha * this._density, cl(dt * 1.4));
    }
    for (let i = this._shooting.length - 1; i >= 0; i--) {
      this._shooting[i].t += dt;
      if (this._shooting[i].t >= this._shooting[i].dur) {
        this._shooting.splice(i, 1);
      }
    }
  },

  render(x, env) {
    const { W, H, u, R, RM } = env;
    for (const s of this._stars) {
      if (s.alpha <= 0.01) continue;
      const tw = RM ? 0.85 : (0.35 + 0.65 * (0.5 + 0.5 * Math.sin((R / s.period) * TAU + s.phase)));
      x.globalAlpha = s.alpha * tw;
      x.fillStyle = s.color;
      const px = s.nx * W;
      const py = s.ny * H;
      const sz = s.sz * u;
      x.fillRect(px, py, sz, sz);
      if (s.sz > 2.2 && tw > 0.76) {
        x.fillRect(px - sz, py + sz * 0.35, sz * 3, sz * 0.3);
        x.fillRect(px + sz * 0.35, py - sz, sz * 0.3, sz * 3);
      }
    }

    if (this._shooting.length) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (const sh of this._shooting) {
        const k = cl(sh.t / sh.dur);
        const ek = ez(k);
        const hx = L(sh.x0, sh.x1, ek) * W;
        const hy = L(sh.y0, sh.y1, ek) * H;
        const dx = (sh.x1 - sh.x0) * W;
        const dy = (sh.y1 - sh.y0) * H;
        const mag = Math.hypot(dx, dy) || 1;
        const tx = hx - (dx / mag) * sh.trailLen * u;
        const ty = hy - (dy / mag) * sh.trailLen * u;
        const fade = k < 0.75 ? 1 : cl((1 - k) / 0.25);
        const grad = x.createLinearGradient(hx, hy, tx, ty);
        grad.addColorStop(0, `rgba(255,250,230,${0.95 * fade})`);
        grad.addColorStop(0.5, `rgba(210,230,255,${0.42 * fade})`);
        grad.addColorStop(1, 'rgba(210,230,255,0)');
        x.strokeStyle = grad;
        x.lineWidth = 2.2 * u;
        x.beginPath();
        x.moveTo(hx, hy);
        x.lineTo(tx, ty);
        x.stroke();
        glow(x, hx, hy, 12 * u, fade, G);
      }
      x.restore();
    }

    if (this._centerStar.visible && this._centerStar.alpha > 0.01) {
      const cs = this._centerStar;
      const px = cs.nx * W;
      const py = cs.ny * H;
      const pulse = RM ? 1 : (0.85 + 0.15 * Math.sin((R / 0.7) * TAU));
      x.save();
      x.globalCompositeOperation = 'lighter';
      glow(x, px, py, cs.size * 4.5 * u * pulse, cs.alpha * 0.75);
      x.restore();
      x.globalAlpha = cs.alpha;
      x.fillStyle = '#FFF9E2';
      star4(x, px, py, cs.size * u * pulse, RM ? 0 : R * 0.25);
    }
    x.globalAlpha = 1;
  }
};
