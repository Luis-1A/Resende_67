import { effectsSettings } from '../config/effects-settings';
import { atmosphereSystem } from './atmosphere-system';
import { lightingSystem } from './lighting-system';
import { particleSystem } from './particle-system';
import type {
  ActiveEffectEntry,
  RenderEnv,
  ScreenBounds,
  VisualEffectModule,
  VisualSceneConfig,
  VisualSceneModule
} from '../types/app';

type EffectModuleExports = { default?: VisualEffectModule } & Record<string, VisualEffectModule>;
type VisualSceneModuleExports = { default?: VisualSceneModule } & Record<string, VisualSceneModule>;

const effectLoaders = import.meta.glob<EffectModuleExports>('../visual-effects/*.ts');
const visualSceneLoaders = import.meta.glob<VisualSceneModuleExports>('../visual-scenes/*.ts');

const EFFECT_FILE_MAP: Record<string, string> = {
  stars: 'stars.ts',
  shootingStars: 'shooting-stars.ts',
  fireflies: 'fireflies.ts',
  fireworks: 'fireworks.ts',
  petals: 'petals.ts',
  butterflies: 'butterflies.ts',
  glowingParticles: 'glowing-particles.ts',
  lightRays: 'light-rays.ts',
  magicalDust: 'magical-dust.ts',
  floatingLanterns: 'floating-lanterns.ts',
  confetti: 'confetti.ts'
};

export const canvasManager = {
  _effectCache: new Map<string, VisualEffectModule>(),
  _sceneCache: new Map<string, VisualSceneModule>(),
  _activeEffects: [] as ActiveEffectEntry[],
  _activeVisualScene: null as { vs: VisualSceneModule; params: Record<string, unknown> } | null,
  _x: null as CanvasRenderingContext2D | null,
  _bounds: null as ScreenBounds | null,

  init(ctx2d: CanvasRenderingContext2D, bounds: ScreenBounds): void {
    this._x = ctx2d;
    this._bounds = bounds;
    atmosphereSystem.init(bounds);
  },

  onResize(bounds: ScreenBounds): void {
    this._bounds = bounds;
    atmosphereSystem.onResize(bounds);
    atmosphereSystem.configure(this._x, bounds, {});
    for (const entry of this._activeEffects) {
      if (!entry.failed && typeof entry.effect.onResize === 'function') {
        try { entry.effect.onResize(bounds); } catch (_e) {}
      }
    }
  },

  async _loadEffect(name: string): Promise<VisualEffectModule> {
    const cached = this._effectCache.get(name);
    if (cached) return cached;
    const file = EFFECT_FILE_MAP[name];
    if (!file) throw new Error(`Unknown visual effect "${name}"`);
    const key = `../visual-effects/${file}`;
    const loader = effectLoaders[key];
    if (!loader) throw new Error(`Missing visual effect module "${key}"`);
    const ns = await loader();
    const eff = ns.default || Object.values(ns)[0];
    this._effectCache.set(name, eff);
    return eff;
  },

  async _loadVisualScene(file: string): Promise<VisualSceneModule | null> {
    if (!file) return null;
    const tsFile = file.replace(/\.js$/, '.ts');
    const cached = this._sceneCache.get(tsFile);
    if (cached) return cached;
    const key = `../visual-scenes/${tsFile}`;
    const loader = visualSceneLoaders[key];
    if (!loader) throw new Error(`Missing visual scene module "${key}"`);
    const ns = await loader();
    const vs = ns.default || Object.values(ns)[0];
    this._sceneCache.set(tsFile, vs);
    return vs;
  },

  async configureScene({ atmosphere, ambientGlow, effects = [], visualScene = null, visualParams = {} }: VisualSceneConfig): Promise<void> {
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
        const merged: Record<string, unknown> = { ...cfg, ...params };
        if (typeof effect.init === 'function' && this._bounds) effect.init(this._bounds, merged);
        this._activeEffects.push({ name, effect, params: merged, failed: false });
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn(`[CanvasManager] Effect ${name}:`, err instanceof Error ? err.message : String(err));
        }
      }
    }

    if (visualScene) {
      try {
        const vs = await this._loadVisualScene(visualScene);
        if (vs && typeof vs.init === 'function' && this._bounds) vs.init(this._bounds, visualParams);
        if (vs) this._activeVisualScene = { vs, params: visualParams };
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn(`[CanvasManager] VisualScene ${visualScene}:`, err instanceof Error ? err.message : String(err));
        }
      }
    }
  },

  async preloadScene({ effects = [], visualScene = null }: VisualSceneConfig = {}): Promise<void> {
    const tasks: Promise<unknown>[] = [];
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

  getActiveEffects(): ActiveEffectEntry[] {
    return this._activeEffects;
  },

  update(dt: number, env: RenderEnv): void {
    atmosphereSystem.update(dt, env);
    lightingSystem.update(dt);
    if (this._activeVisualScene && typeof this._activeVisualScene.vs.update === 'function') {
      try {
        this._activeVisualScene.vs.update(dt, env, this._activeEffects);
      } catch (_e) {}
    }
    for (const entry of this._activeEffects) {
      if (entry.failed || typeof entry.effect.update !== 'function') continue;
      try {
        entry.effect.update(dt, env, entry.params);
      } catch (_err) {
        entry.failed = true;
      }
    }
  },

  clearScene(): void {
    for (const entry of this._activeEffects) {
      if (typeof entry.effect.destroy === 'function') {
        try { entry.effect.destroy(); } catch (_e) {}
      }
    }
    this._activeEffects = [];
    this._activeVisualScene = null;
    particleSystem.clearAll();
  }
};
