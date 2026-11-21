export default {
  id: 0,
  textStartDelay: 15.5,
  transitionType: 'darkFade',
  texts: [
    ['Existe uma noite especial que merece ser lembrada.', 'mid'],
    ['E hoje, ela foi preparada para você.', 'low'],
    ['ANDERSON', 'mid name'],
    ['Hoje, este pequeno universo celebra você.', 'low'],
    ['22 de novembro.', 'bot']
  ],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#050C20', '#142852', '#284A7E'],
        mountains: ['#13264A', '#0A152E'],
        mountainReveal: true,
        ground: true,
        groundTop: '#0B2A24',
        cloudDensity: 1
      },
      ambientGlow: { rx: 0.5, ry: 0.2, radius: 0.9, alpha: 0.24, cool: true },
      visualScene: 'opening-visual.js',
      effects: [
        { name: 'stars', params: { density: 1 } },
        { name: 'shootingStars', params: { startAt: 3.8, duration: 7.0 } },
        { name: 'lightRays', params: { delay: 2.5, opacity: 0.1, warm: false } },
        { name: 'fireflies', params: { count: 16, glowIntensity: 0.7 } },
        { name: 'magicalDust', params: { focusY: 0.34, intensity: 0.65 } },
        { name: 'petals', params: { pinkAccent: false } }
      ]
    };
  },
  getAnimations() {
    return [
      { name: 'opening', params: { skipShootingStar: true } },
      { name: 'flowers', params: { colors: ['#E8F1FF', '#BFD4FF', '#F7C6E0'], mode: 'opening' } }
    ];
  }
};
