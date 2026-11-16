import { cl, L, ez, TAU } from '../utils.js';
import { COLF } from '../config/scenes.config.js';

export const balloonsAnimation = {
  name: 'balloons',
  layer: 4,
  worldSpace: true,
  _active: false,
  _params: { delay: 2.5, count: 10, duration: 11 },

  init() {},

  play(params = {}) {
    this._params = { ...this._params, ...params };
    this._active = true;
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
  },

  update() {},

  render(x, env) {
    if (!this._active) return;
    const { W, H, u, R, sceneElapsed: st } = env;
    const t0n = this._params.delay ?? 2.5;
    const dur = this._params.duration ?? 11;
    const xs = [.08, .9, .16, .84, .12, .88, .24, .76, .06, .94];
    const count = Math.min(xs.length, this._params.count || 10);

    for (let i = 0; i < count; i++) {
      const k = ez(cl((st - t0n - i * .65) / dur));
      if (k <= 0) continue;
      const bx = xs[i] * W + Math.sin(R * .65 + i) * 9 * u;
      const by = L(H * 1.08, H * (.1 + ((i % 4) * .11)), k);
      const s = Math.min(W, H) * .058;
      const topFade = by < H * .14 ? cl(by / (H * .14)) : 1;

      x.save();
      x.globalAlpha = topFade;
      x.translate(bx, by);
      x.rotate(Math.sin(R * .7 + i) * .07);

      x.strokeStyle = 'rgba(255,255,255,.45)';
      x.lineWidth = 1.1 * u;
      x.beginPath();
      x.moveTo(0, s * .58);
      x.quadraticCurveTo(Math.sin(R * 1.5 + i) * 5 * u, s * 1.3, -Math.sin(R + i) * 3 * u, s * 2.1);
      x.stroke();

      x.fillStyle = COLF[i % 4];
      x.beginPath(); x.ellipse(0, 0, s * .45, s * .55, 0, 0, TAU); x.fill();
      x.beginPath(); x.moveTo(-s * .07, s * .54); x.lineTo(s * .07, s * .54); x.lineTo(0, s * .62); x.closePath(); x.fill();

      x.fillStyle = 'rgba(255,255,255,.38)';
      x.beginPath(); x.ellipse(-s * .15, -s * .2, s * .09, s * .19, -.35, 0, TAU); x.fill();
      x.restore();
    }
    x.globalAlpha = 1;
  }
};

export default balloonsAnimation;
