export const PARTICLE_CATEGORIES = {
  DECORATIVE: 'decorative',
  TRANSFORMATION: 'transformation'
} as const;

export type ParticleCategory = typeof PARTICLE_CATEGORIES[keyof typeof PARTICLE_CATEGORIES];
export type ParticleShape = 'glow' | 'dot' | 'streak' | 'petal';
export type ParticleBehavior = 'linear' | 'orbit' | 'converge' | 'curvePath' | 'disperse';

export interface ParticleDefinition {
  id: string;
  category: ParticleCategory;
  size: [number, number];
  alpha: [number, number];
  color: string;
  glowIntensity: number;
  shape: ParticleShape;
  defaultLife: [number, number];
  gravity: number;
}

export type ParticleTypeName =
  | 'primaryGold'
  | 'luminousDust'
  | 'whiteSpark'
  | 'energy'
  | 'trail'
  | 'dispersion'
  | 'formation'
  | 'ambient'
  | 'petal'
  | 'pollen';

export const PARTICLE_TYPES: Record<ParticleTypeName, ParticleDefinition> = {
  primaryGold: {
    id: 'primaryGold',
    category: PARTICLE_CATEGORIES.TRANSFORMATION,
    size: [2.2, 4.4],
    alpha: [0.65, 1.0],
    color: '#FFE59E',
    glowIntensity: 1.0,
    shape: 'glow',
    defaultLife: [1.4, 2.8],
    gravity: 0
  },
  luminousDust: {
    id: 'luminousDust',
    category: PARTICLE_CATEGORIES.DECORATIVE,
    size: [0.6, 1.5],
    alpha: [0.18, 0.48],
    color: '#FFF4D4',
    glowIntensity: 0.45,
    shape: 'dot',
    defaultLife: [3.2, 6.0],
    gravity: -0.002
  },
  whiteSpark: {
    id: 'whiteSpark',
    category: PARTICLE_CATEGORIES.DECORATIVE,
    size: [1.0, 2.3],
    alpha: [0.45, 0.92],
    color: '#FFFFFF',
    glowIntensity: 0.85,
    shape: 'glow',
    defaultLife: [1.2, 2.5],
    gravity: 0
  },
  energy: {
    id: 'energy',
    category: PARTICLE_CATEGORIES.TRANSFORMATION,
    size: [1.6, 3.2],
    alpha: [0.7, 1.0],
    color: '#FFF6CE',
    glowIntensity: 1.15,
    shape: 'streak',
    defaultLife: [0.55, 1.1],
    gravity: 0
  },
  trail: {
    id: 'trail',
    category: PARTICLE_CATEGORIES.TRANSFORMATION,
    size: [1.0, 2.4],
    alpha: [0.4, 0.82],
    color: '#FFD982',
    glowIntensity: 0.72,
    shape: 'glow',
    defaultLife: [0.35, 0.85],
    gravity: 0
  },
  dispersion: {
    id: 'dispersion',
    category: PARTICLE_CATEGORIES.TRANSFORMATION,
    size: [1.4, 2.8],
    alpha: [0.55, 0.95],
    color: '#FFE6A2',
    glowIntensity: 0.9,
    shape: 'glow',
    defaultLife: [0.9, 1.8],
    gravity: 0.015
  },
  formation: {
    id: 'formation',
    category: PARTICLE_CATEGORIES.TRANSFORMATION,
    size: [1.5, 2.6],
    alpha: [0.72, 1.0],
    color: '#FFF2BE',
    glowIntensity: 0.95,
    shape: 'glow',
    defaultLife: [2.0, 5.0],
    gravity: 0
  },
  ambient: {
    id: 'ambient',
    category: PARTICLE_CATEGORIES.DECORATIVE,
    size: [1.0, 2.8],
    alpha: [0.22, 0.65],
    color: '#FFE8B0',
    glowIntensity: 0.6,
    shape: 'glow',
    defaultLife: [3.5, 7.0],
    gravity: 0
  },
  petal: {
    id: 'petal',
    category: PARTICLE_CATEGORIES.DECORATIVE,
    size: [3.2, 6.2],
    alpha: [0.6, 0.9],
    color: '#FFE4F0',
    glowIntensity: 0.25,
    shape: 'petal',
    defaultLife: [4.0, 7.5],
    gravity: 0.014
  },
  pollen: {
    id: 'pollen',
    category: PARTICLE_CATEGORIES.DECORATIVE,
    size: [0.8, 1.7],
    alpha: [0.5, 0.9],
    color: '#FFE084',
    glowIntensity: 0.75,
    shape: 'glow',
    defaultLife: [1.8, 3.4],
    gravity: -0.012
  }
};

export default PARTICLE_TYPES;
