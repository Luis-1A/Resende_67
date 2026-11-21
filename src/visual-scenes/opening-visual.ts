import { lightingSystem } from '../visual-engine/lighting-system';
import type { RenderEnv, VisualSceneModule } from '../types/app';

export const openingVisual: VisualSceneModule & { _pulsed: boolean } = {
  _pulsed: false,

  init(): void {
    this._pulsed = false;
  },

  update(_dt: number, env: RenderEnv): void {
    if (!this._pulsed && env.tm[2] && env.sceneElapsed >= env.tm[2]) {
      this._pulsed = true;
      lightingSystem.triggerPulse(0.45);
    }
  }
};

export default openingVisual;
