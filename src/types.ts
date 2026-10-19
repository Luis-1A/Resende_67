export type TransitionType = 'pages' | 'bubbles' | 'suck' | 'heart' | 'path' | 'glow' | 'unlock';

export interface StoryGroup {
  fx?: 'bub' | 'far' | 'near' | 'zoom' | 'conf';
  paragraphs: string[];
}

export interface ChapterData {
  id: number;
  title: string;
  groups: StoryGroup[];
  isSm?: boolean;
}

export interface Balloon {
  s: number;
  x: number;
  y: number;
  xm?: number;
  ym?: number;
  d: number;
  p: number;
  t: number;
  m: 'r' | 's';
  ph: number;
  px?: number;
  vx: number;
}

export interface Ribbon {
  s: number;
  y: number;
  v: number;
  a: number;
  ph: number;
  t: number;
  l: number;
  c: number;
}

export interface CanvasParticle {
  x: number;
  y: number;
  r: number;
  b: number;
  l: number;
  ph: number;
}

export interface ConfettiParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
  vr: number;
  w: number;
  c: string;
}

export interface GoldParticle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  p: number;
}

export interface CosmicParticle {
  i: number;
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  sp: number;
  dl: number;
  s: number;
}

export interface LightRayParticle {
  a: number;
  r: number;
  sp: number;
  s: number;
}
