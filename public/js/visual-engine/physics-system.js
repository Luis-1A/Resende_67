export const physicsSystem = {
  wind(time, phase = 0, strength = 1) {
    return (Math.sin(time * 0.45 + phase) * 0.65 + Math.sin(time * 1.15 + phase * 1.7) * 0.35) * strength;
  },

  integrateSpark(p, dt, gravityPx) {
    p.px = p.x;
    p.py = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += gravityPx * dt;
    p.vx *= 0.99;
    p.l -= dt;
    return p.l > 0;
  },

  integratePetal(p, dt, time, windFactor, W, H) {
    const gust = this.wind(time, p.p, 16 * windFactor);
    p.x = ((p.x + (gust + 8 * p.s) * dt) % W + W) % W;
    p.y += (22 * p.s) * dt;
    if (p.y > H * 1.08) p.y = -H * 0.06;
  }
};
