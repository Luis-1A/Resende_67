import { cl, ez, L } from '../../../utils.js';
import { FINALE_PALETTES } from '../config/finale-effects.js';

export default {
  _cues: new Set(),

  enter(ctx) {
    this._cues.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.sunset,
      horizonGlow: 0.62,
      lightRays: 0.22,
      mistShift: 1
    });

    // Two friendship stars connected by 1.5s golden particle arc
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

  update(dt, localT, _globalT, ctx) {
    if (localT < 2.5) {
      ctx.flowers.setWarmGlow(L(0.32, 0.82, ez(cl(localT / 2.5))));
    }

    if (localT >= 3.5 && !this._cues.has('t1')) {
      this._cues.add('t1');
      ctx.showText({
        lines: [{ text: 'Engraçado pensar que tudo começou em uma partida de Free Fire.', variant: 'poetic' }],
        position: 'upper'
      });
    }

    if (localT >= 11.5 && !this._cues.has('t2')) {
      this._cues.add('t2');
      ctx.showText({
        lines: [{ text: 'Uma amizade que começou por acaso e acabou ganhando seu próprio espaço na minha vida.', variant: 'poetic' }],
        position: 'upper'
      });
    }

    if (localT >= 22.5 && !this._cues.has('fade')) {
      this._cues.add('fade');
      ctx.clearText();
    }
  }
};
