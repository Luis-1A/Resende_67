import { cl, ez, glow, star4 } from '../utils';
import { visualSettings } from '../config/visual-settings';
import type { RenderEnv, VisualEffectModule } from '../types/app';

export const shootingStarsEffect: VisualEffectModule = {
  layer: visualSettings.layers.DISTANCE,

  init(): void {},

  render(x: CanvasRenderingContext2D, env: RenderEnv, params: Record<string, unknown> = {}): void {
    const startAt = Number(params.startAt ?? 3.8);
    const duration = Number(params.duration ?? 7.0);
    const st = env.sceneElapsed;
    if (st < startAt || st > startAt + duration) return;

    const { W, H, u } = env;
    const gr = ez(cl((st - startAt) / 1.1));
    const k = cl((st - (startAt + 1.2)) / (duration * 0.55));
    const sx0 = Number(params.fromX ?? 0.14);
    const sy0 = Number(params.fromY ?? 0.13);
    const sx1 = Number(params.toX ?? 0.82);
    const sy1 = Number(params.toY ?? 0.68);
    const B = (t: number): [number, number] => {
      const a = 1 - t;
      return [
        a * a * W * sx0 + 2 * a * t * W * ((sx0 + sx1) * 0.52) + t * t * W * sx1,
        a * a * H * sy0 + 2 * a * t * H * 0.03 + t * t * H * sy1
      ];
    };

    const trailLen = Number(params.trailLength ?? 28);
    const fadeTrail = 1 - cl((st - (startAt + duration * 0.72)) / (duration * 0.28));
    x.globalCompositeOperation = 'lighter';
    for (let j = 0; j < trailLen; j++) {
      const t = k - j * 0.012;
      if (t <= 0) continue;
      const p = B(t);
      const al = (1 - j / trailLen) * fadeTrail;
      glow(x, p[0] + Math.sin(j * 7) * 3.5 * u, p[1] + Math.cos(j * 5) * 3.5 * u, (13 - j * 0.38) * u, al * 0.8);
    }
    if (k < 1) {
      const p = B(k);
      const sz = (9.5 + 7 * Math.sin(k * Math.PI)) * u * gr;
      glow(x, p[0], p[1], sz * 3.4, gr);
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = gr;
      x.fillStyle = '#FFF7DE';
      star4(x, p[0], p[1], sz, 0);
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  },

  destroy(): void {}
};

export default shootingStarsEffect;
