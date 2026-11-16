import { settings } from './config/settings.js';

export const audioManager = {
  enabled: Boolean(settings.audioEnabled),
  init() {},
  playScene() {},
  playCue() {},
  stop() {},
  destroy() {}
};
