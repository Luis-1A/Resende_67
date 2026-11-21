import { cl, L, rnd, TAU } from '../../../utils';
import { getFinaleQuality } from '../config/finale-quality';
import type { RenderEnv } from '../../../types/app';

export type PetalWaveMode = 'top' | 'sides' | 'swirl';

interface FinalePetalItem {
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  mode: PetalWaveMode;
  depth: number;
  size: number;
  rot: number;
  vRot: number;
  tiltPhase: number;
  tiltSpd: number;
  swayAmp: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
}

export const finalePetals = {
  _list: [] as FinalePetalItem[],

  init(): void {
    this._list = [];
  },

  spawnWave({
    count = 35,
    mode = 'top',
    colors = ['#FFF5F8', '#FFD6E6', '#FFEBD8']
  }: {
    count?: number;
    mode?: PetalWaveMode;
    colors?: string[];
  } = {}): void {
    const cap = getFinaleQuality().petalsMax;
    const room = Math.max(0, cap - this._list.length);
    const actual = Math.min(count, room);

    for (let i = 0; i < actual; i++) {
      let nx = rnd();
      let ny = -0.05 - rnd() * 0.22;
      let vx = (rnd() - 0.5) * 0.035;
      let vy = 0.045 + rnd() * 0.045;
      const depth = rnd();

      if (mode === 'sides') {
        const fromLeft = i % 2 === 0;
        nx = fromLeft ? -0.06 - rnd() * 0.1 : 1.06 + rnd() * 0.1;
        ny = 0.08 + rnd() * 0.72;
        vx = (fromLeft ? 1 : -1) * (0.12 + rnd() * 0.12);
        vy = 0.02 + rnd() * 0.04;
      } else if (mode === 'swirl') {
        nx = rnd();
        ny = -0.05 - rnd() * 0.15;
        vx = 0.08 + rnd() * 0.09;
        vy = 0.035 + rnd() * 0.04;
      }

      this._list.push({
        nx,
        ny,
        vx,
        vy,
        mode,
        depth,
        size: L(7, 26, depth * depth),
        rot: rnd() * TAU,
        vRot: (rnd() - 0.5) * 3.4,
        tiltPhase: rnd() * TAU,
        tiltSpd: 2.2 + rnd() * 2.5,
        swayAmp: 0.015 + rnd() * 0.025,
        life: 0,
        maxLife: 4.5 + rnd() * 4.5,
        color: colors[i % colors.length],
        alpha: depth > 0.8 ? 0.58 : 0.72 + rnd() * 0.25
      });
    }
  },

  triggerWindShift(): void {
    for (const p of this._list) {
      p.mode = 'swirl';
      p.vy = -0.04 - rnd() * 0.04;
      p.vx = (rnd() < 0.5 ? -1 : 1) * (0.09 + rnd() * 0.08);
    }
  },

  update(dt: number, env: RenderEnv): void {
    const time = env.R;
    for (let i = this._list.length - 1; i >= 0; i--) {
      const p = this._list[i];
      p.life += dt;
      if (p.life >= p.maxLife || p.ny > 1.15 || p.nx < -0.2 || p.nx > 1.2) {
        this._list.splice(i, 1);
        continue;
      }
      if (p.mode === 'swirl') {
        p.vy = Math.min(0.065, p.vy + dt * 0.06);
        p.vx *= Math.max(0.92, 1 - dt * 0.35);
      }
      const lateral = Math.sin(time * 2.1 + p.tiltPhase) * p.swayAmp;
      p.nx += (p.vx + lateral) * dt;
      p.ny += p.vy * dt;
      p.rot += p.vRot * dt;
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv, textActive = false): void {
    const { W, H, u, R } = env;
    for (const p of this._list) {
      const lifeP = p.life / p.maxLife;
      const fadeIn = cl(lifeP / 0.12);
      const fadeOut = lifeP > 0.75 ? cl((1 - lifeP) / 0.25) : 1;
      const inText = textActive && p.nx > 0.15 && p.nx < 0.85 && p.ny > 0.25 && p.ny < 0.75;
      const al = p.alpha * fadeIn * fadeOut * (inText ? 0.45 : 1);
      if (al <= 0.01) continue;

      const tiltScale = 0.45 + 0.55 * Math.abs(Math.sin(R * p.tiltSpd + p.tiltPhase));
      const sz = p.size * u;

      x.save();
      x.translate(p.nx * W, p.ny * H);
      x.rotate(p.rot);
      x.scale(1, tiltScale);
      x.globalAlpha = al;
      x.fillStyle = p.color;
      x.beginPath();
      x.moveTo(-sz * 0.55, 0);
      x.quadraticCurveTo(-sz * 0.1, -sz * 0.36, sz * 0.55, -sz * 0.05);
      x.quadraticCurveTo(sz * 0.15, sz * 0.36, -sz * 0.55, 0);
      x.fill();
      x.restore();
    }
    x.globalAlpha = 1;
  }
};
