import { animationsConfig } from './config/animations.config.js';
import { settings } from './config/settings.js';
import { cl } from './utils.js';

export const animationManager = {
  _ctx: null,
  _modules: new Map(),
  _active: new Map(),
  _loadedCss: new Set(),
  _debug: {
    loaded: [],
    started: [],
    stopped: [],
    destroyed: [],
    errors: []
  },

  init(context) {
    this._ctx = context;
    if (settings.debug && typeof window !== 'undefined') {
      window.__ANDERSON_DEBUG__ = () => this.getDebugSnapshot();
    }
  },

  _record(bucket, name, detail = '') {
    const entry = detail ? `${name}: ${detail}` : name;
    this._debug[bucket].push(entry);
    if (this._debug[bucket].length > 80) this._debug[bucket].shift();
    if (bucket === 'errors' && typeof console !== 'undefined') {
      console.warn(`[AnimationManager] ${entry}`);
    }
  },

  _ensureCss(href) {
    if (!href || this._loadedCss.has(href) || typeof document === 'undefined' || !document.head) return;
    this._loadedCss.add(href);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  },

  async _loadModule(name) {
    if (this._modules.has(name)) return this._modules.get(name);
    const cfg = animationsConfig[name];
    if (!cfg || !cfg.file) throw new Error(`Missing config for animation "${name}"`);
    this._ensureCss(cfg.css);
    const ns = await import(`./animations/${cfg.file}`);
    const mod = ns.default || Object.values(ns).find(v => v && typeof v.init === 'function');
    if (!mod) throw new Error(`Animation "${name}" has no valid module export`);
    this._modules.set(name, mod);
    this._record('loaded', name);
    return mod;
  },

  async preload(names = []) {
    for (const name of names) {
      const cfg = animationsConfig[name];
      if (!cfg || cfg.enabled === false) continue;
      try {
        await this._loadModule(name);
      } catch (err) {
        this._record('errors', name, err.message);
      }
    }
  },

  async activateScene(requests = []) {
    this.stopTemporary();
    const tasks = requests.map(async req => {
      const name = typeof req === 'string' ? req : req.name;
      const params = (typeof req === 'object' && req.params) ? req.params : {};
      const cfg = animationsConfig[name];
      if (!cfg || cfg.enabled === false) return;

      try {
        const mod = await this._loadModule(name);
        const existing = this._active.get(name);
        const mergedParams = { ...cfg, ...params };

        if (existing && cfg.permanent) {
          if (typeof mod.play === 'function') mod.play(mergedParams);
          existing.params = mergedParams;
          existing.failed = false;
          this._record('started', name);
          return;
        }

        if (typeof mod.init === 'function') mod.init(this._ctx, mergedParams);
        if (typeof mod.play === 'function') mod.play(mergedParams);
        this._active.set(name, { mod, cfg, params: mergedParams, failed: false });
        this._record('started', name);
      } catch (err) {
        this._record('errors', name, err.message || String(err));
      }
    });
    await Promise.all(tasks);
  },

  notify(name, action, ...args) {
    const entry = this._active.get(name);
    if (!entry || entry.failed) return false;
    try {
      if (typeof entry.mod[action] === 'function') {
        return entry.mod[action](...args);
      }
    } catch (err) {
      entry.failed = true;
      this._record('errors', name, err.message || String(err));
    }
    return false;
  },

  stopTemporary() {
    for (const [name, entry] of [...this._active.entries()]) {
      if (entry.cfg.permanent) continue;
      try {
        if (typeof entry.mod.stop === 'function') entry.mod.stop();
        this._record('stopped', name);
        if (typeof entry.mod.destroy === 'function') entry.mod.destroy();
        this._record('destroyed', name);
      } catch (err) {
        this._record('errors', name, err.message || String(err));
      }
      this._active.delete(name);
    }
  },

  stopAll() {
    for (const [name, entry] of [...this._active.entries()]) {
      try {
        if (typeof entry.mod.stop === 'function') entry.mod.stop();
        this._record('stopped', name);
        if (typeof entry.mod.destroy === 'function') entry.mod.destroy();
        this._record('destroyed', name);
      } catch (err) {
        this._record('errors', name, err.message || String(err));
      }
      this._active.delete(name);
    }
  },

  update(dt, env) {
    for (const [name, entry] of this._active.entries()) {
      if (entry.failed || typeof entry.mod.update !== 'function') continue;
      try {
        entry.mod.update(dt, env);
      } catch (err) {
        entry.failed = true;
        this._record('errors', name, err.message || String(err));
      }
    }
  },

  render(x, env) {
    const entries = [...this._active.entries()].filter(([, e]) => !e.failed);

    for (const [name, entry] of entries) {
      if (typeof entry.mod.renderBackdrop !== 'function') continue;
      try {
        entry.mod.renderBackdrop(x, env);
      } catch (err) {
        entry.failed = true;
        this._record('errors', name, err.message || String(err));
      }
    }

    const sorted = entries
      .filter(([, e]) => !e.failed && typeof e.mod.render === 'function')
      .sort((a, b) => (a[1].mod.layer ?? 5) - (b[1].mod.layer ?? 5));

    const world = sorted.filter(([, e]) => e.mod.worldSpace !== false);
    const screen = sorted.filter(([, e]) => e.mod.worldSpace === false);

    x.save();
    if (!settings.reducedMotion && env.sc >= 0 && env.sc < 4) {
      const z = 1 + .05 * cl(env.sceneElapsed / 26);
      x.translate(env.cx, env.H * .9);
      x.scale(z, z);
      x.translate(-env.cx, -env.H * .9);
    }
    for (const [name, entry] of world) {
      try {
        entry.mod.render(x, env);
      } catch (err) {
        entry.failed = true;
        this._record('errors', name, err.message || String(err));
      }
    }
    x.restore();

    for (const [name, entry] of screen) {
      try {
        entry.mod.render(x, env);
      } catch (err) {
        entry.failed = true;
        this._record('errors', name, err.message || String(err));
      }
    }

    for (const [name, entry] of entries) {
      if (entry.failed || typeof entry.mod.renderOverlay !== 'function') continue;
      try {
        entry.mod.renderOverlay(x, env);
      } catch (err) {
        entry.failed = true;
        this._record('errors', name, err.message || String(err));
      }
    }
  },

  getDebugSnapshot() {
    return {
      active: [...this._active.keys()],
      loaded: [...this._debug.loaded],
      started: [...this._debug.started],
      stopped: [...this._debug.stopped],
      destroyed: [...this._debug.destroyed],
      errors: [...this._debug.errors]
    };
  }
};
