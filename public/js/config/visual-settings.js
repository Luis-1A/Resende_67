export const visualSettings = {
  qualityTiers: {
    high: {
      dprCap: 1.75,
      particleBudget: 1,
      starCount: 110,
      fireflyCount: 28,
      petalCount: 22,
      dustCount: 34,
      confettiCount: 120,
      rayCount: 4,
      enableBloom: true
    },
    medium: {
      dprCap: 1.25,
      particleBudget: 0.68,
      starCount: 72,
      fireflyCount: 15,
      petalCount: 14,
      dustCount: 18,
      confettiCount: 54,
      rayCount: 3,
      enableBloom: true
    },
    eco: {
      dprCap: 1.1,
      particleBudget: 0.45,
      starCount: 48,
      fireflyCount: 9,
      petalCount: 9,
      dustCount: 12,
      confettiCount: 34,
      rayCount: 2,
      enableBloom: false
    },
    reduced: {
      dprCap: 1.25,
      particleBudget: 0.35,
      starCount: 45,
      fireflyCount: 6,
      petalCount: 6,
      dustCount: 8,
      confettiCount: 30,
      rayCount: 1,
      enableBloom: false
    }
  },
  layers: {
    BACKGROUND: 1,
    DISTANCE: 2,
    ATMOSPHERE: 3,
    MIDGROUND: 4,
    FOREGROUND: 5
  },
  maxPoolSize: 420
};
