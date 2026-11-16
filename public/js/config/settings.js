export const settings = {
  debug: typeof location !== 'undefined' && new URLSearchParams(location.search).get('debug') === '1',
  audioEnabled: false,
  persistProgress: false,
  reducedMotion: typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  isMobile: typeof matchMedia !== 'undefined' && matchMedia('(pointer:coarse)').matches,
  cardContinueDelay: 3.8,
  scene9ContinueDelay: 2.8,
  maxDeltaSeconds: 0.05
};
