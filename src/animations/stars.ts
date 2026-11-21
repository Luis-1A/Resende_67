import { cl, ez, rnd, CG, VG } from '../utils';
import type { AnimationInitContext, RenderEnv, ScreenBounds } from '../types/app';

type StarTuple = [number, number, number, number, number, string];

interface CloudBand {
  x: number;
  y: number;
  w: number;
  spd: number;
  a: number;
}

export interface StarsAnimParams {
  starCount?: number;
  cloudCount?: number;
  skyColors?: string[];
  starDensity?: number;
  mountains?: string[] | null;
  mountainReveal?: boolean;
  ground?: boolean;
  groundTop?: string;
  idle?: boolean;
  [key: string]: unknown;
}

export const starsAnimation = {
  name: 'stars',
  layer: 2,
  worldSpace: true,
  _ctx: null as AnimationInitContext | null,
  _active: false,
  _unsubResize: null as (() => void) | null,
  _ST: [] as StarTuple[],
  _CL: [] as CloudBand[],
  _M0: [] as [number, number][],
  _M1: [] as [number, number][],
  _skyG: null as CanvasGradient | null,
  _gndG: null as CanvasGradient | null,
  _params: {
    skyColors: ['#050C20', '#142852', '#284A7E'],
    starDensity: 1,
    mountains: null,
    mountainReveal: false,
    ground: false,
    groundTop: '#0B2A24',
    idle: false
  } as StarsAnimParams,

  init(ctx: AnimationInitContext | null, params: StarsAnimParams = {}): void {
    this._ctx = ctx;
    this._buildStars(params.starCount || 90, params.cloudCount || 9);
    if (!ctx) return;
    this._buildTerrain(ctx.screenManager.getBounds());
    if (!this._unsubResize) {
      this._unsubResize = ctx.screenManager.onResize(b => {
        this._buildTerrain(b);
        this._rebuildGradients(b);
      });
    }
  },

  _buildStars(starCount: number, cloudCount: number): void {
    this._ST = [];
    for (let i = 0; i < starCount; i++) {
      this._ST.push([
        rnd(),
        rnd() * 0.72,
        0.55 + rnd() * 1.65,
        rnd() * 6,
        i % 3,
        i % 5 === 0 ? '#DCEBFF' : i % 7 === 0 ? '#FFF1CC' : '#FFFFFF'
      ]);
    }
    this._CL = [];
    for (let i = 0; i < cloudCount; i++) {
      this._CL.push({
        x: rnd(),
        y: 0.08 + rnd() * 0.28,
        w: 0.22 + rnd() * 0.24,
        spd: 0.0028 + rnd() * 0.0045,
        a: 0.05 + rnd() * 0.07
      });
    }
  },

  _buildTerrain({ W, H }: ScreenBounds): void {
    const sample = (b: number, a: number, sd: number): [number, number][] => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= W + 24; i += 20) {
        pts.push([i, H * b - H * a * (Math.sin(i * 0.004 + sd) + 0.5 * Math.sin(i * 0.011 + sd * 2) + 0.22 * Math.sin(i * 0.023 + sd * 3) + 1.5) / 3]);
      }
      return pts;
    };
    this._M0 = sample(0.62, 0.16, 1);
    this._M1 = sample(0.76, 0.12, 4);
  },

  _rebuildGradients({ H }: ScreenBounds): void {
    if (!this._ctx || !this._ctx.ctx2d) return;
    const x = this._ctx.ctx2d;
    const cols = this._params.skyColors || ['#050C20', '#142852', '#284A7E'];
    this._skyG = x.createLinearGradient(0, 0, 0, H);
    this._skyG.addColorStop(0, cols[0]);
    this._skyG.addColorStop(0.56, cols[1]);
    this._skyG.addColorStop(1, cols[2]);
    this._gndG = x.createLinearGradient(0, H * 0.86, 0, H);
    this._gndG.addColorStop(0, this._params.groundTop || '#0B2A24');
    this._gndG.addColorStop(1, '#030D0B');
  },

  play(params: StarsAnimParams = {}): void {
    this._params = { ...this._params, ...params };
    this._active = true;
    if (this._ctx) {
      this._rebuildGradients(this._ctx.screenManager.getBounds());
    }
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
    if (this._unsubResize) {
      this._unsubResize();
      this._unsubResize = null;
    }
    this._ST = [];
    this._CL = [];
    this._M0 = [];
    this._M1 = [];
  },

  update(dt: number, env: RenderEnv): void {
    if (!this._active || env.RM || !this._params.starDensity) return;
    for (const c of this._CL) {
      c.x = (c.x + c.spd * dt) > 1.25 ? -0.3 : c.x + c.spd * dt;
    }
  },

  renderBackdrop(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, u, R, RM } = env;
    if (this._params.idle) {
      x.fillStyle = '#07112A';
      x.fillRect(0, 0, W, H);
      x.fillStyle = '#fff';
      for (const a of this._ST) {
        x.globalAlpha = 0.4 + 0.5 * Math.sin(R * 2 + a[3]);
        x.fillRect(a[0] * W, a[1] * H, a[2] * u, a[2] * u);
      }
      x.globalAlpha = 1;
      return;
    }

    if (this._skyG) {
      x.fillStyle = this._skyG;
      x.fillRect(0, 0, W, H);
    }

    const density = this._params.starDensity || 0;
    if (density > 0) {
      for (const a of this._ST) {
        const tw = RM ? 0.8 : (0.32 + 0.68 * (0.5 + 0.5 * Math.sin(R * (1 + a[4] * 0.6) + a[3])));
        const sx = a[0] * W;
        const sy = a[1] * H;
        const sz = a[2] * u;
        x.globalAlpha = density * tw * (a[4] === 2 ? 0.9 : a[4] === 1 ? 0.68 : 0.42);
        x.fillStyle = a[5];
        x.fillRect(sx, sy, sz, sz);
        if (a[4] === 2 && a[2] > 1.65 && tw > 0.72) {
          x.fillRect(sx - sz * 1.1, sy + sz * 0.35, sz * 3.2, sz * 0.35);
          x.fillRect(sx + sz * 0.35, sy - sz * 1.1, sz * 0.35, sz * 3.2);
        }
      }
      for (const c of this._CL) {
        const gx = c.x * W;
        const gy = c.y * H;
        const gw = c.w * W;
        x.globalAlpha = c.a * density;
        x.drawImage(CG, gx - gw, gy - gw * 0.36, gw * 2, gw * 0.72);
      }
      x.globalAlpha = 1;
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active || this._params.idle) return;
    const { W, H, R, sceneElapsed } = env;
    const m = this._params.mountains;
    if (m) {
      const ma = this._params.mountainReveal ? ez(cl((sceneElapsed - 6.8) / 3)) : 1;
      const mb = this._params.mountainReveal ? ez(cl((sceneElapsed - 8.2) / 3)) : 1;
      const drawRidge = (col: string, pts: [number, number][], al: number): void => {
        x.globalAlpha = al;
        x.fillStyle = col;
        x.beginPath();
        x.moveTo(0, H);
        for (let i = 0; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
        x.lineTo(W, H);
        x.closePath();
        x.fill();
      };
      drawRidge(m[0], this._M0, ma);
      drawRidge(m[1], this._M1, mb);
      x.globalCompositeOperation = 'lighter';
      x.globalAlpha = 0.13 * ma;
      x.drawImage(CG, ((R * 12) % (W * 1.6)) - W * 0.5, H * 0.62, W * 0.9, H * 0.14);
      x.globalAlpha = 1;
      x.globalCompositeOperation = 'source-over';
    }
    if (this._params.ground && this._gndG) {
      x.fillStyle = this._gndG;
      x.fillRect(0, H * 0.88, W, H * 0.12);
    }
  },

  renderOverlay(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    x.globalAlpha = this._params.idle ? 0.65 : 0.72;
    x.drawImage(VG, 0, 0, env.W, env.H);
    x.globalAlpha = 1;
    if (env.fin) {
      x.fillStyle = 'rgba(8,16,40,.14)';
      x.fillRect(0, 0, env.W, env.H);
    }
  }
};

export default starsAnimation;
