import { cl, L, ez, glow, rr, getNumber18Points, TAU } from '../utils.js';

export const cakeAnimation = {
  name: 'cake',
  layer: 4,
  worldSpace: true,
  _active: false,
  _NP: [],
  _params: { numberDelay: 8 },

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

    // Fairy horizon lights
    x.globalCompositeOperation = 'lighter';
    const fa = ez(cl(st / 4));
    for (let i = 0; i < 14; i++) {
      glow(x, (i / 13) * W, H * (.74 + (i % 3) * .025), 11 * u, (.35 + .4 * Math.sin(R * 2.5 + i)) * fa);
    }
    x.globalCompositeOperation = 'source-over';

    // 3-tier cake + lighting candles
    const cw = Math.min(W * .42, H * .23), h = cw * .2, by = H * .93, ca = ez(cl((st - 1) / 3));
    if (st < 3.5) {
      x.globalCompositeOperation = 'lighter';
      glow(x, cx, by - h, cw * .9 * (1 - st / 3.5), Math.sin((st / 3.5) * Math.PI) * .75);
      x.globalCompositeOperation = 'source-over';
    }
    x.globalAlpha = ca;
    x.fillStyle = 'rgba(255,235,195,.18)';
    x.beginPath(); x.ellipse(cx, by + 3 * u, cw * .58, h * .28, 0, 0, TAU); x.fill();

    [[1, '#FFD4E2', '#F4ADC6'], [.72, '#FFF0C9', '#EAD39C'], [.46, '#D5E7FF', '#ADC9EF']].forEach((t, i) => {
      const w = cw * t[0], y = by - i * h;
      x.fillStyle = t[1]; rr(x, cx - w / 2, y - h, w, h, h * .2); x.fill();
      x.fillStyle = t[2]; rr(x, cx + w * .18, y - h, w * .32, h, h * .18); x.fill();
      x.fillStyle = 'rgba(255,255,255,.88)'; rr(x, cx - w / 2, y - h, w, h * .26, h * .12); x.fill();
      for (let d = -3; d <= 3; d++) { x.beginPath(); x.arc(cx + d * (w * .12), y - h * .72, h * .09, 0, TAU); x.fill(); }
    });

    const ty = by - 3 * h;
    for (let i = 0; i < 5; i++) {
      const px = cx + (i - 2) * cw * .09;
      const appear = ez(cl((st - 3 - i * .35) / .5));
      const on = st > 4.8 + i * .45;
      if (appear <= 0) continue;
      x.globalAlpha = ca * appear;
      x.fillStyle = '#FFF9EF'; x.fillRect(px - 2 * u, ty - h * .52 * appear, 4 * u, h * .52 * appear);
      x.fillStyle = '#2B1F1B'; x.fillRect(px - .5 * u, ty - h * .57 * appear, 1 * u, h * .07 * appear);
      if (on) {
        const f = RM ? 0 : Math.sin(R * 12 + i) * .15;
        x.globalCompositeOperation = 'lighter';
        glow(x, px, ty - h * .72, cw * .14, .92);
        x.fillStyle = '#FFD27A'; x.beginPath(); x.ellipse(px, ty - h * .65, 2.7 * u, h * .24 * (1 + f), 0, 0, TAU); x.fill();
        x.fillStyle = '#FFFBE6'; x.beginPath(); x.ellipse(px, ty - h * .62, 1.3 * u, h * .12 * (1 + f), 0, 0, TAU); x.fill();
        x.globalCompositeOperation = 'source-over';
      }
    }
    x.globalAlpha = 1;

    // Luminous circle rearranging into 1 & 8
    const el = st - (this._params.numberDelay ?? 8);
    if (el > 0) {
      const form1 = ez(cl((el - 1.4) / 2.2));
      const form8 = ez(cl((el - 2.2) / 2.4));
      x.globalCompositeOperation = 'lighter';
      const sc2 = Math.min(W * .22, H * .13);
      glow(x, cx, H * .3, sc2 * 1.55, .2 * form8);
      const sweep = ((el - 4.5) % 5) / 5;
      for (const p of this._NP) {
        const kf = p.a[2] ? form1 : form8;
        const ang = p.ang + el * .65 * (1 - kf);
        const circX = Math.cos(ang) * sc2 * 1.15, circY = Math.sin(ang) * sc2 * .85;
        const px = cx + L(circX, p.a[0] * sc2, kf) + (RM ? 0 : Math.sin(R * 1.3 + p.p) * 1.8);
        const py = H * .3 + L(circY, p.a[1] * sc2, kf);
        const swBoost = (el > 4.5 && Math.abs((p.a[0] + 1) * .5 - sweep) < .15) ? .35 : 0;
        const r = (2.4 + Math.sin(R * 3 + p.p) * .7 + swBoost * 2) * u;
        glow(x, px, py, r * 2.25, .55 + .25 * kf + swBoost);
      }
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 1;
    }
  }
};

export default cakeAnimation;
