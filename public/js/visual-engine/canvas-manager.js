import { effectsSettings } from '../config/effects-settings.js';
import { atmosphereSystem } from './atmosphere-system.js';
import { lightingSystem } from './lighting-system.js';
import { particleSystem } from './particle-system.js';

export const canvasManager = {
  _effectCache: new Map(),
  _sceneCache: new Map(),
  _activeEffects: [],
  _activeVisualScene: null,
  _x: null,
  _bounds: null,

  init(ctx2d, bounds) {
    this._x = ctx2d;
    this._bounds = bounds;
    atmosphereSystem.init(bounds);
  },

  onResize(bounds) {
    this._bounds = bounds;
    atmosphereSystem.onResize(bounds);
    atmosphereSystem.configure(this._x, bounds, {});
    for (const entry of this._activeEffects) {
      if (!entry.failed && typeof entry.effect.onResize === 'function') {
        try { entry.effect.onResize(bounds); } catch (e) {}
      }
    }
  },

  async _loadEffect(name) {
    if (this._effectCache.has(name)) return this._effectCache.get(name);
    const fileMap = {
      stars: 'stars.js',
      shootingStars: 'shooting-stars.js',
      fireflies: 'fireflies.js',
      fireworks: 'fireworks.js',
      petals: 'petals.js',
      butterflies: 'butterflies.js',
      glowingParticles: 'glowing-particles.js',
      lightRays: 'light-rays.js',
      magicalDust: 'magical-dust.js',
      floatingLanterns: 'floating-lanterns.js',
      confetti: 'confetti.js'
    };
    const file = fileMap[name];
    if (!file) throw new Error(`Unknown visual effect "${name}"`);
    const ns = await import(`../visual-effects/${file}`);
    const eff = ns.default || Object.values(ns)[0];
    this._effectCache.set(name, eff);
    return eff;
  },

  async _loadVisualScene(file) {
    if (!file) return null;
    if (this._sceneCache.has(file)) return this._sceneCache.get(file);
    const ns = await import(`../visual-scenes/${file}`);
    const vs = ns.default || Object.values(ns)[0];
    this._sceneCache.set(file, vs);
    return vs;
  },

  async configureScene({ atmosphere, ambientGlow, effects = [], visualScene = null, visualParams = {} }) {
    this.clearScene();
    if (atmosphere) {
      atmosphereSystem.configure(this._x, this._bounds, atmosphere);
    }
    lightingSystem.configure(ambientGlow || null);

    for (const item of effects) {
      const name = typeof item === 'string' ? item : item.name;
      const params = (typeof item === 'object' && item.params) ? item.params : {};
      const cfg = effectsSettings[name];
      if (!cfg || cfg.enabled === false) continue;
      try {
        const effect = await this._loadEffect(name);
        const merged = { ...cfg, ...params };
        if (typeof effect.init === 'function') effect.init(this._bounds, merged);
        this._activeEffects.push({ name, effect, params: merged, failed: false });
      } catch (err) {
        if (typeof console !== 'undefined') console.warn(`[CanvasManager] Effect ${name}:`, err.message);
      }
    }

    if (visualScene) {
      try {
        const vs = await this._loadVisualScene(visualScene);
        if (vs && typeof vs.init === 'function') vs.init(this._bounds, visualParams);
        this._activeVisualScene = { vs, params: visualParams };
      } catch (err) {
        if (typeof console !== 'undefined') console.warn(`[CanvasManager] VisualScene ${visualScene}:`, err.message);
      }
    }
  },

  async preloadScene({ effects = [], visualScene = null } = {}) {
    const tasks = [];
    for (const item of effects) {
      const name = typeof item === 'string' ? item : item.name;
      const cfg = effectsSettings[name];
      if (!cfg || cfg.enabled === false) continue;
      tasks.push(this._loadEffect(name).catch(() => {}));
    }
    if (visualScene) {
      tasks.push(this._loadVisualScene(visualScene).catch(() => {}));
    }
    await Promise.all(tasks);
  },

  getActiveEffects() {
    return this._activeEffects;
  },

  update(dt, env) {
    atmosphereSystem.update(dt, env);
    lightingSystem.update(dt);
    if (this._activeVisualScene && typeof this._activeVisualScene.vs.update === 'function') {
      try {
        this._activeVisualScene.vs.update(dt, env, this._activeEffects);
      } catch (e) {}
    }
    for (const entry of this._activeEffects) {
      if (entry.failed || typeof entry.effect.update !== 'function') continue;
      try {
        entry.effect.update(dt, env, entry.params);
      } catch (err) {
        entry.failed = true;
      }
    }
  },

  clearScene() {
    for (const entry of this._activeEffects) {
      if (typeof entry.effect.destroy === 'function') {
        try { entry.effect.destroy(); } catch (e) {}
      }
    }
    this._activeEffects = [];
    this._activeVisualScene = null;
    particleSystem.clearAll();
  }
};
