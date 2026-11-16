import { cl } from './utils.js';
import { settings } from './config/settings.js';

export const screenManager = {
  wl: null,
  running: false,
  W: 0,
  H: 0,
  cx: 0,
  u: 1,
  DPR: 1,
  _canvas: null,
  _ctx: null,
  _resizeListeners: new Set(),
  _bound: false,

  init(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this.updateSize();
    if (!this._bound) {
      this._bound = true;
      addEventListener('resize', () => this.updateSize());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.running) this.requestWakeLock();
      });
      addEventListener('pagehide', () => {
        if (this.wl) {
          try { this.wl.release(); } catch (e) {}
          this.wl = null;
        }
      });
    }
  },

  updateSize() {
    if (!this._canvas || !this._ctx) return;
    this.DPR = Math.min(devicePixelRatio || 1, settings.isMobile ? 1.25 : 1.6);
    this.W = innerWidth;
    this.H = innerHeight;
    this._canvas.width = this.W * this.DPR;
    this._canvas.height = this.H * this.DPR;
    this._ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    this.cx = this.W / 2;
    this.u = cl(Math.min(this.W, this.H) / 500, .78, 2);
    this._resizeListeners.forEach(fn => {
      try { fn(this.getBounds()); } catch (e) {}
    });
  },

  getBounds() {
    return { W: this.W, H: this.H, cx: this.cx, u: this.u, DPR: this.DPR };
  },

  onResize(fn) {
    this._resizeListeners.add(fn);
    return () => this._resizeListeners.delete(fn);
  },

  setRunning(v) {
    this.running = Boolean(v);
  },

  async requestWakeLock() {
    if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return false;
    try {
      if (this.wl && !this.wl.released) return true;
      this.wl = await navigator.wakeLock.request('screen');
      this.wl.addEventListener('release', () => { this.wl = null; });
      return true;
    } catch (e) {
      this.wl = null;
      return false;
    }
  },

  async releaseWakeLock() {
    this.running = false;
    try {
      if (this.wl) {
        await this.wl.release();
        this.wl = null;
      }
    } catch (e) {
      this.wl = null;
    }
  }
};
