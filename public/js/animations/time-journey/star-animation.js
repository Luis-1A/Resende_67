import { cl, ez, L, rnd, glow, star4, G, TAU } from '../../utils.js';

export const starAnimation = {
  _x: 0.5,
  _y: 0.43,
  _alpha: 0,
  _size: 0,
  _pulseWaves: [],
  _groundRing: null,
  _groundFlash: 0,
  _trailTimer: 0,
  _orbiters: [],
  _distantStars: [],

  init(starCount = 95) {
    this._x = 0.5;
    this._y = 0.43;
    this._alpha = 0;
    this._size = 0;
    this._pulseWaves = [];
    this._groundRing = null;
    this._groundFlash = 0;
    this._trailTimer = 0;
    this._orbiters = Array.from({ length: 10 }, (_, i) => ({
      angle: (i / 10) * TAU,
      speed: (i % 2 === 0 ? 1 : -1) * (1.2 + rnd() * 1.1),
      radius: 0.028 + rnd() * 0.032,
      size: 1.0 + rnd() * 1.2
    }));
    this._distantStars = Array.from({ length: starCount }, () => ({
      x: rnd(),
      y: rnd() * 0.88,
      size: 0.5 + rnd() * 1.0, // 0.5..1.5px ref
      alpha: 0.16 + rnd() * 0.45,
      twinkle: rnd() > 0.4,
      speed: 0.8 + rnd() * 1.6,
      phase: rnd() * TAU,
      vx: (rnd() - 0.5) * 0.0008
    }));
  },

  setStarState({ x, y, alpha, size } = {}) {
    if (x !== undefined) this._x = x;
    if (y !== undefined) this._y = y;
    if (alpha !== undefined) this._alpha = cl(alpha);
    if (size !== undefined) this._size = Math.max(0, size);
  },

  triggerPulseWave({ x = this._x, y = this._y, maxR = 0.36, duration = 1.1, maxAlpha = 0.34, thinRing = false } = {}) {
    this._pulseWaves.push({ x, y, maxR, duration, maxAlpha, thinRing, t: 0 });
  },

  triggerGroundContact(x = 0.5, y = 0.86) {
    this._groundFlash = 1.0;
    this._groundRing = { x, y, t: 0, duration: 1.05, maxR: 0.28 };
  },

  update(dt, { engine = null, emitTrail = false, starSpeedScale = 1, skyBrightness = 0 } = {}) {
    this._groundFlash = Math.max(0, this._groundFlash - dt * 1.6);

    for (const s of this._distantStars) {
      s.x = (s.x + s.vx * starSpeedScale * dt + 1) % 1;
      s._visibility = cl(1 - skyBrightness * (s.size < 1.05 ? 1.15 : 0.65));
    }

    for (const o of this._orbiters) {
      o.angle += o.speed * dt;
    }

    for (let i = this._pulseWaves.length - 1; i >= 0; i--) {
      this._pulseWaves[i].t += dt;
      if (this._pulseWaves[i].t >= this._pulseWaves[i].duration) {
        this._pulseWaves.splice(i, 1);
      }
    }

    if (this._groundRing) {
      this._groundRing.t += dt;
      if (this._groundRing.t >= this._groundRing.duration) {
        this._groundRing = null;
      }
    }

    if (emitTrail && engine && this._alpha > 0.15) {
      this._trailTimer += dt;
      if (this._trailTimer >= 0.032) {
        this._trailTimer = 0;
        engine.spawn('trail', {
          sceneId: 'star',
          x: this._x + (rnd() - 0.5) * 0.012,
          y: this._y - 0.01,
          vx: (rnd() - 0.5) * 0.014,
          vy: -0.025 - rnd() * 0.02,
          maxLife: 0.55 + rnd() * 0.3,
          size: 1.1 + rnd() * 1.2
        });
      }
    }
  },

  renderBackgroundStars(x, env) {
    const { W, H, u, R, RM } = env;
    for (const s of this._distantStars) {
      const vis = s._visibility ?? 1;
      if (vis <= 0.02) continue;
      const blink = (!s.twinkle || RM) ? 1 : (0.55 + 0.45 * Math.sin(R * s.speed + s.phase));
      x.globalAlpha = s.alpha * blink * vis;
      x.fillStyle = '#FFFFFF';
      x.beginPath();
      x.arc(s.x * W, s.y * H, s.size * Math.max(0.75, u * 0.85), 0, TAU);
      x.fill();
    }
    x.globalAlpha = 1;
  },

  render(x, env) {
    const { W, H, u } = env;
    const minDim = Math.min(W, H);

    // Expanding light pulse waves
    for (const wv of this._pulseWaves) {
      const k = cl(wv.t / wv.duration);
      const rad = Math.max(2, minDim * wv.maxR * ez(k));
      const al = wv.maxAlpha * Math.sin(k * Math.PI);
      const cx = wv.x * W;
      const cy = wv.y * H;
      x.save();
      x.globalCompositeOperation = 'lighter';
      if (wv.thinRing) {
        x.strokeStyle = `rgba(255,228,154,${al})`;
        x.lineWidth = 2.0 * u;
        x.beginPath();
        x.arc(cx, cy, rad, 0, TAU);
        x.stroke();
      } else {
        const gr = x.createRadialGradient(cx, cy, rad * 0.55, cx, cy, rad);
        gr.addColorStop(0, 'rgba(255,235,176,0)');
        gr.addColorStop(0.76, `rgba(255,235,176,${al})`);
        gr.addColorStop(1, 'rgba(255,235,176,0)');
        x.fillStyle = gr;
        x.beginPath();
        x.arc(cx, cy, rad, 0, TAU);
        x.fill();
      }
      x.restore();
    }

    // Ground contact golden sphere + thin spreading ring
    if (this._groundFlash > 0.02) {
      const gx = 0.5 * W, gy = 0.86 * H;
      x.save();
      x.globalCompositeOperation = 'lighter';
      glow(x, gx, gy, 36 * u * (1 + (1 - this._groundFlash) * 0.5), this._groundFlash * 0.85, G);
      x.restore();
    }
    if (this._groundRing) {
      const gr = this._groundRing;
      const k = ez(cl(gr.t / gr.duration));
      const fade = 1 - cl(gr.t / gr.duration);
      x.save();
      x.globalCompositeOperation = 'lighter';
      x.strokeStyle = `rgba(255,228,148,${0.65 * fade})`;
      x.lineWidth = 1.6 * u;
      x.beginPath();
      x.ellipse(gr.x * W, gr.y * H, minDim * gr.maxR * k, minDim * gr.maxR * k * 0.24, 0, 0, TAU);
      x.stroke();
      x.restore();
    }

    if (this._alpha <= 0.01 || this._size <= 0.2) return;

    const sx = this._x * W;
    const sy = this._y * H;
    const sz = this._size * u;

    x.save();
    x.globalCompositeOperation = 'lighter';
    // Golden halo
    glow(x, sx, sy, sz * 6.5, this._alpha * 0.72, G);
    // Soft four-point star rays
    x.globalAlpha = this._alpha * 0.96;
    x.fillStyle = '#FFFFFF';
    star4(x, sx, sy, sz * 2.35, 0);
    x.globalAlpha = this._alpha * 0.45;
    x.fillStyle = '#FFE7A3';
    star4(x, sx, sy, sz * 1.4, Math.PI * 0.25);

    // Intense white core
    glow(x, sx, sy, sz * 1.4, this._alpha, G);

    // Tiny orbiting starlight specks
    for (const o of this._orbiters) {
      const ox = sx + Math.cos(o.angle) * o.radius * minDim;
      const oy = sy + Math.sin(o.angle) * o.radius * minDim * 0.68;
      glow(x, ox, oy, o.size * 2.8 * u, this._alpha * 0.7, G);
    }
    x.restore();
    x.globalAlpha = 1;
  }
};

export default starAnimation;
