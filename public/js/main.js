import { settings } from './config/settings.js';
import { screenManager } from './screen-manager.js';
import { audioManager } from './audio-manager.js';
import { animationManager } from './animation-manager.js';
import { sceneManager } from './scene-manager.js';
import { canvasEngine } from './visual-engine/canvas-engine.js';
import { canvasManager } from './visual-engine/canvas-manager.js';

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

let started = false;

audioManager.init();
animationManager.init({
  canvas,
  ctx2d,
  card: dom.card,
  nx: dom.nx,
  tx: dom.tx,
  screenManager,
  settings,
  getTime: () => canvasEngine.getTime(),
  onFinish: () => sceneManager.finish()
});
sceneManager.init(dom);

canvasEngine.init({
  canvas,
  animationManager,
  onTick: (dt, R) => {
    if (!started) {
      const bounds = screenManager.getBounds();
      return { ...bounds, sc: -1, R, t0: 0, sceneElapsed: R, exiting: null, tm: [], fin: false, RM: settings.reducedMotion };
    }
    return sceneManager.tick(dt, R);
  }
});

// Configure lightweight starry sky & gentle fireflies for initial screen
await canvasManager.configureScene({
  atmosphere: {
    skyColors: ['#050C20', '#0A1636', '#11224D'],
    mountains: null,
    ground: false,
    cloudDensity: 0.45
  },
  effects: [
    { name: 'stars', params: { density: 0.9 } },
    { name: 'fireflies', params: { count: 10, glowIntensity: 0.55 } }
  ]
});

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
    audioManager.start();
    screenManager.requestWakeLock().then(ok => {
      if (!ok && !('wakeLock' in navigator)) {
        dom.nt.textContent = 'Para aproveitar a homenagem inteira sem interrupções, recomendamos manter o navegador aberto.';
        dom.nt.style.opacity = .7;
        setTimeout(() => { dom.nt.style.opacity = 0; }, 7000);
      }
    });
    dom.st.style.display = 'none';
    sceneManager.load(0, canvasEngine.getTime());
    return;
  }
  audioManager.ensurePlaying();
  sceneManager.handlePointerDown(e);
});

addEventListener('click', () => {
  if (started) {
    audioManager.ensurePlaying();
  }
});

canvasEngine.start();
