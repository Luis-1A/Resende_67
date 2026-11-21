import { rnd } from '../utils';
import { COLF } from '../config/scenes.config';
import { visualSettings } from '../config/visual-settings';
import { particleSystem } from '../visual-engine/particle-system';
import { performanceManager } from '../visual-engine/performance-manager';
import type { RenderEnv, VisualEffectModule } from '../types/app';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  w: number;
  h: number;
  c: string;
}

export const confettiEffect: VisualEffectModule & { _spawned: boolean } = {
  layer: visualSettings.layers.FOREGROUND,
  _spawned: false,

  init(): void {
    this._spawned = false;
    particleSystem.clearPool('confetti');
  },

  update(dt: number, env: RenderEnv, params: Record<string, unknown> = {}): void {
    const { W, H, u, R, sceneElapsed: st } = env;
    const pool = particleSystem.getPool<ConfettiParticle>('confetti', 160);
    if (st > Number(params.startAt ?? 10) && !this._spawned) {
      this._spawned = true;
      const count = Math.min(performanceManager.getProfile().confettiCount, Number(params.count) || 95);
      for (let i = 0; i < count; i++) {
        pool.acquire({
          x: rnd() * W,
          y: -rnd() * H * 0.45,
          vx: (rnd() - 0.5) * 55 * u,
          vy: (55 + rnd() * 105) * u,
          r: rnd() * 6,
          vr: (rnd() - 0.5) * 8,
          w: (5 + rnd() * 5) * u,
          h: (3 + rnd() * 4) * u,
          c: COLF[(rnd() * 4) | 0]
        });
      }
    }

    for (let i = pool.active.length - 1; i >= 0; i--) {
      const p = pool.active[i];
      p.x += (p.vx + Math.sin(R * 2 + p.r) * 20) * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      if (p.y > H + 20) pool.releaseAt(i);
    }
  },

  render(x: CanvasRenderingContext2D, _env: RenderEnv, params: Record<string, unknown> = {}): void {
    const pool = particleSystem.getPool<ConfettiParticle>('confetti', 160);
    if (!pool.active.length) return;
    x.save();
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 0.88;
    const spin3D = params.spin3D !== false;
    for (let i = 0; i < pool.active.length; i++) {
      const p = pool.active[i];
      const h = spin3D ? p.h * Math.cos(p.r * 1.7) : p.h;
      x.save();
      x.translate(p.x, p.y);
      x.rotate(p.r);
      x.fillStyle = p.c;
      x.fillRect(-p.w * 0.5, -h * 0.5, p.w, h);
      x.restore();
    }
    x.restore();
    x.globalAlpha = 1;
  },

  destroy(): void {
    this._spawned = false;
    particleSystem.clearPool('confetti');
  }
};

export default confettiEffect;
