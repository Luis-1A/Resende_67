import { lightingSystem } from '../visual-engine/lighting-system.js';

export const birthdayVisual = {
  _waveTriggered: false,

  init() {
    this._waveTriggered = false;
  },

  update(dt, env) {
    if (!this._waveTriggered && env.sceneElapsed >= 7.0) {
      this._waveTriggered = true;
      lightingSystem.triggerPulse(0.5);
    }
  }
};

export default birthdayVisual;
