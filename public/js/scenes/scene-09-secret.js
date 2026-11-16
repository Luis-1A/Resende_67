export default {
  id: 8,
  hasCard: true,
  darkCard: true,
  manualContinue: true,
  autoAdvance: false,
  texts: [],
  getAnimations() {
    return [
      {
        name: 'stars',
        params: {
          idle: false,
          skyColors: ['#02040D', '#060C22', '#0C163B'],
          starDensity: 1,
          mountains: ['#0C1636', '#060B1E'],
          mountainReveal: false,
          ground: true,
          groundTop: '#0B2A24'
        }
      },
      { name: 'secretMessage' },
      { name: 'petals', params: { pinkAccent: false } }
    ];
  },
  onPointerMove(e, { animationManager }) {
    animationManager.notify('secretMessage', 'onPointerMove', e);
  },
  onPointerDown(e, { animationManager, sceneManager }) {
    animationManager.notify('secretMessage', 'onPointerDown', e, sceneManager.R);
  },
  onContinue({ animationManager, sceneManager }) {
    return animationManager.notify('secretMessage', 'advanceStage', sceneManager.R);
  },
  updateUi(st, { animationManager, dom }) {
    const shouldShow = animationManager.notify('secretMessage', 'shouldShowContinue', animationManager._ctx.getTime());
    if (shouldShow) dom.nx.classList.add('on');
  }
};
