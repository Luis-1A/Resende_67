import { cl, ez, L, rnd, glow, G, GB, TAU } from '../../../utils';
import { particleSystem, type ParticlePool } from '../../../visual-engine/particle-system';
import { getFinaleQuality } from '../config/finale-quality';
import type { RenderEnv } from '../../../types/app';

interface SampleTextOpts {
  w?: number;
  h?: number;
  font?: string;
  step?: number;
  maxPoints?: number;
}

interface GoldParticle {
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  size0: number;
  size1: number;
  life: number;
  maxLife: number;
  rot: number;
  vRot: number;
  alpha: number;
  color: string;
  mode: string;
  tx: number;
  ty: number;
  orbitR: number;
  orbitAngle: number;
  orbitSpd: number;
  seed: number;
  cool: boolean;
}

interface GoldParticleSpawnOpts {
  nx?: number;
  ny?: number;
  vx?: number;
  vy?: number;
  ax?: number;
  ay?: number;
  size0?: number;
  size1?: number;
  maxLife?: number;
  alpha?: number;
  color?: string;
  mode?: string;
  tx?: number;
  ty?: number;
  orbitR?: number;
  orbitAngle?: number;
  orbitSpd?: number;
  cool?: boolean;
}

interface Firefly {
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  spd: number;
  life: number;
  maxLife: number;
  fadingOut: boolean;
}

interface TypoPoint {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  normX: number;
  size: number;
  seed: number;
  releasing: boolean;
  alpha: number;
}

interface TypoFormationOpts {
  maxPoints?: number;
  maskW?: number;
  maskH?: number;
  font?: string;
  step?: number;
  centerX?: number;
  centerY?: number;
  scaleW?: number;
  scaleH?: number;
  color?: string;
}

interface LightWaveItem {
  nx: number;
  ny: number;
  maxR: number;
  duration: number;
  maxAlpha: number;
  color: string;
  t: number;
}

interface GuideLineItem {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  duration: number;
  kind: 'line' | 'heart';
  t: number;
  hold: number;
  pulseAt: number[];
}

const maskCache = new Map<string, [number, number][]>();

export function sampleTextTargets(
  text: string,
  {
    w = 420,
    h = 150,
    font = '700 92px "Cinzel", "Playfair Display", Georgia, serif',
    step = 5,
    maxPoints = 600
  }: SampleTextOpts = {}
): [number, number][] {
  const key = `${text}|${font}|${step}|${maxPoints}`;
  const cached = maskCache.get(key);
  if (cached) return cached;

  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#fff';
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const raw: [number, number][] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 110) {
        raw.push([(x - w / 2) / (w / 2), (y - h / 2) / (h / 2)]);
      }
    }
  }
  const stride = Math.max(1, Math.ceil(raw.length / maxPoints));
  const out: [number, number][] = [];
  for (let i = 0; i < raw.length && out.length < maxPoints; i += stride) {
    out.push(raw[i]);
  }
  maskCache.set(key, out);
  return out;
}

