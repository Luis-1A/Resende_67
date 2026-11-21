import { cl, rnd, TAU } from '../utils';
import { COLF } from '../config/scenes.config';
import type { AnimationModule, RenderEnv } from '../types/app';

interface AnimSpark {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  l: number;
  maxL: number;
  c: string;
}

interface AnimConfetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  w: number;
  h: number;
  c: string;
}

export const fireworksAnimation: AnimationModule & {
  _active: boolean;
  _FW: AnimSpark[];
  _CF: AnimConfetti[];
  _confettiSpawned: boolean;
  _params: {
    confettiCount: number;
    burstRate: number;
    burstSize: number;
    startDelay: number;
    endAfter: number | null;
    sideMode: string;
  };
  _burst: (px: number, py: number, n: number, W: number, H: number) => void;
  _spawnConfetti: (n: number, W: number, H: number, u: number) => void;
} = {
  name: 'fireworks',
  layer: 7,
  worldSpace: false,
  _active: false,
  _FW: [],
  _CF: [],
  _confettiSpawned: false,
  _params: {
    confettiCount: 95,
    burstRate: 0.016,
    burstSize: 24,
    startDelay: 12,
    endAfter: null,
    sideMode: 'edges'
  },

  init(): void {
    this._FW = [];
    this._CF = [];
    this._confettiSpawned = false;
  },

  play(params: Record<string, unknown> = {}): void {
    this._params = {
      confettiCount: Number(params.confettiCount ?? 95),
      burstRate: Number(params.burstRate ?? 0.016),
      burstSize: Number(params.burstSize ?? 24),
      startDelay: Number(params.startDelay ?? 12),
      endAfter: params.endAfter != null ? Number(params.endAfter) : null,
      sideMode: String(params.sideMode ?? 'edges')
    };
    this._FW = [];
    this._CF = [];
    this._confettiSpawned = false;
    this._active = true;
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
    this._FW = [];
    this._CF = [];
    this._confettiSpawned = false;
  },

  _burst(px: number, py: number, n: number, W: number, H: number): void {
    const st2 = rnd() < 0.42;
    const c = ['255,224,130', '255,255,255', '160,210,255', '255,160,200'][(rnd() * 4) | 0];
    for (let i = 0; i < n; i++) {
      const a = rnd() * TAU;
      const v = (0.28 + rnd() * 0.72) * Math.min(W, H) * 0.42 * (st2 ? 1 + 0.45 * Math.cos(5 * a) : 1) * (rnd() < 0.4 ? 0.6 : 1);
      this._FW.push({ x: px, y: py, px, py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1.25 + rnd() * 0.75, maxL: 1.9, c });
    }
  },

  _spawnConfetti(n: number, W: number, H: number, u: number): void {
    for (let i = 0; i < n; i++) {
      this._CF.push({
        x: rnd() * W,
        y: -rnd() * H * 0.45,
        vx: (rnd() - 0.5) * 55 * u,
        vy: (55 + rnd() * 105) * u,
        r: rnd() * 6,
        vr: (rnd() - 0.5) * 8,
        w: (5 + rnd() * 5) * u,
        h: (3 + rnd() * 4) * u,
        c: COLF[(rnd() * 4) | 0]
      });
    }
  },

  update(dt: number, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, u, R, sceneElapsed: st, tm } = env;

    if (st > 10 && !this._confettiSpawned) {
      this._confettiSpawned = true;
      this._spawnConfetti(this._params.confettiCount || 95, W, H, u);
    }

    const maxBurstTime = this._params.endAfter != null ? this._params.endAfter : (tm[3] ? tm[3] + 20 : 999);
    if (st > (this._params.startDelay ?? 12) && st < maxBurstTime && rnd() < (this._params.burstRate ?? 0.016)) {
      const bx = this._params.sideMode === 'wide'
        ? W * (rnd() < 0.5 ? 0.1 + rnd() * 0.22 : 0.68 + rnd() * 0.22)
        : W * (rnd() < 0.5 ? 0.15 : 0.85);
      this._burst(bx, H * (0.08 + rnd() * 0.26), this._params.burstSize || 24, W, H);
    }

    for (let i = this._FW.length - 1; i >= 0; i--) {
      const p = this._FW[i];
      p.px = p.x; p.py = p.y;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += Math.min(W, H) * 0.28 * dt;
      p.vx *= 0.99;
      p.l -= dt;
      if (p.l <= 0) this._FW.splice(i, 1);
    }

    for (let i = this._CF.length - 1; i >= 0; i--) {
      const p = this._CF[i];
      p.x += (p.vx + Math.sin(R * 2 + p.r) * 20) * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      if (p.y > H + 20) this._CF.splice(i, 1);
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { u } = env;
    x.globalCompositeOperation = 'lighter';
    for (const p of this._FW) {
      const lr = cl(p.l / p.maxL);
      x.globalAlpha = lr * 0.7;
      x.strokeStyle = 'rgb(' + p.c + ')';
      x.lineWidth = Math.max(0.5, 2 * u * lr);
      x.beginPath(); x.moveTo(p.px, p.py); x.lineTo(p.x, p.y); x.stroke();
      x.globalAlpha = lr;
      x.fillStyle = 'rgb(' + p.c + ')';
      x.beginPath(); x.arc(p.x, p.y, Math.max(0.4, 2.4 * u * lr), 0, TAU); x.fill();
    }

    x.globalCompositeOperation = 'source-over';
    for (const p of this._CF) {
      x.save();
      x.globalAlpha = 0.88;
      x.translate(p.x, p.y);
      x.rotate(p.r);
      x.scale(1, Math.cos(p.r * 1.7));
      x.fillStyle = p.c;
      x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      x.restore();
    }
    x.globalAlpha = 1;
  }
};

export default fireworksAnimation;
