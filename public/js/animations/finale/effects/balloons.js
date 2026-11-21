import { cl, rnd, TAU } from '../../../utils.js';

const BALLOON_COLS = ['#FF9EC4', '#FFD36E', '#9ED1FF', '#C8A6FF', '#FFBC8A'];

export const finaleBalloons = {
  _balloons: [],
  _partSideways: false,

  init() {
    this._balloons = [];
    this._partSideways = false;
  },

  spawnBalloons(count = 12) {
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

  partSideways() {
    this._partSideways = true;
  },

  update(dt, env) {
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

  render(x, env) {
    const { W, H, u, R } = env;

    for (const b of this._balloons) {
      const lifeP = b.life / b.maxLife;
      const fadeIn = cl(b.life / 0.9);
      const fadeOut = lifeP > 0.82 ? cl((1 - lifeP) / 0.18) : 1;
      const al = fadeIn * fadeOut * 0.88;
      if (al <= 0.01) continue;

      const px = b.nx * W;
      const py = b.ny * H;
      const r = 18 * u * b.scale;

      x.save();
      x.translate(px, py);
      x.rotate(b.tilt);
      x.globalAlpha = al;

      // Flexible curved string
      const tailBend = Math.sin(R * 2.3 + b.phase) * 9 * u;
      x.strokeStyle = 'rgba(255,245,235,0.48)';
      x.lineWidth = 1.1 * u;
      x.beginPath();
      x.moveTo(0, r * 1.18);
      x.quadraticCurveTo(tailBend, r * 2.2, -tailBend * 0.6, r * 3.4);
      x.stroke();

      // Balloon body
      const bg = x.createRadialGradient(-r * 0.28, -r * 0.35, r * 0.1, 0, 0, r * 1.2);
      bg.addColorStop(0, '#FFFFFF');
      bg.addColorStop(0.28, b.color);
      bg.addColorStop(1, b.color);
      x.fillStyle = bg;
      x.beginPath();
      x.ellipse(0, 0, r * 0.88, r * 1.12, 0, 0, TAU);
      x.fill();

      // Knot
      x.beginPath();
      x.moveTo(-3 * u, r * 1.12);
      x.lineTo(3 * u, r * 1.12);
      x.lineTo(0, r * 1.24);
      x.closePath();
      x.fill();

      x.restore();
    }
    x.globalAlpha = 1;
  }
};
