import { scenesConfig } from './config/scenes.config';
import { settings } from './config/settings';
import { animationManager } from './animation-manager';
import { canvasManager } from './visual-engine/canvas-manager';
import { transitionSystem } from './visual-engine/transition-system';
import { screenManager } from './screen-manager';
import { audioManager } from './audio-manager';
import { endingSequence } from './ending-sequence';
import type { DomRefs, RenderEnv, SceneDefinition, SceneExitState } from './types/app';

type SceneModuleExports = { default?: SceneDefinition } & Record<string, SceneDefinition>;
const sceneLoaders = import.meta.glob<SceneModuleExports>('./scenes/*.ts');

export const sceneManager = {
  sc: -1,
  t0: 0,
  R: 0,
  sceneDef: null as SceneDefinition | null,
  tm: [] as number[],
  endT: 0,
  shown: -1,
  exiting: null as SceneExitState | null,
  fin: false,
  _sceneCache: new Map<number, SceneDefinition>(),
  _dom: null as DomRefs | null,
  _loadingToken: 0,

  init(dom: DomRefs): void {
    this._dom = dom;
  },

  async _getSceneModule(index: number): Promise<SceneDefinition | null> {
    const cfg = scenesConfig[index];
    if (!cfg) return null;
    const cached = this._sceneCache.get(index);
    if (cached) return cached;
    const key = `./scenes/${cfg.file.replace(/\.js$/, '.ts')}`;
    const loader = sceneLoaders[key];
    if (!loader) throw new Error(`Missing scene module "${key}"`);
    const ns = await loader();
    const def = ns.default || Object.values(ns)[0];
    this._sceneCache.set(index, def);
    return def;
  },

  async load(index: number, globalTime: number): Promise<void> {
    if (index < 0 || index >= scenesConfig.length) return;
    const token = ++this._loadingToken;
    this.sc = index;
    this.t0 = globalTime;
    this.shown = -1;
    this.fin = false;
    this.exiting = null;

    const def = await this._getSceneModule(index);
    if (token !== this._loadingToken || !def || !this._dom) return;
    this.sceneDef = def;

    const { tx, card, nx } = this._dom;
    tx.innerHTML = '';
    (def.texts || []).forEach(a => {
      const d = document.createElement('div');
      d.className = 'b scene-fade-ready ' + a[1];
      d.textContent = a[0];
      tx.appendChild(d);
    });

    let acc = def.textStartDelay ?? 1.8;
    this.tm = (def.texts || []).map(a => {
      const t = acc;
      acc += Math.max(3.6, 2.0 + a[0].length * 0.048);
      return t;
    });
    this.endT = acc + 3.5;

    card.className = def.darkCard ? 'dk' : '';
    card.scrollTop = 0;
    card.innerHTML = '';

    nx.textContent = 'continuar ›';
    nx.classList.remove('on');

    audioManager.playScene();

    const visualCfg = typeof def.getVisualConfig === 'function' ? def.getVisualConfig() : {};
    await canvasManager.configureScene(visualCfg);

    const anims = typeof def.getAnimations === 'function' ? def.getAnimations() : [];
    await animationManager.activateScene(anims);

    const nextCfg = scenesConfig[index + 1];
    if (nextCfg) {
      this._getSceneModule(index + 1).then(nextDef => {
        if (!nextDef) return;
        const nextAnims = typeof nextDef.getAnimations === 'function' ? nextDef.getAnimations() : [];
        const animNames = nextAnims.map(req => (typeof req === 'string' ? req : req.name)).filter(Boolean);
        if (animNames.length) animationManager.preload(animNames).catch(() => {});
        const nextVisual = typeof nextDef.getVisualConfig === 'function' ? nextDef.getVisualConfig() : null;
        if (nextVisual) canvasManager.preloadScene(nextVisual).catch(() => {});
      }).catch(() => {});
    }
  },

  requestExit(): void {
    if (transitionSystem.isActive() || this.sc < 0 || this.sc >= scenesConfig.length - 1 || !this._dom) return;
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

  _startTransition(targetIndex: number): void {
    if (!this._dom) return;
    const cfg = scenesConfig[this.sc] || scenesConfig[0];
    const type = (this.sceneDef && this.sceneDef.transitionType) || 'darkFade';
    this._dom.tx.innerHTML = '';
    this._dom.card.classList.remove('on');
    this._dom.nx.classList.remove('on');
    transitionSystem.start({
      type,
      color: cfg.transitionColor,
      duration: 2.0,
      onMidpoint: () => this.load(targetIndex, this.R)
    });
  },

  handleContinueClick(): void {
    if (!this._dom) return;
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

  handlePointerMove(e: PointerEvent): void {
    if (!this._dom) return;
    if (this.sceneDef && typeof this.sceneDef.onPointerMove === 'function') {
      this.sceneDef.onPointerMove(e, { animationManager, screenManager, dom: this._dom });
    } else if (this._dom.canvas) {
      this._dom.canvas.style.cursor = 'default';
    }
  },

  handlePointerDown(e: PointerEvent): void {
    if (!this._dom) return;
    if (this.sceneDef && typeof this.sceneDef.onPointerDown === 'function') {
      this.sceneDef.onPointerDown(e, { animationManager, screenManager, sceneManager: this, dom: this._dom });
    }
  },

  finish(): void {
    if (this.fin) return;
    this.fin = true;
    screenManager.releaseWakeLock();
    if (this._dom) {
      const hasClosingLine =
        this.sc === scenesConfig.length - 1 &&
        Boolean(this._dom.tx.querySelector('.finale-line.closing, .finale-line.closing-birthday'));
      if (!hasClosingLine) {
        const d = document.createElement('div');
        d.className = 'b mid name on';
        d.textContent = 'ANDERSON';
        d.style.fontSize = 'clamp(22px,6vw,40px)';
        d.style.opacity = '.72';
        this._dom.tx.appendChild(d);
      }
      endingSequence.start({ dom: this._dom });
    }
  },

  tick(_dt: number, R: number): RenderEnv {
    this.R = R;
    const bounds = screenManager.getBounds();

    if (!transitionSystem.isActive()) {
      this._updateUi();
    }

    return {
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
  },

  _updateUi(): void {
    const def = this.sceneDef;
    if (!def || !this._dom) return;

    if (this.exiting) {
      if (this.R - this.exiting.t >= this.exiting.dur) {
        const nextIdx = this.sc + 1;
        const cfg = scenesConfig[this.sc] || scenesConfig[0];
        this.exiting = null;
        transitionSystem.start({
          type: def.transitionType || 'darkFade',
          color: cfg.transitionColor,
          duration: 2.0,
          startT: 1.0,
          swapped: true
        });
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
    }

    if (typeof def.shouldAutoAdvance === 'function' && def.shouldAutoAdvance({ animationManager, sceneElapsed: st }) && !transitionSystem.isActive()) {
      this.requestExit();
      return;
    }

    if (!def.hasCard && def.autoAdvance !== false && st > this.endT && !transitionSystem.isActive()) {
      this.requestExit();
    }
  }
};
