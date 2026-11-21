import { visualSettings } from '../config/visual-settings.js';
import { settings } from '../config/settings.js';

export const performanceManager = {
  tier: 'medium',
  _slowFrames: 0,
  _fastFrames: 0,

  detectInitialTier() {
    if (settings.reducedMotion) {
      this.tier = 'reduced';
      return this.tier;
    }
    const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
    const mem = typeof navigator !== 'undefined' ? (navigator.deviceMemory || 4) : 4;
    if (settings.isMobile || cores <= 4 || mem <= 4) {
      this.tier = cores <= 2 || mem <= 2 ? 'eco' : 'medium';
    } else {
      this.tier = 'high';
    }
    return this.tier;
  },

  recordFrame(dt) {
    if (this.tier === 'reduced') return;
    if (dt > 0.045) {
      this._slowFrames++;
      this._fastFrames = 0;
      if (this._slowFrames > 35) {
        this._slowFrames = 0;
        if (this.tier === 'high') this.tier = 'medium';
        else if (this.tier === 'medium') this.tier = 'eco';
      }
    } else if (dt < 0.022) {
      this._fastFrames++;
      this._slowFrames = 0;
    }
  },

  getProfile() {
    return visualSettings.qualityTiers[this.tier] || visualSettings.qualityTiers.medium;
  },

  scaleCount(base) {
    return Math.max(1, Math.round(base * this.getProfile().particleBudget));
  }
};
