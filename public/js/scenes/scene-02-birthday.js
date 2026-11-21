import { COLF } from '../config/scenes.config.js';

export default {
  id: 1,
  textStartDelay: 9.0,
  transitionType: 'lightBloom',
  texts: [
    ['Hoje o dia é todinho seu.', 'top'],
    ['Feliz aniversário, Anderson!', 'mid big'],
    ['Dezoito anos de vida, novas histórias pela frente e muitas oportunidades para fazer coisas incríveis.', 'low'],
    ['E, por favor, tente não fazer muita besteira. Pelo menos hoje.', 'bot fun']
  ],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#0C163B', '#243875', '#5266A8'],
        mountains: ['#1B2D5E', '#101C42'],
        mountainReveal: false,
        ground: true,
        groundTop: '#0B2A24',
        cloudDensity: 0.8
      },
      ambientGlow: { rx: 0.5, ry: 0.72, radius: 0.85, alpha: 0.32, cool: false },
      visualScene: 'birthday-visual.js',
      effects: [
        { name: 'stars', params: { density: 0.8 } },
        { name: 'floatingLanterns', params: { count: 6 } },
        { name: 'glowingParticles', params: { count: 22 } },
        { name: 'confetti', params: { count: 95, startAt: 10 } },
        { name: 'fireworks', params: { burstRate: 0.016, burstSize: 24, startDelay: 12, sideMode: 'edges' } },
        { name: 'petals', params: { pinkAccent: false } }
      ]
    };
  },
  getAnimations() {
    return [
      { name: 'flowers', params: { colors: COLF, mode: 'meadow' } },
      { name: 'balloons', params: { delay: 2.5, count: 10 } },
      { name: 'finale', params: { numberDelay: 8 } }
    ];
  }
};
