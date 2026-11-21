import { cl, ez, L } from '../../../utils';
import { FINALE_PALETTES } from '../config/finale-effects';
import type { FinaleActContext, FinaleActModule } from '../finale-timeline';

const act07: FinaleActModule = {
  _cues: new Set<string>(),

  enter(ctx: FinaleActContext) {
    this._cues!.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.sunset,
      horizonGlow: 0.62,
      lightRays: 0.22,
      mistShift: 1
    });

    ctx.gold.addConnectingLine({
      x1: 0.28,
      y1: 0.50,
      x2: 0.72,
      y2: 0.50,
      duration: 1.5,
      hold: 23
    });

    ctx.butterflies.spawn({ p0: { x: 0, y: 0.76 }, p1: { x: 0.16, y: 0.45 }, p2: { x: 0.12, y: 0.12 }, duration: 11 });
    ctx.butterflies.spawn({ p0: { x: 1, y: 0.78 }, p1: { x: 0.84, y: 0.48 }, p2: { x: 0.88, y: 0.14 }, duration: 11 });
  },

  update(_dt: number, localT: number, _globalT: number, ctx: FinaleActContext) {
    const cues = this._cues!;
    if (localT < 2.5) {
      ctx.flowers.setWarmGlow(L(0.32, 0.82, ez(cl(localT / 2.5))));
    }

    if (localT >= 3.5 && !cues.has('t1')) {
      cues.add('t1');
      ctx.showText({
        lines: [{ text: 'Engraçado pensar que tudo começou em uma partida de Free Fire.', variant: 'poetic' }],
        position: 'upper'
      });
    }

    if (localT >= 11.5 && !cues.has('t2')) {
      cues.add('t2');
      ctx.showText({
        lines: [{ text: 'Uma amizade que começou por acaso e acabou ganhando seu próprio espaço na minha vida.', variant: 'poetic' }],
        position: 'upper'
      });
    }

    if (localT >= 22.5 && !cues.has('fade')) {
      cues.add('fade');
      ctx.clearText();
    }
  }
};

export default act07;
