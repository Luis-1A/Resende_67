import { cl, ez, L, rnd } from '../../../utils.js';
import { ACT3_FIREWORK_CUES, FINALE_PALETTES } from '../config/finale-effects.js';

export default {
  _cues: new Set(),

  enter(ctx) {
    this._cues.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.fireworksNight,
      horizonGlow: 0.45,
      lightRays: 0.12
    });
    ctx.lanterns.spawnLanterns(8);
  },

  update(dt, localT, globalT, ctx) {
    // Pull virtual camera smoothly back from 1.08 to 1.0 revealing full sky
    if (localT < 4) {
      ctx.setCameraZoom(L(1.08, 1.0, ez(cl(localT / 4))));
    }

    for (let i = 0; i < ACT3_FIREWORK_CUES.length; i++) {
      const cue = ACT3_FIREWORK_CUES[i];
      const key = `fw_${i}`;
      if (globalT >= cue.at - 0.95 && !this._cues.has(key)) {
        this._cues.add(key);
        ctx.fireworks.launch({
          nx: cue.x,
          ny: cue.y,
          type: cue.type,
          size: cue.size,
          onExplode: () => {
            ctx.flowers.pulseFlash(0.28);
            for (let p = 0; p < 12; p++) {
              ctx.gold.spawnParticle({
                nx: cue.x + (rnd() - 0.5) * 0.14,
                ny: cue.y + (rnd() - 0.5) * 0.1,
                vx: (rnd() - 0.5) * 0.08,
                vy: 0.02 + rnd() * 0.04,
                maxLife: 2.1
              });
            }
          }
        });
      }
    }

    if (localT >= 8 && !this._cues.has('shoot1')) {
      this._cues.add('shoot1');
      ctx.stars.spawnShootingStar({ fromLeft: true, dur: 0.9 });
    }
    if (localT >= 16 && !this._cues.has('shoot2')) {
      this._cues.add('shoot2');
      ctx.stars.spawnShootingStar({ fromLeft: false, dur: 0.85 });
    }
  }
};
