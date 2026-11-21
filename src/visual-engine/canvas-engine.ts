import { settings } from '../config/settings';
import { screenManager } from '../screen-manager';
import { performanceManager } from './performance-manager';
import { canvasManager } from './canvas-manager';
import { sceneRenderer } from './scene-renderer';
import { transitionSystem } from './transition-system';
import type { animationManager as AnimationManagerType } from '../animation-manager';
import type { RenderEnv } from '../types/app';

export const canvasEngine = {
  _canvas: null as HTMLCanvasElement | null,
  _x: null as CanvasRenderingContext2D | null,
  _rafId: 0,
  _running: false,
  _paused: false,
  _lastTs: 0,
  _time: 0,
  _onTick: null as ((dt: number, time: number) => RenderEnv) | null,
  _animationManager: null as typeof AnimationManagerType | null,

  init({
    canvas,
    animationManager,
    onTick
  }: {
    canvas: HTMLCanvasElement;
    animationManager: typeof AnimationManagerType;
    onTick: (dt: number, time: number) => RenderEnv;
  }): void {
    this._canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    this._x = ctx;
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

  start(): void {
    if (this._running) return;
    this._running = true;
    this._paused = false;
    this._lastTs = 0;
    const loop = (ts: number) => {
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
      if (env && this._x) {
        canvasManager.update(dt, env);
        if (this._animationManager) this._animationManager.update(dt, env);
        sceneRenderer.render(this._x, env, canvasManager.getActiveEffects(), this._animationManager);
      }
    };
    this._rafId = requestAnimationFrame(loop);
  },

  pause(): void {
    this._paused = true;
  },

  resume(): void {
    this._paused = false;
    this._lastTs = 0;
  },

  getTime(): number {
    return this._time;
  },

  destroy(): void {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    canvasManager.clearScene();
    transitionSystem.clear();
  }
};
