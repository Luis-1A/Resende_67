export default {
  id: 3,
  textStartDelay: 1.8,
  texts: [
    ['Um comunicado extremamente importante.', 'top'],
    ['Foi oficialmente confirmado que Anderson está fazendo aniversário.', 'mid'],
    ['Pedimos que todos mantenham a calma. Ele continua sendo a mesma pessoa, apenas com mais experiência em existir.', 'low'],
    ['Desejamos muitos anos de vida, boas histórias e decisões um pouco menos questionáveis.', 'bot']
  ],
  getAnimations() {
    return [
      {
        name: 'stars',
        params: {
          idle: false,
          skyColors: ['#1F203B', '#35395F', '#55597D'],
          starDensity: 0.5,
          mountains: ['#36365E', '#222242'],
          mountainReveal: false,
          ground: true,
          groundTop: '#0B2A24'
        }
      },
      { name: 'flowers', params: { colors: ['#D9C7A0', '#F0E2B8'], mode: 'meadow' } },
      { name: 'condolenceLetter', params: { mode: 'humor' } },
      { name: 'butterflies', params: { count: 4 } },
      { name: 'petals', params: { pinkAccent: false } }
    ];
  }
};
