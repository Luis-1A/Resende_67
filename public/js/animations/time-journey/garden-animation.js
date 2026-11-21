import { cl, ez, L, rnd, glow, mkSpr, G, TAU } from '../../utils.js';

let _raySprite = null;
function getRaySprite() {
  if (_raySprite) return _raySprite;
  _raySprite = mkSpr(64, 256, c => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, 'rgba(255,234,178,1)');
    g.addColorStop(0.68, 'rgba(255,234,178,0.28)');
    g.addColorStop(1, 'rgba(255,234,178,0)');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(22, 0);
    c.lineTo(42, 0);
    c.lineTo(64, 256);
    c.lineTo(0, 256);
    c.closePath();
    c.fill();
  });
  return _raySprite;
}

export const gardenAnimation = {
  _dawnBlend: 0,
  _rayIntensity: 0,
  _gardenGrowth: 0,
  _pathProgress: 0,
  _pathGlow: 0,
  _grassTufts: [],
  _skyGrad: null,
  _skyKey: '',
  _gndGrad: null,
  _gndKey: '',
  _pathGrad: null,
  _pathKey: '',

  init() {
    this._dawnBlend = 0;
    this._rayIntensity = 0;
    this._gardenGrowth = 0;
    this._pathProgress = 0;
    this._pathGlow = 0;
    this._skyGrad = null;
    this._skyKey = '';
    this._gndGrad = null;
    this._gndKey = '';
    this._pathGrad = null;
    this._pathKey = '';

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

    // Quantize slightly during crossfades so gradient object isn't recreated identically every frame
    const r0 = Math.round(L(2, 16, d));
    const g0 = Math.round(L(6, 40, d));
    const b0 = Math.round(L(22, 92, d));
    const r2 = Math.round(L(11, 74, d));
    const g2 = Math.round(L(28, 114, d));
    const b2 = Math.round(L(68, 166, d));
    const skyKey = `${H}|${r0},${g0},${b0}|${r2},${g2},${b2}`;

    if (!this._skyGrad || this._skyKey !== skyKey) {
      this._skyKey = skyKey;
      const sky = x.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, `rgb(${r0},${g0},${b0})`);
      sky.addColorStop(0.54, `rgb(${Math.round(L(6, 36, d))},${Math.round(L(17, 74, d))},${Math.round(L(46, 134, d))})`);
      sky.addColorStop(1, `rgb(${r2},${g2},${b2})`);
      this._skyGrad = sky;
    }

    x.fillStyle = this._skyGrad;
    x.fillRect(0, 0, W, H);

    // Central horizon golden sunrise glow
    if (d > 0.05) {
      x.save();
      x.globalCompositeOperation = 'lighter';
      glow(x, cx, H * 0.72, Math.max(W, H) * 0.75, d * 0.42, G);
      x.restore();
    }

    // Soft volumetric diagonal light rays via cached offscreen sprite
    if (this._rayIntensity > 0.01) {
      const spr = getRaySprite();
      const rayH = H * 0.85;
      const rayW = W * 0.22;
      x.save();
      x.globalCompositeOperation = 'lighter';
      x.globalAlpha = this._rayIntensity * 0.24;
      for (let i = 0; i < 4; i++) {
        const bx = W * (0.18 + i * 0.22) + (RM ? 0 : Math.sin(R * 0.25 + i) * W * 0.025);
        x.save();
        x.translate(bx, 0);
        x.transform(1, 0, 0.09, 1, 0, 0);
        x.drawImage(spr, -rayW * 0.35, 0, rayW, rayH);
        x.restore();
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
      const gndKey = `${groundY.toFixed(1)}|${H}`;
      if (!this._gndGrad || this._gndKey !== gndKey) {
        this._gndKey = gndKey;
        const gnd = x.createLinearGradient(0, groundY, 0, H);
        gnd.addColorStop(0, '#0C3227');
        gnd.addColorStop(1, '#04120E');
        this._gndGrad = gnd;
      }
      x.fillStyle = this._gndGrad;
      x.fillRect(0, groundY, W, H - groundY);

      // Soil vegetation tufts & curved swaying leaves growing bottom-up
      x.strokeStyle = '#2B6E4A';
      x.lineWidth = Math.max(1.5, 2.2 * u);
      x.lineCap = 'round';
      for (const tuft of this._grassTufts) {
        const localK = ez(cl((this._gardenGrowth - tuft.delay * 0.4) / 0.55));
        if (localK <= 0.02) continue;
        const bx = W * 0.5 + (tuft.nx - 0.5) * W * cameraScale;
        const by = tuft.rootNy * H + cameraOffsetY * 0.65;
        const h = tuft.height * H * localK * cameraScale;
        const sway = RM ? 0 : Math.sin(R * 1.4 + tuft.phase) * 4 * u;

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
      const pKey = `${cx.toFixed(0)}|${topY.toFixed(1)}|${botY}`;
      if (!this._pathGrad || this._pathKey !== pKey) {
        this._pathKey = pKey;
        const pg = x.createLinearGradient(cx, topY, cx, botY);
        pg.addColorStop(0, 'rgba(255,232,162,0.18)');
        pg.addColorStop(0.5, 'rgba(255,224,142,0.34)');
        pg.addColorStop(1, 'rgba(255,240,188,0.48)');
        this._pathGrad = pg;
      }

      x.globalAlpha = this._pathGlow;
      x.fillStyle = this._pathGrad;
      x.beginPath();
      x.moveTo(cx - topHalf, topY);
      x.lineTo(cx + topHalf, topY);
      x.quadraticCurveTo(cx + botHalf * 0.62, L(topY, botY, 0.55), cx + botHalf, botY);
      x.lineTo(cx - botHalf, botY);
      x.quadraticCurveTo(cx - botHalf * 0.62, L(topY, botY, 0.55), cx - topHalf, topY);
      x.closePath();
      x.fill();

      // Golden illuminated center stream
      x.globalAlpha = 1;
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
