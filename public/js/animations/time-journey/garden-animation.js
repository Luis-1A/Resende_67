import { cl, ez, L, rnd, glow, G, TAU } from '../../utils.js';

export const gardenAnimation = {
  _dawnBlend: 0,
  _rayIntensity: 0,
  _gardenGrowth: 0,
  _pathProgress: 0,
  _pathGlow: 0,
  _grassTufts: [],

  init() {
    this._dawnBlend = 0;
    this._rayIntensity = 0;
    this._gardenGrowth = 0;
    this._pathProgress = 0;
    this._pathGlow = 0;

    // Specific soil anchor points for garden foliage & curved leaves
    this._grassTufts = Array.from({ length: 26 }, (_, i) => {
      const nx = (i / 25) * 0.94 + 0.03;
      const distCenter = Math.abs(nx - 0.5);
      return {
        nx,
        rootNy: 0.87 + (i % 3) * 0.025,
        height: 0.05 + (1 - distCenter) * 0.035 + rnd() * 0.025,
        lean: (nx - 0.5) * 0.45 + (rnd() - 0.5) * 0.25,
        delay: distCenter * 0.75, // center grows earlier, edges follow cleanly
        phase: rnd() * TAU
      };
    });
  },

  setDawn(blend, rayIntensity) {
    this._dawnBlend = cl(blend);
    this._rayIntensity = cl(rayIntensity);
  },

  setGardenGrowth(k) {
    this._gardenGrowth = cl(k);
  },

  setPathState(progress, glowAmt = 1) {
    this._pathProgress = cl(progress);
    this._pathGlow = cl(glowAmt);
  },

  renderSky(x, env) {
    const { W, H, cx, R, RM } = env;
    const d = ez(this._dawnBlend);

    // Blend smoothly from very dark night blue to radiant dawn blue
    const topCol = `rgb(${Math.round(L(2, 16, d))}, ${Math.round(L(6, 40, d))}, ${Math.round(L(22, 92, d))})`;
    const midCol = `rgb(${Math.round(L(6, 36, d))}, ${Math.round(L(17, 74, d))}, ${Math.round(L(46, 134, d))})`;
    const botCol = `rgb(${Math.round(L(11, 74, d))}, ${Math.round(L(28, 114, d))}, ${Math.round(L(68, 166, d))})`;

    const sky = x.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, topCol);
    sky.addColorStop(0.54, midCol);
    sky.addColorStop(1, botCol);
    x.fillStyle = sky;
    x.fillRect(0, 0, W, H);

    // Central horizon golden sunrise glow
    if (d > 0.05) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      glow(x, cx, H * 0.72, Math.max(W, H) * 0.75, d * 0.42, G);
      x.restore();
    }

    // Soft volumetric diagonal light rays
    if (this._rayIntensity > 0.01) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const bx = W * (0.18 + i * 0.22) + (RM ? 0 : Math.sin(R * 0.25 + i) * W * 0.025);
        const rg = x.createLinearGradient(bx, 0, bx + W * 0.09, H * 0.85);
        rg.addColorStop(0, `rgba(255,234,178,${this._rayIntensity * 0.24})`);
        rg.addColorStop(1, 'rgba(255,234,178,0)');
        x.fillStyle = rg;
        x.beginPath();
        x.moveTo(bx - W * 0.03, 0);
        x.lineTo(bx + W * 0.035, 0);
        x.lineTo(bx + W * 0.16, H * 0.85);
        x.lineTo(bx - W * 0.04, H * 0.85);
        x.closePath();
        x.fill();
      }
      x.restore();
    }
  },

  renderGroundAndPath(x, env, cameraScale = 1, cameraOffsetY = 0) {
    const { W, H, cx, u, R, RM } = env;
    if (this._gardenGrowth <= 0.01 && this._pathProgress <= 0.01) return;

    const ggReveal = ez(cl(this._gardenGrowth / 0.35));
    const groundY = H * 0.84 + cameraOffsetY * 0.5;

    if (ggReveal > 0.01) {
      x.save();
      x.globalAlpha = ggReveal;
      const gnd = x.createLinearGradient(0, groundY, 0, H);
      gnd.addColorStop(0, '#0C3227');
      gnd.addColorStop(1, '#04120E');
      x.fillStyle = gnd;
      x.fillRect(0, groundY, W, H - groundY);

      // Soil vegetation tufts & curved swaying leaves growing bottom-up
      for (const tuft of this._grassTufts) {
        const localK = ez(cl((this._gardenGrowth - tuft.delay * 0.4) / 0.55));
        if (localK <= 0.02) continue;
        const bx = W * 0.5 + (tuft.nx - 0.5) * W * cameraScale;
        const by = tuft.rootNy * H + cameraOffsetY * 0.65;
        const h = tuft.height * H * localK * cameraScale;
        const sway = RM ? 0 : Math.sin(R * 1.4 + tuft.phase) * 4 * u;

        x.strokeStyle = '#2B6E4A';
        x.lineWidth = Math.max(1.5, 2.2 * u);
        x.lineCap = 'round';
        x.beginPath();
        x.moveTo(bx, by);
        x.quadraticCurveTo(bx + tuft.lean * 12 * u, by - h * 0.55, bx + tuft.lean * 22 * u + sway, by - h);
        x.stroke();
      }
      x.restore();
    }

    // Magical golden trail widening toward the camera (Phase 8)
    if (this._pathProgress > 0.01) {
      const pK = ez(this._pathProgress);
      const topY = H * 0.72 + cameraOffsetY * 0.3;
      const botY = H;
      const topHalf = W * 0.018;
      const botHalf = W * 0.19 * pK;

      x.save();
      x.globalCompositeOperation = 'lighter';
      const pathGrad = x.createLinearGradient(cx, topY, cx, botY);
      pathGrad.addColorStop(0, `rgba(255,232,162,${0.18 * this._pathGlow})`);
      pathGrad.addColorStop(0.5, `rgba(255,224,142,${0.34 * this._pathGlow})`);
      pathGrad.addColorStop(1, `rgba(255,240,188,${0.48 * this._pathGlow})`);

      x.fillStyle = pathGrad;
      x.beginPath();
      x.moveTo(cx - topHalf, topY);
      x.lineTo(cx + topHalf, topY);
      x.quadraticCurveTo(cx + botHalf * 0.62, L(topY, botY, 0.55), cx + botHalf, botY);
      x.lineTo(cx - botHalf, botY);
      x.quadraticCurveTo(cx - botHalf * 0.62, L(topY, botY, 0.55), cx - topHalf, topY);
      x.closePath();
      x.fill();

      // Golden illuminated center stream
      x.strokeStyle = `rgba(255,244,205,${0.55 * pK * this._pathGlow})`;
      x.lineWidth = 3 * u;
      x.beginPath();
      x.moveTo(cx, topY);
      x.quadraticCurveTo(cx + (RM ? 0 : Math.sin(R * 0.8) * 6 * u), L(topY, botY, 0.55), cx, botY);
      x.stroke();

      // Ground sparkles beside path
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const sy = L(topY + H * 0.03, botY - H * 0.03, t);
        const spread = L(topHalf, botHalf, t) * (i % 2 === 0 ? -0.75 : 0.75);
        glow(x, cx + spread, sy, (8 + t * 8) * u, 0.42 * pK * this._pathGlow, G);
      }
      x.restore();
    }
    x.globalAlpha = 1;
  }
};

export default gardenAnimation;
