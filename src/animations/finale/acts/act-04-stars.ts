import { cl, rnd, TAU } from '../../../utils';
import type { FinaleActContext, FinaleActModule } from '../finale-timeline';

const act04: FinaleActModule = {
  _cues: new Set<string>(),

  enter(ctx: FinaleActContext) {
    this._cues!.clear();
    ctx.stars.ensureCount(85);
    ctx.stars.setDensity(1);
    ctx.flowers.setWarmGlow(0.32);
  },

  update(_dt: number, localT: number, _globalT: number, ctx: FinaleActContext) {
    const cues = this._cues!;
    const shootTimes = [5.1, 5.55, 6.2, 6.6, 7.25, 7.8, 8.5, 9.15];
    shootTimes.forEach((st, idx) => {
      const key = `sh_${idx}`;
      if (localT >= st && !cues.has(key)) {
        cues.add(key);
        ctx.stars.spawnShootingStar({
          fromLeft: idx % 2 === 0,
          dur: 0.6 + rnd() * 0.55,
          trailLen: 48 + rnd() * 52
        });
      }
    });

    if (localT >= 10 && !cues.has('gather')) {
      cues.add('gather');
      ctx.stars.setCenterStar({ visible: true, nx: 0.5, ny: 0.34, size: 7, alpha: 0.95 });
      for (let i = 0; i < 180; i++) {
        const ang = (i / 180) * TAU + rnd() * 0.4;
        const dist = 0.25 + rnd() * 0.3;
        ctx.gold.spawnParticle({
          nx: cl(0.5 + Math.cos(ang) * dist, 0.04, 0.96),
          ny: cl(0.34 + Math.sin(ang) * dist * 0.7, 0.04, 0.72),
          tx: 0.5,
          ty: 0.34,
          mode: 'converge',
          maxLife: 4.8,
          size0: 1.8 + rnd() * 1.4
        });
      }
    }

    if (localT >= 15 && !cues.has('form18')) {
      cues.add('form18');
      ctx.stars.setCenterStar({ visible: false });
      ctx.gold.setTypographicFormation('18', {
        centerX: 0.5,
        centerY: 0.36,
        scaleW: 0.19,
        scaleH: 0.14,
        font: '700 124px "Cinzel", "Playfair Display", Georgia, serif',
        maxPoints: 260
      });
      ctx.gold.triggerLightWave({ nx: 0.5, ny: 0.36, maxR: 0.55, duration: 1.4, maxAlpha: 0.22 });
    }

    if (localT >= 18.0 && !cues.has('release18')) {
      cues.add('release18');
      ctx.gold.releaseTypographicFormation();
    }
  }
};

export default act04;
