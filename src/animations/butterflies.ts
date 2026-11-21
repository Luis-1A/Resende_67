import { rnd, TAU } from '../utils';
import type { AnimationInitContext, AnimationModule, RenderEnv } from '../types/app';

interface AnimButterfly {
  x: number;
  y: number;
  p: number;
  c: string;
}

export const butterfliesAnimation: AnimationModule & {
  _active: boolean;
  _BFL: AnimButterfly[];
} = {
  name: 'butterflies',
  layer: 5,
  worldSpace: false,
  _active: false,
  _BFL: [],

  init(ctx: AnimationInitContext | null, params: Record<string, unknown> = {}): void {
    const reduced = ctx?.settings?.reducedMotion;
    const count = reduced ? 2 : (Number(params.count) || 5);
    this._BFL = [];
    for (let i = 0; i < count; i++) {
      this._BFL.push({
        x: 0.15 + rnd() * 0.7,
        y: 0.58 + rnd() * 0.22,
        p: rnd() * 6,
        c: ['#FFB86B', '#DCEBFF', '#FFC6E8'][i % 3]
      });
    }
  },

  play(): void {
    this._active = true;
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
    this._BFL = [];
  },

  update(): void {},

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, u, R } = env;
    for (let i = 0; i < this._BFL.length; i++) {
      const b = this._BFL[i];
      const bx = W * (b.x + 0.18 * Math.sin(R * 0.24 + b.p));
      const by = H * (b.y + 0.08 * Math.sin(R * 0.4 + i)) + Math.sin(R * 2.5 + i) * 5 * u;
      const fl = Math.abs(Math.sin(R * 10 + i));
      x.fillStyle = b.c;
      x.beginPath();
      x.ellipse(bx - 5 * u, by, 5 * u * fl + 1, 7 * u, -0.45, 0, TAU);
      x.ellipse(bx + 5 * u, by, 5 * u * fl + 1, 7 * u, 0.45, 0, TAU);
      x.fill();
    }
  }
};

export default butterfliesAnimation;
