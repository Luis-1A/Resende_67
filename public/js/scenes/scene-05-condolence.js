export default {
  id: 4,
  hasCard: true,
  exitDuration: 3.2,
  exitAnimation: 'condolenceLetter',
  texts: [],
  getAnimations() {
    return [
      {
        name: 'stars',
        params: {
          idle: false,
          skyColors: ['#09070D', '#1A1219', '#2B1C22'],
          starDensity: 0,
          mountains: null,
          mountainReveal: false,
          ground: false
        }
      },
      { name: 'condolenceLetter', params: { mode: 'letter' } },
      { name: 'petals', params: { pinkAccent: false } }
    ];
  }
};
