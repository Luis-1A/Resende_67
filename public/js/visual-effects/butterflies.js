import { rnd, TAU } from '../utils.js';
import { visualSettings } from '../config/visual-settings.js';
import { performanceManager } from '../visual-engine/performance-manager.js';

export const butterfliesEffect = {
  layer: visualSettings.layers.MIDGROUND,
  _BFL: [],

  init(bounds, params = {}) {
    const count = Math.max(2, performanceManager.scaleCount(params.count || 5));
    this._BFL = [];
    for (let i = 0; i < count; i++) {
      this._BFL.push({
        x: 0.15 + rnd() * 0.7,
        y: 0.58 + rnd() * 0.22,
        p: rnd() * 6,
        c: ['#FFB86B', '#DCEBFF', '#FFC6E8'][i % 3]
      });
    }
  },

  render(x, env, params = {}) {
    const { W, H, u, R } = env;
    const wingSpeed = params.wingSpeed ?? 10;
    for (let i = 0; i < this._BFL.length; i++) {
      const b = this._BFL[i];
      const bx = W * (b.x + 0.18 * Math.sin(R * 0.24 + b.p));
      const by = H * (b.y + 0.08 * Math.sin(R * 0.4 + i)) + Math.sin(R * 2.5 + i) * 5 * u;
      const fl = Math.abs(Math.sin(R * wingSpeed + i));
      x.fillStyle = b.c;
      x.beginPath();
      x.ellipse(bx - 5 * u, by, 5 * u * fl + 1, 7 * u, -0.45, 0, TAU);
      x.ellipse(bx + 5 * u, by, 5 * u * fl + 1, 7 * u, 0.45, 0, TAU);
      x.fill();
    }
  },

  destroy() {
    this._BFL = [];
  }
};

export default butterfliesEffect;
