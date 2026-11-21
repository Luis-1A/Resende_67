import { cl, L, ez, rnd, glow, rr, hp, TAU } from '../utils';
import { LT5 } from '../config/scenes.config';
import type { AnimationInitContext, AnimationModule, RenderEnv } from '../types/app';

interface EmberParticle {
  x: number;
  y: number;
  vy: number;
  l: number;
  ml: number;
}

export const condolenceLetterAnimation: AnimationModule & {
  _ctx: AnimationInitContext | null;
  _active: boolean;
  _mode: string;
  _EM: EmberParticle[];
  _cardShown: boolean;
  _exitStartedAt: number | null;
  _timers: ReturnType<typeof setTimeout>[];
  _params: { mode: string; exitDuration: number };
  startExit: (R: number) => void;
} = {
  name: 'condolenceLetter',
  layer: 4,
  worldSpace: true,
  _ctx: null,
  _active: false,
  _mode: 'letter',
  _EM: [],
  _cardShown: false,
  _exitStartedAt: null,
  _timers: [],
  _params: { mode: 'letter', exitDuration: 3.2 },

  init(ctx: AnimationInitContext | null): void {
    this._ctx = ctx;
    this._EM = [];
    this._timers = [];
    this._cardShown = false;
    this._exitStartedAt = null;
  },

  play(params: Record<string, unknown> = {}): void {
    this._params = {
      mode: String(params.mode ?? 'letter'),
      exitDuration: Number(params.exitDuration ?? 3.2)
    };
    this._mode = this._params.mode || 'letter';
    this._EM = [];
    this._cardShown = false;
    this._exitStartedAt = null;
    this._active = true;

    if (this._mode === 'letter' && this._ctx && this._ctx.card) {
      const card = this._ctx.card;
      card.className = '';
      card.scrollTop = 0;
      card.innerHTML = '<h3>NOTA DE CONDOLÊNCIAS ANTECIPADAS</h3>' +
        LT5.split('\n\n').map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
    }
  },

  startExit(R: number): void {
    this._exitStartedAt = R;
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._EM = [];
    this._cardShown = false;
    this._exitStartedAt = null;
    if (this._ctx && this._ctx.card && this._mode === 'letter') {
      this._ctx.card.classList.remove('on');
      this._ctx.card.innerHTML = '';
    }
  },

  update(dt: number, env: RenderEnv): void {
    if (!this._active || this._mode !== 'letter') return;
    const { W, H, u, R, RM, sceneElapsed: st, exiting } = env;

    if (st > 2.2 && !exiting && !this._cardShown && this._ctx && this._ctx.card) {
      this._cardShown = true;
      const card = this._ctx.card;
      card.classList.add('on');
      card.querySelectorAll('p').forEach((p, i) => {
        this._timers.push(setTimeout(() => p.classList.add('vis'), 220 * i));
      });
    }

    const ex = exiting ? cl((R - exiting.t) / exiting.dur) : 0;
    const lit = ez(cl((st - 0.8) / 2.2)) * (1 - ez(cl((ex - 0.15) / 0.38)));
    const cw = W * 0.14;
    const cy = H * 0.84;
    if (!RM && rnd() < 0.08 && this._EM.length < 12 && lit > 0.4) {
      this._EM.push({ x: cw + (rnd() - 0.5) * 14 * u, y: cy - 14 * u, vy: (18 + rnd() * 20) * u, l: 1.4, ml: 1.4 });
    }
    for (let i = this._EM.length - 1; i >= 0; i--) {
      const e = this._EM[i];
      e.y -= e.vy * dt;
      e.x += Math.sin(R * 5 + i) * 8 * u * dt;
      e.l -= dt;
      if (e.l <= 0) this._EM.splice(i, 1);
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, cx, u, R, sceneElapsed: st, exiting } = env;

    if (this._mode === 'humor') {
      const ty = H * 0.8;
      const k = ez(cl(st / 4));
      const turn = st > 4 && st < 18 ? Math.sin((st - 4) * 1.6) : 0;
      x.fillStyle = '#5B3E23'; x.fillRect(W * 0.08, ty, W * 0.84, H * 0.026);
      x.fillStyle = '#724F2E'; x.fillRect(W * 0.08, ty, W * 0.84, H * 0.007);
      x.fillStyle = '#4D331C'; x.fillRect(W * 0.14, ty + H * 0.025, W * 0.03, H * 0.1); x.fillRect(W * 0.83, ty + H * 0.025, W * 0.03, H * 0.1);

      const bw = W * 0.22;
      const bx = cx - bw / 2;
      const bh = H * 0.014;
      x.fillStyle = '#A6824B'; x.fillRect(bx - bw * 0.06, ty - bh * 3.2, bw * 1.12, bh * 3.2);
      x.fillStyle = '#F2E6C4';
      x.save(); x.translate(cx, ty - bh * 3); x.scale(k, 1);
      x.fillRect(-bw / 2, -bh * 2, bw / 2, bh * 2); x.fillRect(0, -bh * 2, bw / 2, bh * 2);
      x.fillStyle = 'rgba(120,95,65,.28)';
      for (let l = 0; l < 3; l++) {
        x.fillRect(-bw * 0.42, -bh * (1.6 - l * 0.4), bw * 0.34, 1.2 * u);
        x.fillRect(bw * 0.08, -bh * (1.6 - l * 0.4), bw * 0.34, 1.2 * u);
      }
      if (Math.abs(turn) > 0.05) {
        x.fillStyle = '#FAF0D6';
        x.beginPath(); x.moveTo(0, -bh * 2); x.quadraticCurveTo(bw * 0.25 * turn, -bh * 3.6, bw * 0.45 * turn, -bh * 2);
        x.lineTo(bw * 0.45 * turn, 0); x.lineTo(0, 0); x.fill();
      }
      x.restore();

      const cushX = cx + bw * 0.52;
      x.fillStyle = '#6E2031'; x.beginPath(); x.ellipse(cushX, ty - bh * 0.5, 25 * u, 9.5 * u, 0, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(231,198,106,.55)'; x.lineWidth = 1.2 * u; x.beginPath(); x.ellipse(cushX, ty - bh * 0.5, 23 * u, 7.8 * u, 0, 0, TAU); x.stroke();

      const fall = st > 9.5 ? cl((st - 9.5) / 1.6) : 0;
      const bounce = fall > 0.7 ? Math.sin((fall - 0.7) / 0.3 * Math.PI) * 12 * u : 0;
      const crownX = L(cx, cushX, ez(fall));
      const crownY = L(ty - bh * 4.2, ty - bh * 1.4 - bounce, ez(fall));
      const cs = Math.min(W, H) * 0.055;
      x.fillStyle = '#E7C66A';
      x.save(); x.translate(crownX, crownY); x.rotate(L(0.06, 0.24, fall));
      x.beginPath();
      x.moveTo(-cs, cs * 0.45); x.lineTo(-cs, -cs * 0.3); x.lineTo(-cs * 0.5, 0); x.lineTo(0, -cs * 0.55);
      x.lineTo(cs * 0.5, 0); x.lineTo(cs, -cs * 0.3); x.lineTo(cs, cs * 0.45); x.closePath(); x.fill();
      x.fillStyle = '#B93848'; x.beginPath(); x.arc(0, cs * 0.16, cs * 0.1, 0, TAU); x.fill();
      x.fillStyle = '#FFF4CC'; x.beginPath(); x.arc(-cs * 0.55, cs * 0.16, cs * 0.07, 0, TAU); x.arc(cs * 0.55, cs * 0.16, cs * 0.07, 0, TAU); x.fill();
      x.restore();
      return;
    }

    const ex = exiting ? cl((R - exiting.t) / exiting.dur) : 0;
    const lit = ez(cl((st - 0.8) / 2.2)) * (1 - ez(cl((ex - 0.15) / 0.38)));
    const ember = st > 1.2 ? cl(1 - cl((ex - 0.58) / 0.42)) : 0;
    const cw = W * 0.14;
    const cy = H * 0.84;

    x.globalCompositeOperation = 'lighter';
    glow(x, cw, cy - H * 0.04, W * 0.58 * lit, (0.48 + Math.sin(R * 9) * 0.08) * lit);
    if (ember > 0) glow(x, cw, cy - 6 * u, 18 * u * (0.6 + 0.4 * ember), ember * 0.55);
    x.globalCompositeOperation = 'source-over';

    x.fillStyle = '#8A6C3E'; x.beginPath(); x.ellipse(cw, cy + H * 0.1, 16 * u, 4.5 * u, 0, 0, TAU); x.fill();
    x.fillStyle = '#EFE3C8'; x.fillRect(cw - 5.5 * u, cy, 11 * u, H * 0.1);
    x.fillStyle = '#DFCFAF'; x.fillRect(cw + 1.5 * u, cy, 4 * u, H * 0.1);
    x.fillStyle = '#F7EED8'; x.beginPath(); x.ellipse(cw, cy, 5.5 * u, 1.8 * u, 0, 0, TAU); x.fill();
    x.fillRect(cw - 4 * u, cy, 2.2 * u, 14 * u); x.fillRect(cw + 2 * u, cy, 2 * u, 9 * u);

    x.strokeStyle = '#1C1514'; x.lineWidth = 1.8 * u;
    x.beginPath(); x.moveTo(cw, cy); x.lineTo(cw + ex * 2 * u, cy - 6 * u); x.stroke();
    if (ember > 0) {
      x.fillStyle = lit > 0.2 ? '#FF7A2F' : '#FF4D1A';
      x.globalAlpha = ember;
      x.beginPath(); x.arc(cw + ex * 2 * u, cy - 6 * u, 2 * u, 0, TAU); x.fill();
      x.globalAlpha = 1;
    }

    if (lit > 0.02) {
      x.globalCompositeOperation = 'lighter';
      x.fillStyle = '#FFBA52'; x.beginPath(); x.ellipse(cw + ex * 6 * u, cy - 12 * u, 4.2 * u * lit, 11.5 * u * lit * (1 + Math.sin(R * 11) * 0.1), ex * 0.4, 0, TAU); x.fill();
      x.fillStyle = '#FFF6D8'; x.beginPath(); x.ellipse(cw + ex * 5 * u, cy - 10 * u, 2 * u * lit, 6 * u * lit, ex * 0.4, 0, TAU); x.fill();
      x.globalCompositeOperation = 'source-over';
    }

    if (ex > 0.22) {
      const sp = (ex - 0.22) / 0.78;
      x.strokeStyle = `rgba(218,224,236,${Math.sin(sp * Math.PI) * 0.42})`; x.lineWidth = 2 * u;
      x.beginPath(); x.moveTo(cw, cy - 6 * u);
      x.bezierCurveTo(cw + 15 * u * sp, H * 0.75, cw - 13 * u * sp, H * 0.68, cw + Math.sin(sp * 4.5) * 18 * u, H * 0.56 - sp * 44 * u);
      x.stroke();
      x.fillStyle = `rgba(255,255,255,${Math.sin(sp * Math.PI) * 0.9})`;
      x.beginPath(); x.ellipse(cx, L(H * 0.2, H * 0.54, ez(sp)), 10 * u, 5 * u, sp * 1.8, 0, TAU); x.fill();
    }

    for (const e of this._EM) {
      x.fillStyle = `rgba(255,140,60,${(e.l / e.ml) * 0.65})`;
      x.fillRect(e.x, e.y, 1.6 * u, 1.6 * u);
    }

    if (!exiting && st > 2.5) {
      const qx = W * 0.84 + Math.sin(R * 1.6) * 6 * u;
      const qy = H * 0.34 + Math.cos(R * 1.2) * 8 * u;
      const ix = W * 0.84;
      const iy = H * 0.46;
      x.save(); x.globalAlpha = 0.8;
      x.fillStyle = '#19141C'; rr(x, ix - 10 * u, iy, 20 * u, 16 * u, 4 * u); x.fill();
      x.fillStyle = '#9B7E4E'; rr(x, ix - 6 * u, iy - 4 * u, 12 * u, 4 * u, 2 * u); x.fill();
      if (st > 5) {
        const ih = ez(cl((st - 5) / 3)) * Math.min(W, H) * 0.0022;
        x.strokeStyle = 'rgba(235,215,180,.58)'; x.lineWidth = 1.4 * u; x.beginPath();
        for (let i = 0; i <= 32; i++) {
          const p = hp((i / 32) * TAU);
          if (i) x.lineTo(ix + p[0] * ih, iy - 15 * u + p[1] * ih);
          else x.moveTo(ix + p[0] * ih, iy - 15 * u + p[1] * ih);
        }
        x.stroke();
      }
      x.translate(qx, qy); x.rotate(-0.5 + Math.sin(R * 2) * 0.05);
      x.fillStyle = '#EFE3C8'; x.beginPath(); x.ellipse(0, -14 * u, 5 * u, 19 * u, 0.2, 0, TAU); x.fill();
      x.strokeStyle = '#C7B38C'; x.lineWidth = 1.2 * u; x.beginPath(); x.moveTo(0, 8 * u); x.lineTo(-2 * u, -30 * u); x.stroke();
      x.restore();
    }
  }
};

export default condolenceLetterAnimation;
