import { cl, ez, L, rnd, glow, TAU } from '../../../utils.js';

function quadBezier(p0, p1, p2, t) {
  const it = 1 - t;
  return {
    x: it * it * p0.x + 2 * it * t * p1.x + t * t * p2.x,
    y: it * it * p0.y + 2 * it * t * p1.y + t * t * p2.y
  };
}

export const finaleButterflies = {
  _list: [],

  init() {
    this._list = [];
  },

  spawn({
    p0 = { x: 0, y: 0.75 },
    p1 = { x: 0.45, y: 0.48 },
    p2 = { x: 1, y: 0.15 },
    duration = 8,
    nearCamera = false,
    colorA = '#FFE8FA',
    colorB = '#FFD59E',
    accent = '#F5A6D1',
    landing = false
  } = {}) {
    this._list.push({
      p0, p1, p2,
      t: 0,
      duration,
      nearCamera,
      colorA,
      colorB,
      accent,
      landing,
      landed: false,
      landTimer: 0,
      flapPeriod: 0.44 + rnd() * 0.28, // 440-720ms organic wing cycle
      phase: rnd() * TAU,
      seed: rnd() * 10,
      nx: p0.x,
      ny: p0.y,
      angle: 0,
      wingOpen: 1,
      bodyTilt: 0,
      scale: 1
    });
  },

  update(dt, env) {
    const time = env.R;
    for (let i = this._list.length - 1; i >= 0; i--) {
      const b = this._list[i];
      b.t += dt;

      if (b.landing) {
        const flightK = cl(b.t / b.duration);
        const easedK = flightK > 0.8 ? 0.8 + ez((flightK - 0.8) / 0.2) * 0.2 : flightK;
        const pos = quadBezier(b.p0, b.p1, b.p2, easedK);
        const nextPos = quadBezier(b.p0, b.p1, b.p2, Math.min(1, easedK + 0.02));
        b.nx = pos.x;
        b.ny = pos.y;

        if (flightK < 1) {
          b.angle = Math.atan2(nextPos.y - pos.y, nextPos.x - pos.x) * 0.3;
          const wave = Math.sin((time / b.flapPeriod) * TAU + b.phase);
          b.wingOpen = 0.2 + 0.8 * (0.5 + 0.5 * wave);
        } else {
          b.landed = true;
          b.landTimer += dt;
          // Reduce wing amplitude & close smoothly in 400ms, tilt body gently forward
          const closeK = cl(b.landTimer / 0.4);
          b.wingOpen = L(b.wingOpen, 0.06, closeK);
          b.bodyTilt = L(0, 0.14, ez(closeK));
          b.angle = L(b.angle, 0.08, closeK);
        }
        continue;
      }

      if (b.t >= b.duration) {
        this._list.splice(i, 1);
        continue;
      }

      const k = cl(b.t / b.duration);
      const pos = quadBezier(b.p0, b.p1, b.p2, k);
      const look = quadBezier(b.p0, b.p1, b.p2, Math.min(1, k + 0.02));
      const bob = Math.sin(time * 2.4 + b.seed) * 0.008;
      b.nx = pos.x;
      b.ny = pos.y + bob;
      b.angle = cl(Math.atan2(look.y - pos.y, look.x - pos.x) * 0.25, -0.21, 0.21);

      // Asymmetrical 420-750ms wing flap curve
      const cyc = ((time + b.phase) % b.flapPeriod) / b.flapPeriod;
      if (cyc < 0.28) {
        b.wingOpen = L(1, 0.16, ez(cyc / 0.28));
      } else if (cyc < 0.65) {
        b.wingOpen = L(0.16, 1, ez((cyc - 0.28) / 0.37));
      } else {
        b.wingOpen = 0.9 + 0.1 * Math.cos(((cyc - 0.65) / 0.35) * TAU);
      }

      if (b.nearCamera) {
        const bell = Math.sin(k * Math.PI);
        b.scale = 1 + 0.8 * bell;
      } else {
        b.scale = 0.82 + 0.25 * Math.sin(k * Math.PI);
      }
    }
  },

  render(x, env) {
    const { W, H, u } = env;
    for (const b of this._list) {
      const k = b.landing ? 1 : cl(b.t / b.duration);
      const fadeIn = cl(b.t / 0.9);
      const fadeOut = b.landing ? 1 : (k > 0.82 ? cl((1 - k) / 0.18) : 1);
      const al = fadeIn * fadeOut;
      if (al <= 0.01) continue;

      const px = b.nx * W;
      const py = b.ny * H;
      const s = 12 * u * b.scale;
      const flap = b.wingOpen; // 0.06..1.0

      x.save();
      x.translate(px, py);
      x.rotate(b.angle + b.bodyTilt);

      // Soft translucent shadow when near camera or landed
      if (b.nearCamera || b.landed) {
        x.globalAlpha = al * 0.16;
        x.fillStyle = '#04060D';
        x.beginPath();
        x.ellipse(2 * u, 6 * u, s * 0.75 * flap, s * 0.35, 0, 0, TAU);
        x.fill();
      }

      // Faint edge glow
      x.globalCompositeOperation = 'lighter';
      glow(x, 0, 0, s * 1.4, al * 0.18);
      x.globalCompositeOperation = 'source-over';

      // Mirrored Left & Right Upper + Lower Wings
      for (const side of [-1, 1]) {
        x.save();
        x.scale(side * flap, 1);

        // Upper wing (base + warm inner highlight without per-frame gradient allocation)
        x.globalAlpha = al * 0.88;
        x.fillStyle = b.colorB;
        x.beginPath();
        x.moveTo(0, -s * 0.08);
        x.bezierCurveTo(s * 0.45, -s * 1.1, s * 1.25, -s * 0.78, s * 1.05, -s * 0.02);
        x.bezierCurveTo(s * 0.75, s * 0.14, s * 0.3, s * 0.1, 0, s * 0.05);
        x.closePath();
        x.fill();

        x.globalAlpha = al * 0.56;
        x.fillStyle = b.colorA;
        x.beginPath();
        x.moveTo(0, -s * 0.06);
        x.bezierCurveTo(s * 0.32, -s * 0.78, s * 0.86, -s * 0.54, s * 0.72, -s * 0.04);
        x.closePath();
        x.fill();

        // Delicate wing veining & accent dot
        x.strokeStyle = `rgba(255,255,255,${0.45 * al})`;
        x.lineWidth = 0.75 * u;
        x.beginPath();
        x.moveTo(0, 0);
        x.quadraticCurveTo(s * 0.48, -s * 0.45, s * 0.86, -s * 0.32);
        x.stroke();

        // Lower wing
        x.globalAlpha = al * 0.84;
        x.fillStyle = b.accent || b.colorB;
        x.beginPath();
        x.moveTo(0, s * 0.05);
        x.bezierCurveTo(s * 0.65, s * 0.08, s * 0.92, s * 0.56, s * 0.48, s * 0.82);
        x.bezierCurveTo(s * 0.22, s * 0.76, s * 0.08, s * 0.42, 0, s * 0.22);
        x.closePath();
        x.fill();

        x.restore();
      }

      // Central body, head & two antennae
      x.globalAlpha = al * 0.95;
      x.fillStyle = '#241826';
      x.beginPath();
      x.ellipse(0, s * 0.04, s * 0.09, s * 0.34, 0, 0, TAU);
      x.fill();
      // Head
      x.beginPath();
      x.arc(0, -s * 0.32, s * 0.1, 0, TAU);
      x.fill();
      // Antennae
      x.strokeStyle = `rgba(255,244,230,${0.7 * al})`;
      x.lineWidth = 0.8 * u;
      for (const side of [-1, 1]) {
        x.beginPath();
        x.moveTo(0, -s * 0.38);
        x.quadraticCurveTo(side * s * 0.16, -s * 0.58, side * s * 0.24, -s * 0.64);
        x.stroke();
      }

      x.restore();
    }
    x.globalAlpha = 1;
  }
};
