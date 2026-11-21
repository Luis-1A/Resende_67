export default {
  id: 2,
  textStartDelay: 1.8,
  textWindow: 1,
  transitionType: 'mistSweep',
  texts: [
    ['Engraçado como algumas amizades começam por acaso.', 'tl'],
    ['No nosso caso, tudo começou em um jogo.', 'mid'],
    ['Uma partida, algumas conversas e, quando a gente percebe, alguém que antes estava do outro lado da tela já faz parte da nossa vida.', 'low'],
    ['E pensar que tudo começou no Free Fire.', 'bot']
  ],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#1C254F', '#4E3868', '#9E5C45'],
        mountains: ['#5A416A', '#2D2142'],
        mountainReveal: false,
        ground: true,
        groundTop: '#2B223C',
        cloudDensity: 0.6
      },
      ambientGlow: { rx: 0.7, ry: 0.54, radius: 0.75, alpha: 0.24, cool: false },
      visualScene: 'friendship-visual.js',
      effects: [
        { name: 'lightRays', params: { delay: 0.5, opacity: 0.14, warm: true } },
        { name: 'butterflies', params: { count: 5 } },
        { name: 'glowingParticles', params: { count: 20, intensity: 0.7 } },
        { name: 'petals', params: { pinkAccent: false } }
      ]
    };
  },
  getAnimations() {
    return [
      { name: 'friendship' },
      { name: 'flowers', params: { colors: ['#FFD9A0', '#FFB4A2'], mode: 'meadow' } }
    ];
  }
};
