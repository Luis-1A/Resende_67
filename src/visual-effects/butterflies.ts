import { rnd, TAU } from '../utils';
import { visualSettings } from '../config/visual-settings';
import { performanceManager } from '../visual-engine/performance-manager';
import type { RenderEnv, ScreenBounds, VisualEffectModule } from '../types/app';

interface ButterflyItem {
  x: number;
  y: number;
  p: number;
  c: string;
}

export const butterfliesEffect: VisualEffectModule & { _BFL: ButterflyItem[] } = {
  layer: visualSettings.layers.MIDGROUND,
  _BFL: [],

  init(_bounds: ScreenBounds, params: Record<string, unknown> = {}): void {
    const count = Math.max(2, performanceManager.scaleCount(Number(params.count) || 5));
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

  render(x: CanvasRenderingContext2D, env: RenderEnv, params: Record<string, unknown> = {}): void {
    const { W, H, u, R } = env;
    const wingSpeed = Number(params.wingSpeed ?? 10);
    for (let i = 0; i < this._BFL.length; i++) {
      const b = this._BFL[i];
      const bx = W * (b.x + 0.18 * Math.sin(R * 0.24 + b.p));
      const by = H * (b.y + 0.08 * Math.sin(R * 0.4 + i)) + Math.sin(R * 2.5 + i) * 5 * u;
      const fl = Math.abs(Math.sin(R * wingSpeed + i));
      x.fillStyle = b.c;
      x.beginPath();
      x.ellipse(bx - 5 * u, by, 5 * u * fl + 1, 7 * u, -0.45, 0, TAU);
      x.ellipse(bx + 5 * u, by, 5 * u * fl + 1, 7 * u, 0.45, 0, TAU);
      x.fill();
    }
  },

  destroy(): void {
    this._BFL = [];
  }
};

export default butterfliesEffect;
