import { lightingSystem } from '../visual-engine/lighting-system.js';

export const finaleVisual = {
  _celebrationPulse: false,

  init() {
    this._celebrationPulse = false;
  },

  update(dt, env) {
    if (!this._celebrationPulse && env.tm[3] && env.sceneElapsed >= env.tm[3]) {
      this._celebrationPulse = true;
      lightingSystem.triggerPulse(0.55);
    }
  }
};

export default finaleVisual;
