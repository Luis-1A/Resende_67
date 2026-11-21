import { cl, rnd, mkSpr, TAU } from '../../../utils';
import type { RenderEnv } from '../../../types/app';

interface FinaleBalloonItem {
  nx: number;
  ny: number;
  vy: number;
  swayAmp: number;
  swaySpd: number;
  phase: number;
  tilt: number;
  scale: number;
  color: string;
  life: number;
  maxLife: number;
}

const BALLOON_COLS = ['#FF9EC4', '#FFD36E', '#9ED1FF', '#C8A6FF', '#FFBC8A'];
const _balloonSprites = new Map<string, HTMLCanvasElement>();

function getBalloonSprite(color: string): HTMLCanvasElement {
  const existing = _balloonSprites.get(color);
  if (existing) return existing;
  const spr = mkSpr(64, 80, c => {
    const cx = 32;
    const cy = 36;
    const r = 24;
    const bg = c.createRadialGradient(cx - r * 0.28, cy - r * 0.35, r * 0.1, cx, cy, r * 1.2);
    bg.addColorStop(0, '#FFFFFF');
    bg.addColorStop(0.28, color);
    bg.addColorStop(1, color);
    c.fillStyle = bg;
    c.beginPath();
    c.ellipse(cx, cy, r * 0.88, r * 1.12, 0, 0, TAU);
    c.fill();

    c.beginPath();
    c.moveTo(cx - 4, cy + r * 1.12);
    c.lineTo(cx + 4, cy + r * 1.12);
    c.lineTo(cx, cy + r * 1.26);
    c.closePath();
    c.fill();
  });
  _balloonSprites.set(color, spr);
  return spr;
}

export const finaleBalloons = {
  _balloons: [] as FinaleBalloonItem[],
  _partSideways: false,

  init(): void {
    this._balloons = [];
    this._partSideways = false;
  },

  spawnBalloons(count = 12): void {
    this._partSideways = false;
    for (let i = 0; i < count; i++) {
      const col = BALLOON_COLS[i % BALLOON_COLS.length];
      this._balloons.push({
        nx: 0.06 + (i / Math.max(1, count - 1)) * 0.88 + (rnd() - 0.5) * 0.04,
        ny: 1.06 + (i % 3) * 0.08 + rnd() * 0.08,
        vy: -(0.025 + rnd() * 0.022),
        swayAmp: 0.008 + rnd() * 0.012,
        swaySpd: 0.9 + rnd() * 0.8,
        phase: rnd() * TAU,
        tilt: (rnd() - 0.5) * 0.16,
        scale: 0.85 + rnd() * 0.3,
        color: col,
        life: 0,
        maxLife: 13 + rnd() * 7
      });
    }
  },

  partSideways(): void {
    this._partSideways = true;
  },

  update(dt: number, env: RenderEnv): void {
    const time = env.R;
    for (let i = this._balloons.length - 1; i >= 0; i--) {
      const b = this._balloons[i];
      b.life += dt;
      if (b.life >= b.maxLife || b.ny < -0.22) {
        this._balloons.splice(i, 1);
        continue;
      }
      b.ny += b.vy * dt;
      const sway = Math.sin(time * b.swaySpd + b.phase) * b.swayAmp;
      if (this._partSideways) {
        const dir = b.nx < 0.5 ? -1 : 1;
        b.nx += (dir * 0.075 + sway * 0.4) * dt;
      } else {
        b.nx += sway * dt;
      }
      b.tilt = Math.sin(time * b.swaySpd + b.phase) * 0.085;
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._balloons.length) return;
    const { W, H, u, R } = env;

    for (let i = 0; i < this._balloons.length; i++) {
      const b = this._balloons[i];
      const lifeP = b.life / b.maxLife;
      const fadeIn = cl(b.life / 0.9);
      const fadeOut = lifeP > 0.82 ? cl((1 - lifeP) / 0.18) : 1;
      const al = fadeIn * fadeOut * 0.88;
      if (al <= 0.01) continue;

      const px = b.nx * W;
      const py = b.ny * H;
      const r = 18 * u * b.scale;
      const spr = getBalloonSprite(b.color);
      const sprScale = r / 24;
      const drawW = 64 * sprScale;
      const drawH = 80 * sprScale;

      x.save();
      x.translate(px, py);
      x.rotate(b.tilt);
      x.globalAlpha = al;

      const tailBend = Math.sin(R * 2.3 + b.phase) * 9 * u;
      x.strokeStyle = 'rgba(255,245,235,0.48)';
      x.lineWidth = 1.1 * u;
      x.beginPath();
      x.moveTo(0, r * 1.18);
      x.quadraticCurveTo(tailBend, r * 2.2, -tailBend * 0.6, r * 3.4);
      x.stroke();

      x.drawImage(spr, -32 * sprScale, -36 * sprScale, drawW, drawH);

      x.restore();
    }
    x.globalAlpha = 1;
  }
};
