import { COLF } from '../config/scenes.config.js';

export default {
  id: 1,
  textStartDelay: 9.0,
  texts: [
    ['Hoje o dia é todinho seu.', 'top'],
    ['Feliz aniversário, Anderson!', 'mid big'],
    ['Dezoito anos de vida, novas histórias pela frente e muitas oportunidades para fazer coisas incríveis.', 'low'],
    ['E, por favor, tente não fazer muita besteira. Pelo menos hoje.', 'bot fun']
  ],
  getAnimations() {
    return [
      {
        name: 'stars',
        params: {
          idle: false,
          skyColors: ['#0C163B', '#243875', '#5266A8'],
          starDensity: 0.8,
          mountains: ['#1B2D5E', '#101C42'],
          mountainReveal: false,
          ground: true,
          groundTop: '#0B2A24'
        }
      },
      { name: 'flowers', params: { colors: COLF, mode: 'meadow' } },
      { name: 'lanterns', params: { count: 6 } },
      { name: 'balloons', params: { delay: 2.5, count: 10 } },
      { name: 'cake', params: { numberDelay: 8 } },
      { name: 'petals', params: { pinkAccent: false } },
      { name: 'fireworks', params: { confettiCount: 95, burstRate: .016, burstSize: 24, startDelay: 12, sideMode: 'edges' } }
    ];
  }
};
