import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Balloon, Ribbon, CanvasParticle, ConfettiParticle, GoldParticle, CosmicParticle, LightRayParticle } from '../types';

export interface BirthdayCanvasHandle {
  addConfetti: (count: number) => void;
  trigger18: () => void;
  clear18: () => void;
  startSpiral: () => void;
  resetCosmic: (fast?: boolean) => void;
}

interface BirthdayCanvasProps {
  ambientTarget: number;
  edgeTarget: number;
  cakeTarget: number;
  cosmicActive: boolean;
  cosmicRate?: number;
  reducedMotion?: boolean;
  onCosmicTime?: (time: number) => void;
}

const TAU = Math.PI * 2;
const R = Math.random;
const cl = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (p: number) => 1 - Math.pow(1 - p, 3);
const ease2 = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

const PAL = [
  ['#ffffff', '#eef3f9', '#cfd9e6'],
  ['#e3f4ff', '#b9e0ff', '#8cc6f2'],
  ['#9fd4ff', '#79c5ff', '#318de0'],
  ['#f6f8fb', '#dce5ee', '#aebfd3'],
];

const BAL_DEF: Array<Omit<Balloon, 'vx'>> = [
  { s: -1, x: 0.08, y: 0.3, xm: 0.1, ym: 0.14, d: 1.15, p: 0, t: 2.0, m: 'r', ph: 0.3 },
  { s: 1, x: 0.92, y: 0.7, xm: 0.9, ym: 0.86, d: 1.2, p: 1, t: 2.5, m: 'r', ph: 1.7 },
  { s: -1, x: 0.19, y: 0.78, xm: 0.14, ym: 0.9, d: 0.8, p: 2, t: 3.0, m: 's', ph: 2.9 },
  { s: 1, x: 0.82, y: 0.24, xm: 0.84, ym: 0.07, d: 0.8, p: 3, t: 3.3, m: 's', ph: 4.1 },
  { s: 1, x: 0.96, y: 0.46, xm: 0.62, ym: 0.93, d: 1.0, p: 0, t: 3.6, m: 'r', ph: 5.2 },
  { s: -1, x: 0.03, y: 0.44, xm: 0.4, ym: 0.06, d: 0.7, p: 1, t: 3.9, m: 's', ph: 0.9 },
  { s: 1, x: 0.74, y: 0.84, d: 0.75, p: 2, t: 4.2, m: 'r', ph: 3.3 },
  { s: -1, x: 0.12, y: 0.1, d: 0.7, p: 3, t: 4.4, m: 's', ph: 2.2 },
];

const RIB_DEF: Ribbon[] = [
  { s: -1, y: 0.2, v: 0.18, a: 0.05, ph: 0, t: 3.9, l: 0.3, c: 0 },
  { s: 1, y: 0.3, v: -0.12, a: 0.06, ph: 2, t: 4.2, l: 0.26, c: 1 },
  { s: -1, y: 0.84, v: -0.16, a: 0.05, ph: 4, t: 4.5, l: 0.28, c: 1 },
  { s: 1, y: 0.78, v: 0.14, a: 0.05, ph: 1, t: 4.7, l: 0.24, c: 0 },
];

const RC = [
  [150, 170, 195],
  [80, 170, 245],
];
const CC = ['#79C5FF', '#318DE0', '#B9E0FF', '#aebfd3', '#9fd4ff'];

const computeHeartPath = (n: number) => {
  const a: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    a.push([
      (16 * Math.pow(Math.sin(t), 3)) / 17,
      -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17,
    ]);
  }
  return a;
};
const HPT = computeHeartPath(260);

