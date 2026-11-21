import { visualSettings } from '../config/visual-settings';
import { settings } from '../config/settings';

export type QualityTierName = keyof typeof visualSettings.qualityTiers;
export type QualityProfile = (typeof visualSettings.qualityTiers)[QualityTierName];

export const performanceManager = {
  tier: 'medium' as QualityTierName,
  _slowFrames: 0,
  _fastFrames: 0,

  detectInitialTier(): QualityTierName {
    if (settings.reducedMotion) {
      this.tier = 'reduced';
      return this.tier;
    }
    const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { deviceMemory?: number }) : undefined;
    const cores = nav?.hardwareConcurrency || 4;
    const mem = nav?.deviceMemory || 4;
    if (settings.isMobile || cores <= 4 || mem <= 4) {
      this.tier = cores <= 2 || mem <= 2 ? 'eco' : 'medium';
    } else {
      this.tier = 'high';
    }
    return this.tier;
  },

  recordFrame(dt: number): void {
    if (this.tier === 'reduced') return;
    if (dt > 0.045) {
      this._slowFrames++;
      this._fastFrames = 0;
      if (this._slowFrames > 20) {
        this._slowFrames = 0;
        if (this.tier === 'high') this.tier = 'medium';
        else if (this.tier === 'medium') this.tier = 'eco';
      }
    } else if (dt < 0.022) {
      this._fastFrames++;
      this._slowFrames = 0;
    }
  },

  getProfile(): QualityProfile {
    return visualSettings.qualityTiers[this.tier] || visualSettings.qualityTiers.medium;
  },

  scaleCount(base: number): number {
    return Math.max(1, Math.round(base * this.getProfile().particleBudget));
  }
};
