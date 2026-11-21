import { rnd } from '../utils.js';
import { COLF } from '../config/scenes.config.js';
import { visualSettings } from '../config/visual-settings.js';
import { particleSystem } from '../visual-engine/particle-system.js';
import { performanceManager } from '../visual-engine/performance-manager.js';

export const confettiEffect = {
  layer: visualSettings.layers.FOREGROUND,
  _spawned: false,

  init() {
    this._spawned = false;
    particleSystem.clearPool('confetti');
  },

  update(dt, env, params = {}) {
    const { W, H, u, R, sceneElapsed: st } = env;
    const pool = particleSystem.getPool('confetti', 160);
    if (st > (params.startAt ?? 10) && !this._spawned) {
      this._spawned = true;
      const count = Math.min(performanceManager.getProfile().confettiCount, params.count || 95);
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
          c: COLF[rnd() * 4 | 0]
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

  render(x, env, params = {}) {
    const pool = particleSystem.getPool('confetti', 160);
    x.globalCompositeOperation = 'source-over';
    for (const p of pool.active) {
      x.save();
      x.globalAlpha = 0.88;
      x.translate(p.x, p.y);
      x.rotate(p.r);
      if (params.spin3D !== false) x.scale(1, Math.cos(p.r * 1.7));
      x.fillStyle = p.c;
      x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      x.restore();
    }
    x.globalAlpha = 1;
  },

  destroy() {
    this._spawned = false;
    particleSystem.clearPool('confetti');
  }
};

export default confettiEffect;
