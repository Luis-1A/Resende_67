import { cl, L, ez, mkSpr, TAU } from '../utils.js';
import { COLF } from '../config/scenes.config.js';

const _sceneBalloonSpr = new Map();
function getSceneBalloonSpr(color) {
  if (_sceneBalloonSpr.has(color)) return _sceneBalloonSpr.get(color);
  const spr = mkSpr(64, 80, c => {
    const cx = 32, cy = 34, s = 54;
    c.fillStyle = color;
    c.beginPath(); c.ellipse(cx, cy, s * 0.45, s * 0.55, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(cx - s * 0.07, cy + s * 0.54); c.lineTo(cx + s * 0.07, cy + s * 0.54); c.lineTo(cx, cy + s * 0.62); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.38)';
    c.beginPath(); c.ellipse(cx - s * 0.15, cy - s * 0.2, s * 0.09, s * 0.19, -0.35, 0, TAU); c.fill();
  });
  _sceneBalloonSpr.set(color, spr);
  return spr;
}

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
    const xs = [0.08, 0.9, 0.16, 0.84, 0.12, 0.88, 0.24, 0.76, 0.06, 0.94];
    const count = Math.min(xs.length, this._params.count || 10);
    const s = Math.min(W, H) * 0.058;
    const sprScale = s / 54;
    const dw = 64 * sprScale;
    const dh = 80 * sprScale;

    for (let i = 0; i < count; i++) {
      const k = ez(cl((st - t0n - i * 0.65) / dur));
      if (k <= 0) continue;
      const bx = xs[i] * W + Math.sin(R * 0.65 + i) * 9 * u;
      const by = L(H * 1.08, H * (0.1 + ((i % 4) * 0.11)), k);
      const topFade = by < H * 0.14 ? cl(by / (H * 0.14)) : 1;
      const spr = getSceneBalloonSpr(COLF[i % 4]);

      x.save();
      x.globalAlpha = topFade;
      x.translate(bx, by);
      x.rotate(Math.sin(R * 0.7 + i) * 0.07);

      x.strokeStyle = 'rgba(255,255,255,.45)';
      x.lineWidth = 1.1 * u;
      x.beginPath();
      x.moveTo(0, s * 0.58);
      x.quadraticCurveTo(Math.sin(R * 1.5 + i) * 5 * u, s * 1.3, -Math.sin(R + i) * 3 * u, s * 2.1);
      x.stroke();

      x.drawImage(spr, -32 * sprScale, -34 * sprScale, dw, dh);
      x.restore();
    }
    x.globalAlpha = 1;
  }
};

export default balloonsAnimation;
