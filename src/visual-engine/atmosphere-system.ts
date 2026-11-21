import { cl, ez, rnd, CG, hexToRgb, syncDynamicTextContrast } from '../utils';
import type { AtmosphereConfig, RenderEnv, ScreenBounds } from '../types/app';

interface CloudItem {
  x: number;
  y: number;
  w: number;
  spd: number;
  a: number;
}

export const atmosphereSystem = {
  _skyG: null as CanvasGradient | null,
  _gndG: null as CanvasGradient | null,
  _clouds: [] as CloudItem[],
  _M0: [] as Array<[number, number]>,
  _M1: [] as Array<[number, number]>,
  _config: {
    skyColors: ['#050C20', '#142852', '#284A7E'],
    mountains: null,
    mountainReveal: false,
    ground: false,
    groundTop: '#0B2A24',
    cloudDensity: 0.9
  } as AtmosphereConfig,

  init(bounds: ScreenBounds): void {
    this._clouds = [];
    for (let i = 0; i < 9; i++) {
      this._clouds.push({
        x: rnd(),
        y: 0.08 + rnd() * 0.28,
        w: 0.22 + rnd() * 0.24,
        spd: 0.0028 + rnd() * 0.0045,
        a: 0.05 + rnd() * 0.07
      });
    }
    this.onResize(bounds);
  },

  onResize({ W, H }: ScreenBounds): void {
    const sample = (b: number, a: number, sd: number): Array<[number, number]> => {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i <= W + 24; i += 20) {
        pts.push([i, H * b - H * a * (Math.sin(i * 0.004 + sd) + 0.5 * Math.sin(i * 0.011 + sd * 2) + 0.22 * Math.sin(i * 0.023 + sd * 3) + 1.5) / 3]);
      }
      return pts;
    };
    this._M0 = sample(0.62, 0.16, 1);
    this._M1 = sample(0.76, 0.12, 4);
  },

  configure(x: CanvasRenderingContext2D | null, bounds: ScreenBounds | null, cfg: AtmosphereConfig = {}): void {
    this._config = { ...this._config, ...cfg };
    const cols = this._config.skyColors || ['#050C20', '#142852', '#284A7E'];
    syncDynamicTextContrast(hexToRgb(cols[1] || cols[0]), 0.18);
    if (!x || !bounds || !bounds.H) return;
    this._skyG = x.createLinearGradient(0, 0, 0, bounds.H);
    this._skyG.addColorStop(0, cols[0]);
    this._skyG.addColorStop(0.56, cols[1]);
    this._skyG.addColorStop(1, cols[2]);
    this._gndG = x.createLinearGradient(0, bounds.H * 0.86, 0, bounds.H);
    this._gndG.addColorStop(0, this._config.groundTop || '#0B2A24');
    this._gndG.addColorStop(1, '#030D0B');
  },

  update(dt: number, env: RenderEnv): void {
    if (env.RM || !this._config.cloudDensity) return;
    for (const c of this._clouds) {
      c.x = (c.x + c.spd * dt) > 1.25 ? -0.3 : c.x + c.spd * dt;
    }
  },

  renderSkyAndClouds(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (this._skyG) {
      x.fillStyle = this._skyG;
      x.fillRect(0, 0, env.W, env.H);
    } else {
      x.fillStyle = '#07112A';
      x.fillRect(0, 0, env.W, env.H);
    }

    const cd = this._config.cloudDensity ?? 0;
    if (cd > 0) {
      for (const c of this._clouds) {
        const gx = c.x * env.W;
        const gy = c.y * env.H;
        const gw = c.w * env.W;
        x.globalAlpha = c.a * cd;
        x.drawImage(CG, gx - gw, gy - gw * 0.36, gw * 2, gw * 0.72);
      }
      x.globalAlpha = 1;
    }
  },

  renderTerrain(x: CanvasRenderingContext2D, env: RenderEnv): void {
    const { W, H, R, sceneElapsed } = env;
    const m = this._config.mountains;
    if (m) {
      const ma = this._config.mountainReveal ? ez(cl((sceneElapsed - 6.8) / 3)) : 1;
      const mb = this._config.mountainReveal ? ez(cl((sceneElapsed - 8.2) / 3)) : 1;
      const drawRidge = (col: string, pts: Array<[number, number]>, al: number) => {
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
    if (this._config.ground && this._gndG) {
      x.fillStyle = this._gndG;
      x.fillRect(0, H * 0.88, W, H * 0.12);
    }
  }
};
