import { rnd, TAU } from '../utils.js';
import { visualSettings } from '../config/visual-settings.js';
import { performanceManager } from '../visual-engine/performance-manager.js';
import { physicsSystem } from '../visual-engine/physics-system.js';

export const petalsEffect = {
  layer: visualSettings.layers.FOREGROUND,
  _PT: [],

  init(bounds, params = {}) {
    const count = performanceManager.scaleCount(params.count || performanceManager.getProfile().petalCount);
    this._PT = [];
    for (let i = 0; i < count; i++) {
      this._PT.push({
        x: rnd() * bounds.W,
        y: rnd() * bounds.H,
        s: 0.5 + rnd(),
        p: rnd() * 6,
        pink: i % 3 === 0
      });
    }
  },

  update(dt, env, params = {}) {
    if (env.RM) return;
    const windFactor = params.windFactor ?? 1;
    for (const p of this._PT) {
      physicsSystem.integratePetal(p, dt, env.R, windFactor, env.W, env.H);
    }
  },

  render(x, env, params = {}) {
    if (!this._PT.length) return;
    const { u, R } = env;
    const pinkAccent = Boolean(params.pinkAccent);

    const drawGroup = (isPink, fill) => {
      x.fillStyle = fill;
      x.beginPath();
      let any = false;
      for (let i = 0; i < this._PT.length; i++) {
        const p = this._PT[i];
        if ((pinkAccent && p.pink) !== isPink) continue;
        any = true;
        const rot = R * p.s + p.p;
        const rx = 5 * u * p.s;
        const ry = 2.4 * u * p.s;
        x.moveTo(p.x + Math.cos(rot) * rx, p.y + Math.sin(rot) * rx);
        x.ellipse(p.x, p.y, rx, ry, rot, 0, TAU);
      }
      if (any) x.fill();
    };

    drawGroup(false, 'rgba(255,255,255,.82)');
    if (pinkAccent) drawGroup(true, 'rgba(255,205,225,.8)');
  },

  destroy() {
    this._PT = [];
  }
};

export default petalsEffect;
