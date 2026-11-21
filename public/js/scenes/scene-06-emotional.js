export default {
  id: 5,
  textStartDelay: 1.8,
  transitionType: 'lightBloom',
  texts: [
    ['Agora, falando sério.', 'low'],
    ['Por trás de todas as brincadeiras, existe uma coisa que eu realmente queria te dizer.', 'bot'],
    ['Eu fico feliz por ter você como meu amigo.', 'b3']
  ],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#010207', '#02030A', '#040611'],
        mountains: null,
        mountainReveal: false,
        ground: false,
        cloudDensity: 0
      },
      effects: [
        { name: 'magicalDust', params: { focusY: 0.24, intensity: 0.45, count: 14 } }
      ]
    };
  },
  getAnimations() {
    return [
      { name: 'emotionalScene' },
      { name: 'flowers', params: { colors: ['#FFFFFF'], mode: 'meadow', startDelay: 7, cornersOnly: true } }
    ];
  }
};
