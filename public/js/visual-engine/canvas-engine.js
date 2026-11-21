import { settings } from '../config/settings.js';
import { screenManager } from '../screen-manager.js';
import { performanceManager } from './performance-manager.js';
import { canvasManager } from './canvas-manager.js';
import { sceneRenderer } from './scene-renderer.js';
import { transitionSystem } from './transition-system.js';

export const canvasEngine = {
  _canvas: null,
  _x: null,
  _rafId: 0,
  _running: false,
  _paused: false,
  _lastTs: 0,
  _time: 0,
  _onTick: null,
  _animationManager: null,

  init({ canvas, animationManager, onTick }) {
    this._canvas = canvas;
    this._x = canvas.getContext('2d');
    this._animationManager = animationManager;
    this._onTick = onTick;

    performanceManager.detectInitialTier();
    screenManager.init(canvas);
    canvasManager.init(this._x, screenManager.getBounds());
    screenManager.onResize(bounds => canvasManager.onResize(bounds));

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.pause();
      } else {
        this.resume();
      }
    });
  },

  start() {
    if (this._running) return;
    this._running = true;
    this._paused = false;
    this._lastTs = 0;
    const loop = ts => {
      if (!this._running) return;
      this._rafId = requestAnimationFrame(loop);
      if (this._paused) {
        this._lastTs = ts;
        return;
      }
      const rawDt = this._lastTs ? (ts - this._lastTs) / 1000 : 0.016;
      this._lastTs = ts;
      const dt = Math.min(settings.maxDeltaSeconds, Math.max(0.001, rawDt));
      performanceManager.recordFrame(rawDt);
      this._time += dt;

      transitionSystem.update(dt);
      const env = this._onTick ? this._onTick(dt, this._time) : null;
      if (env) {
        canvasManager.update(dt, env);
        if (this._animationManager) this._animationManager.update(dt, env);
        sceneRenderer.render(this._x, env, canvasManager.getActiveEffects(), this._animationManager);
      }
    };
    this._rafId = requestAnimationFrame(loop);
  },

  pause() {
    this._paused = true;
  },

  resume() {
    this._paused = false;
    this._lastTs = 0;
  },

  getTime() {
    return this._time;
  },

  destroy() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    canvasManager.clearScene();
    transitionSystem.clear();
  }
};
