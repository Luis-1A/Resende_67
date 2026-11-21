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
      dprCap: 1.4,
      particleBudget: 0.75,
      starCount: 85,
      fireflyCount: 18,
      petalCount: 16,
      dustCount: 22,
      confettiCount: 85,
      rayCount: 3,
      enableBloom: true
    },
    eco: {
      dprCap: 1.15,
      particleBudget: 0.5,
      starCount: 55,
      fireflyCount: 10,
      petalCount: 10,
      dustCount: 14,
      confettiCount: 50,
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
