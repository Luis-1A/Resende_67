import { lightingSystem } from '../visual-engine/lighting-system';
import type { RenderEnv, VisualSceneModule } from '../types/app';

export const finaleVisual: VisualSceneModule & { _celebrationPulse: boolean } = {
  _celebrationPulse: false,

  init(): void {
    this._celebrationPulse = false;
  },

  update(_dt: number, env: RenderEnv): void {
    if (!this._celebrationPulse && env.tm[3] && env.sceneElapsed >= env.tm[3]) {
      this._celebrationPulse = true;
      lightingSystem.triggerPulse(0.55);
    }
  }
};

export default finaleVisual;
