import { cl } from '../utils.js';
import { lightingSystem } from '../visual-engine/lighting-system.js';

export const friendshipVisual = {
  init() {},

  update(dt, env) {
    const fade = 1 - cl((env.sceneElapsed - 16) / 6) * 0.45;
    lightingSystem.configure({ rx: 0.7, ry: 0.54, radius: 0.75, alpha: 0.45 * fade, cool: false });
  }
};

export default friendshipVisual;
