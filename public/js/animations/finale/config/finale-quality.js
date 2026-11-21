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
    goldDustMax: 105,
    starsMax: 72,
    firefliesMax: 60,
    petalsMax: 120,
    sparksMax: 260,
    fireworkParticlesMax: 420,
    confettiMax: 60,
    typoParticlesMax: 340,
    burstScale: 0.72
  },
  eco: {
    goldDustMax: 65,
    starsMax: 50,
    firefliesMax: 36,
    petalsMax: 75,
    sparksMax: 150,
    fireworkParticlesMax: 240,
    confettiMax: 40,
    typoParticlesMax: 220,
    burstScale: 0.5
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
