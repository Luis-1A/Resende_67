import { cl, L, ez, glow, getNumber18Points, type Number18Point } from '../utils';
import type { AnimationModule, RenderEnv } from '../types/app';

export const finaleAnimation: AnimationModule & {
  _active: boolean;
  _NP: Number18Point[];
  _params: { numberDelay: number };
} = {
  name: 'finale',
  layer: 4,
  worldSpace: true,
  _active: false,
  _NP: [],
  _params: { numberDelay: 5.5 },

  init(): void {
    this._NP = getNumber18Points();
  },

  play(params: Record<string, unknown> = {}): void {
    this._params = { numberDelay: Number(params.numberDelay ?? 5.5) };
    this._active = true;
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
  },

  update(): void {},

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, cx, u, R, RM, sceneElapsed: st } = env;

    x.globalCompositeOperation = 'lighter';
    const fa = ez(cl(st / 4));
    for (let i = 0; i < 14; i++) {
      glow(x, (i / 13) * W, H * (0.74 + (i % 3) * 0.025), 11 * u, (0.35 + 0.4 * Math.sin(R * 2.5 + i)) * fa);
    }

    const el = st - (this._params.numberDelay ?? 5.5);
    if (el > 0) {
      const form1 = ez(cl((el - 1.4) / 2.2));
      const form8 = ez(cl((el - 2.2) / 2.4));
      const fade8 = 1 - cl((st - 32) / 6);
      if (fade8 > 0.01) {
        const sc2 = Math.min(W * 0.22, H * 0.13);
        glow(x, cx, H * 0.3, sc2 * 1.55, 0.2 * form8 * fade8);
        const sweep = ((el - 4.5) % 5) / 5;
        for (const p of this._NP) {
          const kf = p.a[2] ? form1 : form8;
          const ang = p.ang + el * 0.65 * (1 - kf);
          const circX = Math.cos(ang) * sc2 * 1.15;
          const circY = Math.sin(ang) * sc2 * 0.85;
          const px = cx + L(circX, p.a[0] * sc2, kf) + (RM ? 0 : Math.sin(R * 1.3 + p.p) * 1.8);
          const py = H * 0.3 + L(circY, p.a[1] * sc2, kf);
          const swBoost = (el > 4.5 && Math.abs((p.a[0] + 1) * 0.5 - sweep) < 0.15) ? 0.35 : 0;
          const r = (2.4 + Math.sin(R * 3 + p.p) * 0.7 + swBoost * 2) * u;
          glow(x, px, py, r * 2.25, (0.55 + 0.25 * kf + swBoost) * fade8);
        }
      }
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  }
};

export default finaleAnimation;
