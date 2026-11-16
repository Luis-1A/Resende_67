import { cl, ez, rnd, glow, TAU } from '../utils.js';

export const flowersAnimation = {
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

  init(ctx) {
    const { settings } = ctx;
    const nf = settings.reducedMotion ? 10 : settings.isMobile ? 18 : 28;
    this._flowers = [];
    for (let i = 0; i < nf; i++) {
      this._flowers.push({
        x: (i + rnd() * .8) / nf,
        y: rnd(),
        h: rnd(),
        p: rnd() * 6,
        c: i,
        d: rnd(),
        depth: i % 3
      });
    }
  },

  play(params = {}) {
    this._params = { ...this._params, ...params };
    this._active = true;
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
    this._flowers = [];
  },

  update() {},

  render(x, env) {
    if (!this._active) return;
    const { W, H, u, R, RM, sceneElapsed } = env;
    const st = sceneElapsed - (this._params.startDelay || 0);
    if (st < 0) return;

    const cols = this._params.colors;
    for (const f of this._flowers) {
      if (this._params.cornersOnly && f.x > .18 && f.x < .82) continue;

      const dl = this._params.mode === 'wave'
        ? (1.5 + f.x * 5.5)
        : this._params.mode === 'opening'
          ? (8.5 + f.d * 5.5)
          : (f.d * 3.2);

      const g = ez(cl((st - dl) / 2.2));
      const b = cl((st - dl - 1.5) / 2.4);
      if (g <= .02) continue;

      const fx = f.x * W;
      const by = H * (.9 + f.y * .1);
      const h = H * (.055 + f.h * .095) * g;
      const sw = RM ? 0 : Math.sin(R * .85 + f.p) * (2.5 + b * 4) * u;

      x.strokeStyle = f.depth === 0 ? '#1F4E35' : '#2E6B4A';
      x.lineWidth = (f.depth === 2 ? 2.4 : 1.7) * u;
      x.beginPath();
      x.moveTo(fx, by);
      x.quadraticCurveTo(fx + sw * .5, by - h * .5, fx + sw, by - h);
      x.stroke();

      if (g > .45) {
        x.fillStyle = f.depth === 0 ? '#2E6C4B' : '#3E8A5E';
        x.beginPath();
        x.ellipse(fx + sw * .4 - 5.5 * u * g, by - h * .4, 6.5 * u * g, 2.4 * u * g, -.6, 0, TAU);
        x.ellipse(fx + sw * .4 + 5.5 * u * g, by - h * .55, 6.5 * u * g, 2.4 * u * g, .6, 0, TAU);
        x.fill();
      }

      const r = (7 + f.h * 9) * (f.depth === 2 ? 1.15 : f.depth === 0 ? .78 : 1) * u;
      if (g > .82 && b <= .1) {
        x.fillStyle = '#4C9A6C';
        x.beginPath(); x.ellipse(fx + sw, by - h, r * .24, r * .38, 0, 0, TAU); x.fill();
      }

      if (b > 0) {
        x.fillStyle = cols[f.c % cols.length];
        for (let i = 0; i < 6; i++) {
          const a = i * 1.047 + f.p;
          x.beginPath();
          x.ellipse(fx + sw + Math.cos(a) * r * .58 * b, by - h + Math.sin(a) * r * .58 * b, r * .52 * b, r * .29 * b, a, 0, TAU);
          x.fill();
        }
        x.globalAlpha = .35;
        x.fillStyle = '#FFF9EC';
        for (let i = 0; i < 6; i++) {
          const a = i * 1.047 + f.p + .52;
          x.beginPath();
          x.ellipse(fx + sw + Math.cos(a) * r * .34 * b, by - h + Math.sin(a) * r * .34 * b, r * .3 * b, r * .16 * b, a, 0, TAU);
          x.fill();
        }
        x.globalAlpha = 1;
        x.fillStyle = '#FFE08A';
        x.beginPath(); x.arc(fx + sw, by - h, r * .26 * b, 0, TAU); x.fill();
        x.fillStyle = '#FFF8DC';
        x.beginPath(); x.arc(fx + sw, by - h, r * .12 * b, 0, TAU); x.fill();
      }

      if (this._params.bloomGlow && b > 0 && b < 1) {
        x.globalCompositeOperation = 'lighter';
        glow(x, fx + sw, by - h, r * 2.9, .45 * (1 - b));
        x.globalCompositeOperation = 'source-over';
        x.globalAlpha = 1;
      }
    }
  }
};

export default flowersAnimation;
