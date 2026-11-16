import { cl, ez, glow, rr, TAU } from '../utils.js';

export const friendshipAnimation = {
  name: 'friendship',
  layer: 1,
  worldSpace: true,
  _active: false,

  init() {},

  play() {
    this._active = true;
  },

  stop() {
    this._active = false;
  },

  destroy() {
    this._active = false;
  },

  update() {},

  render(x, env) {
    if (!this._active) return;
    const { W, H, sceneElapsed: st } = env;

    // Golden-violet sunset sun & horizon glow behind mountain silhouettes
    x.globalCompositeOperation = 'lighter';
    glow(x, W * .7, H * .54, W * .65, .72);
    glow(x, W * .7, H * .56, Math.min(W, H) * .14, .65);
    x.globalCompositeOperation = 'source-over';

    // Two symbolic faceless silhouettes on sunset ridge
    x.fillStyle = 'rgba(20,12,34,.96)';
    [.43, .55].forEach((px, i) => {
      const bx = px * W, by = H * .88, k = ez(cl((st - 2 - i * 1.2) / 3));
      x.globalAlpha = k;
      x.beginPath(); x.arc(bx, by - H * .102, H * .017, 0, TAU); x.fill();
      rr(x, bx - H * .02, by - H * .084, H * .04, H * .062, 8); x.fill();
      rr(x, bx - H * .018, by - H * .028, H * .068, H * .021, 5); x.fill();
    });
    x.globalAlpha = 1;
  }
};

export default friendshipAnimation;
