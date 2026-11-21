import { cl, rnd, TAU } from '../utils';
import { visualSettings } from '../config/visual-settings';
import { particleSystem } from '../visual-engine/particle-system';
import { physicsSystem, type SparkParticle } from '../visual-engine/physics-system';
import { performanceManager } from '../visual-engine/performance-manager';
import type { RenderEnv, VisualEffectModule } from '../types/app';

interface FireworkSpark extends SparkParticle {
  maxL: number;
  c: string;
}

export const fireworksEffect: VisualEffectModule & {
  _cooldown: number;
  _burst: (px: number, py: number, count: number, W: number, H: number) => void;
} = {
  layer: visualSettings.layers.FOREGROUND,
  _cooldown: 0,

  init(): void {
    this._cooldown = 0;
    particleSystem.clearPool('fireworks');
  },

  _burst(px: number, py: number, count: number, W: number, H: number): void {
    const pool = particleSystem.getPool<FireworkSpark>('fireworks', 240);
    const tier = performanceManager.tier;
    const cap = tier === 'eco' ? 110 : tier === 'medium' ? 160 : 220;
    const room = Math.max(0, cap - pool.active.length);
    if (room < 10) return;

    const starShape = rnd() < 0.42;
    const c = ['255,224,130', '255,255,255', '160,210,255', '255,160,200'][(rnd() * 4) | 0];
    const scaled = Math.min(room, performanceManager.scaleCount(count));
    for (let i = 0; i < scaled; i++) {
      const a = rnd() * TAU;
      const v = (0.28 + rnd() * 0.72) * Math.min(W, H) * 0.42 * (starShape ? 1 + 0.45 * Math.cos(5 * a) : 1) * (rnd() < 0.4 ? 0.6 : 1);
      pool.acquire({ x: px, y: py, px, py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1.25 + rnd() * 0.75, maxL: 1.9, c });
    }
  },

  update(dt: number, env: RenderEnv, params: Record<string, unknown> = {}): void {
    const { W, H, sceneElapsed: st, tm } = env;
    const pool = particleSystem.getPool<FireworkSpark>('fireworks', 240);
    this._cooldown = Math.max(0, this._cooldown - dt);
    const maxTime = params.endAfter != null ? Number(params.endAfter) : (tm[3] ? tm[3] + 20 : 999);
    if (this._cooldown <= 0 && st > Number(params.startDelay ?? 12) && st < maxTime && rnd() < Number(params.burstRate ?? 0.016)) {
      this._cooldown = 0.48;
      const bx = params.sideMode === 'wide'
        ? W * (rnd() < 0.5 ? 0.1 + rnd() * 0.22 : 0.68 + rnd() * 0.22)
        : W * (rnd() < 0.5 ? 0.15 : 0.85);
      this._burst(bx, H * (0.08 + rnd() * 0.26), Number(params.burstSize) || 24, W, H);
    }

    const grav = Math.min(W, H) * Number(params.gravity ?? 0.28);
    for (let i = pool.active.length - 1; i >= 0; i--) {
      if (!physicsSystem.integrateSpark(pool.active[i], dt, grav)) {
        pool.releaseAt(i);
      }
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    const pool = particleSystem.getPool<FireworkSpark>('fireworks', 240);
    if (!pool.active.length) return;
    const { u } = env;
    x.save();
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < pool.active.length; i++) {
      const p = pool.active[i];
      const lr = cl(p.l / p.maxL);
      const col = 'rgb(' + p.c + ')';
      x.globalAlpha = lr * 0.7;
      x.strokeStyle = col;
      x.lineWidth = Math.max(0.5, 2 * u * lr);
      x.beginPath();
      x.moveTo(p.px, p.py);
      x.lineTo(p.x, p.y);
      x.stroke();

      const r = Math.max(0.6, 2.2 * u * lr);
      x.globalAlpha = lr;
      x.fillStyle = col;
      x.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    }
    x.restore();
    x.globalAlpha = 1;
  },

  destroy(): void {
    this._cooldown = 0;
    particleSystem.clearPool('fireworks');
  }
};

export default fireworksEffect;
