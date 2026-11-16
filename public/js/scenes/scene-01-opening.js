export default {
  id: 0,
  textStartDelay: 15.5,
  texts: [
    ['Existe uma noite especial que merece ser lembrada.', 'mid'],
    ['E hoje, ela foi preparada para você.', 'low'],
    ['ANDERSON', 'mid name'],
    ['Hoje, este pequeno universo celebra você.', 'low'],
    ['22 de novembro.', 'bot']
  ],
  getAnimations() {
    return [
      {
        name: 'stars',
        params: {
          idle: false,
          skyColors: ['#050C20', '#142852', '#284A7E'],
          starDensity: 1,
          mountains: ['#13264A', '#0A152E'],
          mountainReveal: true,
          ground: true,
          groundTop: '#0B2A24'
        }
      },
      { name: 'opening' },
      { name: 'flowers', params: { colors: ['#E8F1FF', '#BFD4FF', '#F7C6E0'], mode: 'opening' } },
      { name: 'petals', params: { pinkAccent: false } }
    ];
  }
};
