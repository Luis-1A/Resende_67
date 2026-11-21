import { rnd, G, TAU } from '../utils';
import type { AnimationInitContext, RenderEnv } from '../types/app';

interface PetalItem {
  x: number;
  y: number;
  s: number;
  p: number;
  pink: boolean;
}

interface DustMote {
  x: number;
  y: number;
  r: number;
  p: number;
}

export interface PetalsAnimParams {
  pinkAccent?: boolean;
  count?: number;
  [key: string]: unknown;
}

export const petalsAnimation = {
  name: 'petals',
  layer: 6,
  worldSpace: false,
  _active: false,
  _PT: [] as PetalItem[],
  _MT: [] as DustMote[],
  _params: {
    pinkAccent: false,
    count: 18
  } as PetalsAnimParams,

  init(ctx: AnimationInitContext | null, params: PetalsAnimParams = {}): void {
    const reduced = ctx?.settings?.reducedMotion ?? false;
    const count = reduced ? 6 : (params.count || 18);
    this._PT = [];
    for (let i = 0; i < count; i++) {
      this._PT.push({ x: rnd(), y: rnd(), s: 0.5 + rnd(), p: rnd() * 6, pink: i % 3 === 0 });
    }
    this._MT = [];
    for (let i = 0; i < (reduced ? 8 : 28); i++) {
      this._MT.push({ x: rnd(), y: rnd(), r: 1.8 + rnd() * 2.8, p: rnd() * 6 });
    }
  },

  play(params: PetalsAnimParams = {}): void {
    this._params = { ...this._params, ...params };
    this._active = true;
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
    this._PT = [];
    this._MT = [];
  },

  update(_dt: number, _env: RenderEnv): void {},

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, u, R } = env;
    for (const p of this._PT) {
      const px = (((p.x * W + Math.sin(R * 0.7 + p.p) * 30 + R * 8 * p.s) % W) + W) % W;
      const py = (p.y * H + R * 22 * p.s) % (H * 1.1);
      x.fillStyle = p.pink && this._params.pinkAccent ? 'rgba(255,205,225,.8)' : 'rgba(255,255,255,.82)';
      x.beginPath();
      x.ellipse(px, py, 5 * u * p.s, 2.4 * u * p.s, R * p.s + p.p, 0, TAU);
      x.fill();
    }
    x.globalCompositeOperation = 'lighter';
    for (const m of this._MT) {
      x.globalAlpha = 0.22 + 0.25 * Math.sin(R * 1.5 + m.p);
      const r = m.r * u;
      x.drawImage(G, m.x * W + Math.sin(R * 0.4 + m.p) * 8 - r * 2, ((((m.y * H - R * 8) % H) + H) % H) - r * 2, r * 4, r * 4);
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  }
};

export default petalsAnimation;