export const finaleGoldenParticles = {
  _pool: null as ParticlePool<GoldParticle> | null,
  _fireflies: [] as Firefly[],
  _typo: [] as TypoPoint[],
  _typoActive: false,
  _typoCenter: { x: 0.5, y: 0.42 },
  _typoScale: { w: 0.36, h: 0.14 },
  _typoFormed: 0,
  _typoSweep: -0.2,
  _typoColor: '#FFE8A3',
  _lightWaves: [] as LightWaveItem[],
  _guideLines: [] as GuideLineItem[],

  init(): void {
    this._pool = particleSystem.getPool<GoldParticle>('finaleGold', 420);
    this._pool.clear();
    this._fireflies = [];
    this._typo = [];
    this._typoActive = false;
    this._lightWaves = [];
    this._guideLines = [];
  },

  spawnParticle(opts: GoldParticleSpawnOpts = {}): GoldParticle | null {
    if (!this._pool) return null;
    const q = getFinaleQuality();
    if (this._pool.active.length >= q.goldDustMax + 140) return null;
    return this._pool.acquire({
      nx: opts.nx ?? rnd(),
      ny: opts.ny ?? (0.7 + rnd() * 0.28),
      vx: opts.vx ?? ((rnd() - 0.5) * 0.03),
      vy: opts.vy ?? (-0.04 - rnd() * 0.07),
      ax: opts.ax ?? 0,
      ay: opts.ay ?? 0,
      size0: opts.size0 ?? (1.2 + rnd() * 2.1),
      size1: opts.size1 ?? (0.5 + rnd() * 1.1),
      life: 0,
      maxLife: opts.maxLife ?? (1.6 + rnd() * 2.4),
      rot: rnd() * TAU,
      vRot: (rnd() - 0.5) * 1.6,
      alpha: opts.alpha ?? (0.65 + rnd() * 0.35),
      color: opts.color || (rnd() < 0.72 ? '#FFE39A' : '#FFFFFF'),
      mode: opts.mode || 'drift',
      tx: opts.tx ?? 0.5,
      ty: opts.ty ?? 0.5,
      orbitR: opts.orbitR ?? (0.04 + rnd() * 0.08),
      orbitAngle: opts.orbitAngle ?? (rnd() * TAU),
      orbitSpd: opts.orbitSpd ?? ((rnd() < 0.5 ? 1 : -1) * (1.2 + rnd() * 1.4)),
      seed: rnd() * 10,
      cool: Boolean(opts.cool)
    });
  },

  spawnFireflies(count = 60): void {
    const cap = getFinaleQuality().firefliesMax;
    const toAdd = Math.min(count, Math.max(0, cap - this._fireflies.length));
    for (let i = 0; i < toAdd; i++) {
      this._fireflies.push({
        nx: 0.04 + rnd() * 0.92,
        ny: 0.52 + rnd() * 0.42,
        vx: (rnd() - 0.5) * 0.018,
        vy: (rnd() - 0.5) * 0.014,
        size: 1.6 + rnd() * 2.2,
        phase: rnd() * TAU,
        spd: 1.2 + rnd() * 2.2,
        life: 0,
        maxLife: 4 + rnd() * 6,
        fadingOut: false
      });
    }
  },

  dimFireflies(): void {
    for (const f of this._fireflies) f.fadingOut = true;
  },

  triggerLightWave(
    { nx = 0.5, ny = 0.5, maxR = 1.0, duration = 1.2, maxAlpha = 0.28, color = '255,236,184' }:
    { nx?: number; ny?: number; maxR?: number; duration?: number; maxAlpha?: number; color?: string } = {}
  ): void {
    this._lightWaves.push({ nx, ny, maxR, duration, maxAlpha, color, t: 0 });
  },

  setTypographicFormation(text: string, opts: TypoFormationOpts = {}): void {
    const q = getFinaleQuality();
    const maxPts = Math.min(opts.maxPoints ?? 420, q.typoParticlesMax);
    const pts = sampleTextTargets(text, {
      w: opts.maskW ?? 460,
      h: opts.maskH ?? 160,
      font: opts.font || '700 94px "Cinzel", "Playfair Display", Georgia, serif',
      step: opts.step ?? 4,
      maxPoints: maxPts
    });
    const cx = opts.centerX ?? 0.5;
    const cy = opts.centerY ?? 0.46;
    const sw = opts.scaleW ?? 0.34;
    const sh = opts.scaleH ?? 0.13;
    this._typoCenter = { x: cx, y: cy };
    this._typoScale = { w: sw, h: sh };
    this._typoFormed = 0;
    this._typoSweep = -0.25;
    this._typoColor = opts.color || '#FFE8A3';
    this._typoActive = true;

    this._typo = pts.map((pt, i) => {
      const ang = (i / Math.max(1, pts.length)) * TAU + rnd() * 0.6;
      const dist = 0.14 + rnd() * 0.36;
      return {
        sx: cl(cx + Math.cos(ang) * dist, 0.05, 0.95),
        sy: cl(cy + Math.sin(ang) * dist * 0.7, 0.06, 0.92),
        tx: cx + pt[0] * sw,
        ty: cy + pt[1] * sh,
        nx: cx + Math.cos(ang) * dist,
        ny: cy + Math.sin(ang) * dist * 0.7,
        vx: 0,
        vy: 0,
        normX: (pt[0] + 1) * 0.5,
        size: 1.4 + rnd() * 1.5,
        seed: rnd() * TAU,
        releasing: false,
        alpha: 1
      };
    });
  },

  releaseTypographicFormation(): void {
    for (const p of this._typo) {
      p.releasing = true;
      p.vx = (rnd() - 0.5) * 0.05;
      p.vy = -0.03 - rnd() * 0.05;
    }
  },

  clearTypographicFormation(): void {
    this._typoActive = false;
    this._typo = [];
  },

  addConnectingLine(
    opts: {
      x1?: number;
      y1?: number;
      x2?: number;
      y2?: number;
      duration?: number;
      kind?: 'line' | 'heart';
      hold?: number;
      pulseAt?: number[];
    } = {}
  ): void {
    this._guideLines.push({
      x1: opts.x1 ?? 0.28,
      y1: opts.y1 ?? 0.50,
      x2: opts.x2 ?? 0.72,
      y2: opts.y2 ?? 0.50,
      duration: opts.duration ?? 1.5,
      kind: opts.kind || 'line',
      t: 0,
      hold: opts.hold ?? 18,
      pulseAt: opts.pulseAt || []
    });
  },

  update(dt: number, env: RenderEnv): void {
    const time = env.R;
    const pool = this._pool;
    if (pool) {
      for (let i = pool.active.length - 1; i >= 0; i--) {
        const p = pool.active[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          pool.releaseAt(i);
          continue;
        }
        if (p.mode === 'converge') {
          const k = cl(p.life / Math.max(0.5, p.maxLife * 0.85));
          const dx = p.tx - p.nx;
          const dy = p.ty - p.ny;
          const swirl = (1 - k) * 0.35;
          p.nx += (dx * 1.9 - dy * swirl) * dt;
          p.ny += (dy * 1.9 + dx * swirl) * dt;
        } else if (p.mode === 'orbit') {
          p.orbitAngle += p.orbitSpd * dt;
          p.nx = p.tx + Math.cos(p.orbitAngle) * p.orbitR;
          p.ny = p.ty + Math.sin(p.orbitAngle) * p.orbitR * 0.68;
        } else {
          const wave = Math.sin(time * 1.4 + p.seed) * 0.014;
          p.vx += p.ax * dt;
          p.vy += p.ay * dt;
          p.nx += (p.vx + wave) * dt;
          p.ny += p.vy * dt;
        }
        p.rot += p.vRot * dt;
      }
    }

    for (let i = this._fireflies.length - 1; i >= 0; i--) {
      const f = this._fireflies[i];
      f.life += dt;
      f.nx += (f.vx + Math.sin(time * 0.8 + f.phase) * 0.008) * dt;
      f.ny += (f.vy + Math.cos(time * 0.7 + f.phase) * 0.006) * dt;
      if (f.nx < 0.02 || f.nx > 0.98) f.vx *= -1;
      if (f.ny < 0.48 || f.ny > 0.96) f.vy *= -1;
      if (f.fadingOut && f.life > f.maxLife * 0.75) {
        this._fireflies.splice(i, 1);
      } else if (!f.fadingOut && f.life > f.maxLife) {
        f.life = 0;
      }
    }

    for (let i = this._lightWaves.length - 1; i >= 0; i--) {
      this._lightWaves[i].t += dt;
      if (this._lightWaves[i].t >= this._lightWaves[i].duration) {
        this._lightWaves.splice(i, 1);
      }
    }

    if (this._typoActive && this._typo.length) {
      this._typoFormed = cl(this._typoFormed + dt * 0.52);
      this._typoSweep = (this._typoSweep + dt * 0.45) % 1.45;
      const kf = ez(this._typoFormed);
      let aliveCount = 0;
      for (const p of this._typo) {
        if (p.releasing) {
          p.nx += p.vx * dt;
          p.ny += p.vy * dt;
          p.alpha = Math.max(0, p.alpha - dt * 0.48);
          if (p.alpha > 0.02) aliveCount++;
        } else {
          p.nx = L(p.sx, p.tx, kf) + Math.sin(time * 2.1 + p.seed) * 0.0018 * (1 - kf * 0.6);
          p.ny = L(p.sy, p.ty, kf) + Math.cos(time * 1.8 + p.seed) * 0.0018 * (1 - kf * 0.6);
          aliveCount++;
        }
      }
      if (aliveCount === 0) this.clearTypographicFormation();
    }

    for (let i = this._guideLines.length - 1; i >= 0; i--) {
      this._guideLines[i].t += dt;
      if (this._guideLines[i].t >= this._guideLines[i].hold) {
        this._guideLines.splice(i, 1);
      }
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv, textActive = false): void {
    const { W, H, u, R, RM } = env;
    const textDim = textActive ? 0.22 : 1;

    if (this._lightWaves.length) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (const wv of this._lightWaves) {
        const k = cl(wv.t / wv.duration);
        const rad = Math.max(W, H) * wv.maxR * ez(k);
        const al = wv.maxAlpha * Math.sin(k * Math.PI);
        const cx = wv.nx * W;
        const cy = wv.ny * H;
        const grad = x.createRadialGradient(cx, cy, rad * 0.55, cx, cy, Math.max(1, rad));
        grad.addColorStop(0, `rgba(${wv.color},0)`);
        grad.addColorStop(0.78, `rgba(${wv.color},${al})`);
        grad.addColorStop(1, `rgba(${wv.color},0)`);
        x.fillStyle = grad;
        x.beginPath();
        x.arc(cx, cy, rad, 0, TAU);
        x.fill();
      }
      x.restore();
    }

    if (this._guideLines.length) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (const gl of this._guideLines) {
        const drawP = ez(cl(gl.t / gl.duration));
        const fadeOut = gl.t > gl.hold - 1.5 ? cl((gl.hold - gl.t) / 1.5) : 1;
        if (gl.kind === 'heart') {
          let pulse = 1;
          for (const pt of gl.pulseAt) {
            const d = Math.abs(gl.t - pt);
            if (d < 0.45) pulse += Math.sin((1 - d / 0.45) * Math.PI) * 0.22;
          }
          const cx = gl.x1 * W;
          const cy = gl.y1 * H;
          const sc = Math.min(W, H) * 0.0022 * pulse;
          x.strokeStyle = `rgba(255,220,145,${0.78 * fadeOut})`;
          x.lineWidth = 2 * u;
          x.beginPath();
          const steps = Math.max(2, Math.floor(64 * drawP));
          for (let s = 0; s <= steps; s++) {
            const a = (s / 64) * TAU;
            const hx = 16 * Math.pow(Math.sin(a), 3) * sc;
            const hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * sc;
            s === 0 ? x.moveTo(cx + hx, cy + hy) : x.lineTo(cx + hx, cy + hy);
          }
          x.stroke();
        } else {
          const x1 = gl.x1 * W;
          const y1 = gl.y1 * H;
          const x2 = L(x1, gl.x2 * W, drawP);
          const y2 = L(y1, gl.y2 * H, drawP);
          x.strokeStyle = `rgba(255,222,148,${0.65 * fadeOut})`;
          x.lineWidth = 1.6 * u;
          x.beginPath();
          x.moveTo(x1, y1);
          x.quadraticCurveTo((x1 + x2) * 0.5, y1 - H * 0.05 * drawP, x2, y2);
          x.stroke();
          glow(x, x1, y1, 18 * u, 0.85 * fadeOut);
          if (drawP > 0.92) glow(x, gl.x2 * W, gl.y2 * H, 18 * u, 0.85 * fadeOut);
          glow(x, x2, y2, 12 * u, 0.9 * fadeOut);
        }
      }
      x.restore();
    }

    if (this._typoActive && this._typo.length) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (const p of this._typo) {
        const px = p.nx * W;
        const py = p.ny * H;
        const sweepBoost = Math.abs(p.normX - this._typoSweep) < 0.1 ? 0.45 : 0;
        const al = p.alpha * (0.58 + sweepBoost + (RM ? 0 : 0.18 * Math.sin(R * 3.5 + p.seed)));
        glow(x, px, py, (p.size * 2.4 + sweepBoost * 2.2) * u, al);
      }
      x.restore();
    }

    if (this._pool && this._pool.active.length) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (const p of this._pool.active) {
        const lifeP = p.life / p.maxLife;
        const fadeIn = cl(lifeP / 0.14);
        const fadeOut = lifeP > 0.75 ? cl((1 - lifeP) / 0.25) : 1;
        const px = p.nx * W;
        const py = p.ny * H;
        const inTextBox = textActive && p.nx > 0.15 && p.nx < 0.85 && p.ny > 0.25 && p.ny < 0.75;
        const a = p.alpha * fadeIn * fadeOut * (inTextBox ? textDim : 1);
        if (a <= 0.01) continue;
        const sz = L(p.size0, p.size1, lifeP) * u;
        glow(x, px, py, sz * 2.6, a, p.cool ? GB : G);
      }
      x.restore();
    }

    if (this._fireflies.length) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (const f of this._fireflies) {
        const blink = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(R * f.spd + f.phase));
        const out = f.fadingOut ? cl(1 - f.life / f.maxLife) : 1;
        const a = blink * out * 0.85 * (f.ny < 0.75 && textActive ? textDim : 1);
        if (a <= 0.01) continue;
        glow(x, f.nx * W, f.ny * H, f.size * 3.4 * u, a);
      }
      x.restore();
    }
    x.globalAlpha = 1;
  }
};
