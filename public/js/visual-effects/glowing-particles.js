import { rnd, glow, G } from '../utils.js';
import { visualSettings } from '../config/visual-settings.js';
import { performanceManager } from '../visual-engine/performance-manager.js';

export const glowingParticlesEffect = {
  layer: visualSettings.layers.ATMOSPHERE,
  _orbs: [],

  init(bounds, params = {}) {
    const count = performanceManager.scaleCount(params.count || 28);
    this._orbs = [];
    for (let i = 0; i < count; i++) {
      this._orbs.push({
        x: rnd(),
        y: rnd(),
        r: 1.8 + rnd() * 2.8,
        p: rnd() * 6.28
      });
    }
  },

  render(x, env, params = {}) {
    const { W, H, u, R } = env;
    const intensity = params.intensity ?? 0.85;
    x.globalCompositeOperation = 'lighter';
    for (const m of this._orbs) {
      const alpha = (0.22 + 0.25 * Math.sin(R * 1.5 + m.p)) * intensity;
      const r = m.r * u;
      glow(x, m.x * W + Math.sin(R * 0.4 + m.p) * 8, ((m.y * H - R * 8) % H + H) % H, r * 2, alpha, G);
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  },

  destroy() {
    this._orbs = [];
  }
};

export default glowingParticlesEffect;
