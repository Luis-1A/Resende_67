import { cl, ez, glow } from '../utils.js';
import { LT7 } from '../config/scenes.config.js';

export const personalLetterAnimation = {
  name: 'personalLetter',
  layer: 4,
  worldSpace: true,
  _ctx: null,
  _active: false,
  _cardShown: false,
  _timers: [],

  init(ctx) {
    this._ctx = ctx;
    this._timers = [];
    this._cardShown = false;
  },

  play() {
    this._cardShown = false;
    this._active = true;
    if (this._ctx && this._ctx.card) {
      const card = this._ctx.card;
      card.className = '';
      card.scrollTop = 0;
      card.innerHTML = LT7.split('\n\n').map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
    }
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._cardShown = false;
    if (this._ctx && this._ctx.card) {
      this._ctx.card.classList.remove('on');
      this._ctx.card.innerHTML = '';
    }
  },

  update(dt, env) {
    if (!this._active) return;
    if (env.sceneElapsed > 2.2 && !env.exiting && !this._cardShown && this._ctx && this._ctx.card) {
      this._cardShown = true;
      const card = this._ctx.card;
      card.classList.add('on');
      card.querySelectorAll('p').forEach((p, i) => {
        this._timers.push(setTimeout(() => p.classList.add('vis'), 220 * i));
      });
    }
  },

  render(x, env) {
    if (!this._active) return;
    const { W, H, cx, u, R, exiting } = env;
    x.globalCompositeOperation = 'lighter';
    glow(x, cx, H * .5, W * .9, .38);
    if (exiting) {
      const ep = cl((R - exiting.t) / exiting.dur);
      for (let i = 0; i < 24; i++) {
        const gx = cx + ((i / 23) - .5) * Math.min(W * .82, 520);
        const gy = H * .5 - ez(ep) * H * .48 + (i % 3) * 18 * u;
        glow(x, gx, gy, (5 + Math.sin(R * 4 + i)) * u, Math.sin(ep * Math.PI) * .9);
      }
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  }
};

export default personalLetterAnimation;
