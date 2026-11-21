import { cl, rnd, TAU } from '../../../utils';
import { getFinaleQuality } from '../config/finale-quality';
import type { RenderEnv } from '../../../types/app';

interface FinaleConfettiItem {
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  shape: 'circle' | 'rect' | 'ribbon';
  size: number;
  rot: number;
  vRot: number;
  phase: number;
  color: string;
  life: number;
  maxLife: number;
}

const CONFETTI_COLS = ['#FFE58F', '#FF9EC4', '#9ED1FF', '#FFFFFF', '#C8A6FF'];

export const finaleConfetti = {
  _list: [] as FinaleConfettiItem[],

  init(): void {
    this._list = [];
  },

  spawnWave(count = 50): void {
    const cap = getFinaleQuality().confettiMax;
    const room = Math.max(0, cap - this._list.length);
    const n = Math.min(count, room);

    for (let i = 0; i < n; i++) {
      const leftSide = i % 2 === 0;
      this._list.push({
        nx: leftSide ? 0.04 + rnd() * 0.28 : 0.68 + rnd() * 0.28,
        ny: -0.04 - rnd() * 0.12,
        vx: (leftSide ? 1 : -1) * (0.04 + rnd() * 0.07),
        vy: 0.055 + rnd() * 0.065,
        shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'rect' : 'ribbon',
        size: 3.2 + rnd() * 5.2,
        rot: rnd() * TAU,
        vRot: (rnd() - 0.5) * 6,
        phase: rnd() * TAU,
        color: CONFETTI_COLS[i % CONFETTI_COLS.length],
        life: 0,
        maxLife: 3.2 + rnd() * 2.8
      });
    }
  },

  update(dt: number, env: RenderEnv): void {
    for (let i = this._list.length - 1; i >= 0; i--) {
      const c = this._list[i];
      c.life += dt;
      if (c.life >= c.maxLife || c.ny > 1.06) {
        this._list.splice(i, 1);
        continue;
      }
      c.vx *= Math.max(0.92, 1 - dt * 0.35);
      c.nx += (c.vx + Math.sin(env.R * 3 + c.phase) * 0.018) * dt;
      c.ny += c.vy * dt;
      c.rot += c.vRot * dt;
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    const { W, H, u } = env;
    for (const c of this._list) {
      const lifeP = c.life / c.maxLife;
      const al = lifeP > 0.75 ? cl((1 - lifeP) / 0.25) : cl(lifeP / 0.08);
      if (al <= 0.01) continue;

      const sz = c.size * u;
      x.save();
      x.translate(c.nx * W, c.ny * H);
      x.rotate(c.rot);
      x.scale(1, Math.cos(c.rot * 0.7));
      x.globalAlpha = al * 0.9;
      x.fillStyle = c.color;
      if (c.shape === 'circle') {
        x.beginPath();
        x.arc(0, 0, sz * 0.45, 0, TAU);
        x.fill();
      } else if (c.shape === 'ribbon') {
        x.fillRect(-sz * 0.85, -sz * 0.22, sz * 1.7, sz * 0.44);
      } else {
        x.fillRect(-sz * 0.55, -sz * 0.38, sz * 1.1, sz * 0.76);
      }
      x.restore();
    }
    x.globalAlpha = 1;
  }
};
