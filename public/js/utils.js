export const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const L = (a, b, k) => a + (b - a) * k;
export const ez = k => k * k * (3 - 2 * k);
export const rnd = Math.random;
export const TAU = 6.283185;

export const hp = t => [
  16 * Math.pow(Math.sin(t), 3),
  -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
];

export function mkSpr(w, h, fn) {
  const o = document.createElement('canvas');
  o.width = w; o.height = h;
  fn(o.getContext('2d'), w, h);
  return o;
}

export const G = mkSpr(64, 64, c => {
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,250,232,1)');
  g.addColorStop(.26, 'rgba(255,228,162,.52)');
  g.addColorStop(.62, 'rgba(255,198,118,.14)');
  g.addColorStop(1, 'rgba(255,220,160,0)');
  c.fillStyle = g; c.fillRect(0, 0, 64, 64);
});

export const GB = mkSpr(64, 64, c => {
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(220,240,255,1)');
  g.addColorStop(.3, 'rgba(120,180,255,.45)');
  g.addColorStop(1, 'rgba(120,180,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 64, 64);
});

export const CG = mkSpr(128, 48, c => {
  const g = c.createRadialGradient(64, 24, 0, 64, 24, 62);
  g.addColorStop(0, 'rgba(215,232,255,.95)');
  g.addColorStop(.5, 'rgba(205,225,255,.35)');
  g.addColorStop(1, 'rgba(205,225,255,0)');
  c.fillStyle = g;
  c.beginPath(); c.ellipse(64, 24, 62, 22, 0, 0, TAU); c.fill();
});

export const VG = mkSpr(256, 256, c => {
  const g = c.createRadialGradient(128, 128, 60, 128, 128, 175);
  g.addColorStop(0, 'rgba(4,5,10,0)');
  g.addColorStop(.68, 'rgba(6,7,12,.18)');
  g.addColorStop(1, 'rgba(3,4,9,.62)');
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
});

export function glow(x, px, py, r, a, spr = G) {
  if (a <= .005 || r <= .2) return;
  x.globalAlpha = cl(a);
  x.drawImage(spr, px - r, py - r, 2 * r, 2 * r);
}

export function rr(x, a, b, w, h, r) {
  x.beginPath();
  x.moveTo(a + r, b);
  x.arcTo(a + w, b, a + w, b + h, r);
  x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r);
  x.arcTo(a, b, a + w, b, r);
  x.closePath();
}

export function star4(x, px, py, sz, rot = 0) {
  x.save(); x.translate(px, py); if (rot) x.rotate(rot);
  x.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 ? sz * .19 : sz, a = i * .7854;
    i ? x.lineTo(Math.cos(a) * r, Math.sin(a) * r) : x.moveTo(r, 0);
  }
  x.closePath(); x.fill(); x.restore();
}

let cached18 = null;
export function getNumber18Points() {
  if (cached18) return cached18;
  const o = document.createElement('canvas');
  o.width = 340; o.height = 220;
  const c = o.getContext('2d');
  c.fillStyle = '#fff';
  c.font = 'bold 200px Arial,sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('18', 170, 118);
  const d = c.getImageData(0, 0, 340, 220).data;
  const q = [];
  for (let j = 0; j < 220; j += 5) {
    for (let i = 0; i < 340; i += 5) {
      if (d[(j * 340 + i) * 4 + 3] > 128) q.push([(i - 170) / 100, (j - 110) / 100, i < 155]);
    }
  }
  cached18 = q.map((a, idx) => {
    const ang = (idx / q.length) * TAU;
    return { a, cx: Math.cos(ang) * .95, cy: Math.sin(ang) * .72, d: rnd() * .35, p: rnd() * 6, ang };
  });
  return cached18;
}
