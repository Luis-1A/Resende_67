import { cl, ez, mkSpr } from '../utils.js';
import { visualSettings } from '../config/visual-settings.js';
import { performanceManager } from '../visual-engine/performance-manager.js';

const _raySprCache = { warm: null, cool: null };
function getRaySpr(warm) {
  const key = warm ? 'warm' : 'cool';
  if (_raySprCache[key]) return _raySprCache[key];
  const tint = warm ? '255,220,150' : '165,205,255';
  _raySprCache[key] = mkSpr(64, 256, c => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, `rgba(${tint},1)`);
    g.addColorStop(0.65, `rgba(${tint},0.35)`);
    g.addColorStop(1, `rgba(${tint},0)`);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(22, 0);
    c.lineTo(42, 0);
    c.lineTo(64, 256);
    c.lineTo(0, 256);
    c.closePath();
    c.fill();
  });
  return _raySprCache[key];
}

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

    const spr = getRaySpr(Boolean(params.warm));
    const rayH = H * 0.9;
    x.save();
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = op;
    for (let i = 0; i < rayCount; i++) {
      const baseX = W * (0.18 + (i / Math.max(1, rayCount - 1)) * 0.64) + (RM ? 0 : Math.sin(R * 0.25 + i * 1.4) * W * 0.04);
      const drawW = W * (0.32 + (i % 2) * 0.12);
      const skew = 0.09 + i * 0.022;
      x.save();
      x.translate(baseX, 0);
      x.transform(1, 0, skew, 1, 0, 0);
      x.drawImage(spr, -drawW * 0.35, 0, drawW, rayH);
      x.restore();
    }
    x.restore();
    x.globalAlpha = 1;
  },

  destroy() {}
};

export default lightRaysEffect;
