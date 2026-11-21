import { cl, ez, L, rnd } from '../../../utils';
import { FINALE_PALETTES } from '../config/finale-effects';
import type { FinaleActContext, FinaleActModule } from '../finale-timeline';

const act02: FinaleActModule = {
  _cues: new Set<string>(),

  enter(ctx: FinaleActContext) {
    this._cues!.clear();
    ctx.setAtmosphere({
      skyColors: FINALE_PALETTES.gardenGlow,
      horizonGlow: 0.34,
      lightRays: 0.16,
      dim: 0
    });

    for (let i = 0; i < 12; i++) {
      ctx.flowers.addFlower({
        nx: 0.05 + (i / 11) * 0.9 + (rnd() - 0.5) * 0.03,
        ny: 0.8 + rnd() * 0.05,
        tier: 'small',
        scale: 0.85 + rnd() * 0.3,
        delay: i * 0.14,
        openDuration: 1.2 + rnd() * 0.6
      });
    }
    ctx.gold.spawnFireflies(80);
  },

  update(_dt: number, localT: number, _globalT: number, ctx: FinaleActContext) {
    const cues = this._cues!;
    if (localT >= 5 && !cues.has('midFlowers')) {
      cues.add('midFlowers');
      const xs = [0.15, 0.28, 0.42, 0.60, 0.76, 0.88];
      xs.forEach((nx, i) => {
        ctx.flowers.addFlower({
          nx,
          ny: 0.74 + (i % 2) * 0.08 + rnd() * 0.05,
          tier: 'mid',
          scale: 0.95 + (i % 3) * 0.12,
          delay: i * 0.35,
          openDuration: 1.5,
          onOpened: fl => {
            for (let p = 0; p < 8; p++) {
              ctx.gold.spawnParticle({
                nx: fl.nx + (rnd() - 0.5) * 0.03,
                ny: fl.ny - 0.03,
                vx: (rnd() - 0.5) * 0.04,
                vy: -0.04 - rnd() * 0.05,
                maxLife: 2.0 + rnd() * 1.2
              });
            }
          }
        });
      });
    }

    if (localT >= 10 && !cues.has('butterflies')) {
      cues.add('butterflies');
      ctx.butterflies.spawn({ p0: { x: 0, y: 0.75 }, p1: { x: 0.45, y: 0.48 }, p2: { x: 1, y: 0.15 }, duration: 8, nearCamera: true });
      ctx.butterflies.spawn({ p0: { x: 0, y: 0.62 }, p1: { x: 0.38, y: 0.36 }, p2: { x: 1, y: 0.26 }, duration: 9.5, colorA: '#FFE6C4', colorB: '#FFB3D9' });
      ctx.butterflies.spawn({ p0: { x: 1, y: 0.80 }, p1: { x: 0.58, y: 0.65 }, p2: { x: 0, y: 0.28 }, duration: 10 });
      ctx.butterflies.spawn({ p0: { x: 1, y: 0.58 }, p1: { x: 0.52, y: 0.34 }, p2: { x: 0, y: 0.18 }, duration: 9, colorA: '#E5F0FF', colorB: '#FFD39E' });
      ctx.butterflies.spawn({ p0: { x: 0.5, y: 1.02 }, p1: { x: 0.42, y: 0.56 }, p2: { x: 0.72, y: 0.12 }, duration: 8.5, nearCamera: true });
    }

    if (localT >= 15 && !cues.has('petals')) {
      cues.add('petals');
      ctx.petals.spawnWave({ count: 35, mode: 'top' });
    }

    if (localT >= 20) {
      const k = ez(cl((localT - 20) / 5));
      ctx.setCameraZoom(L(1, 1.08, k));
      ctx.flowers.setWarmGlow(L(0.2, 0.75, k));
      ctx.setAtmosphere({ horizonGlow: L(0.34, 0.58, k) });
    }
  }
};

export default act02;
