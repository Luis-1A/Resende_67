import { timeSceneManager } from './time-scene-manager';
import type { AnimationInitContext, RenderEnv } from '../../types/app';

export const timeJourneyAnimation = {
  name: 'timeJourney',
  layer: 4,
  worldSpace: false,
  _ctx: null as AnimationInitContext | null,
  _active: false,

  init(ctx: AnimationInitContext | null): void {
    this._ctx = ctx;
    this._active = false;
  },

  play(): void {
    this._active = true;
    const reducedMotion = Boolean(this._ctx && this._ctx.settings && this._ctx.settings.reducedMotion);
    timeSceneManager.init(this._ctx ? this._ctx.tx : null, { reducedMotion });
  },

  pause(): void {
    timeSceneManager.pause();
  },

  resume(): void {
    timeSceneManager.resume();
  },

  stop(): void {
    this._active = false;
  },

  destroy(): void {
    this._active = false;
    timeSceneManager.destroy(this._ctx ? this._ctx.tx : null);
  },

  isComplete(): boolean {
    return timeSceneManager.finished;
  },

  update(dt: number, env: RenderEnv): void {
    if (!this._active) return;
    timeSceneManager.update(dt, env);
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv): void {
    if (!this._active) return;
    timeSceneManager.render(x, env);
  }
};

export default timeJourneyAnimation;
