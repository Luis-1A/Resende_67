import { lightingSystem } from '../visual-engine/lighting-system';
import type { RenderEnv, VisualSceneModule } from '../types/app';

export const birthdayVisual: VisualSceneModule & { _waveTriggered: boolean } = {
  _waveTriggered: false,

  init(): void {
    this._waveTriggered = false;
  },

  update(_dt: number, env: RenderEnv): void {
    if (!this._waveTriggered && env.sceneElapsed >= 7.0) {
      this._waveTriggered = true;
      lightingSystem.triggerPulse(0.5);
    }
  }
};

export default birthdayVisual;
