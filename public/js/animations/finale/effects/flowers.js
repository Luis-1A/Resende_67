import { cl, ez, L, rnd, glow, G, TAU } from '../../../utils.js';
import { FLOWER_PALETTE } from '../config/finale-effects.js';

export const finaleFlowers = {
  _flowers: [],
  _flashBoost: 0,
  _warmGlow: 0,
  _heroFlower: null,

  init() {
    this._flowers = [];
    this._flashBoost = 0;
    this._warmGlow = 0;
    this._heroFlower = null;
  },

  addFlower({
    nx = 0.5,
    ny = 0.78,
    rootNy = null,
    tier = 'mid', // 'small' | 'mid' | 'large'
    scale = 1,
    color = null,
    delay = 0,
    openDuration = 2.0,
    onOpened = null
  } = {}) {
    const col = color || FLOWER_PALETTE[Math.floor(rnd() * FLOWER_PALETTE.length)];
    const baseSize = tier === 'small' ? 12 : tier === 'large' ? 26 : 19;
    // Anchor stem root directly inside the garden ground (Y: 0.87..0.98)
    const defaultRoot = tier === 'small'
      ? 0.86 + rnd() * 0.04
      : tier === 'large'
        ? 0.94 + rnd() * 0.04
        : 0.90 + rnd() * 0.05;
    const soilY = rootNy ?? defaultRoot;
    const headY = Math.min(ny, soilY - (tier === 'small' ? 0.055 : tier === 'large' ? 0.13 : 0.095));

    this._flowers.push({
      nx,
      ny: headY,
      rootNy: soilY,
      tier,
      baseSize: baseSize * scale,
      color: col,
      delay,
      openDuration,
      elapsed: 0,
      openedCalled: false,
      onOpened,
      swayCycle: 3.2 + rnd() * 2,
      swayPhase: rnd() * TAU,
      curveBias: (rnd() - 0.5) * 0.28,
      dimmed: false,
      alpha: 1
    });
  },

  spawnHeroWhiteFlower({ nx = 0.5, ny = 0.65, rootNy = 0.91 } = {}) {
    this._heroFlower = {
      nx,
      ny,
      rootNy,
      elapsed: 0,
      growDuration: 2.4,
      openStage: 0.52, // grows up from soil to closed bud (0..0.52), then butterfly lands -> 1.0 open!
      targetOpen: 0.52,
      dipAngle: 0,
      targetDip: 0,
      color: '#FFFDF8',
      glowLevel: 0.25,
      alpha: 1
    };
  },

  setHeroFlowerState({ targetOpen, targetDip, glowLevel } = {}) {
    if (!this._heroFlower) return;
    if (targetOpen !== undefined) this._heroFlower.targetOpen = targetOpen;
    if (targetDip !== undefined) this._heroFlower.targetDip = targetDip;
    if (glowLevel !== undefined) this._heroFlower.glowLevel = glowLevel;
  },

  pulseFlash(amount = 0.35) {
    this._flashBoost = Math.min(0.65, this._flashBoost + amount);
  },

  setWarmGlow(val) {
    this._warmGlow = cl(val);
  },

  dimAll() {
    for (const f of this._flowers) f.dimmed = true;
  },

  update(dt) {
    this._flashBoost = Math.max(0, this._flashBoost - dt * 1.4);

    for (const f of this._flowers) {
      f.elapsed += dt;
      if (f.dimmed) {
        f.alpha = Math.max(0.18, f.alpha - dt * 0.22);
      }
      if (!f.openedCalled && f.elapsed >= f.delay + f.openDuration * 0.92 && typeof f.onOpened === 'function') {
        f.openedCalled = true;
        f.onOpened(f);
      }
    }

    if (this._heroFlower) {
      const hf = this._heroFlower;
      hf.elapsed += dt;
      // First 2.4s: natural upward sprout from ground to bud; then transitions smoothly toward targetOpen
      if (hf.elapsed < hf.growDuration) {
        hf.openStage = L(0.02, hf.targetOpen, ez(cl(hf.elapsed / hf.growDuration)));
      } else {
        hf.openStage = L(hf.openStage, hf.targetOpen, cl(dt * 1.8));
      }
      hf.dipAngle = L(hf.dipAngle, hf.targetDip, cl(dt * 5.2));
    }
  },

  _drawSproutingFlower(x, rootX, rootY, fullStemH, headSize, growthK, col, glowAmt, swayAngle, curveBias, al, u) {
    // 6 organic growth phases anchored from soil root (0,0) growing UPWARD (negative Y)
    const stemK = ez(cl(growthK / 0.36));
    const leafLK = ez(cl((growthK - 0.16) / 0.24));
    const leafRK = ez(cl((growthK - 0.24) / 0.24));
    const budK = ez(cl((growthK - 0.34) / 0.2));
    const outerK = ez(cl((growthK - 0.52) / 0.24));
    const innerK = ez(cl((growthK - 0.72) / 0.2));
    const centerK = ez(cl((growthK - 0.84) / 0.16));

    if (stemK <= 0.01) return;

    x.save();
    // Root anchor sits right inside the soil so swaying tilts the whole flower from the ground
    x.translate(rootX, rootY);
    x.rotate(swayAngle);

    const curH = fullStemH * stemK;
    const tipX = curH * curveBias * 0.22;
    const tipY = -curH;
    const ctrlX = curH * curveBias * 0.48;
    const ctrlY = -curH * 0.52;

    // Subtle ground sprout mound where stem breaks through soil
    x.globalAlpha = al * Math.min(1, stemK * 2.5) * 0.65;
    x.fillStyle = '#072219';
    x.beginPath();
    x.ellipse(0, 1.5 * u, headSize * 0.38, headSize * 0.13, 0, 0, TAU);
    x.fill();

    // Growing curved stem from soil (0,0) upward to (tipX, tipY)
    x.globalAlpha = al * 0.94;
    x.strokeStyle = '#2E6E4A';
    x.lineWidth = Math.max(1.5 * u, headSize * 0.12);
    x.lineCap = 'round';
    x.beginPath();
    x.moveTo(0, 0);
    x.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
    x.stroke();

    // Sequential leaves sprouting along the rising stem
    if (leafLK > 0.02) {
      const lx = L(0, tipX, 0.36) + ctrlX * 0.42;
      const ly = -curH * 0.38;
      x.fillStyle = '#3B8459';
      x.globalAlpha = al * 0.92 * leafLK;
      x.beginPath();
      x.ellipse(
        lx - headSize * 0.36 * leafLK,
        ly - headSize * 0.06 * leafLK,
        headSize * 0.38 * leafLK,
        headSize * 0.14 * leafLK,
        -0.52,
        0,
        TAU
      );
      x.fill();
    }

    if (leafRK > 0.02) {
      const rx = L(0, tipX, 0.56) + ctrlX * 0.34;
      const ry = -curH * 0.58;
      x.fillStyle = '#479466';
      x.globalAlpha = al * 0.92 * leafRK;
      x.beginPath();
      x.ellipse(
        rx + headSize * 0.36 * leafRK,
        ry - headSize * 0.06 * leafRK,
        headSize * 0.36 * leafRK,
        headSize * 0.14 * leafRK,
        0.52,
        0,
        TAU
      );
      x.fill();
    }

    // Move to the growing stem tip to draw bud / blooming petals
    x.translate(tipX, tipY);

    // Closed / swelling bud
    if (budK > 0.02 && outerK < 0.55) {
      const budFade = outerK > 0.15 ? 1 - cl((outerK - 0.15) / 0.4) : 1;
      x.globalAlpha = al * budK * budFade;
      x.fillStyle = '#4C9A6C';
      x.beginPath();
      x.ellipse(0, -headSize * 0.12 * budK, headSize * 0.24 * budK, headSize * 0.36 * budK, 0, 0, TAU);
      x.fill();
      x.fillStyle = col;
      x.beginPath();
      x.ellipse(0, -headSize * 0.2 * budK, headSize * 0.18 * budK, headSize * 0.28 * budK, 0, 0, TAU);
      x.fill();
    }

    // Outer petals unfolding individually with subtle stagger
    if (outerK > 0.01) {
      const n = 6;
      for (let i = 0; i < n; i++) {
        const pk = ez(cl((outerK * 1.35) - (i / n) * 0.35));
        if (pk <= 0.01) continue;
        const ang = (i / n) * TAU;
        const spread = headSize * (0.24 + 0.62 * pk);
        x.save();
        x.rotate(ang);
        x.globalAlpha = al * 0.9 * pk;
        x.fillStyle = col;
        x.beginPath();
        x.ellipse(spread * 0.54, 0, spread * 0.54, headSize * 0.28 * pk, 0, 0, TAU);
        x.fill();
        x.restore();
      }
    }

    // Inner petals opening
    if (innerK > 0.01) {
      const n = 5;
      const spread = headSize * 0.44 * innerK;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * TAU + 0.32;
        x.save();
        x.rotate(ang);
        x.globalAlpha = al * 0.96 * innerK;
        x.fillStyle = '#FFFFFF';
        x.beginPath();
        x.ellipse(spread * 0.5, 0, spread * 0.48, headSize * 0.2 * innerK, 0, 0, TAU);
        x.fill();
        x.restore();
      }
    }

    // Illuminated glowing golden center
    if (centerK > 0.01) {
      x.globalCompositeOperation = 'lighter';
      glow(x, 0, 0, headSize * (0.85 + glowAmt * 0.9) * centerK, al * (0.45 + glowAmt * 0.5) * centerK, G);
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = al * centerK;
      x.fillStyle = '#FFE392';
      x.beginPath();
      x.arc(0, 0, headSize * 0.16 * centerK, 0, TAU);
      x.fill();
    }

    x.restore();
  },

  render(x, env) {
    const { W, H, u, R, RM } = env;
    for (const f of this._flowers) {
      const local = f.elapsed - f.delay;
      if (local <= 0) continue;
      const growthK = cl(local / f.openDuration);
      const sway = RM ? 0 : Math.sin((R / f.swayCycle) * TAU + f.swayPhase) * 0.036;
      const pulseGlow = 0.12 + this._warmGlow * 0.45 + this._flashBoost + (RM ? 0 : 0.08 * Math.sin(R * 2 + f.swayPhase));
      const rootX = f.nx * W;
      const rootY = f.rootNy * H;
      const fullStemH = Math.max(24 * u, (f.rootNy - f.ny) * H);

      this._drawSproutingFlower(
        x,
        rootX,
        rootY,
        fullStemH,
        f.baseSize * u,
        growthK,
        f.color,
        pulseGlow,
        sway,
        f.curveBias,
        f.alpha,
        u
      );
    }

    if (this._heroFlower && this._heroFlower.alpha > 0.01) {
      const hf = this._heroFlower;
      const rootX = hf.nx * W;
      const rootY = hf.rootNy * H;
      const fullStemH = Math.max(40 * u, (hf.rootNy - hf.ny) * H);
      this._drawSproutingFlower(
        x,
        rootX,
        rootY,
        fullStemH,
        34 * u,
        hf.openStage,
        hf.color,
        hf.glowLevel,
        hf.dipAngle,
        0.05,
        hf.alpha,
        u
      );
    }
    x.globalAlpha = 1;
  }
};
