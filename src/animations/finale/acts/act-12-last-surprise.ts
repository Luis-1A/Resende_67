import { cl, ez, L, rnd, TAU } from '../../../utils';
import { FINALE_PALETTES } from '../config/finale-effects';
import type { FinaleActContext, FinaleActModule } from '../finale-timeline';

const act12: FinaleActModule = {
  _cues: new Set<string>(),

  enter(ctx: FinaleActContext) {
    this._cues!.clear();
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

  update(_dt: number, localT: number, _globalT: number, ctx: FinaleActContext) {
    const cues = this._cues!;
    if (localT >= 3 && !cues.has('butterflyLand')) {
      cues.add('butterflyLand');
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

    if (localT >= 6 && !cues.has('dip')) {
      cues.add('dip');
      ctx.flowers.setHeroFlowerState({ targetDip: 0.035 });
    }

    if (localT >= 9 && !cues.has('openStar')) {
      cues.add('openStar');
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

    if (localT >= 11.5 && !cues.has('finalMsg')) {
      cues.add('finalMsg');
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

export default act12;
