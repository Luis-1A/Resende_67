import { cl, ez, L } from '../../utils';
import type { RenderEnv } from '../../types/app';

export interface CameraTransform {
  scale: number;
  offsetY: number;
  portalDepthScale: number;
}

export const cameraAnimation = {
  _progress: 0,
  _active: false,

  init(): void {
    this._progress = 0;
    this._active = false;
  },

  setAdvance(progress: number): void {
    this._progress = cl(progress);
    this._active = this._progress > 0;
  },

  getTransform(env: RenderEnv): CameraTransform {
    if (!this._active || env.RM) {
      return { scale: 1, offsetY: 0, portalDepthScale: 1 };
    }
    const k = ez(this._progress);
    return {
      scale: L(1, 1.48, k),
      offsetY: L(0, env.H * 0.14, k),
      portalDepthScale: L(0.42, 1.05, k)
    };
  }
};

export default cameraAnimation;
