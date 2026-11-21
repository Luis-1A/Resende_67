import { lightingSystem } from '../visual-engine/lighting-system.js';

export const openingVisual = {
  _pulsed: false,

  init() {
    this._pulsed = false;
  },

  update(dt, env) {
    if (!this._pulsed && env.tm[2] && env.sceneElapsed >= env.tm[2]) {
      this._pulsed = true;
      lightingSystem.triggerPulse(0.45);
    }
  }
};

export default openingVisual;
