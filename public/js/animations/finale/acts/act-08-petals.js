import { rnd } from '../../../utils.js';
import { FINALE_PALETTES } from '../config/finale-effects.js';

export default {
  _cues: new Set(),

  enter(ctx) {
    this._cues.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.petalTwilight,
      horizonGlow: 0.44,
      lightRays: 0.16,
      mistShift: 0
    });
    // Wave 1 (02:45–02:51): 120 top falling petals
    ctx.petals.spawnWave({ count: 120, mode: 'top' });
    ctx.butterflies.spawn({ p0: { x: 0, y: 0.65 }, p1: { x: 0.45, y: 0.42 }, p2: { x: 1, y: 0.24 }, duration: 9, nearCamera: true });
    for (let i = 0; i < 40; i++) {
      ctx.gold.spawnParticle({ nx: rnd(), ny: rnd(), vx: 0.05, vy: -0.02, maxLife: 4.5 });
    }
  },

  update(dt, localT, _globalT, ctx) {
    // Wave 2 (02:51–02:57): 80 fast cross-screen petals including foreground blur scale
    if (localT >= 6 && !this._cues.has('wave2')) {
      this._cues.add('wave2');
      ctx.petals.spawnWave({ count: 80, mode: 'sides' });
      ctx.butterflies.spawn({ p0: { x: 1, y: 0.55 }, p1: { x: 0.55, y: 0.32 }, p2: { x: 0, y: 0.18 }, duration: 8, nearCamera: true });
    }

    // Wave 3 (02:57–03:02): wind shift lifting & swirling 40 fresh petals
    if (localT >= 12 && !this._cues.has('wave3')) {
      this._cues.add('wave3');
      ctx.petals.triggerWindShift();
      ctx.petals.spawnWave({ count: 40, mode: 'swirl' });
    }

    // Closing golden wave preparing Act 9 fireworks (03:02–03:05)
    if (localT >= 17 && !this._cues.has('goldWave')) {
      this._cues.add('goldWave');
      ctx.gold.triggerLightWave({ nx: 0.5, ny: 0.52, maxR: 1.05, duration: 1.8, maxAlpha: 0.26 });
      for (let i = 0; i < 15; i++) {
        ctx.gold.spawnParticle({ nx: 0.1 + rnd() * 0.8, ny: 0.2 + rnd() * 0.6, vy: -0.04, maxLife: 2.5 });
      }
    }
  }
};
