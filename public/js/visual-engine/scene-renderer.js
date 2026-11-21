import { cl } from '../utils.js';
import { atmosphereSystem } from './atmosphere-system.js';
import { lightingSystem } from './lighting-system.js';
import { transitionSystem } from './transition-system.js';
import { visualSettings } from '../config/visual-settings.js';

export const sceneRenderer = {
  _worldAnims: [],
  _screenAnims: [],

  render(x, env, visualEffects, animationManager) {
    const { DISTANCE, ATMOSPHERE, MIDGROUND, FOREGROUND } = visualSettings.layers;

    // Layer 1: Background (Sky gradients + ambient glow)
    atmosphereSystem.renderSkyAndClouds(x, env);
    lightingSystem.renderAmbient(x, env);

    // Layer 2: Distance (Stars, shooting stars, backdrop animations)
    this._renderEffectBucket(x, env, visualEffects, DISTANCE);
    if (animationManager) {
      // Backdrop animation layer (e.g. idle or non-terrain backdrop)
      for (const [, entry] of animationManager._active.entries()) {
        if (!entry.failed && typeof entry.mod.renderBackdrop === 'function') {
          try { entry.mod.renderBackdrop(x, env); } catch (e) {}
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

    // World space with gentle cinematic depth zoom in early narrative scenes
    x.save();
    if (!env.RM && env.sc >= 0 && env.sc < 4) {
      const z = 1 + 0.05 * cl(env.sceneElapsed / 26);
      x.translate(env.cx, env.H * 0.9);
      x.scale(z, z);
      x.translate(-env.cx, -env.H * 0.9);
    }

    // Layer 3: Atmosphere (Light rays, fireflies, distant glow particles, terrain behind midground)
    this._renderEffectBucket(x, env, visualEffects, ATMOSPHERE);
    atmosphereSystem.renderTerrain(x, env);

    // Layer 4: Midground (Lanterns, flowers, balloons, butterflies, narrative scene objects)
    this._renderEffectBucket(x, env, visualEffects, MIDGROUND);
    for (let i = 0; i < worldAnims.length; i++) {
      try { worldAnims[i].mod.render(x, env); } catch (e) {}
    }
    x.restore();

    // Screen-space midground/foreground animations + Layer 5 Foreground effects (petals, dust, confetti, fireworks)
    for (let i = 0; i < screenAnims.length; i++) {
      try { screenAnims[i].mod.render(x, env); } catch (e) {}
    }
    this._renderEffectBucket(x, env, visualEffects, FOREGROUND);

    // Charcoal film vignette & cinematic transitions
    lightingSystem.renderVignette(x, env, env.sc < 0 ? 0.65 : 0.72);
    transitionSystem.render(x, env);
  },

  _renderEffectBucket(x, env, effects, targetLayer) {
    for (const entry of effects) {
      if (!entry.failed && (entry.effect.layer ?? 4) === targetLayer && typeof entry.effect.render === 'function') {
        try {
          entry.effect.render(x, env, entry.params);
        } catch (err) {
          entry.failed = true;
        }
      }
    }
  }
};
