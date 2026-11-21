import { cl, ez, L, rnd, glow, star4, G, TAU } from '../../utils';
import type { ParticleEngine } from './particle-engine';
import type { RenderEnv } from '../../types/app';

interface LightWave {
  x: number;
  y: number;
  t: number;
  dur: number;
  maxR: number;
}

interface OrbiterSeed {
  offset: number;
  phase: number;
  amp: number;
  speed: number;
}

export const timelineAnimation = {
  _mode: 'hidden' as 'hidden' | 'line' | 'circle',
  _lineProgress: 0,
  _lineAlpha: 0,
  _lineIntensity: 1,
  _lineY: 0.56,
  _milestoneStarX: -0.2,
  _milestoneActive: false,
  _milestoneBurstCooldown: 0,
  _ringProgress: 0,
  _ringAlpha: 0,
  _ringSpin: 0,
  _ringSpinSpeed: 0.35,
  _ringRadius: 0.19,
  _activeLightIndex: -1,
  _lightsDetached: 0,
  _lightWaves: [] as LightWave[],
  _orbiterSeeds: [] as OrbiterSeed[],

  init(): void {
    this._mode = 'hidden';
    this._lineProgress = 0;
    this._lineAlpha = 0;
    this._lineIntensity = 1;
    this._milestoneStarX = -0.2;
    this._milestoneActive = false;
    this._ringProgress = 0;
    this._ringAlpha = 0;
    this._ringSpin = 0;
    this._ringSpinSpeed = 0.35;
    this._activeLightIndex = -1;
    this._lightsDetached = 0;
    this._lightWaves = [];
    this._orbiterSeeds = Array.from({ length: 18 }, (_, i) => ({
      offset: i / 18,
      phase: rnd() * TAU,
      amp: 0.008 + rnd() * 0.012,
      speed: 1.4 + rnd() * 1.5
    }));
  },

  activateLine(): void {
    this._mode = 'line';
    this._lineAlpha = 1;
  },

  setLineBuild(k: number, intensity = 1): void {
    this._lineProgress = cl(k);
    this._lineIntensity = intensity;
  },

  triggerMilestoneSweep(): void {
    this._milestoneActive = true;
    this._milestoneStarX = 0.08;
    this._milestoneBurstCooldown = 0;
  },

  transitionLineToCircle(engine: ParticleEngine | null): void {
    this._mode = 'circle';
    if (engine) {
      const cardinals: [number, number][] = [
        [0.5, 0.45 - 0.19],
        [0.5, 0.45 + 0.19],
        [0.5 - 0.19 * 0.72, 0.45],
        [0.5 + 0.19 * 0.72, 0.45]
      ];
      cardinals.forEach((pt, idx) => {
        engine.spawn('primaryGold', {
          sceneId: 'lineToCircle',
          behavior: 'curvePath',
          x: L(0.18, 0.82, idx / 3),
          y: this._lineY,
          cx: 0.5,
          cy: 0.52,
          tx: pt[0],
          ty: pt[1],
          maxLife: 1.05,
          size: 3.0
        });
      });
    }
  },

  setCircleState(
    { ringProgress = 1, activeMonthIdx = 0, detachK = 0, spinSpeed = 0.35 }:
    { ringProgress?: number; activeMonthIdx?: number; detachK?: number; spinSpeed?: number } = {}
  ): void {
    this._ringProgress = cl(ringProgress);
    this._ringAlpha = 1 - cl(detachK);
    this._activeLightIndex = activeMonthIdx;
    this._lightsDetached = cl(detachK);
    this._ringSpinSpeed = spinSpeed;
  },

  hideAll(): void {
    this._mode = 'hidden';
    this._lineAlpha = 0;
    this._ringAlpha = 0;
  },

  update(dt: number, engine: ParticleEngine | null): void {
    if (this._mode === 'line' && this._milestoneActive) {
      const prevX = this._milestoneStarX;
      this._milestoneStarX += dt * 0.92;
      if (prevX < 0.5 && this._milestoneStarX >= 0.5) {
        this._lightWaves.push({ x: 0.5, y: this._lineY, t: 0, dur: 0.9, maxR: 0.25 });
        if (engine) {
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * TAU;
            engine.spawn('dispersion', {
              sceneId: 'milestone',
              x: 0.5,
              y: this._lineY,
              vx: Math.cos(a) * (0.06 + rnd() * 0.05),
              vy: Math.sin(a) * (0.04 + rnd() * 0.04),
              maxLife: 0.9 + rnd() * 0.4,
              size: 1.8 + rnd() * 1.2
            });
          }
        }
      }
      if (this._milestoneStarX > 0.96) {
        this._milestoneActive = false;
      }
    }

    if (this._mode === 'circle') {
      this._lineAlpha = Math.max(0, this._lineAlpha - dt * 1.8);
      this._ringSpin += dt * this._ringSpinSpeed;
    }

    for (let i = this._lightWaves.length - 1; i >= 0; i--) {
      this._lightWaves[i].t += dt;
      if (this._lightWaves[i].t >= this._lightWaves[i].dur) {
        this._lightWaves.splice(i, 1);
      }
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    const { W, H, u, R, RM } = env;
    const minDim = Math.min(W, H);

    for (const wv of this._lightWaves) {
      const k = ez(cl(wv.t / wv.dur));
      const fade = 1 - cl(wv.t / wv.dur);
      x.save();
      x.globalCompositeOperation = 'lighter';
      x.strokeStyle = `rgba(255,232,162,${0.7 * fade})`;
      x.lineWidth = 2 * u;
      x.beginPath();
      x.arc(wv.x * W, wv.y * H, minDim * wv.maxR * k, 0, TAU);
      x.stroke();
      x.restore();
    }

    if (this._lineAlpha > 0.01 && this._lineProgress > 0.01) {
      const span = 0.40 * ez(this._lineProgress);
      const x1 = (0.5 - span) * W;
      const x2 = (0.5 + span) * W;
      const ly = this._lineY * H;
      const intensity = this._lineIntensity;

      x.save();
      x.globalCompositeOperation = 'lighter';
      const halo = x.createLinearGradient(x1, ly, x2, ly);
      halo.addColorStop(0, 'rgba(255,214,122,0)');
      halo.addColorStop(0.18, `rgba(255,222,145,${0.32 * this._lineAlpha * intensity})`);
      halo.addColorStop(0.5, `rgba(255,244,200,${0.62 * this._lineAlpha * intensity})`);
      halo.addColorStop(0.82, `rgba(255,222,145,${0.32 * this._lineAlpha * intensity})`);
      halo.addColorStop(1, 'rgba(255,214,122,0)');
      x.strokeStyle = halo;
      x.lineWidth = 7 * u;
      x.beginPath();
      for (let s = 0; s <= 28; s++) {
        const t = s / 28;
        const px = L(x1, x2, t);
        const py = ly + (RM ? 0 : Math.sin(t * Math.PI * 3 + R * 1.2) * 2.2 * u);
        s === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
      }
      x.stroke();

      x.strokeStyle = `rgba(255,242,198,${0.86 * this._lineAlpha})`;
      x.lineWidth = 1.8 * u;
      x.stroke();

      glow(x, 0.5 * W, ly, 16 * u, 0.72 * this._lineAlpha, G);
      for (const orb of this._orbiterSeeds) {
        const px = L(x1, x2, orb.offset);
        const py = ly + Math.sin(R * orb.speed + orb.phase) * orb.amp * H;
        glow(x, px, py, 5 * u, 0.5 * this._lineAlpha, G);
      }

      if (this._milestoneActive) {
        const mx = this._milestoneStarX * W;
        const my = ly + Math.sin(this._milestoneStarX * 8) * 3 * u;
        glow(x, mx, my, 22 * u, 0.9 * this._lineAlpha, G);
        x.fillStyle = '#FFFFFF';
        x.globalAlpha = 0.95 * this._lineAlpha;
        star4(x, mx, my, 9 * u, 0);
      }
      x.restore();
    }

    if (this._mode === 'circle' && this._ringAlpha > 0.01) {
      const cx = W * 0.5;
      const cy = H * 0.45;
      const rad = minDim * this._ringRadius;
      const detach = this._lightsDetached;

      x.save();
      x.globalCompositeOperation = 'lighter';
      x.strokeStyle = `rgba(255,224,148,${0.32 * this._ringProgress * this._ringAlpha})`;
      x.lineWidth = 1.5 * u;
      x.beginPath();
      x.arc(cx, cy, rad, 0, TAU * this._ringProgress);
      x.stroke();

      for (let m = 0; m < 12; m++) {
        const revealP = cl((this._ringProgress * 12 - m) / 1.5);
        if (revealP <= 0.02) continue;
        const ang = (m / 12) * TAU - Math.PI * 0.5 + this._ringSpin;
        const curRad = L(rad, minDim * 0.02, ez(detach));
        const lx = cx + Math.cos(ang) * curRad;
        const ly = cy + Math.sin(ang) * curRad;
        const isCurrent = m === this._activeLightIndex;
        const glowSz = (isCurrent ? 22 : 11) * u;
        const glowAl = (isCurrent ? 0.95 : 0.48) * revealP * (1 - detach * 0.7);
        glow(x, lx, ly, glowSz, glowAl, G);

        if (isCurrent) {
          x.globalAlpha = 0.95 * (1 - detach * 0.7);
          x.fillStyle = '#FFFFFF';
          x.beginPath();
          x.arc(lx, ly, 3.2 * u, 0, TAU);
          x.fill();
        }
      }
      x.restore();
    }
    x.globalAlpha = 1;
  }
};

export default timelineAnimation;
