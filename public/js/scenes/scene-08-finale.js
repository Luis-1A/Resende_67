import { COLF } from '../config/scenes.config.js';

export default {
  id: 7,
  textStartDelay: 11.0,
  transitionType: 'darkFade',
  texts: [
    ['Que a vida te surpreenda com coisas bonitas.', 'top'],
    ['Que nunca te faltem motivos para sorrir, pessoas boas para compartilhar a vida e sonhos que façam você querer continuar caminhando.', 'mid'],
    ['Que você tenha saúde, felicidade, coragem para enfrentar os dias difíceis e tempo para aproveitar os dias bons.', 'low'],
    ['FELIZ ANIVERSÁRIO, ANDERSON!', 'mid big'],
    ['Que a vida ainda nos reserve muitas histórias para contar.', 'low']
  ],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#071033', '#1C3373', '#4263B5'],
        mountains: ['#1A2B5A', '#0E1A3D'],
        mountainReveal: false,
        ground: true,
        groundTop: '#0B2A24',
        cloudDensity: 0.9
      },
      ambientGlow: { rx: 0.5, ry: 0.42, radius: 0.9, alpha: 0.28, cool: true },
      visualScene: 'finale-visual.js',
      effects: [
        { name: 'stars', params: { density: 1 } },
        { name: 'shootingStars', params: { startAt: 22.0, duration: 5.5, fromX: 0.82, toX: 0.16 } },
        { name: 'lightRays', params: { delay: 1.0, opacity: 0.11, warm: false } },
        { name: 'fireflies', params: { count: 16, glowIntensity: 0.9 } },
        { name: 'floatingLanterns', params: { count: 6 } },
        { name: 'butterflies', params: { count: 5 } },
        { name: 'magicalDust', params: { focusY: 0.35, intensity: 0.68 } },
        { name: 'confetti', params: { count: 68, startAt: 10 } },
        { name: 'fireworks', params: { burstRate: 0.024, burstSize: 22, startDelay: 9, sideMode: 'wide' } },
        { name: 'petals', params: { pinkAccent: true } }
      ]
    };
  },
  getAnimations() {
    return [
      { name: 'flowers', params: { colors: COLF, mode: 'wave', bloomGlow: true } },
      { name: 'balloons', params: { delay: 1, count: 10 } },
      { name: 'finale', params: { numberDelay: 5.5 } }
    ];
  }
};
