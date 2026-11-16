import { cl, ez, rnd, CG, VG } from '../utils.js';

export const starsAnimation = {
  name: 'stars',
  layer: 2,
  worldSpace: true,
  _ctx: null,
  _active: false,
  _unsubResize: null,
  _ST: [],
  _CL: [],
  _M0: [],
  _M1: [],
  _skyG: null,
  _gndG: null,
  _params: {
    skyColors: ['#050C20', '#142852', '#284A7E'],
    starDensity: 1,
    mountains: null,
    mountainReveal: false,
    ground: false,
    groundTop: '#0B2A24',
    idle: false
  },

  init(ctx, params = {}) {
    this._ctx = ctx;
    this._buildStars(params.starCount || 90, params.cloudCount || 9);
    this._buildTerrain(ctx.screenManager.getBounds());
    if (!this._unsubResize) {
      this._unsubResize = ctx.screenManager.onResize(b => {
        this._buildTerrain(b);
        this._rebuildGradients(b);
      });
    }
  },

  _buildStars(starCount, cloudCount) {
    this._ST = [];
    for (let i = 0; i < starCount; i++) {
      this._ST.push([
        rnd(),
        rnd() * .72,
        .55 + rnd() * 1.65,
        rnd() * 6,
        i % 3,
        i % 5 === 0 ? '#DCEBFF' : i % 7 === 0 ? '#FFF1CC' : '#FFFFFF'
      ]);
    }
    this._CL = [];
    for (let i = 0; i < cloudCount; i++) {
      this._CL.push({
        x: rnd(),
        y: .08 + rnd() * .28,
        w: .22 + rnd() * .24,
        spd: .0028 + rnd() * .0045,
        a: .05 + rnd() * .07
      });
    }
  },

  _buildTerrain({ W, H }) {
    const sample = (b, a, sd) => {
      const pts = [];
      for (let i = 0; i <= W + 24; i += 20) {
        pts.push([i, H * b - H * a * (Math.sin(i * .004 + sd) + .5 * Math.sin(i * .011 + sd * 2) + .22 * Math.sin(i * .023 + sd * 3) + 1.5) / 3]);
      }
      return pts;
    };
    this._M0 = sample(.62, .16, 1);
    this._M1 = sample(.76, .12, 4);
  },

  _rebuildGradients({ H }) {
    if (!this._ctx || !this._ctx.ctx2d) return;
    const x = this._ctx.ctx2d;
    const cols = this._params.skyColors || ['#050C20', '#142852', '#284A7E'];
    this._skyG = x.createLinearGradient(0, 0, 0, H);
    this._skyG.addColorStop(0, cols[0]);
    this._skyG.addColorStop(.56, cols[1]);
    this._skyG.addColorStop(1, cols[2]);
    this._gndG = x.createLinearGradient(0, H * .86, 0, H);
    this._gndG.addColorStop(0, this._params.groundTop || '#0B2A24');
    this._gndG.addColorStop(1, '#030D0B');
  },

  play(params = {}) {
    this._params = { ...this._params, ...params };
    this._active = true;
    this._rebuildGradients(this._ctx.screenManager.getBounds());
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
    if (this._unsubResize) {
      this._unsubResize();
      this._unsubResize = null;
    }
    this._ST = [];
    this._CL = [];
    this._M0 = [];
    this._M1 = [];
  },

  update(dt, env) {
    if (!this._active || env.RM || !this._params.starDensity) return;
    for (const c of this._CL) {
      c.x = (c.x + c.spd * dt) > 1.25 ? -.3 : c.x + c.spd * dt;
    }
  },

  renderBackdrop(x, env) {
    if (!this._active) return;
    const { W, H, u, R, RM } = env;
    if (this._params.idle) {
      x.fillStyle = '#07112A';
      x.fillRect(0, 0, W, H);
      x.fillStyle = '#fff';
      for (const a of this._ST) {
        x.globalAlpha = .4 + .5 * Math.sin(R * 2 + a[3]);
        x.fillRect(a[0] * W, a[1] * H, a[2] * u, a[2] * u);
      }
      x.globalAlpha = 1;
      return;
    }

    if (this._skyG) {
      x.fillStyle = this._skyG;
      x.fillRect(0, 0, W, H);
    }

    const density = this._params.starDensity || 0;
    if (density > 0) {
      for (const a of this._ST) {
        const tw = RM ? .8 : (.32 + .68 * (.5 + .5 * Math.sin(R * (1 + a[4] * .6) + a[3])));
        const sx = a[0] * W, sy = a[1] * H, sz = a[2] * u;
        x.globalAlpha = density * tw * (a[4] === 2 ? .9 : a[4] === 1 ? .68 : .42);
        x.fillStyle = a[5];
        x.fillRect(sx, sy, sz, sz);
        if (a[4] === 2 && a[2] > 1.65 && tw > .72) {
          x.fillRect(sx - sz * 1.1, sy + sz * .35, sz * 3.2, sz * .35);
          x.fillRect(sx + sz * .35, sy - sz * 1.1, sz * .35, sz * 3.2);
        }
      }
      for (const c of this._CL) {
        const gx = c.x * W, gy = c.y * H, gw = c.w * W;
        x.globalAlpha = c.a * density;
        x.drawImage(CG, gx - gw, gy - gw * .36, gw * 2, gw * .72);
      }
      x.globalAlpha = 1;
    }
  },

  render(x, env) {
    if (!this._active || this._params.idle) return;
    const { W, H, R, sceneElapsed } = env;
    const m = this._params.mountains;
    if (m) {
      const ma = this._params.mountainReveal ? ez(cl((sceneElapsed - 6.8) / 3)) : 1;
      const mb = this._params.mountainReveal ? ez(cl((sceneElapsed - 8.2) / 3)) : 1;
      const drawRidge = (col, pts, al) => {
        x.globalAlpha = al;
        x.fillStyle = col;
        x.beginPath();
        x.moveTo(0, H);
        for (let i = 0; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
        x.lineTo(W, H);
        x.closePath();
        x.fill();
      };
      drawRidge(m[0], this._M0, ma);
      drawRidge(m[1], this._M1, mb);
      x.globalCompositeOperation = 'lighter';
      x.globalAlpha = .13 * ma;
      x.drawImage(CG, ((R * 12) % (W * 1.6)) - W * .5, H * .62, W * .9, H * .14);
      x.globalAlpha = 1;
      x.globalCompositeOperation = 'source-over';
    }
    if (this._params.ground && this._gndG) {
      x.fillStyle = this._gndG;
      x.fillRect(0, H * .88, W, H * .12);
    }
  },

  renderOverlay(x, env) {
    if (!this._active) return;
    x.globalAlpha = this._params.idle ? .65 : .72;
    x.drawImage(VG, 0, 0, env.W, env.H);
    x.globalAlpha = 1;
    if (env.fin) {
      x.fillStyle = 'rgba(8,16,40,.14)';
      x.fillRect(0, 0, env.W, env.H);
    }
  }
};

export default starsAnimation;
