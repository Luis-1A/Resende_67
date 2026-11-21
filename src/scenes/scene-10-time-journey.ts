import type { SceneDefinition } from '../types/app';

const scene: SceneDefinition = {
  id: 9,
  hasCard: false,
  autoAdvance: false,
  transitionType: 'lightBloom',
  texts: [],
  getVisualConfig() {
    return {
      atmosphere: {
        skyColors: ['#020512', '#06112E', '#0D214C'],
        mountains: null,
        mountainReveal: false,
        ground: false,
        cloudDensity: 0
      },
      ambientGlow: null,
      effects: []
    };
  },
  getAnimations() {
    return [
      { name: 'timeJourney' }
    ];
  },
  shouldAutoAdvance({ animationManager }) {
    return Boolean(animationManager.notify('timeJourney', 'isComplete'));
  }
};

export default scene;
