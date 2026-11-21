import { glow, mkSpr, TAU } from '../utils';
import { visualSettings } from '../config/visual-settings';
import type { RenderEnv, VisualEffectModule } from '../types/app';

let _flSprite: HTMLCanvasElement | null = null;
function getLanternSpr(): HTMLCanvasElement {
  if (_flSprite) return _flSprite;
  _flSprite = mkSpr(40, 48, c => {
    c.fillStyle = 'rgba(255,205,120,.88)';
    c.beginPath();
    c.moveTo(9, 10);
    c.lineTo(31, 10);
    c.lineTo(28, 38);
    c.lineTo(12, 38);
    c.closePath();
    c.fill();
    c.fillStyle = '#FFF7DF';
    c.beginPath();
    c.arc(20, 31, 4, 0, TAU);
    c.fill();
  });
  return _flSprite;
}

export const floatingLanternsEffect: VisualEffectModule = {
  layer: visualSettings.layers.MIDGROUND,

  init(): void {},

  render(x: CanvasRenderingContext2D, env: RenderEnv, params: Record<string, unknown> = {}): void {
    const { W, H, u, R } = env;
    const count = Number(params.count) || 6;
    const spd = Number(params.riseSpeed ?? 0.011);
    const spr = getLanternSpr();
    const dw = 20 * u;
    const dh = 24 * u;

    x.save();
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i++) {
      const lx = (i * 0.17 + 0.08) * W + Math.sin(R * 0.4 + i) * 10 * u;
      const ly = H * (0.62 - (R * spd * (1 + i * 0.1) + i * 0.17) % 1 * 0.58) + H * 0.06;
      glow(x, lx, ly, 26 * u, 0.78);
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
    for (let i = 0; i < count; i++) {
      const lx = (i * 0.17 + 0.08) * W + Math.sin(R * 0.4 + i) * 10 * u;
      const ly = H * (0.62 - (R * spd * (1 + i * 0.1) + i * 0.17) % 1 * 0.58) + H * 0.06;
      x.drawImage(spr, lx - dw * 0.5, ly - dh * 0.5, dw, dh);
    }
    x.restore();
    x.globalAlpha = 1;
  },

  destroy(): void {}
};

export default floatingLanternsEffect;
