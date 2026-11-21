import { cl, L, ez, glow, star4, GB, TAU } from '../utils';
import type { AnimationInitContext, RenderEnv } from '../types/app';

export interface OpeningParams {
  skipShootingStar?: boolean;
  [key: string]: unknown;
}

export const openingAnimation = {
  name: 'opening',
  layer: 1,
  worldSpace: false,
  _active: false,

  _params: { skipShootingStar: false } as OpeningParams,

  init(_ctx?: AnimationInitContext | null, _params?: OpeningParams): void {},

  play(params: OpeningParams = {}): void {
    this._params = { skipShootingStar: false, ...params };
    this._active = true;
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
  },

  update(_dt: number, _env: RenderEnv): void {},

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, cx, u, sceneElapsed: st } = env;

    // 1.5s darkness -> upper-center blue radial glow
    const skyRev = ez(cl((st - 1.5) / 4.5));
    if (skyRev < 1) {
      x.globalAlpha = 1 - skyRev;
      x.fillStyle = '#02040A';
      x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'lighter';
      glow(x, cx, H * 0.18, Math.max(W, H) * 0.75, skyRev * 0.52, GB);
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 1;
    }

    // 4-point shooting star on curved trajectory with trailing light
    if (!this._params.skipShootingStar && st >= 3.8 && st <= 10.8) {
      const gr = ez(cl((st - 3.8) / 1.1));
      const k = cl((st - 5.0) / 3.9);
      const B = (t: number): [number, number] => {
        const a = 1 - t;
        return [
          a * a * W * 0.14 + 2 * a * t * W * 0.52 + t * t * W * 0.82,
          a * a * H * 0.13 + 2 * a * t * H * 0.03 + t * t * H * 0.68
        ];
      };
      x.globalCompositeOperation = 'lighter';
      const fadeTrail = 1 - cl((st - 8.9) / 1.8);
      for (let j = 0; j < 28; j++) {
        const t = k - j * 0.012;
        if (t <= 0) continue;
        const p = B(t);
        const al = (1 - j / 28) * fadeTrail;
        glow(x, p[0] + Math.sin(j * 7) * 3.5 * u, p[1] + Math.cos(j * 5) * 3.5 * u, (13 - j * 0.38) * u, al * 0.8);
      }
      if (k < 1) {
        const p = B(k);
        const sz = (9.5 + 7 * Math.sin(k * Math.PI)) * u * gr;
        glow(x, p[0], p[1], sz * 3.4, gr);
        x.globalCompositeOperation = 'source-over';
        x.globalAlpha = gr;
        x.fillStyle = '#FFF7DE';
        star4(x, p[0], p[1], sz, 0);
      }
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 1;
    }

    // Foreground curved white petal sweep
    if (st >= 11.5 && st <= 15.8) {
      const pk = (st - 11.5) / 4.3;
      const px = L(W * 0.15, W * 0.88, ez(pk));
      const py = H * 0.78 - Math.sin(pk * Math.PI) * H * 0.36 + Math.sin(pk * 7) * H * 0.04;
      const sz = (10 + 16 * Math.sin(pk * Math.PI)) * u;
      x.save();
      x.translate(px, py);
      x.rotate(pk * 3.2);
      x.globalAlpha = Math.sin(pk * Math.PI) * 0.9;
      x.fillStyle = '#FFFFFF';
      x.beginPath();
      x.ellipse(0, 0, sz, sz * 0.52, 0, 0, TAU);
      x.fill();
      x.strokeStyle = 'rgba(200,220,255,.45)';
      x.lineWidth = 1 * u;
      x.beginPath();
      x.moveTo(-sz * 0.8, 0);
      x.quadraticCurveTo(0, -sz * 0.12, sz * 0.8, 0);
      x.stroke();
      x.restore();
    }
  }
};

export default openingAnimation;
