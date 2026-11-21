import { cl } from '../utils';
import { lightingSystem } from '../visual-engine/lighting-system';
import type { RenderEnv, VisualSceneModule } from '../types/app';

export const friendshipVisual: VisualSceneModule = {
  init(): void {},

  update(_dt: number, env: RenderEnv): void {
    const fade = 1 - cl((env.sceneElapsed - 16) / 6) * 0.45;
    lightingSystem.configure({ rx: 0.7, ry: 0.54, radius: 0.75, alpha: 0.45 * fade, cool: false });
  }
};

export default friendshipVisual;
