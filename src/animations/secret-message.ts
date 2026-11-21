import { cl, L, ez, glow, star4, hp, TAU } from '../utils';
import { LT9 } from '../config/scenes.config';
import { settings } from '../config/settings';
import type { AnimationInitContext, RenderEnv } from '../types/app';

interface Ripple {
  x: number;
  y: number;
  l: number;
}

export const secretMessageAnimation = {
  name: 'secretMessage',
  layer: 5,
  worldSpace: true,
  _ctx: null as AnimationInitContext | null,
  _active: false,
  _stg: 0,
  _t1: 0,
  _hoverStar: false,
  _RP: [] as Ripple[],
  _timers: [] as ReturnType<typeof setTimeout>[],
  _hintEl: null as HTMLDivElement | null,

  init(ctx: AnimationInitContext | null): void {
    this._ctx = ctx;
    this._stg = 0;
    this._t1 = 0;
    this._hoverStar = false;
    this._RP = [];
    this._timers = [];
    this._hintEl = null;
  },

  play(): void {
    this._stg = 0;
    this._t1 = 0;
    this._hoverStar = false;
    this._RP = [];
    this._active = true;
    if (this._hintEl) {
      this._hintEl.remove();
      this._hintEl = null;
    }
    const hint = document.createElement('div');
    hint.className = 'star-hint';
    hint.textContent = 'clica na estrela';
    document.body.appendChild(hint);
    this._hintEl = hint;
    this._timers.push(setTimeout(() => {
      if (this._active && this._stg === 0 && this._hintEl === hint) {
        hint.classList.add('on');
      }
    }, 900));
    if (this._ctx && this._ctx.card) {
      const card = this._ctx.card;
      card.className = 'dk';
      card.scrollTop = 0;
      card.innerHTML = LT9.split('\n\n').map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
    }
  },

  stop(): void {
    this._active = false;
    if (this._hintEl) {
      this._hintEl.classList.remove('on');
    }
  },

  destroy(): void {
    this._active = false;
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._RP = [];
    this._hoverStar = false;
    if (this._hintEl) {
      this._hintEl.remove();
      this._hintEl = null;
    }
    if (this._ctx && this._ctx.canvas) this._ctx.canvas.style.cursor = 'default';
    if (this._ctx && this._ctx.card) {
      this._ctx.card.classList.remove('on');
      this._ctx.card.innerHTML = '';
    }
  },

  onPointerMove(e: PointerEvent): void {
    if (!this._active || !this._ctx) return;
    const { cx, H, u } = this._ctx.screenManager.getBounds();
    if (this._stg === 0) {
      this._hoverStar = Math.hypot(e.clientX - cx, e.clientY - H * 0.34) < 48 * u;
      this._ctx.canvas.style.cursor = this._hoverStar ? 'pointer' : 'default';
    } else {
      this._hoverStar = false;
      this._ctx.canvas.style.cursor = 'default';
    }
  },

  onPointerDown(e: PointerEvent, R: number): boolean {
    if (!this._active || !this._ctx || this._stg !== 0) return false;
    const { cx, H, u } = this._ctx.screenManager.getBounds();
    if (Math.hypot(e.clientX - cx, e.clientY - H * 0.34) < 64 * u) {
      this._RP.push({ x: e.clientX, y: e.clientY, l: 0 });
      this._stg = 1;
      this._t1 = R;
      this._hoverStar = false;
      if (this._hintEl) {
        this._hintEl.classList.remove('on');
      }
      this._ctx.canvas.style.cursor = 'default';
      return true;
    }
    return false;
  },

  advanceStage(R: number): boolean {
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

  shouldShowContinue(R: number): boolean {
    return this._stg === 2 && (R - this._t1) > settings.scene9ContinueDelay;
  },

  update(dt: number, _env: RenderEnv): void {
    if (!this._active) return;
    for (let i = this._RP.length - 1; i >= 0; i--) {
      this._RP[i].l += dt;
      if (this._RP[i].l > 0.9) this._RP.splice(i, 1);
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, cx, u, R, RM, fin } = env;
    const hs = Math.min(W, H) * 0.011;
    const hy = H * 0.5;
    const sx = cx;
    const sy0 = H * 0.34;

    if (this._stg === 0) {
      const pulse = RM ? 0.65 : (0.5 + 0.5 * Math.sin(R * 2.4));
      const sa = (this._hoverStar ? 1 : 0.62) + 0.32 * pulse;
      x.globalCompositeOperation = 'lighter';
      glow(x, sx, sy0, this._hoverStar ? 48 * u : 36 * u, sa);
      glow(x, sx, sy0, 14 * u, 1);
      if (!RM) {
        const rp = (R * 0.38) % 1;
        const rrPulse = (9 + 28 * ez(rp)) * u;
        const ra = (1 - rp) * (this._hoverStar ? 0.52 : 0.34);
        x.strokeStyle = `rgba(255,244,208,${ra})`;
        x.lineWidth = 1.15 * u;
        x.beginPath();
        x.arc(sx, sy0, rrPulse, 0, TAU);
        x.stroke();
      }
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 0.88 + 0.12 * pulse;
      x.fillStyle = '#FFF9E6';
      star4(x, sx, sy0, (this._hoverStar ? 11 : 8.5) * u * (1 + 0.1 * pulse), RM ? 0 : R * 0.12);
      x.globalAlpha = 1;
    } else {
      const k = this._stg === 1 ? cl((R - this._t1) / 3) : 1;
      const fade = this._stg === 3 ? 1 - cl((R - this._t1) / 2) : 1;
      x.globalAlpha = 0.9 * fade;
      x.strokeStyle = '#fff';
      x.lineWidth = 3 * u;
      x.beginPath();
      for (let i = 0; i <= 80 * k; i++) {
        const p = hp((i / 80) * TAU);
        i ? x.lineTo(cx + p[0] * hs, hy + p[1] * hs) : x.moveTo(cx + p[0] * hs, hy + p[1] * hs);
      }
      x.stroke();
      x.globalCompositeOperation = 'lighter';
      glow(x, cx, hy, hs * 22, 0.28 * fade);
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
        const openP = ez(cl((k3 - 0.08) / 0.35));
        const bloomGlow = ez(cl((k3 - 0.38) / 0.22));
        const riseP = ez(cl((k3 - 0.62) / 0.38));
        const sy = L(hy, -H * 0.08, riseP);
        if (k3 < 0.68) {
          x.globalAlpha = 1 - cl((k3 - 0.56) / 0.12);
          x.fillStyle = '#fff';
          for (let i = 0; i < 6; i++) {
            const petP = cl((openP * 6 - i) * 1.2);
            const a = i * 1.047;
            const rr2 = hs * 7.5 * L(0.25, 1, petP);
            x.beginPath();
            x.ellipse(cx + Math.cos(a) * rr2 * 0.8, hy + Math.sin(a) * rr2 * 0.8, rr2 * 0.55, rr2 * 0.28, a, 0, TAU);
            x.fill();
          }
        }
        x.globalCompositeOperation = 'lighter';
        glow(x, cx, sy, 44 * u, bloomGlow * (1 - cl((k3 - 0.88) / 0.12)));
        x.globalCompositeOperation = 'source-over';
        x.globalAlpha = 1;
        if (k3 >= 1 && !fin && this._ctx && typeof this._ctx.onFinish === 'function') {
          this._ctx.onFinish();
        }
      }
    }

    for (const r of this._RP) {
      x.strokeStyle = `rgba(255,240,190,${(1 - r.l / 0.9) * 0.65})`;
      x.lineWidth = 1.8 * u;
      x.beginPath();
      x.arc(r.x, r.y, r.l * 75 * u, 0, TAU);
      x.stroke();
    }
  }
};

export default secretMessageAnimation;
