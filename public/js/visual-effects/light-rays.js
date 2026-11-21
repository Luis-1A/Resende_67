import { cl, ez } from '../utils.js';
import { visualSettings } from '../config/visual-settings.js';
import { performanceManager } from '../visual-engine/performance-manager.js';

export const lightRaysEffect = {
  layer: visualSettings.layers.ATMOSPHERE,

  init() {},

  render(x, env, params = {}) {
    const rayCount = performanceManager.getProfile().rayCount;
    if (!rayCount) return;
    const { W, H, R, RM, sceneElapsed } = env;
    const fadeIn = ez(cl((sceneElapsed - (params.delay ?? 1.5)) / 3.5));
    const op = (params.opacity ?? 0.14) * fadeIn;
    if (op <= 0.005) return;

    x.save();
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < rayCount; i++) {
      const baseX = W * (0.18 + (i / Math.max(1, rayCount - 1)) * 0.64) + (RM ? 0 : Math.sin(R * 0.25 + i * 1.4) * W * 0.04);
      const topW = W * (0.04 + (i % 2) * 0.025);
      const botW = W * (0.18 + (i % 2) * 0.06);
      const skew = W * (0.08 + i * 0.02);
      const grad = x.createLinearGradient(baseX, 0, baseX + skew, H * 0.88);
      const tint = params.warm ? '255,220,150' : '165,205,255';
      grad.addColorStop(0, `rgba(${tint},${op})`);
      grad.addColorStop(0.65, `rgba(${tint},${op * 0.35})`);
      grad.addColorStop(1, `rgba(${tint},0)`);
      x.fillStyle = grad;
      x.beginPath();
      x.moveTo(baseX - topW, 0);
      x.lineTo(baseX + topW, 0);
      x.lineTo(baseX + skew + botW, H * 0.9);
      x.lineTo(baseX + skew - botW, H * 0.9);
      x.closePath();
      x.fill();
    }
    x.restore();
  },

  destroy() {}
};

export default lightRaysEffect;
