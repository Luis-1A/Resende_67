export default {
  id: 5,
  textStartDelay: 1.8,
  texts: [
    ['Agora, falando sério.', 'low'],
    ['Por trás de todas as brincadeiras, existe uma coisa que eu realmente queria te dizer.', 'bot'],
    ['Eu fico feliz por ter você como meu amigo.', 'b3']
  ],
  getAnimations() {
    return [
      {
        name: 'stars',
        params: {
          idle: false,
          skyColors: ['#010207', '#02030A', '#040611'],
          starDensity: 0,
          mountains: null,
          mountainReveal: false,
          ground: false
        }
      },
      { name: 'emotionalScene' },
      { name: 'flowers', params: { colors: ['#FFFFFF'], mode: 'meadow', startDelay: 7, cornersOnly: true } }
    ];
  }
};
