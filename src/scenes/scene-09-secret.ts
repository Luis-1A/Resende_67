import type { SceneDefinition } from '../types/app';

const scene: SceneDefinition = {
  id: 8,
  hasCard: true,
  darkCard: true,
  manualContinue: true,
  autoAdvance: false,
  transitionType: 'darkFade',
  texts: [],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#02040D', '#060C22', '#0C163B'],
        mountains: ['#0C1636', '#060B1E'],
        mountainReveal: false,
        ground: true,
        groundTop: '#0B2A24',
        cloudDensity: 0.7
      },
      visualScene: 'finale-visual.ts',
      effects: [
        { name: 'stars', params: { density: 1 } },
        { name: 'fireflies', params: { count: 14, glowIntensity: 0.65 } },
        { name: 'petals', params: { pinkAccent: false, count: 10 } }
      ]
    };
  },
  getAnimations() {
    return [
      { name: 'secretMessage' }
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
  updateUi(_st, { animationManager, dom }) {
    const shouldShow = animationManager.notify('secretMessage', 'shouldShowContinue', animationManager._ctx.getTime());
    if (shouldShow) dom.nx.classList.add('on');
  }
};

export default scene;
