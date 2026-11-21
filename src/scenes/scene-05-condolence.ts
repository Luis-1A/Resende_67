export default {
  id: 4,
  hasCard: true,
  exitDuration: 3.2,
  exitAnimation: 'condolenceLetter',
  transitionType: 'darkFade',
  texts: [],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#09070D', '#1A1219', '#2B1C22'],
        mountains: null,
        mountainReveal: false,
        ground: false,
        cloudDensity: 0
      },
      ambientGlow: { rx: 0.5, ry: 0.48, radius: 0.72, alpha: 0.2, cool: false },
      visualScene: 'letter-visual.ts',
      effects: [
        { name: 'magicalDust', params: { focusY: 0.48, intensity: 0.55 } },
        { name: 'petals', params: { pinkAccent: false, count: 8 } }
      ]
    };
  },
  getAnimations() {
    return [
      { name: 'condolenceLetter', params: { mode: 'letter' } }
    ];
  }
};
