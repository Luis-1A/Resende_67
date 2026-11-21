import { lightingSystem } from '../visual-engine/lighting-system.js';

export const letterVisual = {
  _pulsed: false,

  init() {
    this._pulsed = false;
  },

  update(dt, env) {
    if (!this._pulsed && env.sceneElapsed >= 2.2) {
      this._pulsed = true;
      lightingSystem.triggerPulse(0.32);
    }
  }
};

export default letterVisual;
