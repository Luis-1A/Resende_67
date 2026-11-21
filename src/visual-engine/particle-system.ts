import { visualSettings } from '../config/visual-settings';

export type ParticleRecord = Record<string, any>;

export class ParticlePool<T extends ParticleRecord = ParticleRecord> {
  maxSize: number;
  active: T[];
  free: T[];

  constructor(maxSize = visualSettings.maxPoolSize) {
    this.maxSize = maxSize;
    this.active = [];
    this.free = [];
  }

  acquire(props: Partial<T>): T {
    let p = this.free.pop();
    if (!p) {
      if (this.active.length >= this.maxSize) {
        p = this.active.shift() as T;
      } else {
        p = {} as T;
      }
    }
    Object.assign(p, props);
    this.active.push(p);
    return p;
  }

  releaseAt(index: number): void {
    const last = this.active.length - 1;
    const removed = this.active[index];
    if (index !== last) this.active[index] = this.active[last];
    this.active.pop();
    if (this.free.length < this.maxSize) this.free.push(removed);
  }

  clear(): void {
    while (this.active.length) {
      const p = this.active.pop();
      if (p && this.free.length < this.maxSize) this.free.push(p);
    }
  }
}

export const particleSystem = {
  pools: new Map<string, ParticlePool>(),

  getPool<T extends ParticleRecord = ParticleRecord>(name: string, maxSize = visualSettings.maxPoolSize): ParticlePool<T> {
    let pool = this.pools.get(name);
    if (!pool) {
      pool = new ParticlePool(maxSize);
      this.pools.set(name, pool);
    }
    return pool as ParticlePool<T>;
  },

  clearPool(name: string): void {
    const pool = this.pools.get(name);
    if (pool) pool.clear();
  },

  clearAll(): void {
    for (const pool of this.pools.values()) pool.clear();
  }
};
