import { cl, rnd, TAU } from '../utils.js';
import { visualSettings } from '../config/visual-settings.js';
import { particleSystem } from '../visual-engine/particle-system.js';
import { physicsSystem } from '../visual-engine/physics-system.js';
import { performanceManager } from '../visual-engine/performance-manager.js';

export const fireworksEffect = {
  layer: visualSettings.layers.FOREGROUND,

  init() {
    particleSystem.clearPool('fireworks');
  },

  _burst(px, py, count, W, H) {
    const pool = particleSystem.getPool('fireworks');
    const starShape = rnd() < 0.42;
    const c = ['255,224,130', '255,255,255', '160,210,255', '255,160,200'][rnd() * 4 | 0];
    const scaled = performanceManager.scaleCount(count);
    for (let i = 0; i < scaled; i++) {
      const a = rnd() * TAU;
      const v = (0.28 + rnd() * 0.72) * Math.min(W, H) * 0.42 * (starShape ? 1 + 0.45 * Math.cos(5 * a) : 1) * (rnd() < 0.4 ? 0.6 : 1);
      pool.acquire({ x: px, y: py, px, py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1.25 + rnd() * 0.75, maxL: 1.9, c });
    }
  },

  update(dt, env, params = {}) {
    const { W, H, sceneElapsed: st, tm } = env;
    const pool = particleSystem.getPool('fireworks');
    const maxTime = params.endAfter != null ? params.endAfter : (tm[3] ? tm[3] + 20 : 999);
    if (st > (params.startDelay ?? 12) && st < maxTime && rnd() < (params.burstRate ?? 0.016)) {
      const bx = params.sideMode === 'wide'
        ? W * (rnd() < 0.5 ? 0.1 + rnd() * 0.22 : 0.68 + rnd() * 0.22)
        : W * (rnd() < 0.5 ? 0.15 : 0.85);
      this._burst(bx, H * (0.08 + rnd() * 0.26), params.burstSize || 24, W, H);
    }

    const grav = Math.min(W, H) * (params.gravity ?? 0.28);
    for (let i = pool.active.length - 1; i >= 0; i--) {
      if (!physicsSystem.integrateSpark(pool.active[i], dt, grav)) {
        pool.releaseAt(i);
      }
    }
  },

  render(x, env) {
    const { u } = env;
    const pool = particleSystem.getPool('fireworks');
    x.globalCompositeOperation = 'lighter';
    for (const p of pool.active) {
      const lr = cl(p.l / p.maxL);
      x.globalAlpha = lr * 0.7;
      x.strokeStyle = 'rgb(' + p.c + ')';
      x.lineWidth = Math.max(0.5, 2 * u * lr);
      x.beginPath(); x.moveTo(p.px, p.py); x.lineTo(p.x, p.y); x.stroke();
      x.globalAlpha = lr;
      x.fillStyle = 'rgb(' + p.c + ')';
      x.beginPath(); x.arc(p.x, p.y, Math.max(0.4, 2.4 * u * lr), 0, TAU); x.fill();
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  },

  destroy() {
    particleSystem.clearPool('fireworks');
  }
};

export default fireworksEffect;
