import { cl, ez, glow, G, CG, TAU } from '../utils.js';

export const transitionSystem = {
  active: null,

  start({ type = 'darkFade', color = '7,12,30', duration = 2, startT = 0, swapped = false, onMidpoint = null }) {
    this.active = {
      type,
      color,
      duration,
      t: startT,
      swapped,
      onMidpoint
    };
  },

  isActive() {
    return this.active !== null;
  },

  update(dt) {
    if (!this.active) return;
    this.active.t += dt;
    const half = this.active.duration * 0.5;
    if (!this.active.swapped && this.active.t >= half) {
      this.active.swapped = true;
      if (typeof this.active.onMidpoint === 'function') this.active.onMidpoint();
    }
    if (this.active.t >= this.active.duration) {
      this.active = null;
    }
  },

  render(x, env) {
    if (!this.active) return;
    const { W, H, cx, u } = env;
    const { t, duration, color, type } = this.active;
    const half = duration * 0.5;
    const norm = t < half ? cl(t / half) : cl(1 - (t - half) / half);
    const eased = ez(norm);

    if (type === 'lightBloom') {
      x.globalCompositeOperation = 'lighter';
      glow(x, cx, H * 0.5, Math.max(W, H) * (0.35 + eased * 0.9), eased * 0.85, G);
      x.globalCompositeOperation = 'source-over';
      x.fillStyle = `rgba(${color},${cl(eased * 0.85)})`;
      x.fillRect(0, 0, W, H);
    } else if (type === 'mistSweep') {
      x.fillStyle = `rgba(${color},${cl(eased * 0.82)})`;
      x.fillRect(0, 0, W, H);
      x.globalAlpha = eased * 0.55;
      x.drawImage(CG, -W * 0.2 + (t / duration) * W * 0.4, H * 0.15, W * 1.4, H * 0.7);
      x.globalAlpha = 1;
    } else if (type === 'petalCurtain') {
      x.fillStyle = `rgba(${color},${cl(eased * 0.9)})`;
      x.fillRect(0, 0, W, H);
      x.fillStyle = `rgba(255,244,235,${eased * 0.55})`;
      for (let i = 0; i < 10; i++) {
        const px = W * ((i / 9) * 0.9 + 0.05);
        const py = H * ((i * 0.17 + (t / duration)) % 1);
        x.beginPath(); x.ellipse(px, py, 6 * u, 3 * u, i + t * 2, 0, TAU); x.fill();
      }
    } else if (type === 'starConverge') {
      x.fillStyle = `rgba(${color},${cl(eased)})`;
      x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + t * 0.6;
        const dist = Math.min(W, H) * 0.38 * (1 - eased);
        glow(x, cx + Math.cos(a) * dist, H * 0.5 + Math.sin(a) * dist, 16 * u, eased * 0.7);
      }
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 1;
    } else {
      x.fillStyle = `rgba(${color},${cl(norm)})`;
      x.fillRect(0, 0, W, H);
    }
  },

  clear() {
    this.active = null;
  }
};
