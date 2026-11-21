import { rnd, glow, G } from '../utils.js';
import { visualSettings } from '../config/visual-settings.js';
import { performanceManager } from '../visual-engine/performance-manager.js';

export const magicalDustEffect = {
  layer: visualSettings.layers.FOREGROUND,
  _motes: [],

  init(bounds, params = {}) {
    const count = performanceManager.scaleCount(params.count || performanceManager.getProfile().dustCount);
    this._motes = [];
    for (let i = 0; i < count; i++) {
      this._motes.push({
        ox: (rnd() - 0.5) * 0.65,
        oy: (rnd() - 0.5) * 0.45,
        r: 1.2 + rnd() * 2.2,
        p: rnd() * 6.28,
        spd: 0.4 + rnd() * 0.8
      });
    }
  },

  render(x, env, params = {}) {
    const { W, H, cx, u, R, RM } = env;
    const focusY = H * (params.focusY ?? 0.36);
    const intensity = params.intensity ?? 0.75;

    x.globalCompositeOperation = 'lighter';
    for (const m of this._motes) {
      const drift = RM ? 0 : Math.sin(R * m.spd + m.p);
      const px = cx + m.ox * W + drift * 18 * u;
      const py = focusY + m.oy * H + (RM ? 0 : Math.cos(R * m.spd * 0.8 + m.p) * 14 * u);
      const al = (0.18 + 0.42 * (0.5 + 0.5 * Math.sin(R * 2.2 + m.p))) * intensity;
      glow(x, px, py, m.r * 2.4 * u, al, G);
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  },

  destroy() {
    this._motes = [];
  }
};

export default magicalDustEffect;
