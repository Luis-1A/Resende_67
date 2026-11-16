export default {
  id: 2,
  textStartDelay: 1.8,
  textWindow: 1,
  texts: [
    ['Engraçado como algumas amizades começam por acaso.', 'tl'],
    ['No nosso caso, tudo começou em um jogo.', 'mid'],
    ['Uma partida, algumas conversas e, quando a gente percebe, alguém que antes estava do outro lado da tela já faz parte da nossa vida.', 'low'],
    ['E pensar que tudo começou no Free Fire.', 'bot']
  ],
  getAnimations() {
    return [
      {
        name: 'stars',
        params: {
          idle: false,
          skyColors: ['#3E4D8A', '#875E8E', '#F7B267'],
          starDensity: 0,
          mountains: ['#6A4D7C', '#382A4F'],
          mountainReveal: false,
          ground: true,
          groundTop: '#362B4A'
        }
      },
      { name: 'friendship' },
      { name: 'flowers', params: { colors: ['#FFD9A0', '#FFB4A2'], mode: 'meadow' } },
      { name: 'butterflies', params: { count: 5 } },
      { name: 'petals', params: { pinkAccent: false } }
    ];
  }
};
