import { cl, ez, L, rnd, TAU } from '../../../utils.js';
import { FINALE_PALETTES } from '../config/finale-effects.js';

export default {
  _cues: new Set(),

  enter(ctx) {
    this._cues.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.quietEnd,
      horizonGlow: 0.14,
      lightRays: 0.04,
      dim: 0.12
    });
    ctx.lanterns.fadeOutAll();
    ctx.gold.dimFireflies();
    ctx.flowers.dimAll();
    ctx.flowers.spawnHeroWhiteFlower({ nx: 0.5, ny: 0.65 });
  },

  update(dt, localT, _globalT, ctx) {
    // 04:18 - 04:21: butterfly enters X:100%, Y:35% and lands at X:50%, Y:53%
    if (localT >= 3 && !this._cues.has('butterflyLand')) {
      this._cues.add('butterflyLand');
      ctx.butterflies.spawn({
        p0: { x: 1.0, y: 0.35 },
        p1: { x: 0.72, y: 0.42 },
        p2: { x: 0.5, y: 0.53 },
        duration: 3.0,
        landing: true,
        colorA: '#FFFFFF',
        colorB: '#FFECC2',
        accent: '#FFD479'
      });
    }

    // 04:21 - 04:24: butterfly rests, flower dips gently 2° (~0.035 rad)
    if (localT >= 6 && !this._cues.has('dip')) {
      this._cues.add('dip');
      ctx.flowers.setHeroFlowerState({ targetDip: 0.035 });
    }

    // 04:24 - 04:27: white flower opens wide, center glows gold, 25 golden particles emerge into star
    if (localT >= 9 && !this._cues.has('openStar')) {
      this._cues.add('openStar');
      ctx.flowers.setHeroFlowerState({ targetOpen: 1.0, targetDip: 0, glowLevel: 0.95 });
      for (let i = 0; i < 25; i++) {
        const ang = (i / 25) * TAU;
        ctx.gold.spawnParticle({
          nx: 0.5 + Math.cos(ang) * 0.035,
          ny: 0.62 + Math.sin(ang) * 0.03,
          tx: 0.5,
          ty: 0.55,
          mode: 'converge',
          maxLife: 2.2,
          size0: 2.2
        });
      }
      ctx.stars.setCenterStar({ visible: true, nx: 0.5, ny: 0.55, size: 8, alpha: 0.95 });
    }

    // 04:27 - 04:30: golden star rises Y:55% -> Y:10% over 2s leaving 35-particle trail + closing line
    if (localT >= 11.5 && !this._cues.has('finalMsg')) {
      this._cues.add('finalMsg');
      ctx.showText({
        lines: [
          { text: 'Feliz aniversário, Anderson.', variant: 'closing-birthday' },
          { text: 'Obrigado por fazer parte da minha história.', variant: 'closing' }
        ],
        position: 'center'
      });
      for (let i = 0; i < 35; i++) {
        ctx.gold.spawnParticle({
          nx: 0.5 + (rnd() - 0.5) * 0.025,
          ny: L(0.55, 0.14, i / 35),
          vx: (rnd() - 0.5) * 0.015,
          vy: -0.02 - rnd() * 0.02,
          maxLife: 2.8,
          size0: 1.8
        });
      }
    }

    if (localT >= 11.5) {
      const riseK = ez(cl((localT - 11.5) / 2.2));
      const fadeOut = localT > 13.5 ? 1 - cl((localT - 13.5) / 1.5) : 1;
      ctx.stars.setCenterStar({
        visible: fadeOut > 0.02,
        nx: 0.5,
        ny: L(0.55, 0.1, riseK),
        size: L(8, 3.5, riseK),
        alpha: fadeOut
      });
      ctx.setAtmosphere({ dim: L(0.12, 0.65, cl((localT - 12.2) / 2.8)) });
    }
  }
};
