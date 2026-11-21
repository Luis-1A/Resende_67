import { timeSceneManager } from './time-scene-manager.js';

export const timeJourneyAnimation = {
  name: 'timeJourney',
  layer: 4,
  worldSpace: false,
  _ctx: null,
  _active: false,

  init(ctx) {
    this._ctx = ctx;
    this._active = false;
  },

  play() {
    this._active = true;
    const reducedMotion = Boolean(this._ctx && this._ctx.settings && this._ctx.settings.reducedMotion);
    timeSceneManager.init(this._ctx ? this._ctx.tx : null, { reducedMotion });
  },

  pause() {
    timeSceneManager.pause();
  },

  resume() {
    timeSceneManager.resume();
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
    timeSceneManager.destroy(this._ctx ? this._ctx.tx : null);
  },

  isComplete() {
    return timeSceneManager.finished;
  },

  update(dt, env) {
    if (!this._active) return;
    timeSceneManager.update(dt, env);
  },

  render(x, env) {
    if (!this._active) return;
    timeSceneManager.render(x, env);
  }
};

export default timeJourneyAnimation;
