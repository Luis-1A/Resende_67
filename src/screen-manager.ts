import { cl } from './utils';
import { settings } from './config/settings';
import type { ScreenBounds } from './types/app';

export const screenManager = {
  wl: null as WakeLockSentinel | null,
  running: false,
  W: 0,
  H: 0,
  cx: 0,
  u: 1,
  DPR: 1,
  _canvas: null as HTMLCanvasElement | null,
  _ctx: null as CanvasRenderingContext2D | null,
  _resizeListeners: new Set<(bounds: ScreenBounds) => void>(),
  _bound: false,

  init(canvas: HTMLCanvasElement): void {
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
          try { this.wl.release(); } catch (_e) {}
          this.wl = null;
        }
      });
    }
  },

  updateSize(): void {
    if (!this._canvas || !this._ctx) return;
    this.DPR = Math.min(devicePixelRatio || 1, settings.isMobile ? 1.15 : 1.5);
    this.W = innerWidth;
    this.H = innerHeight;
    this._canvas.width = this.W * this.DPR;
    this._canvas.height = this.H * this.DPR;
    this._ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    this.cx = this.W / 2;
    this.u = cl(Math.min(this.W, this.H) / 500, 0.78, 2);
    this._resizeListeners.forEach(fn => {
      try { fn(this.getBounds()); } catch (_e) {}
    });
  },

  getBounds(): ScreenBounds {
    return { W: this.W, H: this.H, cx: this.cx, u: this.u, DPR: this.DPR };
  },

  onResize(fn: (bounds: ScreenBounds) => void): () => void {
    this._resizeListeners.add(fn);
    return () => this._resizeListeners.delete(fn);
  },

  setRunning(v: boolean): void {
    this.running = Boolean(v);
  },

  async requestWakeLock(): Promise<boolean> {
    if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return false;
    try {
      if (this.wl && !this.wl.released) return true;
      this.wl = await navigator.wakeLock.request('screen');
      this.wl.addEventListener('release', () => { this.wl = null; });
      return true;
    } catch (_e) {
      this.wl = null;
      return false;
    }
  },

  async releaseWakeLock(): Promise<void> {
    this.running = false;
    try {
      if (this.wl) {
        await this.wl.release();
        this.wl = null;
      }
    } catch (_e) {
      this.wl = null;
    }
  }
};
