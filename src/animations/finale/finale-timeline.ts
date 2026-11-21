import { FINALE_ACTS, FINALE_DURATION, type FinaleActMeta } from './config/finale-timing';
import type { finaleStars } from './effects/stars';
import type { finaleGoldenParticles } from './effects/golden-particles';
import type { finaleButterflies } from './effects/butterflies';
import type { finaleFlowers } from './effects/flowers';
import type { finalePetals } from './effects/petals';
import type { finaleFireworks } from './effects/fireworks';
import type { finaleBalloons } from './effects/balloons';
import type { finaleConfetti } from './effects/confetti';
import type { finaleLanterns } from './effects/lanterns';

export interface FinaleAtmosphereUpdate {
  skyColors?: string[];
  horizonGlow?: number;
  lightRays?: number;
  dim?: number;
  mistShift?: number;
}

export interface FinaleTextLine {
  text: string;
  variant?: string;
}

export interface FinaleActContext {
  stars: typeof finaleStars;
  gold: typeof finaleGoldenParticles;
  butterflies: typeof finaleButterflies;
  flowers: typeof finaleFlowers;
  petals: typeof finalePetals;
  fireworks: typeof finaleFireworks;
  balloons: typeof finaleBalloons;
  confetti: typeof finaleConfetti;
  lanterns: typeof finaleLanterns;
  setCameraZoom: (z: number) => void;
  setAtmosphere: (cfg: FinaleAtmosphereUpdate) => void;
  showText: (opts?: { lines?: FinaleTextLine[]; position?: string }) => void;
  shatterText: () => void;
  clearText: () => void;
}

export interface FinaleActModule {
  _cues?: Set<string>;
  enter?: (ctx: FinaleActContext, localT: number, globalT: number) => void;
  update?: (dt: number, localT: number, globalT: number, ctx: FinaleActContext) => void;
  exit?: (ctx: FinaleActContext, globalT: number) => void;
}

export interface RegisteredFinaleAct extends FinaleActMeta {
  mod?: FinaleActModule;
}

export const FINALE_SPEED_SCALE = 1.32;

export const finaleTimeline = {
  elapsed: 0,
  finished: false,
  _acts: [] as RegisteredFinaleAct[],
  _entered: new Set<number>(),
  _exited: new Set<number>(),
  _currentActId: 0,

  registerActs(actModules: Record<string, FinaleActModule>): void {
    this._acts = FINALE_ACTS.map(meta => ({
      ...meta,
      mod: actModules[meta.key]
    }));
  },

  reset(): void {
    this.elapsed = 0;
    this.finished = false;
    this._entered.clear();
    this._exited.clear();
    this._currentActId = 0;
  },

  step(dt: number, ctx: FinaleActContext): void {
    if (this.finished) return;
    const safeDt = Math.min(0.05, Math.max(0, dt)) * FINALE_SPEED_SCALE;
    this.elapsed = Math.min(FINALE_DURATION, this.elapsed + safeDt);
    const t = this.elapsed;

    for (const act of this._acts) {
      if (t >= act.start && !this._entered.has(act.id)) {
        this._entered.add(act.id);
        this._currentActId = act.id;
        if (act.mod && typeof act.mod.enter === 'function') {
          act.mod.enter(ctx, t - act.start, t);
        }
      }
      if (t >= act.start && t < act.end) {
        this._currentActId = act.id;
        if (act.mod && typeof act.mod.update === 'function') {
          act.mod.update(safeDt, t - act.start, t, ctx);
        }
      }
      if (t >= act.end && !this._exited.has(act.id)) {
        this._exited.add(act.id);
        if (act.mod && typeof act.mod.exit === 'function') {
          act.mod.exit(ctx, t);
        }
      }
    }

    if (t >= FINALE_DURATION) {
      this.finished = true;
    }
  },

  getCurrentAct(): RegisteredFinaleAct | null {
    return this._acts.find(a => a.id === this._currentActId) || this._acts[0] || null;
  }
};
