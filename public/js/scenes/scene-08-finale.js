import { COLF } from '../config/scenes.config.js';

export default {
  id: 7,
  textStartDelay: 11.0,
  texts: [
    ['Que a vida te surpreenda com coisas bonitas.', 'top'],
    ['Que nunca te faltem motivos para sorrir, pessoas boas para compartilhar a vida e sonhos que façam você querer continuar caminhando.', 'mid'],
    ['Que você tenha saúde, felicidade, coragem para enfrentar os dias difíceis e tempo para aproveitar os dias bons.', 'low'],
    ['FELIZ ANIVERSÁRIO, ANDERSON!', 'mid big'],
    ['Que a vida ainda nos reserve muitas histórias para contar.', 'low']
  ],
  getAnimations() {
    return [
      {
        name: 'stars',
        params: {
          idle: false,
          skyColors: ['#071033', '#1C3373', '#4263B5'],
          starDensity: 1,
          mountains: ['#1A2B5A', '#0E1A3D'],
          mountainReveal: false,
          ground: true,
          groundTop: '#0B2A24'
        }
      },
      { name: 'flowers', params: { colors: COLF, mode: 'wave', bloomGlow: true } },
      { name: 'lanterns', params: { count: 6 } },
      { name: 'balloons', params: { delay: 1, count: 10 } },
      { name: 'finale', params: { numberDelay: 5.5 } },
      { name: 'butterflies', params: { count: 5 } },
      { name: 'petals', params: { pinkAccent: true } },
      { name: 'fireworks', params: { confettiCount: 120, burstRate: .034, burstSize: 32, startDelay: 9, sideMode: 'wide' } }
    ];
  }
};
