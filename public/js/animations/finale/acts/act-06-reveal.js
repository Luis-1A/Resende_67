import { cl, rnd, TAU } from '../../../utils.js';

export default {
  _cues: new Set(),

  enter(ctx) {
    this._cues.clear();
    ctx.balloons.partSideways();
    ctx.flowers.setWarmGlow(0.75);

    // Converging background particles
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

  update(dt, localT, _globalT, ctx) {
    // 02:00 - 02:07: 600 particles form ANDERSON contour
    if (localT >= 5 && !this._cues.has('andersonMask')) {
      this._cues.add('andersonMask');
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

    // 02:07 - 02:12: light wave across name
    if (localT >= 12 && !this._cues.has('sweep')) {
      this._cues.add('sweep');
      ctx.gold.triggerLightWave({ nx: 0.5, ny: 0.42, maxR: 0.72, duration: 1.5, maxAlpha: 0.22 });
    }

    // 02:12 - 02:20: disperse bright particle mask smoothly and reveal crisp HTML title
    if (localT >= 14.5 && !this._cues.has('titleHtml')) {
      this._cues.add('titleHtml');
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

  exit(ctx) {
    ctx.gold.releaseTypographicFormation();
    ctx.clearText();
  }
};
