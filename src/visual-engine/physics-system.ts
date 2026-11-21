export interface SparkParticle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  l: number;
}

export interface PetalParticle {
  x: number;
  y: number;
  p: number;
  s: number;
}

export const physicsSystem = {
  wind(time: number, phase = 0, strength = 1): number {
    return (Math.sin(time * 0.45 + phase) * 0.65 + Math.sin(time * 1.15 + phase * 1.7) * 0.35) * strength;
  },

  integrateSpark(p: SparkParticle, dt: number, gravityPx: number): boolean {
    p.px = p.x;
    p.py = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += gravityPx * dt;
    p.vx *= 0.99;
    p.l -= dt;
    return p.l > 0;
  },

  integratePetal(p: PetalParticle, dt: number, time: number, windFactor: number, W: number, H: number): void {
    const gust = this.wind(time, p.p, 16 * windFactor);
    p.x = ((p.x + (gust + 8 * p.s) * dt) % W + W) % W;
    p.y += (22 * p.s) * dt;
    if (p.y > H * 1.08) p.y = -H * 0.06;
  }
};
