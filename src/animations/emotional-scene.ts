import { cl, glow, hp, TAU } from '../utils';
import type { AnimationModule, RenderEnv } from '../types/app';

export const emotionalSceneAnimation: AnimationModule & { _active: boolean } = {
  name: 'emotionalScene',
  layer: 4,
  worldSpace: true,
  _active: false,

  init(): void {},

  play(): void {
    this._active = true;
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
  },

  update(): void {},

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    const { W, H, cx, u, R, RM, sceneElapsed: st } = env;
    const py = H * 0.14 + (R * 18) % (H * 0.25) + Math.sin(R * 1.2) * 10 * u;
    x.fillStyle = 'rgba(255,255,255,.88)';
    x.beginPath();
    x.ellipse(cx + Math.sin(R * 0.8) * 22 * u, py, 7 * u, 3.4 * u, Math.sin(R * 0.7) * 0.4, 0, TAU);
    x.fill();

    const k = cl((st - 2.2) / 4.2);
    const sS = Math.min(W, H) * 0.0056 * (1 + (k >= 1 && !RM ? 0.045 * Math.sin(R * 2.8) : 0));
    const hy = H * 0.21;
    x.strokeStyle = '#fff';
    x.lineWidth = 2.4 * u;
    x.beginPath();
    for (let i = 0; i <= 70 * k; i++) {
      const p = hp((i / 70) * TAU);
      const jig = Math.sin(i * 1.7) * 0.4;
      if (i) x.lineTo(cx + p[0] * sS * 1.2 + jig, hy + p[1] * sS * 1.2);
      else x.moveTo(cx + p[0] * sS * 1.2, hy + p[1] * sS * 1.2);
    }
    x.stroke();
    x.globalCompositeOperation = 'lighter';
    glow(x, cx, hy, H * 0.17, k * 0.58);
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  }
};

export default emotionalSceneAnimation;
