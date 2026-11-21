import { cl, ez, L, rnd, glow, G, GB, TAU } from '../../utils.js';
import { PARTICLE_CATEGORIES, PARTICLE_TYPES } from './particle-types.js';

export class ParticleEngine {
  constructor(maxCap = 720) {
    this.maxCap = maxCap;
    this.active = [];
    this.free = [];
    this.lowPower = false;
  }

  configureQuality({ lowPower = false, maxCap = 720 } = {}) {
    this.lowPower = lowPower;
    this.maxCap = lowPower ? Math.min(360, maxCap) : maxCap;
  }

  clear() {
    while (this.active.length) {
      this.free.push(this.active.pop());
    }
  }

  clearScene(sceneId) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (this.active[i].sceneId === sceneId) {
        this.free.push(this.active.splice(i, 1)[0]);
      }
    }
  }

  countByCategory(category) {
    let n = 0;
    for (let i = 0; i < this.active.length; i++) {
      if (this.active[i].category === category) n++;
    }
    return n;
  }

  spawn(typeName, opts = {}) {
    const def = PARTICLE_TYPES[typeName] || PARTICLE_TYPES.ambient;
    const isDecorative = def.category === PARTICLE_CATEGORIES.DECORATIVE;

    // Never drop critical transformation particles for ambient dust; shed decorative first under budget
    if (this.active.length >= this.maxCap) {
      if (isDecorative) return null;
      let shedIdx = -1;
      for (let i = 0; i < this.active.length; i++) {
        if (this.active[i].category === PARTICLE_CATEGORIES.DECORATIVE) {
          shedIdx = i;
          break;
        }
      }
      if (shedIdx >= 0) {
        this.free.push(this.active.splice(shedIdx, 1)[0]);
      } else {
        return null;
      }
    }

    if (this.lowPower && isDecorative && rnd() < 0.45) {
      return null;
    }

    const p = this.free.pop() || {};
    const szMin = def.size[0], szMax = def.size[1];
    const alMin = def.alpha[0], alMax = def.alpha[1];
    const lfMin = def.defaultLife[0], lfMax = def.defaultLife[1];

    p.type = def.id;
    p.category = def.category;
    p.shape = opts.shape || def.shape;
    p.sceneId = opts.sceneId || 'global';
    p.behavior = opts.behavior || 'linear'; // linear | orbit | converge | curvePath | disperse
    p.x = opts.x ?? 0.5;
    p.y = opts.y ?? 0.5;
    p.z = opts.z ?? 1.0; // depth 0.5 (far) .. 1.6 (near)
    p.x0 = p.x;
    p.y0 = p.y;
    p.tx = opts.tx ?? p.x;
    p.ty = opts.ty ?? p.y;
    p.cx = opts.cx ?? ((p.x + p.tx) * 0.5);
    p.cy = opts.cy ?? ((p.y + p.ty) * 0.5 - 0.08);
    p.vx = opts.vx ?? 0;
    p.vy = opts.vy ?? 0;
    p.ax = opts.ax ?? 0;
    p.ay = opts.ay ?? 0;
    p.gravity = opts.gravity ?? def.gravity;
    p.size = opts.size ?? L(szMin, szMax, rnd());
    p.alpha = opts.alpha ?? L(alMin, alMax, rnd());
    p.glowIntensity = opts.glowIntensity ?? def.glowIntensity;
    p.color = opts.color || def.color;
    p.cool = Boolean(opts.cool);
    p.rot = opts.rot ?? rnd() * TAU;
    p.vRot = opts.vRot ?? (rnd() - 0.5) * 1.4;
    p.life = 0;
    p.delay = opts.delay ?? 0;
    p.maxLife = opts.maxLife ?? L(lfMin, lfMax, rnd());
    p.fadeInDur = opts.fadeInDur ?? Math.min(0.35, p.maxLife * 0.22);
    p.fadeOutStart = opts.fadeOutStart ?? 0.72;
    p.orbitRadius = opts.orbitRadius ?? 0.06;
    p.orbitAngle = opts.orbitAngle ?? rnd() * TAU;
    p.orbitSpeed = opts.orbitSpeed ?? 1.4;
    p.seed = rnd() * 20;

    this.active.push(p);
    return p;
  }

  update(dt, globalT) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.free.push(this.active.splice(i, 1)[0]);
        continue;
      }

      const progress = p.life / p.maxLife;
      p.rot += p.vRot * dt;

      if (p.behavior === 'orbit') {
        p.orbitAngle += p.orbitSpeed * dt;
        const shrink = p.ax < 0 ? Math.max(0.18, 1 + p.ax * progress) : 1;
        const r = p.orbitRadius * shrink;
        p.x = p.tx + Math.cos(p.orbitAngle) * r;
        p.y = p.ty + Math.sin(p.orbitAngle) * r * 0.62;
      } else if (p.behavior === 'converge') {
        const k = ez(cl(progress / 0.88));
        const swirl = (1 - k) * 0.08 * Math.sin(p.seed + globalT * 2.2);
        p.x = L(p.x0, p.tx, k) + swirl;
        p.y = L(p.y0, p.ty, k) - Math.sin(k * Math.PI) * 0.035;
      } else if (p.behavior === 'curvePath') {
        const k = ez(cl(progress));
        const inv = 1 - k;
        p.x = inv * inv * p.x0 + 2 * inv * k * p.cx + k * k * p.tx;
        p.y = inv * inv * p.y0 + 2 * inv * k * p.cy + k * k * p.ty;
      } else {
        p.vx += p.ax * dt;
        p.vy += (p.ay + p.gravity) * dt;
        const drift = p.type === 'ambient' || p.type === 'pollen'
          ? Math.sin(globalT * 1.3 + p.seed) * 0.008
          : 0;
        p.x += (p.vx + drift) * dt;
        p.y += p.vy * dt;
      }
    }
  }

  render(x, env) {
    const { W, H, u } = env;
    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i];
      if (p.delay > 0) continue;

      const prog = cl(p.life / p.maxLife);
      const fadeIn = p.fadeInDur > 0 ? cl(p.life / p.fadeInDur) : 1;
      const fadeOut = prog > p.fadeOutStart ? cl((1 - prog) / (1 - p.fadeOutStart)) : 1;
      const depthScale = cl(p.z, 0.55, 1.55);
      const depthBlurFade = p.z > 1.32 ? 0.68 : 1;
      const al = p.alpha * fadeIn * fadeOut * depthBlurFade;
      if (al <= 0.01) continue;

      const px = p.x * W;
      const py = p.y * H;
      const sz = p.size * depthScale * u;

      if (p.shape === 'petal') {
        x.save();
        x.translate(px, py);
        x.rotate(p.rot);
        x.globalAlpha = al;
        x.fillStyle = p.color;
        x.beginPath();
        x.moveTo(0, -sz * 0.65);
        x.bezierCurveTo(sz * 0.72, -sz * 0.3, sz * 0.58, sz * 0.62, 0, sz * 0.75);
        x.bezierCurveTo(-sz * 0.58, sz * 0.62, -sz * 0.72, -sz * 0.3, 0, -sz * 0.65);
        x.fill();
        x.restore();
      } else if (p.shape === 'streak') {
        x.save();
        x.globalCompositeOperation = 'lighter';
        x.globalAlpha = al;
        x.strokeStyle = p.color;
        x.lineWidth = Math.max(1, sz * 0.65);
        x.lineCap = 'round';
        x.beginPath();
        x.moveTo(px, py);
        x.lineTo(px - p.vx * W * 0.035, py - p.vy * H * 0.035);
        x.stroke();
        x.restore();
      } else if (p.shape === 'dot') {
        x.save();
        x.globalAlpha = al;
        x.fillStyle = p.color;
        x.beginPath();
        x.arc(px, py, Math.max(0.6, sz * 0.65), 0, TAU);
        x.fill();
        x.restore();
      } else {
        x.save();
        x.globalCompositeOperation = 'lighter';
        glow(x, px, py, sz * (2.0 + p.glowIntensity * 1.4), al, p.cool ? GB : G);
        x.restore();
      }
    }
    x.globalAlpha = 1;
  }
}

export default ParticleEngine;
