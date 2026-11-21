import { lightingSystem } from '../visual-engine/lighting-system';
import type { RenderEnv, VisualSceneModule } from '../types/app';

export const letterVisual: VisualSceneModule & { _pulsed: boolean } = {
  _pulsed: false,

  init(): void {
    this._pulsed = false;
  },

  update(_dt: number, env: RenderEnv): void {
    if (!this._pulsed && env.sceneElapsed >= 2.2) {
      this._pulsed = true;
      lightingSystem.triggerPulse(0.32);
    }
  }
};

export default letterVisual;
