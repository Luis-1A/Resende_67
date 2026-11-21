import { cl, L, rnd, glow, G, TAU } from '../../../utils.js';
import { particleSystem } from '../../../visual-engine/particle-system.js';
import { getFinaleQuality } from '../config/finale-quality.js';

const COLOR_SETS = {
  goldCircle: ['#FFE9A8', '#FFD06B', '#FFF5D6'],
  whiteCircle: ['#FFFFFF', '#DCEBFF', '#EEF6FF'],
  star5: ['#FFEBA6', '#FFFFFF', '#FFD27A'],
  goldLarge: ['#FFE694', '#FFC557', '#FFF7DF'],
  pinkWhite: ['#FFB3D6', '#FFFFFF', '#FFD6EA'],
  doubleRing: ['#FFE9A8', '#B8D9FF', '#FFFFFF'],
  grandBurst: ['#FFE89C', '#FFFFFF', '#FFB8D9', '#A8D2FF']
};

export const finaleFireworks = {
  _rockets: [],
  _sparks: null,
  _trails: [],
  _flash: 0,
  _flashColor: '255,236,184',

  init() {
    this._rockets = [];
    this._trails = [];
    this._flash = 0;
    this._sparks = particleSystem.getPool('finaleFW', 920);
    this._sparks.clear();
  },

  launch({ nx = 0.5, ny = 0.22, type = 'goldCircle', size = 1, onExplode = null } = {}) {
    this._rockets.push({
      sx: nx + (rnd() - 0.5) * 0.04,
      sy: 1.0,
      tx: nx,
      ty: ny,
      t: 0,
      dur: 0.95,
      type,
      size,
      onExplode,
      trailAccum: 0
    });
  },

  _explode(r) {
    const q = getFinaleQuality();
    const baseCount = Math.round((95 + rnd() * 50) * q.burstScale * r.size);
    const room = Math.max(0, q.fireworkParticlesMax - this._sparks.active.length);
    const count = Math.min(baseCount, room);
    const cols = COLOR_SETS[r.type] || COLOR_SETS.goldCircle;

    this._flash = Math.min(0.24, this._flash + 0.14 * r.size);
    this._flashColor = r.type === 'pinkWhite' ? '255,205,230' : r.type === 'whiteCircle' ? '220,238,255' : '255,232,175';

    for (let i = 0; i < count; i++) {
      let angle = (i / count) * TAU + (rnd() - 0.5) * 0.15;
      let speed = (0.09 + rnd() * 0.18) * r.size;

      if (r.type === 'star5') {
        const starAng = (i / count) * TAU;
        const pointMask = 0.52 + 0.48 * Math.abs(Math.cos(starAng * 2.5));
        angle = starAng;
        speed = 0.18 * pointMask * r.size * (0.9 + rnd() * 0.2);
      } else if (r.type === 'doubleRing') {
        const outer = i % 2 === 0;
        speed = (outer ? 0.21 : 0.11) * r.size * (0.92 + rnd() * 0.16);
      } else if (r.type === 'grandBurst') {
        speed = (0.1 + (i % 3) * 0.075 + rnd() * 0.06) * r.size;
      }

      this._sparks.acquire({
        nx: r.tx,
        ny: r.ty,
        px: r.tx,
        py: r.ty,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        sz: (1.2 + rnd() * 2.4) * (r.size > 1.2 ? 1.15 : 1),
        life: 0,
        maxLife: 1.2 + rnd() * 1.5,
        color: cols[i % cols.length],
        trail: i % 3 === 0
      });
    }

    if (typeof r.onExplode === 'function') r.onExplode(r);
  },

  update(dt) {
    this._flash = Math.max(0, this._flash - dt * 0.75);

    for (let i = this._rockets.length - 1; i >= 0; i--) {
      const r = this._rockets[i];
      r.t += dt;
      r.trailAccum += dt;
      const k = cl(r.t / r.dur);
      const easeOut = 1 - Math.pow(1 - k, 2.1);
      const curX = L(r.sx, r.tx, easeOut);
      const curY = L(r.sy, r.ty, easeOut);

      if (r.trailAccum >= 0.045) {
        r.trailAccum = 0;
        this._trails.push({ nx: curX, ny: curY, life: 0, maxLife: 0.42 });
      }

      if (k >= 1) {
        this._explode(r);
        this._rockets.splice(i, 1);
      }
    }

    for (let i = this._trails.length - 1; i >= 0; i--) {
      this._trails[i].life += dt;
      if (this._trails[i].life >= this._trails[i].maxLife) {
        this._trails.splice(i, 1);
      }
    }

    const pool = this._sparks;
    for (let i = pool.active.length - 1; i >= 0; i--) {
      const p = pool.active[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        pool.releaseAt(i);
        continue;
      }
      p.px = p.nx;
      p.py = p.ny;
      p.nx += p.vx * dt;
      p.ny += p.vy * dt;
      p.vy += 0.065 * dt; // subtle gravity pull
      p.vx *= Math.max(0.88, 1 - dt * 0.72);
      p.vy *= Math.max(0.88, 1 - dt * 0.65);
    }
  },

  render(x, env) {
    const { W, H, u } = env;

    // Soft controlled ambient flash
    if (this._flash > 0.005) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      x.fillStyle = `rgba(${this._flashColor},${this._flash * 0.42})`;
      x.fillRect(0, 0, W, H * 0.62);
      x.restore();
    }

    // Rocket trail dots
    if (this._trails.length) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (const tr of this._trails) {
        const a = 1 - cl(tr.life / tr.maxLife);
        glow(x, tr.nx * W, tr.ny * H, 5 * u, a * 0.7, G);
      }
      x.restore();
    }

    // Active rising rockets
    for (const r of this._rockets) {
      const k = cl(r.t / r.dur);
      const easeOut = 1 - Math.pow(1 - k, 2.1);
      const rx = L(r.sx, r.tx, easeOut) * W;
      const ry = L(r.sy, r.ty, easeOut) * H;
      x.save();
      x.globalCompositeOperation = 'lighter';
      glow(x, rx, ry, 10 * u, 0.95, G);
      x.restore();
    }

    // Dispersing sparks
    if (this._sparks.active.length) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (const p of this._sparks.active) {
        const k = p.life / p.maxLife;
        const earlyBright = k < 0.2 ? 1.2 : 1;
        const fadeOut = k > 0.75 ? cl((1 - k) / 0.25) : 1;
        const a = cl(earlyBright * fadeOut);
        if (a <= 0.01) continue;

        const px = p.nx * W;
        const py = p.ny * H;
        if (p.trail) {
          x.strokeStyle = p.color;
          x.globalAlpha = a * 0.65;
          x.lineWidth = p.sz * 0.75 * u;
          x.beginPath();
          x.moveTo(p.px * W, p.py * H);
          x.lineTo(px, py);
          x.stroke();
        }
        x.globalAlpha = a;
        x.fillStyle = p.color;
        x.beginPath();
        x.arc(px, py, p.sz * u, 0, TAU);
        x.fill();
        if (k < 0.35) {
          glow(x, px, py, p.sz * 2.8 * u, a * 0.45);
        }
      }
      x.restore();
    }
    x.globalAlpha = 1;
  }
};
