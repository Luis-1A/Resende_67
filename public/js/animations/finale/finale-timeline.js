import { FINALE_ACTS, FINALE_DURATION } from './config/finale-timing.js';

export const finaleTimeline = {
  elapsed: 0,
  finished: false,
  _acts: [],
  _entered: new Set(),
  _exited: new Set(),
  _currentActId: 0,

  registerActs(actModules) {
    this._acts = FINALE_ACTS.map(meta => ({
      ...meta,
      mod: actModules[meta.key]
    }));
  },

  reset() {
    this.elapsed = 0;
    this.finished = false;
    this._entered.clear();
    this._exited.clear();
    this._currentActId = 0;
  },

  step(dt, ctx) {
    if (this.finished) return;
    // Clamp step to avoid catch-up spikes after tab pause or hiccups
    const safeDt = Math.min(0.05, Math.max(0, dt));
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

  getCurrentAct() {
    return this._acts.find(a => a.id === this._currentActId) || this._acts[0] || null;
  }
};
