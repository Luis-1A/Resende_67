import { rnd } from '../../../utils';
import { FINALE_PALETTES } from '../config/finale-effects';
import type { FinaleActContext, FinaleActModule } from '../finale-timeline';

const act11: FinaleActModule = {
  _cues: new Set<string>(),

  enter(ctx: FinaleActContext) {
    this._cues!.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.softOutro,
      horizonGlow: 0.28,
      lightRays: 0.1
    });
    ctx.flowers.setWarmGlow(0.42);
  },

  update(_dt: number, localT: number, _globalT: number, ctx: FinaleActContext) {
    const cues = this._cues!;
    if (localT >= 5 && !cues.has('msg1')) {
      cues.add('msg1');
      ctx.showText({
        lines: [{ text: 'Que nunca te faltem motivos para sorrir.', variant: 'poetic' }],
        position: 'center-high'
      });
      [0.14, 0.2, 0.8, 0.86].forEach((nx, idx) => {
        ctx.flowers.addFlower({ nx, ny: 0.76 + (idx % 2) * 0.05, tier: 'small', delay: idx * 0.2, openDuration: 1.4 });
      });
      for (let i = 0; i < 30; i++) {
        ctx.gold.spawnParticle({
          nx: 0.22 + rnd() * 0.56,
          ny: 0.58 + rnd() * 0.18,
          vy: -0.045 - rnd() * 0.04,
          maxLife: 3.4
        });
      }
    }

    if (localT >= 10 && !cues.has('msg2')) {
      cues.add('msg2');
      ctx.gold.triggerLightWave({ nx: 0.5, ny: 0.45, maxR: 0.8, duration: 1.2, maxAlpha: 0.2 });
      ctx.showText({
        lines: [{ text: 'Que você tenha coragem para conquistar tudo aquilo que deseja.', variant: 'poetic' }],
        position: 'center-high'
      });
      ctx.butterflies.spawn({ p0: { x: 0, y: 0.68 }, p1: { x: 0.2, y: 0.4 }, p2: { x: 0.14, y: 0.12 }, duration: 7.5 });
      ctx.butterflies.spawn({ p0: { x: 1, y: 0.68 }, p1: { x: 0.8, y: 0.4 }, p2: { x: 0.86, y: 0.12 }, duration: 7.5 });
    }

    if (localT >= 15 && !cues.has('msg3')) {
      cues.add('msg3');
      ctx.showText({
        lines: [{ text: 'E que ainda existam muitas histórias para a gente contar.', variant: 'poetic' }],
        position: 'center-high'
      });
      ctx.gold.addConnectingLine({
        kind: 'heart',
        x1: 0.5,
        y1: 0.58,
        duration: 1.2,
        hold: 4.8,
        pulseAt: [1.7, 3.1]
      });
    }
  },

  exit(ctx: FinaleActContext) {
    ctx.clearText();
  }
};

export default act11;
