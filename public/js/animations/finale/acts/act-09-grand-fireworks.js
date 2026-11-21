import { rnd } from '../../../utils.js';
import { ACT9_FIREWORK_CUES, FINALE_PALETTES } from '../config/finale-effects.js';

export default {
  _cues: new Set(),

  enter(ctx) {
    this._cues.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.grandClimax,
      horizonGlow: 0.5,
      lightRays: 0.14
    });
    ctx.lanterns.spawnLanterns(40);
    ctx.gold.spawnFireflies(30); // boosts active fireflies up toward 100 cap
  },

  update(dt, _localT, globalT, ctx) {
    for (let i = 0; i < ACT9_FIREWORK_CUES.length; i++) {
      const cue = ACT9_FIREWORK_CUES[i];
      const key = `gfw_${i}`;
      if (globalT >= cue.at - 0.95 && !this._cues.has(key)) {
        this._cues.add(key);
        ctx.fireworks.launch({
          nx: cue.x,
          ny: cue.y,
          type: cue.type,
          size: cue.size,
          onExplode: () => {
            ctx.flowers.pulseFlash(cue.type === 'grandBurst' ? 0.52 : 0.3);
            for (let p = 0; p < 10; p++) {
              ctx.gold.spawnParticle({
                nx: cue.x + (rnd() - 0.5) * 0.16,
                ny: cue.y + (rnd() - 0.5) * 0.12,
                vx: (rnd() - 0.5) * 0.09,
                vy: 0.02 + rnd() * 0.05,
                maxLife: 2.3
              });
            }
          }
        });
      }
    }
  }
};
