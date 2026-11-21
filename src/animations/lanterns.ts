import { glow, TAU } from '../utils';
import type { AnimationInitContext, RenderEnv } from '../types/app';

export interface LanternsParams {
  count?: number;
  [key: string]: unknown;
}

export const lanternsAnimation = {
  name: 'lanterns',
  layer: 4,
  worldSpace: true,
  _active: false,
  _params: { count: 6 } as LanternsParams,

  init(_ctx?: AnimationInitContext | null, _params?: LanternsParams): void {},

  play(params: LanternsParams = {}): void {
    this._params = { ...this._params, ...params };
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
    const { W, H, u, R } = env;
    const count = this._params.count || 6;
    for (let i = 0; i < count; i++) {
      const lx = (i * 0.17 + 0.08) * W + Math.sin(R * 0.4 + i) * 10 * u;
      const ly = H * (0.62 - ((R * 0.011 * (1 + i * 0.1) + i * 0.17) % 1) * 0.58) + H * 0.06;
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
      x.beginPath();
      x.arc(lx, ly + sz * 0.28, sz * 0.18, 0, TAU);
      x.fill();
    }
    x.globalAlpha = 1;
  }
};

export default lanternsAnimation;
