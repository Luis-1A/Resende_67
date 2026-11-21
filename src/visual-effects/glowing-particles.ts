import { rnd, glow, G } from '../utils';
import { visualSettings } from '../config/visual-settings';
import { performanceManager } from '../visual-engine/performance-manager';
import type { RenderEnv, ScreenBounds, VisualEffectModule } from '../types/app';

interface OrbItem {
  x: number;
  y: number;
  r: number;
  p: number;
}

export const glowingParticlesEffect: VisualEffectModule & { _orbs: OrbItem[] } = {
  layer: visualSettings.layers.ATMOSPHERE,
  _orbs: [],

  init(_bounds: ScreenBounds, params: Record<string, unknown> = {}): void {
    const count = performanceManager.scaleCount(Number(params.count) || 28);
    this._orbs = [];
    for (let i = 0; i < count; i++) {
      this._orbs.push({
        x: rnd(),
        y: rnd(),
        r: 1.8 + rnd() * 2.8,
        p: rnd() * 6.28
      });
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv, params: Record<string, unknown> = {}): void {
    const { W, H, u, R } = env;
    const intensity = Number(params.intensity ?? 0.85);
    x.globalCompositeOperation = 'lighter';
    for (const m of this._orbs) {
      const alpha = (0.22 + 0.25 * Math.sin(R * 1.5 + m.p)) * intensity;
      const r = m.r * u;
      glow(x, m.x * W + Math.sin(R * 0.4 + m.p) * 8, ((m.y * H - R * 8) % H + H) % H, r * 2, alpha, G);
    }
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
  },

  destroy(): void {
    this._orbs = [];
  }
};

export default glowingParticlesEffect;
