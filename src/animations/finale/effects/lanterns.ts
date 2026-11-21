import { rnd, glow, mkSpr, rr, G, TAU } from '../../../utils';
import type { RenderEnv } from '../../../types/app';

interface FinaleLanternItem {
  nx: number;
  ny: number;
  vy: number;
  vx: number;
  scale: number;
  phase: number;
  alpha: number;
  targetAlpha: number;
}

let _lanternSpr: HTMLCanvasElement | null = null;
function getLanternSprite(): HTMLCanvasElement {
  if (_lanternSpr) return _lanternSpr;
  _lanternSpr = mkSpr(48, 64, c => {
    const g = c.createLinearGradient(24, 4, 24, 60);
    g.addColorStop(0, '#FFB86B');
    g.addColorStop(0.55, '#FFE0A3');
    g.addColorStop(1, '#FFF6DA');
    c.fillStyle = g;
    rr(c, 4, 4, 40, 56, 9);
    c.fill();
  });
  return _lanternSpr;
}

export const finaleLanterns = {
  _list: [] as FinaleLanternItem[],
  _fadingOut: false,

  init(): void {
    this._list = [];
    this._fadingOut = false;
  },

  spawnLanterns(count = 12): void {
    this._fadingOut = false;
    for (let i = 0; i < count; i++) {
      const depth = 0.45 + rnd() * 0.55;
      this._list.push({
        nx: 0.06 + rnd() * 0.88,
        ny: 0.78 + rnd() * 0.26,
        vy: -(0.016 + rnd() * 0.022) * depth,
        vx: (rnd() - 0.5) * 0.008,
        scale: (0.45 + rnd() * 0.55) * depth,
        phase: rnd() * TAU,
        alpha: 0,
        targetAlpha: 0.65 + rnd() * 0.3
      });
    }
  },

  fadeOutAll(): void {
    this._fadingOut = true;
  },

  update(dt: number, env: RenderEnv): void {
    for (let i = this._list.length - 1; i >= 0; i--) {
      const l = this._list[i];
      l.ny += l.vy * dt;
      l.nx += (l.vx + Math.sin(env.R * 0.9 + l.phase) * 0.005) * dt;
      l.scale = Math.max(0.18, l.scale - dt * 0.008);
      if (this._fadingOut || l.ny < 0.04) {
        l.alpha -= dt * 0.35;
        if (l.alpha <= 0.01 || l.ny < -0.1) {
          this._list.splice(i, 1);
          continue;
        }
      } else {
        l.alpha = Math.min(l.targetAlpha, l.alpha + dt * 0.45);
      }
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._list.length) return;
    const { W, H, u, R } = env;
    const spr = getLanternSprite();

    x.save();
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < this._list.length; i++) {
      const l = this._list[i];
      if (l.alpha <= 0.01) continue;
      const w = 13 * u * l.scale;
      const flicker = 0.88 + 0.12 * Math.sin(R * 7 + l.phase);
      glow(x, l.nx * W, l.ny * H, w * 1.9, l.alpha * 0.38 * flicker, G);
    }
    x.restore();

    x.save();
    for (let i = 0; i < this._list.length; i++) {
      const l = this._list[i];
      if (l.alpha <= 0.01) continue;
      const px = l.nx * W;
      const py = l.ny * H;
      const w = 15.6 * u * l.scale;
      const h = 21.6 * u * l.scale;
      x.globalAlpha = l.alpha;
      x.drawImage(spr, px - w * 0.5, py - h * 0.5, w, h);
    }
    x.restore();
    x.globalAlpha = 1;
  }
};
