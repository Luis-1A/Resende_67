import { cl, rnd, TAU } from '../../../utils';
import type { FinaleActContext, FinaleActModule } from '../finale-timeline';

const act06: FinaleActModule = {
  _cues: new Set<string>(),

  enter(ctx: FinaleActContext) {
    this._cues!.clear();
    ctx.balloons.partSideways();
    ctx.flowers.setWarmGlow(0.75);

    for (let i = 0; i < 65; i++) {
      const ang = (i / 65) * TAU;
      ctx.gold.spawnParticle({
        nx: cl(0.5 + Math.cos(ang) * 0.45, 0.05, 0.95),
        ny: cl(0.42 + Math.sin(ang) * 0.35, 0.08, 0.88),
        tx: 0.5,
        ty: 0.4,
        mode: 'converge',
        maxLife: 5.0
      });
    }
  },

  update(_dt: number, localT: number, _globalT: number, ctx: FinaleActContext) {
    const cues = this._cues!;
    if (localT >= 5 && !cues.has('andersonMask')) {
      cues.add('andersonMask');
      ctx.gold.setTypographicFormation('ANDERSON', {
        centerX: 0.5,
        centerY: 0.36,
        scaleW: 0.38,
        scaleH: 0.11,
        font: '700 84px "Cinzel", "Playfair Display", Georgia, serif',
        step: 3,
        maxPoints: 600
      });
    }

    if (localT >= 12 && !cues.has('sweep')) {
      cues.add('sweep');
      ctx.gold.triggerLightWave({ nx: 0.5, ny: 0.42, maxR: 0.72, duration: 1.5, maxAlpha: 0.22 });
    }

    if (localT >= 14.5 && !cues.has('titleHtml')) {
      cues.add('titleHtml');
      ctx.gold.releaseTypographicFormation();
      ctx.showText({
        lines: [
          { text: 'ANDERSON', variant: 'hero-name' },
          { text: '18 ANOS', variant: 'hero-sub' },
          { text: 'Uma nova fase. Muitas histórias pela frente.', variant: 'caption' }
        ],
        position: 'center'
      });
      for (let i = 0; i < 16; i++) {
        ctx.gold.spawnParticle({
          mode: 'orbit',
          tx: i % 2 === 0 ? 0.18 : 0.82,
          ty: 0.48,
          orbitR: 0.04 + rnd() * 0.05,
          orbitSpd: 1.4,
          maxLife: 7.5
        });
      }
    }
  },

  exit(ctx: FinaleActContext) {
    ctx.gold.releaseTypographicFormation();
    ctx.clearText();
  }
};

export default act06;
