import { cl, rnd, glow, rr, G, TAU } from '../../../utils.js';

export const finaleLanterns = {
  _list: [],
  _fadingOut: false,

  init() {
    this._list = [];
    this._fadingOut = false;
  },

  spawnLanterns(count = 12) {
    this._fadingOut = false;
    for (let i = 0; i < count; i++) {
      const depth = 0.45 + rnd() * 0.55;
      this._list.push({
        nx: 0.06 + rnd() * 0.88,
        ny: 0.78 + rnd() * 0.26,
        vy: -(0.016 + rnd() * 0.022) * depth,
        vx: (rnd() - 0.5) * 0.008,
        scale: (0.45 + rnd() * 0.55) * depth,
        phase: rnd() * TAU,
        alpha: 0,
        targetAlpha: 0.65 + rnd() * 0.3
      });
    }
  },

  fadeOutAll() {
    this._fadingOut = true;
  },

  update(dt, env) {
    for (let i = this._list.length - 1; i >= 0; i--) {
      const l = this._list[i];
      l.ny += l.vy * dt;
      l.nx += (l.vx + Math.sin(env.R * 0.9 + l.phase) * 0.005) * dt;
      l.scale = Math.max(0.18, l.scale - dt * 0.008);
      if (this._fadingOut || l.ny < 0.04) {
        l.alpha -= dt * 0.35;
        if (l.alpha <= 0.01 || l.ny < -0.1) {
          this._list.splice(i, 1);
          continue;
        }
      } else {
        l.alpha = Math.min(l.targetAlpha, l.alpha + dt * 0.45);
      }
    }
  },

  render(x, env) {
    const { W, H, u, R } = env;
    for (const l of this._list) {
      if (l.alpha <= 0.01) continue;
      const px = l.nx * W;
      const py = l.ny * H;
      const w = 13 * u * l.scale;
      const h = 18 * u * l.scale;
      const flicker = 0.88 + 0.12 * Math.sin(R * 7 + l.phase);

      x.save();
      x.globalCompositeOperation = 'lighter';
      glow(x, px, py, w * 1.9, l.alpha * 0.38 * flicker, G);
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = l.alpha;
      const g = x.createLinearGradient(px, py - h * 0.5, px, py + h * 0.5);
      g.addColorStop(0, '#FFB86B');
      g.addColorStop(0.55, '#FFE0A3');
      g.addColorStop(1, '#FFF6DA');
      x.fillStyle = g;
      rr(x, px - w * 0.5, py - h * 0.5, w, h, w * 0.22);
      x.fill();
      x.restore();
    }
    x.globalAlpha = 1;
  }
};
