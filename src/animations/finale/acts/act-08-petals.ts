import { rnd } from '../../../utils';
import { FINALE_PALETTES } from '../config/finale-effects';
import type { FinaleActContext, FinaleActModule } from '../finale-timeline';

const act08: FinaleActModule = {
  _cues: new Set<string>(),

  enter(ctx: FinaleActContext) {
    this._cues!.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.petalTwilight,
      horizonGlow: 0.44,
      lightRays: 0.16,
      mistShift: 0
    });
    ctx.petals.spawnWave({ count: 120, mode: 'top' });
    ctx.butterflies.spawn({ p0: { x: 0, y: 0.65 }, p1: { x: 0.45, y: 0.42 }, p2: { x: 1, y: 0.24 }, duration: 9, nearCamera: true });
    for (let i = 0; i < 40; i++) {
      ctx.gold.spawnParticle({ nx: rnd(), ny: rnd(), vx: 0.05, vy: -0.02, maxLife: 4.5 });
    }
  },

  update(_dt: number, localT: number, _globalT: number, ctx: FinaleActContext) {
    const cues = this._cues!;
    if (localT >= 6 && !cues.has('wave2')) {
      cues.add('wave2');
      ctx.petals.spawnWave({ count: 80, mode: 'sides' });
      ctx.butterflies.spawn({ p0: { x: 1, y: 0.55 }, p1: { x: 0.55, y: 0.32 }, p2: { x: 0, y: 0.18 }, duration: 8, nearCamera: true });
    }

    if (localT >= 12 && !cues.has('wave3')) {
      cues.add('wave3');
      ctx.petals.triggerWindShift();
      ctx.petals.spawnWave({ count: 40, mode: 'swirl' });
    }

    if (localT >= 17 && !cues.has('goldWave')) {
      cues.add('goldWave');
      ctx.gold.triggerLightWave({ nx: 0.5, ny: 0.52, maxR: 1.05, duration: 1.8, maxAlpha: 0.26 });
      for (let i = 0; i < 15; i++) {
        ctx.gold.spawnParticle({ nx: 0.1 + rnd() * 0.8, ny: 0.2 + rnd() * 0.6, vy: -0.04, maxLife: 2.5 });
      }
    }
  }
};

export default act08;
