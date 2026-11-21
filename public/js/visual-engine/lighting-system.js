import { cl, glow, G, GB, VG } from '../utils.js';
import { performanceManager } from './performance-manager.js';

export const lightingSystem = {
  _ambientGlow: null,
  _pulse: 0,

  configure(ambient = null) {
    this._ambientGlow = ambient;
    this._pulse = 0;
  },

  triggerPulse(strength = 0.35) {
    this._pulse = Math.max(this._pulse, strength);
  },

  update(dt) {
    if (this._pulse > 0) this._pulse = Math.max(0, this._pulse - dt * 0.45);
  },

  renderAmbient(x, env) {
    const profile = performanceManager.getProfile();
    if (!profile.enableBloom && !this._ambientGlow) return;
    if (this._ambientGlow) {
      const { rx, ry, radius, alpha, cool } = this._ambientGlow;
      x.globalCompositeOperation = 'lighter';
      glow(x, env.W * rx, env.H * ry, Math.min(env.W, env.H) * radius, alpha, cool ? GB : G);
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 1;
    }
    if (this._pulse > 0.01) {
      x.globalCompositeOperation = 'lighter';
      glow(x, env.cx, env.H * 0.45, Math.max(env.W, env.H) * 0.65, this._pulse * 0.45, G);
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 1;
    }
  },

  renderVignette(x, env, alpha = 0.72) {
    x.globalAlpha = cl(alpha);
    x.drawImage(VG, 0, 0, env.W, env.H);
    x.globalAlpha = 1;
    if (env.fin) {
      x.fillStyle = 'rgba(8,16,40,.14)';
      x.fillRect(0, 0, env.W, env.H);
    }
  }
};
