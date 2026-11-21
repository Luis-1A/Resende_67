import { glow, TAU } from '../utils.js';
import { visualSettings } from '../config/visual-settings.js';

export const floatingLanternsEffect = {
  layer: visualSettings.layers.MIDGROUND,

  init() {},

  render(x, env, params = {}) {
    const { W, H, u, R } = env;
    const count = params.count || 6;
    const spd = params.riseSpeed ?? 0.011;
    for (let i = 0; i < count; i++) {
      const lx = (i * 0.17 + 0.08) * W + Math.sin(R * 0.4 + i) * 10 * u;
      const ly = H * (0.62 - (R * spd * (1 + i * 0.1) + i * 0.17) % 1 * 0.58) + H * 0.06;
      const sz = 10 * u;
      x.globalCompositeOperation = 'lighter';
      glow(x, lx, ly, 26 * u, 0.78);
      x.globalCompositeOperation = 'source-over';
      x.fillStyle = 'rgba(255,205,120,.86)';
      x.beginPath();
      x.moveTo(lx - sz * 0.52, ly - sz * 0.6);
      x.lineTo(lx + sz * 0.52, ly - sz * 0.6);
      x.lineTo(lx + sz * 0.36, ly + sz * 0.55);
      x.lineTo(lx - sz * 0.36, ly + sz * 0.55);
      x.closePath();
      x.fill();
      x.fillStyle = '#FFF7DF';
      x.beginPath(); x.arc(lx, ly + sz * 0.28, sz * 0.18, 0, TAU); x.fill();
    }
    x.globalAlpha = 1;
  },

  destroy() {}
};

export default floatingLanternsEffect;
