import { cl, ez, L, rnd, TAU } from '../../../utils.js';
import { FINALE_PALETTES } from '../config/finale-effects.js';

export default {
  _cues: new Set(),

  enter(ctx) {
    this._cues.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.deepNight,
      horizonGlow: 0.08,
      lightRays: 0.04,
      dim: 0.25
    });
    ctx.stars.setDensity(0.55);

    // 40 white edge particles drifting toward center on curved trajectories
    for (let i = 0; i < 40; i++) {
      const ang = (i / 40) * TAU;
      const edgeX = cl(0.5 + Math.cos(ang) * 0.56, 0.02, 0.98);
      const edgeY = cl(0.5 + Math.sin(ang) * 0.56, 0.02, 0.98);
      ctx.gold.spawnParticle({
        nx: edgeX,
        ny: edgeY,
        tx: 0.5,
        ty: 0.5,
        mode: 'converge',
        maxLife: 4.5 + rnd() * 2,
        size0: 1.8 + rnd() * 1.4,
        color: '#FFFFFF',
        cool: true
      });
    }
  },

  update(dt, localT, _globalT, ctx) {
    // 00:00 - 00:03: gentle sky lift
    if (localT < 3) {
      ctx.setAtmosphere({ dim: L(0.25, 0.04, ez(cl(localT / 3))) });
    }

    // 00:03 - 00:06: center star 2px -> 9px + 30 golden orbiters
    if (localT >= 3 && localT < 15) {
      const growK = ez(cl((localT - 3) / 3));
      ctx.stars.setCenterStar({
        visible: true,
        nx: 0.5,
        ny: 0.5,
        size: L(2, 9, growK),
        alpha: cl((localT - 3) / 0.8)
      });
    }

    if (localT >= 3 && !this._cues.has('orbit')) {
      this._cues.add('orbit');
      for (let i = 0; i < 30; i++) {
        ctx.gold.spawnParticle({
          mode: 'orbit',
          tx: 0.5,
          ty: 0.5,
          orbitR: 0.04 + rnd() * 0.07,
          orbitAngle: (i / 30) * TAU,
          orbitSpd: (i % 2 === 0 ? 1 : -1) * (1.2 + rnd() * 1.1),
          maxLife: 6.5,
          size0: 1.8 + rnd() * 1.1
        });
      }
    }

    // 00:06 - 00:10: light wave expansion + upward edge scatter + shooting star
    if (localT >= 6 && !this._cues.has('wave')) {
      this._cues.add('wave');
      ctx.gold.triggerLightWave({ nx: 0.5, ny: 0.5, maxR: 1.0, duration: 1.2, maxAlpha: 0.28 });
      ctx.stars.spawnShootingStar({ x0: 0.14, y0: 0.14, x1: 0.84, y1: 0.34, dur: 1.15 });
      for (let i = 0; i < 24; i++) {
        ctx.gold.spawnParticle({
          nx: rnd() < 0.5 ? 0.06 + rnd() * 0.18 : 0.76 + rnd() * 0.18,
          ny: 0.72 + rnd() * 0.22,
          vy: -0.09 - rnd() * 0.08,
          maxLife: 3.2
        });
      }
    }

    // 00:10 - 00:15: HTML prompt text
    if (localT >= 10 && !this._cues.has('text')) {
      this._cues.add('text');
      ctx.stars.setCenterStar({ visible: true, nx: 0.5, ny: 0.36, size: 7, alpha: 0.8 });
      ctx.showText({
        lines: [{ text: 'Você realmente achou que tinha acabado?', variant: 'poetic' }],
        position: 'center'
      });
    }

    // 00:15 - 00:20: shatter text into 120 rising particles & transition star into horizon glow
    if (localT >= 15 && !this._cues.has('shatter')) {
      this._cues.add('shatter');
      ctx.shatterText();
      for (let i = 0; i < 120; i++) {
        ctx.gold.spawnParticle({
          nx: 0.22 + rnd() * 0.56,
          ny: 0.44 + rnd() * 0.12,
          vx: (rnd() - 0.5) * 0.05,
          vy: -0.06 - rnd() * 0.09,
          maxLife: 2.4 + rnd() * 1.8,
          size0: 1.5 + rnd() * 1.8
        });
      }
    }

    if (localT >= 15) {
      const k = ez(cl((localT - 15) / 5));
      ctx.stars.setCenterStar({
        visible: k < 0.92,
        nx: 0.5,
        ny: L(0.36, 0.54, k),
        size: L(7, 14, k),
        alpha: 1 - k
      });
      ctx.setAtmosphere({
        horizonGlow: L(0.12, 0.36, k),
        lightRays: L(0.05, 0.14, k)
      });
      ctx.stars.setDensity(L(0.55, 0.85, k));
    }
  }
};
