import { cl, L, ez, glow, getNumber18Points } from '../utils.js';

export const finaleAnimation = {
  name: 'finale',
  layer: 4,
  worldSpace: true,
  _active: false,
  _NP: [],
  _params: { numberDelay: 5.5 },

  init() {
    this._NP = getNumber18Points();
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
  },

  update() {},

  render(x, env) {
    if (!this._active) return;
    const { W, H, cx, u, R, RM, sceneElapsed: st } = env;

    // Illuminated garden fairy lights
    x.globalCompositeOperation = 'lighter';
    const fa = ez(cl(st / 4));
    for (let i = 0; i < 14; i++) {
      glow(x, (i / 13) * W, H * (.74 + (i % 3) * .025), 11 * u, (.35 + .4 * Math.sin(R * 2.5 + i)) * fa);
    }

    // 18 particle constellation with sweep shimmer & late fade
    const el = st - (this._params.numberDelay ?? 5.5);
    if (el > 0) {
      const form1 = ez(cl((el - 1.4) / 2.2));
      const form8 = ez(cl((el - 2.2) / 2.4));
      const fade8 = 1 - cl((st - 32) / 6);
      if (fade8 > .01) {
        const sc2 = Math.min(W * .22, H * .13);
        glow(x, cx, H * .3, sc2 * 1.55, .2 * form8 * fade8);
        const sweep = ((el - 4.5) % 5) / 5;
        for (const p of this._NP) {
          const kf = p.a[2] ? form1 : form8;
          const ang = p.ang + el * .65 * (1 - kf);
          const circX = Math.cos(ang) * sc2 * 1.15, circY = Math.sin(ang) * sc2 * .85;
          const px = cx + L(circX, p.a[0] * sc2, kf) + (RM ? 0 : Math.sin(R * 1.3 + p.p) * 1.8);
          const py = H * .3 + L(circY, p.a[1] * sc2, kf);
          const swBoost = (el > 4.5 && Math.abs((p.a[0] + 1) * .5 - sweep) < .15) ? .35 : 0;
          const r = (2.4 + Math.sin(R * 3 + p.p) * .7 + swBoost * 2) * u;
          glow(x, px, py, r * 2.25, (.55 + .25 * kf + swBoost) * fade8);
        }
      }
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  }
};

export default finaleAnimation;
