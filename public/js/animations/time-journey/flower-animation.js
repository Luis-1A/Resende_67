import { cl, ez, L, rnd, glow, G, TAU } from '../../utils.js';

export const flowerAnimation = {
  _flowers: [],
  _pollenTimer: 0,

  init() {
    this._flowers = [];
    this._pollenTimer = 0;
  },

  addFlower({
    nx = 0.5,
    rootNy = 0.86,
    headNy = 0.62,
    headSize = 30,
    color = '#FFF8F4',
    innerColor = '#FFE4F0',
    delay = 0,
    growDuration = 4.2,
    curveBias = 0.12,
    isHero = false
  } = {}) {
    const f = {
      nx,
      rootNy,
      headNy,
      headSize,
      color,
      innerColor,
      delay,
      growDuration,
      elapsed: 0,
      curveBias,
      isHero,
      alpha: 1,
      stemAlpha: 1,
      dimmed: false,
      dissolving: false,
      dissolveProgress: 0,
      detachedPetals: false,
      swayPhase: rnd() * TAU,
      swayCycle: 3.4 + rnd() * 1.6,
      lastPollenBurst: false,
      petalSeeds: Array.from({ length: 14 }, (_, i) => ({
        phaseOffset: i * 0.045,
        widthVar: 0.88 + rnd() * 0.24,
        lenVar: 0.92 + rnd() * 0.16,
        curveVar: (rnd() - 0.5) * 0.22
      }))
    };
    this._flowers.push(f);
    return f;
  },

  startDissolveToTimeline(engine) {
    for (const f of this._flowers) {
      if (!f.isHero) continue;
      f.dissolving = true;
      if (!f.detachedPetals && engine) {
        f.detachedPetals = true;
        const headY = f.headNy;
        const total = 36;
        for (let i = 0; i < total; i++) {
          const goLeft = i % 2 === 0;
          const slot = Math.floor(i / 2) / (total / 2);
          const targetX = goLeft ? L(0.47, 0.10, slot) : L(0.53, 0.90, slot);
          const ang = (i / total) * TAU;
          engine.spawn('primaryGold', {
            sceneId: 'flowerToLine',
            behavior: 'curvePath',
            x: f.nx + Math.cos(ang) * 0.032,
            y: headY + Math.sin(ang) * 0.025,
            cx: f.nx + (targetX - f.nx) * 0.45,
            cy: headY - 0.09 - rnd() * 0.06,
            tx: targetX,
            ty: 0.56,
            delay: (i % 6) * 0.08,
            maxLife: 1.55 + rnd() * 0.3,
            size: 2.2 + rnd() * 1.6,
            fadeOutStart: 0.78
          });
        }
      }
    }
  },

  update(dt, engine) {
    this._pollenTimer += dt;
    for (let i = this._flowers.length - 1; i >= 0; i--) {
      const f = this._flowers[i];
      f.elapsed += dt;

      if (f.dissolving) {
        f.dissolveProgress = cl(f.dissolveProgress + dt * 0.55);
        f.alpha = Math.max(0, 1 - f.dissolveProgress * 1.15);
        // Stem fades out gracefully only after particles begin forming the timeline
        f.stemAlpha = f.dissolveProgress > 0.35
          ? cl(1 - (f.dissolveProgress - 0.35) / 0.65)
          : 1;
        if (f.alpha <= 0.01 && f.stemAlpha <= 0.01) {
          this._flowers.splice(i, 1);
          continue;
        }
      }

      const localT = f.elapsed - f.delay;
      if (localT <= 0 || !engine || f.dissolving) continue;

      const growth = cl(localT / f.growDuration);

      // Emit occasional pollen from leaves mid-stem and flower center once blooming
      if (growth > 0.55 && growth < 0.92 && Math.random() < (f.isHero ? 0.25 : 0.08)) {
        engine.spawn('pollen', {
          sceneId: 'flower',
          x: f.nx + (rnd() - 0.5) * 0.025,
          y: f.headNy + (rnd() - 0.5) * 0.018,
          vx: (rnd() - 0.5) * 0.012,
          vy: -0.022 - rnd() * 0.02,
          maxLife: 1.8 + rnd() * 1.2,
          size: 0.9 + rnd() * 0.9
        });
      }

      if (f.isHero && growth >= 0.82 && !f.lastPollenBurst) {
        f.lastPollenBurst = true;
        for (let k = 0; k < 14; k++) {
          engine.spawn('pollen', {
            sceneId: 'flower',
            x: f.nx + (rnd() - 0.5) * 0.02,
            y: f.headNy,
            vx: (rnd() - 0.5) * 0.028,
            vy: -0.035 - rnd() * 0.035,
            maxLife: 2.2 + rnd() * 1.4,
            size: 1.1 + rnd() * 1.0
          });
        }
      }
    }
  },

  _drawBezierPetal(x, len, width, curveOffset) {
    x.beginPath();
    x.moveTo(0, 0);
    x.bezierCurveTo(
      len * 0.35, -width * (0.75 + curveOffset),
      len * 0.82, -width * 0.62,
      len, 0
    );
    x.bezierCurveTo(
      len * 0.82, width * 0.62,
      len * 0.35, width * (0.75 - curveOffset),
      0, 0
    );
    x.closePath();
    x.fill();
  },

  _drawSplitLeaf(x, lx, ly, len, openK, side) {
    const dir = side < 0 ? -1 : 1;
    x.save();
    x.translate(lx, ly);
    x.rotate(dir * L(0.15, 0.56, openK));
    x.scale(openK, openK);
    x.fillStyle = side < 0 ? '#3E885C' : '#4B9769';
    // Organic split two-lobe leaf shape opening from bud
    x.beginPath();
    x.moveTo(0, 0);
    x.bezierCurveTo(dir * len * 0.36, -len * 0.32, dir * len * 0.78, -len * 0.22, dir * len, -len * 0.04);
    x.bezierCurveTo(dir * len * 0.74, len * 0.24, dir * len * 0.34, len * 0.18, 0, 0);
    x.fill();
    x.restore();
  },

  render(x, env, cameraScale = 1, cameraOffsetY = 0) {
    const { W, H, u, R, RM } = env;
    for (const f of this._flowers) {
      const local = f.elapsed - f.delay;
      if (local <= 0) continue;

      const growthK = cl(local / f.growDuration);
      const stemK = ez(cl(growthK / 0.36));
      const leafLK = ez(cl((growthK - 0.16) / 0.22));
      const leafRK = ez(cl((growthK - 0.24) / 0.22));
      const budK = ez(cl((growthK - 0.34) / 0.18));
      const outerK = ez(cl((growthK - 0.48) / 0.22));
      const midK = ez(cl((growthK - 0.62) / 0.20));
      const innerK = ez(cl((growthK - 0.74) / 0.18));
      const centerK = ez(cl((growthK - 0.84) / 0.16));

      if (stemK <= 0.01) continue;

      const depthFactor = f.isHero ? 1 : cameraScale;
      const rootX = W * 0.5 + (f.nx - 0.5) * W * depthFactor;
      const rootY = f.rootNy * H + cameraOffsetY;
      const fullH = Math.max(26 * u, (f.rootNy - f.headNy) * H) * (f.isHero ? 1 : depthFactor);
      const headSz = f.headSize * u * (f.isHero ? 1 : depthFactor);
      const sway = RM ? 0 : Math.sin((R / f.swayCycle) * TAU + f.swayPhase) * 0.032;

      x.save();
      x.translate(rootX, rootY);
      x.rotate(sway);

      const curH = fullH * stemK;
      const tipX = curH * f.curveBias * 0.22;
      const tipY = -curH;
      const ctrlX = curH * f.curveBias * 0.48;
      const ctrlY = -curH * 0.52;

      // Subtle ground highlight around stem origin
      if (f.stemAlpha > 0.02) {
        x.globalAlpha = f.stemAlpha * 0.55;
        x.fillStyle = '#08251B';
        x.beginPath();
        x.ellipse(0, 1.5 * u, headSz * 0.36, headSz * 0.11, 0, 0, TAU);
        x.fill();

        // Variable-thickness green-gold stem growing bottom-up
        x.globalAlpha = f.stemAlpha * 0.95;
        const sg = x.createLinearGradient(0, 0, tipX, tipY);
        sg.addColorStop(0, '#2C6A47');
        sg.addColorStop(0.75, '#468E62');
        sg.addColorStop(1, '#98BA76');
        x.strokeStyle = sg;
        x.lineWidth = Math.max(1.5 * u, headSz * 0.11);
        x.lineCap = 'round';
        x.beginPath();
        x.moveTo(0, 0);
        x.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
        x.stroke();

        // Tip-following spark during active stem elongation
        if (stemK < 0.96) {
          x.save();
          x.globalCompositeOperation = 'lighter';
          glow(x, tipX, tipY, headSz * 0.5, f.stemAlpha * 0.85, G);
          x.restore();
        }

        // Staggered organic leaves opening left then right
        if (leafLK > 0.02) {
          const lx = L(0, tipX, 0.36) + ctrlX * 0.42;
          const ly = -curH * 0.38;
          x.globalAlpha = f.stemAlpha * 0.92;
          this._drawSplitLeaf(x, lx, ly, headSz * 0.72, leafLK, -1);
        }
        if (leafRK > 0.02) {
          const rx = L(0, tipX, 0.58) + ctrlX * 0.32;
          const ry = -curH * 0.58;
          x.globalAlpha = f.stemAlpha * 0.92;
          this._drawSplitLeaf(x, rx, ry, headSz * 0.68, leafRK, 1);
        }
      }

      if (f.alpha > 0.01) {
        x.translate(tipX, tipY);

        // Closed / expanding bud
        if (budK > 0.02 && outerK < 0.55) {
          const budFade = outerK > 0.15 ? 1 - cl((outerK - 0.15) / 0.4) : 1;
          x.globalAlpha = f.alpha * budK * budFade;
          x.fillStyle = '#4B9A6B';
          x.beginPath();
          x.ellipse(0, -headSz * 0.14 * budK, headSz * 0.22 * budK, headSz * 0.34 * budK, 0, 0, TAU);
          x.fill();
          x.fillStyle = f.color;
          x.beginPath();
          x.ellipse(0, -headSz * 0.22 * budK, headSz * 0.17 * budK, headSz * 0.26 * budK, 0, 0, TAU);
          x.fill();
        }

        const drawRing = (count, stageK, radiusFrac, wFrac, petalCol, angleOffset, seedBase) => {
          if (stageK <= 0.01) return;
          for (let i = 0; i < count; i++) {
            const seed = f.petalSeeds[(seedBase + i) % f.petalSeeds.length];
            const pk = ez(cl(stageK * 1.28 - seed.phaseOffset));
            if (pk <= 0.01) continue;
            const targetAng = (i / count) * TAU + angleOffset;
            const ang = L(targetAng - 0.22, targetAng, pk);
            x.save();
            x.rotate(ang);
            x.globalAlpha = f.alpha * 0.92 * pk;
            x.fillStyle = petalCol;
            this._drawBezierPetal(
              x,
              headSz * radiusFrac * seed.lenVar * pk,
              headSz * wFrac * seed.widthVar * pk,
              seed.curveVar
            );
            x.restore();
          }
        };

        // Stages 2, 3, 4: Outer -> Intermediate -> Inner petals
        drawRing(6, outerK, 0.92, 0.34, f.color, 0, 0);
        drawRing(6, midK, 0.68, 0.27, f.innerColor, 0.28, 6);
        drawRing(5, innerK, 0.46, 0.21, '#FFFFFF', 0.52, 9);

        // Stage 5: Illuminated golden center
        if (centerK > 0.01) {
          x.save();
          x.globalCompositeOperation = 'lighter';
          glow(x, 0, 0, headSz * (f.isHero ? 1.15 : 0.78) * centerK, f.alpha * 0.82 * centerK, G);
          x.restore();
          x.globalAlpha = f.alpha * centerK;
          x.fillStyle = '#FFE392';
          x.beginPath();
          x.arc(0, 0, headSz * 0.17 * centerK, 0, TAU);
          x.fill();
        }
      }

      x.restore();
    }
    x.globalAlpha = 1;
  }
};

export default flowerAnimation;
