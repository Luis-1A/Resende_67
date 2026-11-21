import { rnd, glow } from '../utils.js';
import { visualSettings } from '../config/visual-settings.js';
import { performanceManager } from '../visual-engine/performance-manager.js';

export const firefliesEffect = {
  layer: visualSettings.layers.ATMOSPHERE,
  _bugs: [],

  init(bounds, params = {}) {
    const count = Math.min(performanceManager.getProfile().fireflyCount, params.count || 24);
    this._bugs = [];
    for (let i = 0; i < count; i++) {
      this._bugs.push({
        x: rnd(),
        y: 0.48 + rnd() * 0.42,
        vx: (rnd() - 0.5) * 0.02,
        vy: (rnd() - 0.5) * 0.015,
        p: rnd() * 6.28,
        r: 2.2 + (i % 3) * 1.1,
        spd: 0.9 + rnd() * 1.3
      });
    }
  },

  update(dt, env, params = {}) {
    if (env.RM) return;
    const speed = params.speed ?? 1;
    for (const b of this._bugs) {
      b.x += (b.vx + Math.sin(env.R * 0.7 + b.p) * 0.008) * dt * speed;
      b.y += (b.vy + Math.cos(env.R * 0.9 + b.p) * 0.007) * dt * speed;
      if (b.x < 0.02) b.x = 0.98;
      if (b.x > 0.98) b.x = 0.02;
      if (b.y < 0.45) b.vy = Math.abs(b.vy);
      if (b.y > 0.92) b.vy = -Math.abs(b.vy);
    }
  },

  render(x, env, params = {}) {
    const { W, H, u, R, RM } = env;
    const intensity = params.glowIntensity ?? 0.85;
    x.globalCompositeOperation = 'lighter';
    for (const b of this._bugs) {
      const pulse = RM ? 0.5 : (0.18 + 0.82 * Math.max(0, Math.sin(R * b.spd + b.p)));
      const px = b.x * W, py = b.y * H;
      glow(x, px, py, b.r * 3.8 * u, pulse * 0.65 * intensity);
      x.globalAlpha = pulse * intensity;
      x.fillStyle = '#FFF6C8';
      x.beginPath(); x.arc(px, py, b.r * 0.48 * u, 0, Math.PI * 2); x.fill();
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  },

  destroy() {
    this._bugs = [];
  }
};

export default firefliesEffect;
