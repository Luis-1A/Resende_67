import { cl } from '../utils';
import { atmosphereSystem } from './atmosphere-system';
import { lightingSystem } from './lighting-system';
import { transitionSystem } from './transition-system';
import { visualSettings } from '../config/visual-settings';
import type { ActiveEffectEntry, AnimationModule, RenderEnv } from '../types/app';

interface AnimRenderEntry {
  mod: AnimationModule;
  failed: boolean;
}

interface AnimationManagerLike {
  _active: Map<string, AnimRenderEntry>;
}

export const sceneRenderer = {
  _worldAnims: [] as AnimRenderEntry[],
  _screenAnims: [] as AnimRenderEntry[],

  render(
    x: CanvasRenderingContext2D,
    env: RenderEnv,
    visualEffects: ActiveEffectEntry[],
    animationManager: AnimationManagerLike | null
  ): void {
    const { DISTANCE, ATMOSPHERE, MIDGROUND, FOREGROUND } = visualSettings.layers;

    atmosphereSystem.renderSkyAndClouds(x, env);
    lightingSystem.renderAmbient(x, env);

    this._renderEffectBucket(x, env, visualEffects, DISTANCE);
    if (animationManager) {
      for (const [, entry] of animationManager._active.entries()) {
        if (!entry.failed && typeof entry.mod.renderBackdrop === 'function') {
          try { entry.mod.renderBackdrop(x, env); } catch (_e) {}
        }
      }
    }

    const worldAnims = this._worldAnims;
    const screenAnims = this._screenAnims;
    worldAnims.length = 0;
    screenAnims.length = 0;
    if (animationManager) {
      for (const [, entry] of animationManager._active.entries()) {
        if (entry.failed || typeof entry.mod.render !== 'function') continue;
        if (entry.mod.worldSpace === false) screenAnims.push(entry);
        else worldAnims.push(entry);
      }
      if (worldAnims.length > 1) worldAnims.sort((a, b) => (a.mod.layer ?? 5) - (b.mod.layer ?? 5));
      if (screenAnims.length > 1) screenAnims.sort((a, b) => (a.mod.layer ?? 5) - (b.mod.layer ?? 5));
    }

    x.save();
    if (!env.RM && env.sc >= 0 && env.sc < 4) {
      const z = 1 + 0.05 * cl(env.sceneElapsed / 26);
      x.translate(env.cx, env.H * 0.9);
      x.scale(z, z);
      x.translate(-env.cx, -env.H * 0.9);
    }

    this._renderEffectBucket(x, env, visualEffects, ATMOSPHERE);
    atmosphereSystem.renderTerrain(x, env);

    this._renderEffectBucket(x, env, visualEffects, MIDGROUND);
    for (let i = 0; i < worldAnims.length; i++) {
      try { worldAnims[i].mod.render?.(x, env); } catch (_e) {}
    }
    x.restore();

    for (let i = 0; i < screenAnims.length; i++) {
      try { screenAnims[i].mod.render?.(x, env); } catch (_e) {}
    }
    this._renderEffectBucket(x, env, visualEffects, FOREGROUND);

    lightingSystem.renderVignette(x, env, env.sc < 0 ? 0.65 : 0.72);
    transitionSystem.render(x, env);
  },

  _renderEffectBucket(
    x: CanvasRenderingContext2D,
    env: RenderEnv,
    effects: ActiveEffectEntry[],
    targetLayer: number
  ): void {
    for (const entry of effects) {
      if (!entry.failed && (entry.effect.layer ?? 4) === targetLayer && typeof entry.effect.render === 'function') {
        try {
          entry.effect.render(x, env, entry.params);
        } catch (_err) {
          entry.failed = true;
        }
      }
    }
  }
};
