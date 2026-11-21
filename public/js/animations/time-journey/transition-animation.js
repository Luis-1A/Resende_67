import { cl, ez, L, glow, G, TAU } from '../../utils.js';

export const transitionAnimation = {
  _openProgress: 0,
  _bloomFill: 0,

  init() {
    this._openProgress = 0;
    this._bloomFill = 0;
  },

  setPortalState(openProgress, bloomFill = 0) {
    this._openProgress = cl(openProgress);
    this._bloomFill = cl(bloomFill);
  },

  render(x, env) {
    const { W, H, cx, u } = env;
    if (this._openProgress <= 0.01 && this._bloomFill <= 0.01) return;

    const k = ez(this._openProgress);
    const py = H * 0.54;
    const minDim = Math.min(W, H);
    const rx = L(minDim * 0.04, minDim * 0.34, k);
    const ry = L(minDim * 0.05, minDim * 0.44, k);

    x.save();
    x.globalCompositeOperation = 'lighter';

    // Central portal glow widening as edges open
    glow(x, cx, py, Math.max(rx, 16 * u) * 1.9, 0.38 + 0.45 * k, G);

    // Floral arch silhouette glow framing the portal opening
    const archPts = 14;
    for (let i = 0; i < archPts; i++) {
      const ang = L(-Math.PI * 0.92, Math.PI * 0.08, i / (archPts - 1)) - Math.PI * 0.08;
      const fx = cx + Math.cos(ang) * rx;
      const fy = py + Math.sin(ang) * ry;
      glow(x, fx, fy, (16 + 14 * k) * u, 0.45 + 0.35 * k, G);
      x.globalAlpha = 0.72 * k;
      x.fillStyle = i % 2 === 0 ? '#FFF8F4' : '#FFE4F0';
      x.beginPath();
      x.arc(fx, fy, (4.5 + 3 * k) * u, 0, TAU);
      x.fill();
    }

    // Progressive portal rim separating outward
    x.strokeStyle = `rgba(255,242,200,${0.7 * (1 - this._bloomFill * 0.6)})`;
    x.lineWidth = (2.2 + 2.0 * k) * u;
    x.beginPath();
    x.ellipse(cx, py, rx, ry, 0, 0, TAU);
    x.stroke();
    x.restore();

    // Seamless full-viewport warm dawn fill before transitioning into Grand Finale
    if (this._bloomFill > 0.01) {
      x.fillStyle = `rgba(255,247,226,${ez(this._bloomFill)})`;
      x.fillRect(0, 0, W, H);
    }
    x.globalAlpha = 1;
  }
};

export default transitionAnimation;
