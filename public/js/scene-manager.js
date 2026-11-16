import { scenesConfig } from './config/scenes.config.js';
import { settings } from './config/settings.js';
import { cl } from './utils.js';
import { animationManager } from './animation-manager.js';
import { screenManager } from './screen-manager.js';
import { audioManager } from './audio-manager.js';

export const sceneManager = {
  sc: -1,
  t0: 0,
  R: 0,
  sceneDef: null,
  tm: [],
  endT: 0,
  shown: -1,
  trans: null,
  exiting: null,
  fin: false,
  _sceneCache: new Map(),
  _dom: null,
  _loadingToken: 0,

  init(dom) {
    this._dom = dom;
  },

  async _getSceneModule(index) {
    const cfg = scenesConfig[index];
    if (!cfg) return null;
    if (this._sceneCache.has(index)) return this._sceneCache.get(index);
    const ns = await import(`./scenes/${cfg.file}`);
    const def = ns.default || Object.values(ns)[0];
    this._sceneCache.set(index, def);
    return def;
  },

  async load(index, globalTime) {
    if (index < 0 || index >= scenesConfig.length) return;
    const token = ++this._loadingToken;
    this.sc = index;
    this.t0 = globalTime;
    this.shown = -1;
    this.fin = false;
    this.exiting = null;

    const def = await this._getSceneModule(index);
    if (token !== this._loadingToken || !def) return;
    this.sceneDef = def;

    const { tx, card, nx } = this._dom;
    tx.innerHTML = '';
    (def.texts || []).forEach(a => {
      const d = document.createElement('div');
      d.className = 'b ' + a[1];
      d.textContent = a[0];
      tx.appendChild(d);
    });

    let acc = def.textStartDelay ?? 1.8;
    this.tm = (def.texts || []).map(a => {
      const t = acc;
      acc += Math.max(3.6, 2.0 + a[0].length * .048);
      return t;
    });
    this.endT = acc + 3.5;

    card.className = def.darkCard ? 'dk' : '';
    card.scrollTop = 0;
    card.innerHTML = '';

    nx.textContent = 'continuar ›';
    nx.classList.remove('on');

    audioManager.playScene(index);

    const anims = typeof def.getAnimations === 'function' ? def.getAnimations() : [];
    await animationManager.activateScene(anims);

    // Preload next scene lazily after current scene settles
    const nextCfg = scenesConfig[index + 1];
    if (nextCfg) {
      this._getSceneModule(index + 1).catch(() => {});
    }
  },

  requestExit() {
    if (this.trans || this.sc < 0 || this.sc >= scenesConfig.length - 1) return;
    const def = this.sceneDef;
    if (def && def.exitDuration && !this.exiting) {
      this.exiting = { t: this.R, dur: def.exitDuration };
      this._dom.card.classList.remove('on');
      this._dom.nx.classList.remove('on');
      if (def.exitAnimation) {
        animationManager.notify(def.exitAnimation, 'startExit', this.R);
      }
      return;
    }
    this._startTransition(this.sc + 1);
  },

  _startTransition(targetIndex) {
    const cfg = scenesConfig[this.sc] || scenesConfig[0];
    this.trans = { t: 0, sw: 0, to: targetIndex, c: cfg.transitionColor };
    this._dom.tx.innerHTML = '';
    this._dom.card.classList.remove('on');
    this._dom.nx.classList.remove('on');
  },

  handleContinueClick() {
    if (this.sceneDef && typeof this.sceneDef.onContinue === 'function') {
      const handled = this.sceneDef.onContinue({
        sceneManager: this,
        animationManager,
        dom: this._dom
      });
      if (handled) return;
    }
    this.requestExit();
  },

  handlePointerMove(e) {
    if (this.sceneDef && typeof this.sceneDef.onPointerMove === 'function') {
      this.sceneDef.onPointerMove(e, { animationManager, screenManager, dom: this._dom });
    } else if (this._dom && this._dom.canvas) {
      this._dom.canvas.style.cursor = 'default';
    }
  },

  handlePointerDown(e) {
    if (this.sceneDef && typeof this.sceneDef.onPointerDown === 'function') {
      this.sceneDef.onPointerDown(e, { animationManager, screenManager, sceneManager: this, dom: this._dom });
    }
  },

  finish() {
    if (this.fin) return;
    this.fin = true;
    screenManager.releaseWakeLock();
    const d = document.createElement('div');
    d.className = 'b mid name on';
    d.textContent = 'ANDERSON';
    d.style.fontSize = 'clamp(22px,6vw,40px)';
    d.style.opacity = '.72';
    this._dom.tx.appendChild(d);
  },

  tick(dt, R) {
    this.R = R;
    const bounds = screenManager.getBounds();

    if (this.trans) {
      this.trans.t += dt;
      if (!this.trans.sw && this.trans.t >= 1) {
        this.trans.sw = 1;
        this.load(this.trans.to, R);
      }
    }

    const env = {
      ...bounds,
      sc: this.sc,
      R,
      t0: this.t0,
      sceneElapsed: R - this.t0,
      exiting: this.exiting,
      tm: this.tm,
      fin: this.fin,
      RM: settings.reducedMotion
    };

    animationManager.update(dt, env);
    animationManager.render(this._dom.ctx, env);

    if (this.trans) {
      const a = this.trans.t < 1 ? this.trans.t : 2 - this.trans.t;
      this._dom.ctx.fillStyle = `rgba(${this.trans.c},${cl(a)})`;
      this._dom.ctx.fillRect(0, 0, bounds.W, bounds.H);
      if (this.trans.t >= 2) this.trans = null;
    }

    if (!this.trans) this._updateUi();
  },

  _updateUi() {
    const def = this.sceneDef;
    if (!def) return;

    if (this.exiting) {
      if (this.R - this.exiting.t >= this.exiting.dur) {
        const nextIdx = this.sc + 1;
        const cfg = scenesConfig[this.sc] || scenesConfig[0];
        this.exiting = null;
        this.trans = { t: 1, sw: 1, to: nextIdx, c: cfg.transitionColor };
        this.load(nextIdx, this.R);
      }
      return;
    }

    const st = this.R - this.t0;
    let cur = -1;
    this.tm.forEach((t, i) => { if (st >= t) cur = i; });
    if (cur !== this.shown) {
      this.shown = cur;
      const windowSize = def.textWindow ?? 2;
      [...this._dom.tx.children].forEach((d, i) => d.classList.toggle('on', i <= cur && i > cur - windowSize));
    }

    if (def.hasCard) {
      if (typeof def.updateUi === 'function') {
        def.updateUi(st, { animationManager, dom: this._dom, settings });
      }
      if (!def.manualContinue && st > settings.cardContinueDelay) {
        this._dom.nx.classList.add('on');
      }
    } else if (this.tm.length && st > this.tm[this.tm.length - 1] + 2.2) {
      this._dom.nx.classList.add('on');
    }

    if (!def.hasCard && def.autoAdvance !== false && st > this.endT && !this.trans) {
      this.requestExit();
    }
  }
};
