import { FINALE_PALETTES } from '../config/finale-effects.js';

export default {
  _cues: new Set(),

  enter(ctx) {
    this._cues.clear();
    ctx.gold.clearTypographicFormation();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.partyWarm,
      horizonGlow: 0.42,
      lightRays: 0.16
    });

    ctx.balloons.spawnBalloons(12);
    ctx.confetti.spawnWave(50);

    // Festive flowers sprouting from the garden floor
    const ringXs = [0.22, 0.36, 0.5, 0.64, 0.78];
    ringXs.forEach((nx, i) => {
      ctx.flowers.addFlower({
        nx,
        ny: i === 2 ? 0.74 : 0.77 + (i % 2) * 0.04,
        tier: i === 2 ? 'large' : 'mid',
        scale: i === 2 ? 1.0 : 0.92,
        delay: 0.35 + i * 0.25,
        openDuration: 2.1
      });
    });
  },

  update(dt, localT, _globalT, ctx) {
    // Party text appears in upper-center zone (well separated from balloons & flowers)
    if (localT >= 2.2 && !this._cues.has('partyText')) {
      this._cues.add('partyText');
      ctx.showText({
        lines: [
          {
            text: 'Hoje a comemoração é sua. Aproveita, porque essa festa foi preparada especialmente para você.',
            variant: 'poetic'
          }
        ],
        position: 'upper'
      });
    }

    // Second wave of confetti
    if (localT >= 6.5 && !this._cues.has('confetti2')) {
      this._cues.add('confetti2');
      ctx.confetti.spawnWave(50);
      ctx.lanterns.spawnLanterns(6);
    }

    if (localT >= 22.5 && !this._cues.has('fadeText')) {
      this._cues.add('fadeText');
      ctx.clearText();
    }
  }
};
