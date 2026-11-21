import { cl, ez, L, rnd, glow, G, TAU } from '../../utils';
import type { RenderEnv } from '../../types/app';

export interface ButterflyPoint {
  x: number;
  y: number;
}

export interface ButterflySpawnConfig {
  p0?: ButterflyPoint;
  p1?: ButterflyPoint;
  p2?: ButterflyPoint;
  duration?: number;
  scale?: number;
  colorPrimary?: string;
  colorSecondary?: string;
  accent?: string;
  landing?: boolean;
  landFlower?: unknown;
  z?: number;
}

interface ButterflyInstance {
  p0: ButterflyPoint;
  p1: ButterflyPoint;
  p2: ButterflyPoint;
  duration: number;
  elapsed: number;
  scale: number;
  colorPrimary: string;
  colorSecondary: string;
  accent: string;
  landing: boolean;
  landFlower: unknown;
  z: number;
  x: number;
  y: number;
  angle: number;
  flapPeriod: number;
  phase: number;
  bodyTilt: number;
  wingFold: number;
  alpha: number;
}

export const butterflyAnimation = {
  _butterflies: [] as ButterflyInstance[],

  init(): void {
    this._butterflies = [];
  },

  spawn({
    p0 = { x: 0, y: 0.72 },
    p1 = { x: 0.4, y: 0.42 },
    p2 = { x: 0.96, y: 0.24 },
    duration = 7.5,
    scale = 1,
    colorPrimary = '#FFECC4',
    colorSecondary = '#FFD2E4',
    accent = '#FFD978',
    landing = false,
    landFlower = null,
    z = 1.0
  }: ButterflySpawnConfig = {}): void {
    this._butterflies.push({
      p0,
      p1,
      p2,
      duration,
      elapsed: 0,
      scale,
      colorPrimary,
      colorSecondary,
      accent,
      landing,
      landFlower,
      z,
      x: p0.x,
      y: p0.y,
      angle: 0,
      flapPeriod: 0.44 + rnd() * 0.28,
      phase: rnd() * TAU,
      bodyTilt: 0,
      wingFold: 0,
      alpha: 0
    });
  },

  update(dt: number, globalT: number): void {
    for (let i = this._butterflies.length - 1; i >= 0; i--) {
      const b = this._butterflies[i];
      b.elapsed += dt;
      const rawT = b.elapsed / b.duration;

      if (!b.landing && rawT >= 1.1) {
        this._butterflies.splice(i, 1);
        continue;
      }

      const t = cl(rawT);
      const k = b.landing ? (1 - Math.pow(1 - t, 2.3)) : ez(t);
      const inv = 1 - k;

      const prevX = b.x;
      const prevY = b.y;
      const nextX = inv * inv * b.p0.x + 2 * inv * k * b.p1.x + k * k * b.p2.x;
      let nextY = inv * inv * b.p0.y + 2 * inv * k * b.p1.y + k * k * b.p2.y;

      const hoverAmp = b.landing ? L(0.014, 0.001, t) : 0.014;
      nextY += Math.sin(globalT * 2.6 + b.phase) * hoverAmp;

      const dx = nextX - prevX;
      const dy = nextY - prevY;
      if (Math.abs(dx) + Math.abs(dy) > 0.0002) {
        const moveAng = Math.atan2(dy, dx);
        b.bodyTilt = L(b.bodyTilt, cl(moveAng * 0.35, -0.45, 0.45), cl(dt * 6));
      }

      b.x = nextX;
      b.y = nextY;

      if (b.landing && rawT > 0.72) {
        const settleK = cl((rawT - 0.72) / 0.28);
        b.bodyTilt = L(b.bodyTilt, -0.18, settleK);
        b.wingFold = settleK * 0.42;
      }

      const fadeIn = cl(b.elapsed / 0.65);
      const fadeOut = !b.landing && rawT > 0.85 ? cl((1.05 - rawT) / 0.2) : 1;
      b.alpha = Math.max(0, fadeIn * fadeOut);
    }
  },

  render(x: CanvasRenderingContext2D, env: RenderEnv, cameraScale = 1, cameraOffsetY = 0): void {
    const { W, H, u, R, RM } = env;

    for (const b of this._butterflies) {
      if (b.alpha <= 0.01) continue;
      const depth = b.z * (0.9 + 0.1 * cameraScale);
      const px = W * 0.5 + (b.x - 0.5) * W * cameraScale;
      const py = b.y * H + cameraOffsetY;
      const sc = 11 * u * b.scale * depth;

      const cycle = (R / b.flapPeriod) * TAU + b.phase;
      const amp = RM ? 0.3 : L(1.0, 0.28, b.wingFold);
      const upperFlap = Math.max(0.18, Math.abs(Math.cos(cycle)) * amp + (1 - amp) * 0.45);
      const lowerFlap = Math.max(0.22, Math.abs(Math.cos(cycle - 0.34)) * amp + (1 - amp) * 0.52);

      x.save();
      x.translate(px, py);
      x.rotate(b.bodyTilt);

      x.save();
      x.globalCompositeOperation = 'lighter';
      glow(x, 0, 0, sc * 2.1, b.alpha * 0.28, G);
      x.restore();

      const drawWingPair = (side: number): void => {
        x.save();
        x.scale(side * upperFlap, 1);
        x.globalAlpha = b.alpha * 0.9;
        x.fillStyle = b.colorPrimary;
        x.beginPath();
        x.moveTo(0, -sc * 0.1);
        x.bezierCurveTo(sc * 0.9, -sc * 1.15, sc * 1.48, -sc * 0.65, sc * 1.15, sc * 0.05);
        x.bezierCurveTo(sc * 0.72, sc * 0.2, sc * 0.25, sc * 0.1, 0, 0);
        x.fill();
        x.strokeStyle = b.accent;
        x.lineWidth = Math.max(0.8, sc * 0.06);
        x.stroke();
        x.restore();

        x.save();
        x.scale(side * lowerFlap, 1);
        x.globalAlpha = b.alpha * 0.82;
        x.fillStyle = b.colorSecondary;
        x.beginPath();
        x.moveTo(0, sc * 0.05);
        x.bezierCurveTo(sc * 0.78, sc * 0.14, sc * 1.05, sc * 0.75, sc * 0.55, sc * 1.0);
        x.bezierCurveTo(sc * 0.22, sc * 0.9, sc * 0.06, sc * 0.48, 0, sc * 0.12);
        x.fill();
        x.restore();
      };

      drawWingPair(1);
      drawWingPair(-1);

      x.globalAlpha = b.alpha * 0.95;
      x.fillStyle = '#FFECC8';
      x.beginPath();
      x.ellipse(0, sc * 0.1, sc * 0.11, sc * 0.48, 0, 0, TAU);
      x.fill();

      x.beginPath();
      x.arc(0, -sc * 0.42, sc * 0.11, 0, TAU);
      x.fill();

      x.strokeStyle = 'rgba(255,240,200,0.85)';
      x.lineWidth = Math.max(0.8, sc * 0.055);
      x.beginPath();
      x.moveTo(-sc * 0.04, -sc * 0.48);
      x.quadraticCurveTo(-sc * 0.24, -sc * 0.85, -sc * 0.34, -sc * 0.78);
      x.moveTo(sc * 0.04, -sc * 0.48);
      x.quadraticCurveTo(sc * 0.24, -sc * 0.85, sc * 0.34, -sc * 0.78);
      x.stroke();

      x.restore();
    }
    x.globalAlpha = 1;
  }
};

export default butterflyAnimation;
