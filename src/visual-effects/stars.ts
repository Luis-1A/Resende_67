import { rnd } from '../utils';
import { visualSettings } from '../config/visual-settings';
import { performanceManager } from '../visual-engine/performance-manager';
import type { RenderEnv, VisualEffectModule } from '../types/app';

type StarTuple = [number, number, number, number, number, string];

export const starsEffect: VisualEffectModule & { _stars: StarTuple[] } = {
  layer: visualSettings.layers.DISTANCE,
  _stars: [],

  init(): void {
    const count = performanceManager.getProfile().starCount;
    this._stars = [];
    for (let i = 0; i < count; i++) {
      this._stars.push([
        rnd(),
        rnd() * 0.74,
        0.55 + rnd() * 1.65,
        rnd() * 6,
        i % 3,
        i % 5 === 0 ? '#DCEBFF' : i % 7 === 0 ? '#FFF1CC' : '#FFFFFF'
      ]);
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv, params: Record<string, unknown> = {}): void {
    const density = Number(params.density ?? 1);
    if (density <= 0) return;
    const { W, H, u, R, RM } = env;
    const speed = Number(params.twinkleSpeed ?? 1.2);

    for (const a of this._stars) {
      const tw = RM ? 0.8 : (0.32 + 0.68 * (0.5 + 0.5 * Math.sin(R * (0.85 + a[4] * 0.5) * speed + a[3])));
      const sx = a[0] * W;
      const sy = a[1] * H;
      const sz = a[2] * u;
      x.globalAlpha = density * tw * (a[4] === 2 ? 0.92 : a[4] === 1 ? 0.68 : 0.42);
      x.fillStyle = a[5];
      x.fillRect(sx, sy, sz, sz);
      if (a[4] === 2 && a[2] > 1.65 && tw > 0.72) {
        x.fillRect(sx - sz * 1.1, sy + sz * 0.35, sz * 3.2, sz * 0.35);
        x.fillRect(sx + sz * 0.35, sy - sz * 1.1, sz * 0.35, sz * 3.2);
      }
    }
    x.globalAlpha = 1;
  },

  destroy(): void {
    this._stars = [];
  }
};

export default starsEffect;
