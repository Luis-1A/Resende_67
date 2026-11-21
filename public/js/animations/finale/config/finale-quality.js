import { performanceManager } from '../../../visual-engine/performance-manager.js';
import { settings } from '../../../config/settings.js';

export const FINALE_QUALITY_TIERS = {
  high: {
    goldDustMax: 180,
    starsMax: 100,
    firefliesMax: 100,
    petalsMax: 240,
    sparksMax: 500,
    fireworkParticlesMax: 900,
    confettiMax: 100,
    typoParticlesMax: 600,
    burstScale: 1
  },
  medium: {
    goldDustMax: 120,
    starsMax: 80,
    firefliesMax: 70,
    petalsMax: 150,
    sparksMax: 320,
    fireworkParticlesMax: 560,
    confettiMax: 72,
    typoParticlesMax: 420,
    burstScale: 0.78
  },
  eco: {
    goldDustMax: 75,
    starsMax: 55,
    firefliesMax: 42,
    petalsMax: 90,
    sparksMax: 180,
    fireworkParticlesMax: 320,
    confettiMax: 48,
    typoParticlesMax: 260,
    burstScale: 0.55
  },
  reduced: {
    goldDustMax: 40,
    starsMax: 45,
    firefliesMax: 25,
    petalsMax: 36,
    sparksMax: 80,
    fireworkParticlesMax: 160,
    confettiMax: 24,
    typoParticlesMax: 180,
    burstScale: 0.35
  }
};

export function getFinaleQuality() {
  if (settings.reducedMotion) return FINALE_QUALITY_TIERS.reduced;
  return FINALE_QUALITY_TIERS[performanceManager.tier] || FINALE_QUALITY_TIERS.medium;
}
