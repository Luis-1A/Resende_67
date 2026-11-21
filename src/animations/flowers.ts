import { cl, ez, rnd, glow, TAU } from '../utils';
import type { AnimationInitContext, AnimationModule, RenderEnv } from '../types/app';

interface FlowerItem {
  x: number;
  y: number;
  h: number;
  p: number;
  c: number;
  d: number;
  depth: number;
}

export const flowersAnimation: AnimationModule & {
  _active: boolean;
  _flowers: FlowerItem[];
  _params: {
    colors: string[];
    mode: string;
    startDelay: number;
    cornersOnly: boolean;
    bloomGlow: boolean;
  };
} = {
  name: 'flowers',
  layer: 3,
  worldSpace: true,
  _active: false,
  _flowers: [],
  _params: {
    colors: ['#E8F1FF', '#BFD4FF', '#F7C6E0'],
    mode: 'meadow',
    startDelay: 0,
    cornersOnly: false,
    bloomGlow: false
  },

  init(ctx: AnimationInitContext | null): void {
    const s = ctx?.settings;
    const nf = s?.reducedMotion ? 10 : s?.isMobile ? 18 : 28;
    this._flowers = [];
    for (let i = 0; i < nf; i++) {
      this._flowers.push({
        x: (i + rnd() * 0.8) / nf,
        y: rnd(),
        h: rnd(),
        p: rnd() * 6,
        c: i,
        d: rnd(),
        depth: i % 3
      });
    }
  },

  play(params: Record<string, unknown> = {}): void {
    this._params = {
      colors: Array.isArray(params.colors) ? (params.colors as string[]) : ['#E8F1FF', '#BFD4FF', '#F7C6E0'],
      mode: String(params.mode ?? 'meadow'),
      startDelay: Number(params.startDelay ?? 0),
      cornersOnly: Boolean(params.cornersOnly),
      bloomGlow: Boolean(params.bloomGlow)
    };
    this._active = true;
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
    this._flowers = [];
  },

  update(): void {},

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, u, R, RM, sceneElapsed } = env;
    const st = sceneElapsed - (this._params.startDelay || 0);
    if (st < 0) return;

    const cols = this._params.colors;
    for (const f of this._flowers) {
      if (this._params.cornersOnly && f.x > 0.18 && f.x < 0.82) continue;

      const dl = this._params.mode === 'wave'
        ? (1.5 + f.x * 5.5)
        : this._params.mode === 'opening'
          ? (8.5 + f.d * 5.5)
          : (f.d * 3.2);

      const g = ez(cl((st - dl) / 2.2));
      const b = cl((st - dl - 1.5) / 2.4);
      if (g <= 0.02) continue;

      const fx = f.x * W;
      const by = H * (0.9 + f.y * 0.1);
      const h = H * (0.055 + f.h * 0.095) * g;
      const sw = RM ? 0 : Math.sin(R * 0.85 + f.p) * (2.5 + b * 4) * u;

      x.strokeStyle = f.depth === 0 ? '#1F4E35' : '#2E6B4A';
      x.lineWidth = (f.depth === 2 ? 2.4 : 1.7) * u;
      x.beginPath();
      x.moveTo(fx, by);
      x.quadraticCurveTo(fx + sw * 0.5, by - h * 0.5, fx + sw, by - h);
      x.stroke();

      if (g > 0.45) {
        x.fillStyle = f.depth === 0 ? '#2E6C4B' : '#3E8A5E';
        x.beginPath();
        x.ellipse(fx + sw * 0.4 - 5.5 * u * g, by - h * 0.4, 6.5 * u * g, 2.4 * u * g, -0.6, 0, TAU);
        x.ellipse(fx + sw * 0.4 + 5.5 * u * g, by - h * 0.55, 6.5 * u * g, 2.4 * u * g, 0.6, 0, TAU);
        x.fill();
      }

      const r = (7 + f.h * 9) * (f.depth === 2 ? 1.15 : f.depth === 0 ? 0.78 : 1) * u;
      if (g > 0.82 && b <= 0.1) {
        x.fillStyle = '#4C9A6C';
        x.beginPath(); x.ellipse(fx + sw, by - h, r * 0.24, r * 0.38, 0, 0, TAU); x.fill();
      }

      if (b > 0) {
        const hx = fx + sw;
        const hy = by - h;
        const rxOut = r * 0.52 * b;
        const ryOut = r * 0.29 * b;
        x.fillStyle = cols[f.c % cols.length];
        x.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = i * 1.047 + f.p;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          const cxp = hx + ca * r * 0.58 * b;
          const cyp = hy + sa * r * 0.58 * b;
          x.moveTo(cxp + ca * rxOut, cyp + sa * rxOut);
          x.ellipse(cxp, cyp, rxOut, ryOut, a, 0, TAU);
        }
        x.fill();

        const rxIn = r * 0.3 * b;
        const ryIn = r * 0.16 * b;
        x.globalAlpha = 0.35;
        x.fillStyle = '#FFF9EC';
        x.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = i * 1.047 + f.p + 0.52;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          const cxp = hx + ca * r * 0.34 * b;
          const cyp = hy + sa * r * 0.34 * b;
          x.moveTo(cxp + ca * rxIn, cyp + sa * rxIn);
          x.ellipse(cxp, cyp, rxIn, ryIn, a, 0, TAU);
        }
        x.fill();
        x.globalAlpha = 1;
        x.fillStyle = '#FFE08A';
        x.beginPath(); x.arc(hx, hy, r * 0.26 * b, 0, TAU); x.fill();
        x.fillStyle = '#FFF8DC';
        x.beginPath(); x.arc(hx, hy, r * 0.12 * b, 0, TAU); x.fill();
      }

      if (this._params.bloomGlow && b > 0 && b < 1) {
        x.globalCompositeOperation = 'lighter';
        glow(x, fx + sw, by - h, r * 2.9, 0.45 * (1 - b));
        x.globalCompositeOperation = 'source-over';
        x.globalAlpha = 1;
      }
    }
  }
};

export default flowersAnimation;
