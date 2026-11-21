import { cl, ez, glow, rr, TAU } from '../utils';
import type { AnimationInitContext, RenderEnv } from '../types/app';

export const friendshipAnimation = {
  name: 'friendship',
  layer: 1,
  worldSpace: true,
  _active: false,

  init(_ctx?: AnimationInitContext | null, _params?: Record<string, unknown>): void {},

  play(): void {
    this._active = true;
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
  },

  update(_dt: number, _env: RenderEnv): void {},

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, sceneElapsed: st } = env;

    // Golden-violet sunset sun & horizon glow behind mountain silhouettes
    x.globalCompositeOperation = 'lighter';
    glow(x, W * 0.7, H * 0.54, W * 0.65, 0.72);
    glow(x, W * 0.7, H * 0.56, Math.min(W, H) * 0.14, 0.65);
    x.globalCompositeOperation = 'source-over';

    // Two symbolic faceless silhouettes on sunset ridge
    x.fillStyle = 'rgba(20,12,34,.96)';
    [0.43, 0.55].forEach((px, i) => {
      const bx = px * W;
      const by = H * 0.88;
      const k = ez(cl((st - 2 - i * 1.2) / 3));
      x.globalAlpha = k;
      x.beginPath();
      x.arc(bx, by - H * 0.102, H * 0.017, 0, TAU);
      x.fill();
      rr(x, bx - H * 0.02, by - H * 0.084, H * 0.04, H * 0.062, 8);
      x.fill();
      rr(x, bx - H * 0.018, by - H * 0.028, H * 0.068, H * 0.021, 5);
      x.fill();
    });
    x.globalAlpha = 1;
  }
};

export default friendshipAnimation;
