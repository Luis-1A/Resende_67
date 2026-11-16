import { rnd, TAU } from '../utils.js';

export const butterfliesAnimation = {
  name: 'butterflies',
  layer: 5,
  worldSpace: false,
  _active: false,
  _BFL: [],

  init(ctx, params = {}) {
    const { settings } = ctx;
    const count = settings.reducedMotion ? 2 : (params.count || 5);
    this._BFL = [];
    for (let i = 0; i < count; i++) {
      this._BFL.push({
        x: .15 + rnd() * .7,
        y: .58 + rnd() * .22,
        p: rnd() * 6,
        c: ['#FFB86B', '#DCEBFF', '#FFC6E8'][i % 3]
      });
    }
  },

  play() {
    this._active = true;
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
    this._BFL = [];
  },

  update() {},

  render(x, env) {
    if (!this._active) return;
    const { W, H, u, R } = env;
    for (let i = 0; i < this._BFL.length; i++) {
      const b = this._BFL[i];
      const bx = W * (b.x + .18 * Math.sin(R * .24 + b.p));
      const by = H * (b.y + .08 * Math.sin(R * .4 + i)) + Math.sin(R * 2.5 + i) * 5 * u;
      const fl = Math.abs(Math.sin(R * 10 + i));
      x.fillStyle = b.c;
      x.beginPath();
      x.ellipse(bx - 5 * u, by, 5 * u * fl + 1, 7 * u, -.45, 0, TAU);
      x.ellipse(bx + 5 * u, by, 5 * u * fl + 1, 7 * u, .45, 0, TAU);
      x.fill();
    }
  }
};

export default butterfliesAnimation;
