export default {
  id: 6,
  hasCard: true,
  exitDuration: 2.6,
  transitionType: 'starConverge',
  texts: [],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#2B211E', '#3A2D28', '#19141F'],
        mountains: null,
        mountainReveal: false,
        ground: false,
        cloudDensity: 0
      },
      ambientGlow: { rx: 0.5, ry: 0.5, radius: 0.85, alpha: 0.34, cool: false },
      visualScene: 'letter-visual.js',
      effects: [
        { name: 'magicalDust', params: { focusY: 0.5, intensity: 0.65 } },
        { name: 'petals', params: { pinkAccent: false, count: 12 } }
      ]
    };
  },
  getAnimations() {
    return [
      { name: 'personalLetter' }
    ];
  }
};
