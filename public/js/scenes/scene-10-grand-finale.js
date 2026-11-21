export default {
  id: 10,
  hasCard: false,
  autoAdvance: false,
  transitionType: 'darkFade',
  texts: [],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#030817', '#0B1838', '#172E61'],
        mountains: null,
        mountainReveal: false,
        ground: false,
        cloudDensity: 0
      },
      ambientGlow: null,
      effects: []
    };
  },
  getAnimations() {
    return [
      { name: 'grandFinale' }
    ];
  }
};
