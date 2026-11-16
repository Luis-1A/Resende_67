export default {
  id: 6,
  hasCard: true,
  exitDuration: 2.6,
  texts: [],
  getAnimations() {
    return [
      {
        name: 'stars',
        params: {
          idle: false,
          skyColors: ['#2B211E', '#3A2D28', '#19141F'],
          starDensity: 0,
          mountains: null,
          mountainReveal: false,
          ground: false
        }
      },
      { name: 'personalLetter' },
      { name: 'petals', params: { pinkAccent: false } }
    ];
  }
};
