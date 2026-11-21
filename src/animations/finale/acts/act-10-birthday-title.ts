import { rnd } from '../../../utils';
import { ACT10_FIREWORK_CUES, FINALE_PALETTES } from '../config/finale-effects';
import type { FinaleActContext, FinaleActModule } from '../finale-timeline';

const act10: FinaleActModule = {
  _cues: new Set<string>(),

  enter(ctx: FinaleActContext) {
    this._cues!.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.deepNight,
      horizonGlow: 0.28,
      lightRays: 0.14,
      dim: 0.2
    });

    ctx.gold.setTypographicFormation('FELIZ', {
      centerX: 0.5,
      centerY: 0.26,
      scaleW: 0.28,
      scaleH: 0.09,
      font: '700 90px "Cinzel", "Playfair Display", Georgia, serif',
      step: 4,
      maxPoints: 400
    });
  },

  update(_dt: number, localT: number, globalT: number, ctx: FinaleActContext) {
    const cues = this._cues!;
    if (localT >= 2.2 && !cues.has('felizHtml')) {
      cues.add('felizHtml');
      ctx.gold.releaseTypographicFormation();
      ctx.showText({
        lines: [
          { text: 'FELIZ', variant: 'grand-kicker' },
          { text: 'ANIVERSÁRIO!', variant: 'grand-title hidden' },
          { text: 'ANDERSON!', variant: 'grand-name hidden' }
        ],
        position: 'center'
      });
    }

    if (localT >= 4.2 && !cues.has('aniversario')) {
      cues.add('aniversario');
      ctx.gold.triggerLightWave({ nx: 0.5, ny: 0.48, maxR: 0.9, duration: 1.4, maxAlpha: 0.18 });
      ctx.showText({
        lines: [
          { text: 'FELIZ', variant: 'grand-kicker' },
          { text: 'ANIVERSÁRIO!', variant: 'grand-title' },
          { text: 'ANDERSON!', variant: 'grand-name hidden' }
        ],
        position: 'center'
      });
    }

    if (localT >= 9.0 && !cues.has('anderson')) {
      cues.add('anderson');
      ctx.showText({
        lines: [
          { text: 'FELIZ', variant: 'grand-kicker' },
          { text: 'ANIVERSÁRIO!', variant: 'grand-title' },
          { text: 'ANDERSON!', variant: 'grand-name' }
        ],
        position: 'center'
      });
      for (let i = 0; i < 12; i++) {
        ctx.gold.spawnParticle({
          mode: 'orbit',
          tx: i % 2 === 0 ? 0.14 : 0.86,
          ty: 0.62,
          orbitR: 0.035 + rnd() * 0.04,
          maxLife: 10
        });
      }
    }

    for (let i = 0; i < ACT10_FIREWORK_CUES.length; i++) {
      const cue = ACT10_FIREWORK_CUES[i];
      const key = `a10fw_${i}`;
      if (globalT >= cue.at - 0.95 && !cues.has(key)) {
        cues.add(key);
        ctx.fireworks.launch({ nx: cue.x, ny: cue.y, type: cue.type, size: cue.size });
      }
    }

    if (localT >= 13 && !cues.has('celebration')) {
      cues.add('celebration');
      ctx.flowers.setWarmGlow(0.85);
      ctx.petals.spawnWave({ count: 32, mode: 'top' });
      ctx.butterflies.spawn({ p0: { x: 0.02, y: 0.85 }, p1: { x: 0.14, y: 0.44 }, p2: { x: 0.24, y: 0.12 }, duration: 9 });
      ctx.butterflies.spawn({ p0: { x: 0.98, y: 0.85 }, p1: { x: 0.86, y: 0.44 }, p2: { x: 0.76, y: 0.12 }, duration: 9 });
    }
  },

  exit(ctx: FinaleActContext) {
    ctx.setAtmosphere({ dim: 0 });
    ctx.clearText();
  }
};

export default act10;
