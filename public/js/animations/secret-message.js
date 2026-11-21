import { cl, L, ez, glow, star4, hp, TAU } from '../utils.js';
import { LT9 } from '../config/scenes.config.js';
import { settings } from '../config/settings.js';

export const secretMessageAnimation = {
  name: 'secretMessage',
  layer: 5,
  worldSpace: true,
  _ctx: null,
  _active: false,
  _stg: 0,
  _t1: 0,
  _hoverStar: false,
  _RP: [],
  _timers: [],

  init(ctx) {
    this._ctx = ctx;
    this._stg = 0;
    this._t1 = 0;
    this._hoverStar = false;
    this._RP = [];
    this._timers = [];
  },

  play() {
    this._stg = 0;
    this._t1 = 0;
    this._hoverStar = false;
    this._RP = [];
    this._active = true;
    if (this._ctx && this._ctx.card) {
      const card = this._ctx.card;
      card.className = 'dk';
      card.scrollTop = 0;
      card.innerHTML = LT9.split('\n\n').map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
    }
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._RP = [];
    this._hoverStar = false;
    if (this._ctx && this._ctx.canvas) this._ctx.canvas.style.cursor = 'default';
    if (this._ctx && this._ctx.card) {
      this._ctx.card.classList.remove('on');
      this._ctx.card.innerHTML = '';
    }
  },

  onPointerMove(e) {
    if (!this._active || !this._ctx) return;
    const { cx, H, u } = this._ctx.screenManager.getBounds();
    if (this._stg === 0) {
      this._hoverStar = Math.hypot(e.clientX - cx, e.clientY - H * .34) < 48 * u;
      this._ctx.canvas.style.cursor = this._hoverStar ? 'pointer' : 'default';
    } else {
      this._hoverStar = false;
      this._ctx.canvas.style.cursor = 'default';
    }
  },

  onPointerDown(e, R) {
    if (!this._active || !this._ctx || this._stg !== 0) return false;
    const { cx, H, u } = this._ctx.screenManager.getBounds();
    if (Math.hypot(e.clientX - cx, e.clientY - H * .34) < 64 * u) {
      this._RP.push({ x: e.clientX, y: e.clientY, l: 0 });
      this._stg = 1;
      this._t1 = R;
      this._hoverStar = false;
      this._ctx.canvas.style.cursor = 'default';
      return true;
    }
    return false;
  },

  advanceStage(R) {
    if (this._stg === 2) {
      this._stg = 3;
      this._t1 = R;
      if (this._ctx) {
        this._ctx.card.classList.remove('on');
        this._ctx.nx.classList.remove('on');
      }
      return false;
    }
    if (this._stg === 3) {
      if (this._ctx && typeof this._ctx.onFinish === 'function') this._ctx.onFinish();
      return true;
    }
    return false;
  },

  shouldShowContinue(R) {
    return this._stg === 2 && (R - this._t1) > settings.scene9ContinueDelay;
  },

  update(dt) {
    if (!this._active) return;
    for (let i = this._RP.length - 1; i >= 0; i--) {
      this._RP[i].l += dt;
      if (this._RP[i].l > .9) this._RP.splice(i, 1);
    }
  },

  render(x, env) {
    if (!this._active) return;
    const { W, H, cx, u, R, RM, fin } = env;
    const hs = Math.min(W, H) * .011, hy = H * .5, sx = cx, sy0 = H * .34;

    if (this._stg === 0) {
      const pulse = RM ? .65 : (.5 + .5 * Math.sin(R * 2.4));
      const sa = (this._hoverStar ? 1 : .62) + .32 * pulse;
      x.globalCompositeOperation = 'lighter';
      glow(x, sx, sy0, this._hoverStar ? 48 * u : 36 * u, sa);
      glow(x, sx, sy0, 14 * u, 1);
      if (!RM) {
        const rp = (R * .38) % 1, rrPulse = (9 + 28 * ez(rp)) * u, ra = (1 - rp) * (this._hoverStar ? .52 : .34);
        x.strokeStyle = `rgba(255,244,208,${ra})`;
        x.lineWidth = 1.15 * u;
        x.beginPath(); x.arc(sx, sy0, rrPulse, 0, TAU); x.stroke();
      }
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = .88 + .12 * pulse;
      x.fillStyle = '#FFF9E6';
      star4(x, sx, sy0, (this._hoverStar ? 11 : 8.5) * u * (1 + .1 * pulse), RM ? 0 : R * .12);
      x.globalAlpha = 1;
    } else {
      const k = this._stg === 1 ? cl((R - this._t1) / 3) : 1;
      const fade = this._stg === 3 ? 1 - cl((R - this._t1) / 2) : 1;
      x.globalAlpha = .9 * fade;
      x.strokeStyle = '#fff';
      x.lineWidth = 3 * u;
      x.beginPath();
      for (let i = 0; i <= 80 * k; i++) {
        const p = hp(i / 80 * TAU);
        i ? x.lineTo(cx + p[0] * hs, hy + p[1] * hs) : x.moveTo(cx + p[0] * hs, hy + p[1] * hs);
      }
      x.stroke();
      x.globalCompositeOperation = 'lighter';
      glow(x, cx, hy, hs * 22, .28 * fade);
      if (this._stg === 1) {
        const p = hp(k * TAU);
        glow(x, cx + p[0] * hs, hy + p[1] * hs, 30 * u, 1);
      }
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 1;

      if (this._stg === 1 && k >= 1) {
        this._stg = 2;
        this._t1 = R;
        if (this._ctx && this._ctx.card) {
          const card = this._ctx.card;
          card.classList.add('on');
          card.querySelectorAll('p').forEach((p, i) => {
            this._timers.push(setTimeout(() => p.classList.add('vis'), 160 * i));
          });
        }
      }

      if (this._stg === 3) {
        const k3 = cl((R - this._t1) / 7.5);
        const openP = ez(cl((k3 - .08) / .35));
        const bloomGlow = ez(cl((k3 - .38) / .22));
        const riseP = ez(cl((k3 - .62) / .38));
        const sy = L(hy, -H * .08, riseP);
        if (k3 < .68) {
          x.globalAlpha = 1 - cl((k3 - .56) / .12);
          x.fillStyle = '#fff';
          for (let i = 0; i < 6; i++) {
            const petP = cl((openP * 6 - i) * 1.2);
            const a = i * 1.047;
            const rr2 = hs * 7.5 * L(.25, 1, petP);
            x.beginPath();
            x.ellipse(cx + Math.cos(a) * rr2 * .8, hy + Math.sin(a) * rr2 * .8, rr2 * .55, rr2 * .28, a, 0, TAU);
            x.fill();
          }
        }
        x.globalCompositeOperation = 'lighter';
        glow(x, cx, sy, 44 * u, bloomGlow * (1 - cl((k3 - .88) / .12)));
        x.globalCompositeOperation = 'source-over';
        x.globalAlpha = 1;
        if (k3 >= 1 && !fin && this._ctx && typeof this._ctx.onFinish === 'function') {
          this._ctx.onFinish();
        }
      }
    }

    for (const r of this._RP) {
      x.strokeStyle = `rgba(255,240,190,${(1 - r.l / .9) * .65})`;
      x.lineWidth = 1.8 * u;
      x.beginPath(); x.arc(r.x, r.y, r.l * 75 * u, 0, TAU); x.stroke();
    }
  }
};

export default secretMessageAnimation;
