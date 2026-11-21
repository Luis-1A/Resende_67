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
    const { u, R } = env;
    for (const p of this._PT) {
      x.fillStyle = p.pink && params.pinkAccent ? 'rgba(255,205,225,.8)' : 'rgba(255,255,255,.82)';
      x.beginPath();
      x.ellipse(p.x, p.y, 5 * u * p.s, 2.4 * u * p.s, R * p.s + p.p, 0, TAU);
      x.fill();
    }
  },

  destroy() {
    this._PT = [];
  }
};

export default petalsEffect;
