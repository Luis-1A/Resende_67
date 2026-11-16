import { settings } from './config/settings.js';
import { screenManager } from './screen-manager.js';
import { audioManager } from './audio-manager.js';
import { animationManager } from './animation-manager.js';
import { sceneManager } from './scene-manager.js';

const $ = id => document.getElementById(id);

const canvas = $('c');
const ctx2d = canvas.getContext('2d');
const dom = {
  canvas,
  ctx: ctx2d,
  tx: $('tx'),
  card: $('card'),
  st: $('st'),
  nt: $('nt'),
  nx: $('nx')
};

let R = 0;
let last = 0;
let started = false;

screenManager.init(canvas);
audioManager.init();
animationManager.init({
  canvas,
  ctx2d,
  card: dom.card,
  nx: dom.nx,
  tx: dom.tx,
  screenManager,
  settings,
  getTime: () => R,
  onFinish: () => sceneManager.finish()
});
sceneManager.init(dom);

// Load only lightweight idle stars before user starts
await animationManager.activateScene([
  { name: 'stars', params: { idle: true } }
]);

dom.nx.onclick = e => {
  e.stopPropagation();
  sceneManager.handleContinueClick();
};

addEventListener('pointermove', e => {
  if (!started) return;
  sceneManager.handlePointerMove(e);
});

addEventListener('pointerdown', e => {
  if (!started) {
    started = true;
    screenManager.setRunning(true);
    screenManager.requestWakeLock().then(ok => {
      if (!ok && !('wakeLock' in navigator)) {
        dom.nt.textContent = 'Para aproveitar a homenagem inteira sem interrupções, recomendamos manter o navegador aberto.';
        dom.nt.style.opacity = .7;
        setTimeout(() => { dom.nt.style.opacity = 0; }, 7000);
      }
    });
    dom.st.style.display = 'none';
    sceneManager.load(0, R);
    return;
  }
  sceneManager.handlePointerDown(e);
});

function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min(settings.maxDeltaSeconds, (ts - last) / 1000 || .016);
  last = ts;
  R += dt;

  if (!started) {
    const bounds = screenManager.getBounds();
    const env = { ...bounds, sc: -1, R, t0: 0, sceneElapsed: R, exiting: null, tm: [], fin: false, RM: settings.reducedMotion };
    animationManager.update(dt, env);
    animationManager.render(ctx2d, env);
    return;
  }

  sceneManager.tick(dt, R);
}

requestAnimationFrame(frame);
