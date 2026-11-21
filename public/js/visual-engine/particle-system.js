import { visualSettings } from '../config/visual-settings.js';

export class ParticlePool {
  constructor(maxSize = visualSettings.maxPoolSize) {
    this.maxSize = maxSize;
    this.active = [];
    this.free = [];
  }

  acquire(props) {
    let p = this.free.pop();
    if (!p) {
      if (this.active.length >= this.maxSize) {
        p = this.active.shift();
      } else {
        p = {};
      }
    }
    Object.assign(p, props);
    this.active.push(p);
    return p;
  }

  releaseAt(index) {
    const last = this.active.length - 1;
    const removed = this.active[index];
    if (index !== last) this.active[index] = this.active[last];
    this.active.pop();
    if (this.free.length < this.maxSize) this.free.push(removed);
  }

  clear() {
    while (this.active.length) {
      const p = this.active.pop();
      if (this.free.length < this.maxSize) this.free.push(p);
    }
  }
}

export const particleSystem = {
  pools: new Map(),

  getPool(name, maxSize = visualSettings.maxPoolSize) {
    if (!this.pools.has(name)) {
      this.pools.set(name, new ParticlePool(maxSize));
    }
    return this.pools.get(name);
  },

  clearPool(name) {
    const pool = this.pools.get(name);
    if (pool) pool.clear();
  },

  clearAll() {
    for (const pool of this.pools.values()) pool.clear();
  }
};