export const BirthdayCanvas = forwardRef<BirthdayCanvasHandle, BirthdayCanvasProps>(
  (
    {
      ambientTarget,
      edgeTarget,
      cakeTarget,
      cosmicActive,
      cosmicRate = 1,
      reducedMotion = false,
      onCosmicTime,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Dynamic animation references
    const stateRef = useRef({
      W: window.innerWidth,
      H: window.innerHeight,
      mob: window.innerWidth < 640,
      T: 0,
      last: 0,
      gt: 0,
      R0: 40,
      st: { amb: 0, edge: 0, g: 0, cake: 0 },
      tg: { amb: ambientTarget, edge: edgeTarget, g: 0, cake: cakeTarget },
      P: [] as CanvasParticle[],
      CF: [] as ConfettiParticle[],
      gp: [] as GoldParticle[],
      bl: [] as Balloon[],
      cakeT: 0,
      sp: { on: false, t: 0 },
      cs: {
        on: cosmicActive,
        t: 0,
        rate: cosmicRate,
        exp: false,
        beat: false,
      },
      flash: 0,
      rings: [] as { r: number; a: number; v: number }[],
      CP: [] as CosmicParticle[],
      PL: [] as LightRayParticle[],
      hs: 1,
    });

    // Update targets
    useEffect(() => {
      stateRef.current.tg.amb = ambientTarget;
      stateRef.current.tg.edge = edgeTarget;
      stateRef.current.tg.cake = cakeTarget;
      if (cakeTarget > 0 && stateRef.current.cakeT === 0) {
        stateRef.current.cakeT = stateRef.current.T;
      }
    }, [ambientTarget, edgeTarget, cakeTarget]);

    useEffect(() => {
      stateRef.current.cs.on = cosmicActive;
    }, [cosmicActive]);

    useEffect(() => {
      stateRef.current.cs.rate = cosmicRate;
    }, [cosmicRate]);

    const newPL = (W: number, H: number): LightRayParticle => {
      const a = R() * TAU;
      const r = Math.max(W, H) * (0.35 + R() * 0.45);
      return { a, r, sp: 0.2 + R() * 0.6, s: 0.8 + R() * 1.6 };
    };

    const addConfetti = (n: number) => {
      if (reducedMotion) return;
      const { W, H, CF } = stateRef.current;
      for (let i = 0; i < n; i++) {
        CF.push({
          x: R() * W,
          y: -10 - R() * H * 0.3,
          vy: 80 + R() * 110,
          vx: (R() - 0.5) * 50,
          r: R() * TAU,
          vr: (R() - 0.5) * 7,
          w: 6 + R() * 6,
          c: CC[(R() * 5) | 0],
        });
      }
    };

    const trigger18 = () => {
      const { W, H, gp } = stateRef.current;
      const off = document.createElement('canvas');
      off.width = 200;
      off.height = 120;
      const ctx = off.getContext('2d');
      if (!ctx) return;
      ctx.font = '800 120px Nunito, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('18', 100, 64);

      const d = ctx.getImageData(0, 0, 200, 120).data;
      const sc = Math.min(W * 0.8, 460) / 200;
      gp.length = 0;
      for (let j = 0; j < 120; j += 4) {
        for (let i = 0; i < 200; i += 4) {
          if (d[(j * 200 + i) * 4 + 3] > 128) {
            gp.push({
              tx: W / 2 + (i - 100) * sc,
              ty: H * 0.24 + (j - 60) * sc,
              x: R() * W,
              y: R() * H,
              p: R() * TAU,
            });
          }
        }
      }
      stateRef.current.gt = 0;
      stateRef.current.tg.g = 1;
    };

    const clear18 = () => {
      stateRef.current.tg.g = 0;
    };

    const startSpiral = () => {
      stateRef.current.sp.on = true;
      stateRef.current.sp.t = 0;
    };

    const resetCosmic = (fast = false) => {
      const s = stateRef.current;
      s.cs.on = true;
      s.cs.t = 0;
      s.cs.rate = fast ? 8 : 1;
      s.cs.exp = false;
      s.cs.beat = false;
      s.flash = 0;
      s.rings.length = 0;
      s.CP.length = 0;
      s.PL.length = 0;
      for (let i = 0; i < 260; i++) {
        s.CP.push({
          i,
          x: 0,
          y: 0,
          px: 0,
          py: 0,
          vx: 0,
          vy: 0,
          sp: 150 + R() * 650,
          dl: (i / 260) * 1.3,
          s: 1 + R() * 1.8,
        });
      }
      for (let i = 0; i < 90; i++) {
        s.PL.push(newPL(s.W, s.H));
      }
    };

    useImperativeHandle(ref, () => ({
      addConfetti,
      trigger18,
      clear18,
      startSpiral,
      resetCosmic,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const s = stateRef.current;

      const handleResize = () => {
        s.W = window.innerWidth;
        s.H = window.innerHeight;
        s.mob = s.W < 640;
        const d = Math.min(window.devicePixelRatio || 1, s.mob ? 1.5 : 2);
        canvas.width = s.W * d;
        canvas.height = s.H * d;
        ctx.setTransform(d, 0, 0, d, 0, 0);
        s.R0 = Math.max(30, Math.min(66, Math.min(s.W, s.H) * 0.085));
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      // Initialize ambient particles & balloons
      s.bl = (s.mob ? BAL_DEF.slice(0, 6) : BAL_DEF)
        .map((b) => ({ ...b, px: undefined, vx: 0 }))
        .sort((a, b) => a.d - b.d);

      s.P.length = 0;
      const particleCount = reducedMotion ? 10 : s.mob ? 24 : 44;
      for (let i = 0; i < particleCount; i++) {
        s.P.push({
          x: R() * s.W,
          y: s.H * (0.1 + R() * 0.8),
          r: 1.2 + R() * 2,
          b: 0.5 + R() * 3.5,
          l: 4 + R() * 3,
          ph: R() * TAU,
        });
      }

      resetCosmic(false);

      const glow = (px: number, py: number, r: number, color: string) => {
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(84,172,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, TAU);
        ctx.fill();
      };

      const drawBalloon = (b: Balloon, conv: number, dt: number) => {
        if (s.T < b.t) return;
        const Rr = s.R0 * b.d;
        const rx = Rr * 0.95;
        const ry = Rr;
        const p = cl((s.T - b.t) / (b.m === 'r' ? 4.6 : 4));
        const e = ease(p);
        const ax = ((s.mob && b.xm != null ? b.xm : b.x) || 0) * s.W;
        const ay = ((s.mob && b.ym != null ? b.ym : b.y) || 0) * s.H;
        const edge = ax < s.W / 2 ? -1 : 1;
        let px = ax + edge * conv * s.W * 0.035;
        const yb = ay - conv * s.H * 0.09;
        let py: number;

        if (b.m === 'r') {
          px += Math.sin(s.T * 0.8 + b.ph) * 12 * b.d;
          py = yb + (s.H - yb + Rr * 3.5) * (1 - e);
        } else {
          px = mix(b.s < 0 ? -Rr * 2 : s.W + Rr * 2, px, e);
          py = yb + (1 - e) * s.H * 0.12;
        }
        py += Math.sin(s.T * 1.05 + b.ph) * 8 * b.d;
        const rot = Math.sin(s.T * 0.7 + b.ph) * 0.07 + (b.m === 's' ? b.s * 0.4 * (1 - e) : 0);
        if (b.px === undefined) b.px = px;
        b.vx = b.vx * 0.85 + (dt > 0 ? (px - b.px) / dt : 0) * 0.15;
        b.px = px;

        ctx.globalAlpha = (0.8 + 0.2 * cl((b.d - 0.7) / 0.5)) * cl(p * 4) * s.st.amb;
        const hh = ry + Rr * 0.07;
        const kx = px - Math.sin(rot) * hh;
        const ky = py + Math.cos(rot) * hh;
        const L = Rr * 2.7;
        const lag = Math.max(-Rr * 0.9, Math.min(Rr * 0.9, -b.vx * 0.09));

        ctx.beginPath();
        ctx.moveTo(kx, ky);
        ctx.quadraticCurveTo(
          kx + lag * 0.2 + Math.sin(s.T * 2.1 + b.ph) * Rr * 0.08,
          ky + L * 0.55,
          kx + lag + Math.sin(s.T * 1.4 + b.ph) * Rr * 0.12,
          ky + L
        );
        ctx.strokeStyle = 'rgba(110,140,172,.55)';
        ctx.lineWidth = Math.max(0.8, 1.1 * b.d);
        ctx.stroke();

        const c = PAL[b.p];
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, -ry);
        ctx.bezierCurveTo(rx * 1.2, -ry, rx * 1.15, ry * 0.55, 0, ry);
        ctx.bezierCurveTo(-rx * 1.15, ry * 0.55, -rx * 1.2, -ry, 0, -ry);

        const gr = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, Rr * 0.1, 0, 0, Rr * 1.15);
        gr.addColorStop(0, c[0]);
        gr.addColorStop(0.55, c[1]);
        gr.addColorStop(1, c[2]);

        ctx.shadowColor = 'rgba(23,79,136,.22)';
        ctx.shadowBlur = Rr * 0.5;
        ctx.shadowOffsetY = Rr * 0.14;
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(23,79,136,.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,.75)';
        ctx.beginPath();
        ctx.ellipse(-rx * 0.38, -ry * 0.45, rx * 0.16, ry * 0.28, -0.5, 0, TAU);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,.3)';
        ctx.beginPath();
        ctx.ellipse(rx * 0.4, ry * 0.38, rx * 0.1, ry * 0.06, 0.7, 0, TAU);
        ctx.fill();

        ctx.fillStyle = c[2];
        ctx.beginPath();
        ctx.moveTo(0, ry - 1);
        ctx.lineTo(-Rr * 0.09, ry + Rr * 0.1);
        ctx.lineTo(Rr * 0.09, ry + Rr * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
      };

      const drawRibbon = (r: Ribbon, conv: number) => {
        const g = ease2(cl((s.T - r.t) / 2.8));
        if (g <= 0.02 || s.st.amb < 0.02) return;
        const ex = r.s < 0 ? -8 : s.W + 8;
        const dir = -r.s;
        const len = s.W * r.l * (s.mob ? 0.9 : 1) * (1 - 0.3 * conv);
        const n = Math.max(2, Math.floor(34 * g));
        const xs: number[] = [];
        const ys: number[] = [];
        const us: number[] = [];

        for (let i = 0; i <= n; i++) {
          const u = (g * i) / n;
          us.push(u);
          xs.push(ex + dir * (u * len + Math.sin(u * 5 + r.ph + s.T * 0.55) * len * 0.08 * u));
          ys.push(
            s.H * (r.y + u * r.v) +
              Math.sin(u * 7.5 + r.ph + s.T * 0.9) * s.H * r.a * u +
              Math.cos(s.T * 0.4 + r.ph) * 6 * u
          );
        }

        const b = RC[r.c];
        ctx.lineCap = 'round';
        for (let i = 0; i < n; i++) {
          const f = Math.abs(Math.cos(us[i] * 11 + s.T * 1.2 + r.ph));
          ctx.beginPath();
          ctx.moveTo(xs[i], ys[i]);
          ctx.lineTo(xs[i + 1], ys[i + 1]);
          ctx.lineWidth = 3 + 4 * f;
          ctx.strokeStyle = `rgba(${mix(b[0], 255, f * 0.5) | 0},${mix(b[1], 255, f * 0.5) | 0},${
            mix(b[2], 255, f * 0.5) | 0
          },${0.92 * s.st.amb})`;
          ctx.stroke();
        }
      };

      const drawCosmic = (dt: number) => {
        s.cs.t += dt * s.cs.rate;
        const t = s.cs.t;
        const cx = s.W / 2;
        const cy = s.H * 0.45;
        const S = Math.min(s.W, s.H) * 0.32;

        if (onCosmicTime) {
          onCosmicTime(t);
        }

        const zoom =
          t < 4
            ? 1 + ease(t / 4) * 0.12
            : t < 5.5
            ? 1.12 - ease((t - 4) / 1.5) * 0.3
            : 0.82 + ease(cl((t - 5.5) / 2)) * 0.18;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(zoom, zoom);
        ctx.translate(-cx, -cy);

        if (t < 4.05) {
          const da = cl((t - 1.2) / 1.2);
          const pu = 0.5 + 0.5 * Math.sin(t * (t < 2.6 ? 4 : t < 3.4 ? 8 : 14));
          const dr = 3 + pu * (2 + Math.max(0, t - 2) * 3);
          glow(cx, cy, dr * (8 + Math.max(0, t - 2) * 6), `rgba(84,172,255,${da * 0.5})`);
          ctx.fillStyle = `rgba(230,245,255,${da})`;
          ctx.beginPath();
          ctx.arc(cx, cy, dr, 0, TAU);
          ctx.fill();

          if (t > 1.8) {
            const pa = cl((t - 1.8) / 1);
            for (const p of s.PL) {
              p.r -= dt * s.cs.rate * (12 + (t - 1.8) * p.sp * 90);
              if (p.r < 10) Object.assign(p, newPL(s.W, s.H));
              const cosA = Math.cos(p.a);
              const sinA = Math.sin(p.a);
              const px = cx + cosA * p.r;
              const py = cy + sinA * p.r;
              ctx.strokeStyle = `rgba(145,206,255,${pa * 0.7})`;
              ctx.lineWidth = p.s;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(px + cosA * 14, py + sinA * 14);
              ctx.stroke();
            }
          }

          if (t > 2) {
            ctx.lineWidth = 2;
            for (let k = 0; k < 3; k++) {
              const rr = (40 + k * 34) * (1 + (t - 2) * 0.1);
              const a0 = t * (1.2 + k * 0.7) * (k % 2 ? -1 : 1);
              ctx.strokeStyle = `rgba(145,206,255,${cl((t - 2) / 1) * 0.6})`;
              ctx.beginPath();
              ctx.arc(cx, cy, rr, a0, a0 + 1.6);
              ctx.stroke();
            }
          }
        }

        if (t >= 4 && !s.cs.exp) {
          s.cs.exp = true;
          s.flash = 0.65;
          s.rings.push({ r: 0, a: 0.9, v: 1100 }, { r: 0, a: 0.6, v: 700 });
          for (const p of s.CP) {
            const a = R() * TAU;
            p.x = p.px = cx;
            p.y = p.py = cy;
            p.vx = Math.cos(a) * p.sp;
            p.vy = Math.sin(a) * p.sp;
          }
        }

        if (t >= 8.6 && !s.cs.beat) {
          s.cs.beat = true;
          s.rings.push({ r: S * 0.6, a: 0.7, v: 400 });
        }

        s.hs =
          t < 8.6
            ? 1
            : t < 10
            ? 1 + 0.12 * Math.sin(Math.min((t - 8.6) / 0.6, 1) * Math.PI) + ease(cl((t - 9.2) / 0.8)) * 0.3
            : 1.3 + Math.pow(cl((t - 10) / 2.2), 3) * 17;

        for (let i = s.rings.length - 1; i >= 0; i--) {
          const r = s.rings[i];
          r.r += r.v * dt * s.cs.rate;
          r.a -= dt * 0.45 * s.cs.rate;
          if (r.a <= 0) {
            s.rings.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `rgba(145,206,255,${r.a})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, r.r, 0, TAU);
          ctx.stroke();

          ctx.strokeStyle = `rgba(255,255,255,${r.a * 0.6})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, r.r * 0.97, 0, TAU);
          ctx.stroke();
        }

        if (s.cs.exp) {
          for (const p of s.CP) {
            p.px = p.x;
            p.py = p.y;
            if (t < 5.5 + p.dl) {
              const f = Math.pow(0.25, dt * s.cs.rate);
              p.vx *= f;
              p.vy *= f;
              p.x += p.vx * dt * s.cs.rate;
              p.y += p.vy * dt * s.cs.rate;
            } else {
              const tx = cx + HPT[p.i][0] * S * s.hs;
              const ty = cy + HPT[p.i][1] * S * s.hs;
              const k = 1 - Math.exp(-dt * s.cs.rate * 3);
              p.x += (tx - p.x) * k;
              p.y += (ty - p.y) * k;
            }
            const a = t < 10 ? 0.95 : Math.max(0, 1 - (t - 10) / 1.2);
            if (a <= 0) continue;
            const col = `rgba(${p.i % 3 ? '145,206,255' : '255,255,255'},${a})`;
            ctx.strokeStyle = col;
            ctx.fillStyle = col;
            ctx.lineWidth = p.s;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.s, 0, TAU);
            ctx.fill();
          }
        }

        const fa = cl((t - 6.6) / 1.6);
        if (fa > 0 && t < 12.4) {
          ctx.beginPath();
          for (let j = 0; j < HPT.length; j += 2) {
            const px = cx + HPT[j][0] * S * s.hs;
            const py = cy + HPT[j][1] * S * s.hs;
            j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.closePath();
          const g = ctx.createRadialGradient(cx - S * 0.2 * s.hs, cy - S * 0.3 * s.hs, 0, cx, cy, S * s.hs * 1.15);
          g.addColorStop(0, '#F5FAFF');
          g.addColorStop(0.35, '#91CEFF');
          g.addColorStop(1, '#287FD1');
          ctx.globalAlpha = fa * 0.9;
          ctx.fillStyle = g;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = '#C7E5FF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if (t > 10.3) {
          for (let k = 0; k < 5; k++) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.6);
            const o = (((t - 10.3) * s.W * 0.9 + k * s.W * 0.35) % (s.W * 2)) - s.W;
            ctx.fillStyle = `rgba(255,255,255,${0.12 * cl((t - 10.3) / 0.5)})`;
            ctx.fillRect(o, -s.H * 2, s.W * 0.08, s.H * 4);
            ctx.restore();
          }
        }

        ctx.restore();

        if (s.flash > 0) {
          ctx.fillStyle = `rgba(210,235,255,${s.flash})`;
          ctx.fillRect(0, 0, s.W, s.H);
          s.flash = Math.max(0, s.flash - dt * 0.55 * s.cs.rate);
        }
      };

      let animId: number;

      const loop = (n: number) => {
        const dt = Math.min((n - (s.last || n)) / 1000, 0.1);
        s.last = n;
        s.T += dt;

        // Smooth state interpolation
        s.st.amb += (s.tg.amb - s.st.amb) * Math.min(1, dt * 1);
        s.st.edge += (s.tg.edge - s.st.edge) * Math.min(1, dt * 1.4);
        s.st.g += (s.tg.g - s.st.g) * Math.min(1, dt * 1.4);
        s.st.cake += (s.tg.cake - s.st.cake) * Math.min(1, dt * 1.4);

        ctx.clearRect(0, 0, s.W, s.H);

        // Cosmic Intro Heart Effect
        if (s.cs.on) {
          drawCosmic(dt);
        }

        // Ambient particles
        for (const p of s.P) {
          if (s.T > p.b + p.l) {
            p.x = R() * s.W;
            p.y = s.H * (0.1 + R() * 0.8);
            p.b = s.T + R() * 1.2;
            p.l = 4 + R() * 3;
          }
          const q = (s.T - p.b) / p.l;
          if (q < 0 || q > 1) continue;
          const a = Math.pow(Math.sin(Math.PI * q), 1.6) * 0.85 * s.st.amb * cl(s.T / 2.5);
          const px = p.x + Math.sin(s.T * 0.6 + p.ph) * 10;
          const py = p.y - q * 40;

          ctx.fillStyle = `rgba(121,197,255,${a * 0.2})`;
          ctx.beginPath();
          ctx.arc(px, py, p.r * 3.4, 0, TAU);
          ctx.fill();

          ctx.fillStyle = `rgba(49,141,224,${a * 0.85})`;
          ctx.beginPath();
          ctx.arc(px, py, p.r, 0, TAU);
          ctx.fill();
        }

        // Balloons and ribbons
        if (s.st.amb > 0.02) {
          for (const b of s.bl) drawBalloon(b, s.st.edge, dt);
          for (const r of RIB_DEF) drawRibbon(r, s.st.edge);
        }

        // Confetti physics
        for (let i = s.CF.length - 1; i >= 0; i--) {
          const c = s.CF[i];
          c.y += c.vy * dt;
          c.x += (c.vx + Math.sin(s.T * 2 + c.r) * 20) * dt;
          c.r += c.vr * dt;
          if (c.y > s.H + 20) {
            s.CF.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.r);
          ctx.fillStyle = c.c;
          ctx.fillRect(
            -c.w / 2,
            -c.w / 4,
            c.w,
            (c.w / 2) * (Math.abs(Math.cos(s.T * 2 + c.r)) * 0.8 + 0.2)
          );
          ctx.restore();
        }

        // Birthday Cake Animation
        if (s.st.cake > 0.02) {
          const sc = Math.min(s.W, 520) / 520;
          const cx = s.W / 2;
          const cy = s.H * 0.93;

          ctx.globalAlpha = s.st.cake;
          ctx.fillStyle = '#C7E5FF';
          ctx.fillRect(cx - 75 * sc, cy - 34 * sc, 150 * sc, 34 * sc);
          ctx.fillStyle = '#fff';
          ctx.fillRect(cx - 50 * sc, cy - 62 * sc, 100 * sc, 28 * sc);
          ctx.fillStyle = '#54ACFF';
          ctx.fillRect(cx - 75 * sc, cy - 34 * sc, 150 * sc, 5 * sc);
          ctx.fillRect(cx - 50 * sc, cy - 62 * sc, 100 * sc, 4 * sc);

          for (let i = -1; i <= 1; i++) {
            const px = cx + i * 28 * sc;
            ctx.fillStyle = '#91CEFF';
            ctx.fillRect(px - 2.5 * sc, cy - 82 * sc, 5 * sc, 20 * sc);
            if (s.T - s.cakeT > (i + 1) * 0.7 + 0.8) {
              const fl = 1 + 0.25 * Math.sin(s.T * 9 + i * 2);
              ctx.fillStyle = 'rgba(255,190,90,.35)';
              ctx.beginPath();
              ctx.arc(px, cy - 90 * sc, 12 * sc, 0, TAU);
              ctx.fill();

              ctx.fillStyle = '#ffb347';
              ctx.beginPath();
              ctx.ellipse(px, cy - 90 * sc, 3.5 * sc, 7 * sc * fl, 0, 0, TAU);
              ctx.fill();
            }
          }
          ctx.globalAlpha = 1;
        }

        // Spiral particles
        if (s.sp.on) {
          s.sp.t += dt;
          const k = ease(cl(s.sp.t / 3));
          const hy = s.H * 0.08 + 60;
          const rr = Math.min(s.W, s.H) * 0.3;
          for (let i = 0; i < 70; i++) {
            const f = i / 70;
            const a = f * 14 + s.sp.t * 2.2;
            const r = (1 - k) * rr * (0.15 + f);
            ctx.fillStyle = `rgba(49,141,224,${(1 - k * 0.6) * (0.3 + f * 0.6)})`;
            ctx.beginPath();
            ctx.arc(s.W / 2 + Math.cos(a) * r, hy + Math.sin(a) * r, 1.2 + f * 2, 0, TAU);
            ctx.fill();
          }
          if (s.sp.t > 3.4) s.sp.on = false;
        }

        // Gold particles morphing to '18'
        if (s.st.g > 0.02) {
          s.gt += dt;
          const k = ease(Math.min(s.gt / 3, 1));
          const r = Math.max(1.6, (Math.min(s.W * 0.8, 460) / 200) * 1.3);
          ctx.fillStyle = `rgba(49,141,224,${s.st.g})`;
          for (const p of s.gp) {
            ctx.beginPath();
            ctx.arc(
              p.x + (p.tx - p.x) * k + Math.sin(s.T * 2 + p.p) * (1.5 - k),
              p.y + (p.ty - p.y) * k + Math.cos(s.T * 2 + p.p) * (1.5 - k),
              r,
              0,
              TAU
            );
            ctx.fill();
          }
        }

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
      };
    }, [reducedMotion, onCosmicTime]);

    return <canvas id="cv" ref={canvasRef} aria-hidden="true" />;
  }
);

BirthdayCanvas.displayName = 'BirthdayCanvas';
