import { glow, TAU } from '../utils.js';

export const lanternsAnimation = {
  name: 'lanterns',
  layer: 4,
  worldSpace: true,
  _active: false,
  _params: { count: 6 },

  init() {},

  play(params = {}) {
    this._params = { ...this._params, ...params };
    this._active = true;
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
  },

  update() {},

  render(x, env) {
    if (!this._active) return;
    const { W, H, u, R } = env;
    const count = this._params.count || 6;
    for (let i = 0; i < count; i++) {
      const lx = (i * .17 + .08) * W + Math.sin(R * .4 + i) * 10 * u;
      const ly = H * (.62 - (R * .011 * (1 + i * .1) + i * .17) % 1 * .58) + H * .06;
      const sz = 10 * u;
      x.globalCompositeOperation = 'lighter';
      glow(x, lx, ly, 26 * u, .78);
      x.globalCompositeOperation = 'source-over';
      x.fillStyle = 'rgba(255,205,120,.86)';
      x.beginPath();
      x.moveTo(lx - sz * .52, ly - sz * .6);
      x.lineTo(lx + sz * .52, ly - sz * .6);
      x.lineTo(lx + sz * .36, ly + sz * .55);
      x.lineTo(lx - sz * .36, ly + sz * .55);
      x.closePath();
      x.fill();
      x.fillStyle = '#FFF7DF';
      x.beginPath(); x.arc(lx, ly + sz * .28, sz * .18, 0, TAU); x.fill();
    }
    x.globalAlpha = 1;
  }
};

export default lanternsAnimation;
