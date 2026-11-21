import { settings } from './config/settings';
import { audioManager } from './audio-manager';
import type { DomRefs } from './types/app';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface StrokeDef {
  id: string;
  d: string;
  className: string;
  duration: number;
  pauseAfter: number;
}

interface FimRefs {
  wrap: HTMLDivElement;
  paths: SVGPathElement[];
  nibGlow: SVGCircleElement;
  nibCore: SVGCircleElement;
}

const FIM_STROKES: StrokeDef[] = [
  {
    id: 'f-stem',
    d: 'M 120 35 C 117 22, 102 20, 97 36 C 93 50, 90 80, 84 106 C 81 118, 74 121, 69 115',
    className: 'ending-fim-stroke',
    duration: 900,
    pauseAfter: 160
  },
  {
    id: 'f-cross',
    d: 'M 74 66 C 88 64, 102 62, 115 60',
    className: 'ending-fim-stroke',
    duration: 420,
    pauseAfter: 180
  },
  {
    id: 'im-flow',
    d: 'M 119 77 C 125 70, 131 63, 134 61 C 131 73, 129 85, 130 93 C 132 98, 141 93, 147 80 C 151 69, 155 61, 159 61 C 164 61, 159 80, 157 94 C 161 79, 170 61, 179 61 C 184 61, 180 80, 178 94 C 182 79, 192 61, 200 61 C 206 61, 202 80, 201 90 C 201 97, 212 95, 226 83',
    className: 'ending-fim-stroke',
    duration: 1550,
    pauseAfter: 240
  },
  {
    id: 'i-dot',
    d: 'M 135.5 45.5 Q 137.5 43.5 139.5 45',
    className: 'ending-fim-dot',
    duration: 180,
    pauseAfter: 0
  }
];

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export const endingSequence = {
  _started: false,
  _overlay: null as HTMLDivElement | null,
  _refs: null as FimRefs | null,
  _timers: [] as ReturnType<typeof setTimeout>[],
  _rafId: 0,

  start({ dom }: { dom?: DomRefs | null } = {}): void {
    if (this._started || typeof document === 'undefined') return;
    this._started = true;

    const holdMs = settings.reducedMotion ? 800 : 2400;
    const fadeBlackMs = settings.reducedMotion ? 800 : 2400;

    const t1 = setTimeout(() => {
      if (dom && dom.nx) dom.nx.classList.remove('on');
      if (dom && dom.card) dom.card.classList.remove('on');

      const { overlay, refs } = this._createOverlay();
      document.body.appendChild(overlay);
      this._overlay = overlay;
      this._refs = refs;

      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });
      audioManager.fadeOutAndStop(3400);

      const t2 = setTimeout(() => {
        if (dom && dom.tx) dom.tx.innerHTML = '';
        this._animateHandwriting(refs);
      }, fadeBlackMs + (settings.reducedMotion ? 150 : 450));
      this._timers.push(t2);
    }, holdMs);

    this._timers.push(t1);
  },

  _createOverlay(): { overlay: HTMLDivElement; refs: FimRefs } {
    const overlay = document.createElement('div');
    overlay.id = 'ending-overlay';
    overlay.setAttribute('aria-label', 'fim');

    const wrap = document.createElement('div');
    wrap.className = 'ending-fim-wrap';

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 300 140');
    svg.setAttribute('class', 'ending-fim-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'fim');

    const defs = document.createElementNS(SVG_NS, 'defs');
    const glowGrad = document.createElementNS(SVG_NS, 'radialGradient');
    glowGrad.setAttribute('id', 'fimNibGlow');
    const s1 = document.createElementNS(SVG_NS, 'stop');
    s1.setAttribute('offset', '0%');
    s1.setAttribute('stop-color', '#FFFDF6');
    s1.setAttribute('stop-opacity', '1');
    const s2 = document.createElementNS(SVG_NS, 'stop');
    s2.setAttribute('offset', '45%');
    s2.setAttribute('stop-color', '#FFE8B0');
    s2.setAttribute('stop-opacity', '0.55');
    const s3 = document.createElementNS(SVG_NS, 'stop');
    s3.setAttribute('offset', '100%');
    s3.setAttribute('stop-color', '#FFE8B0');
    s3.setAttribute('stop-opacity', '0');
    glowGrad.appendChild(s1);
    glowGrad.appendChild(s2);
    glowGrad.appendChild(s3);
    defs.appendChild(glowGrad);
    svg.appendChild(defs);

    const paths = FIM_STROKES.map(st => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', st.d);
      path.setAttribute('class', st.className);
      svg.appendChild(path);
      return path;
    });

    const nibGlow = document.createElementNS(SVG_NS, 'circle');
    nibGlow.setAttribute('r', '7.5');
    nibGlow.setAttribute('fill', 'url(#fimNibGlow)');
    nibGlow.setAttribute('class', 'ending-fim-nib');
    svg.appendChild(nibGlow);

    const nibCore = document.createElementNS(SVG_NS, 'circle');
    nibCore.setAttribute('r', '2.1');
    nibCore.setAttribute('class', 'ending-fim-nib');
    svg.appendChild(nibCore);

    wrap.appendChild(svg);
    overlay.appendChild(wrap);
    return { overlay, refs: { wrap, paths, nibGlow, nibCore } };
  },

  _animateHandwriting(refs: FimRefs): void {
    const { wrap, paths, nibGlow, nibCore } = refs;
    const lengths = paths.map(p => p.getTotalLength());

    if (settings.reducedMotion) {
      paths.forEach(p => {
        p.style.strokeDasharray = 'none';
        p.style.strokeDashoffset = '0';
      });
      wrap.classList.add('vis', 'done');
      return;
    }

    paths.forEach((p, idx) => {
      const len = lengths[idx];
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });

    wrap.classList.add('vis');
    nibGlow.classList.add('active');
    nibCore.classList.add('active');

    let strokeIdx = 0;
    let strokeStart = performance.now();
    let inPause = false;
    let pauseStart = 0;

    const frame = (now: number) => {
      if (strokeIdx >= FIM_STROKES.length) {
        nibGlow.classList.remove('active');
        nibCore.classList.remove('active');
        wrap.classList.add('done');
        this._rafId = 0;
        return;
      }

      const meta = FIM_STROKES[strokeIdx];
      const path = paths[strokeIdx];
      const len = lengths[strokeIdx];

      if (inPause) {
        if (now - pauseStart >= meta.pauseAfter) {
          inPause = false;
          strokeIdx += 1;
          strokeStart = now;
          if (strokeIdx < FIM_STROKES.length) {
            const nextPt = paths[strokeIdx].getPointAtLength(0);
            nibGlow.setAttribute('cx', nextPt.x.toFixed(2));
            nibGlow.setAttribute('cy', nextPt.y.toFixed(2));
            nibCore.setAttribute('cx', nextPt.x.toFixed(2));
            nibCore.setAttribute('cy', nextPt.y.toFixed(2));
            nibGlow.classList.add('active');
            nibCore.classList.add('active');
          }
        }
        this._rafId = requestAnimationFrame(frame);
        return;
      }

      const rawT = Math.min(1, (now - strokeStart) / meta.duration);
      const eased = easeInOutSine(rawT);
      const drawn = len * eased;

      path.style.strokeDashoffset = `${Math.max(0, len - drawn)}`;
      const pt = path.getPointAtLength(Math.min(len, drawn));
      nibGlow.setAttribute('cx', pt.x.toFixed(2));
      nibGlow.setAttribute('cy', pt.y.toFixed(2));
      nibCore.setAttribute('cx', pt.x.toFixed(2));
      nibCore.setAttribute('cy', pt.y.toFixed(2));

      if (rawT >= 1) {
        path.style.strokeDashoffset = '0';
        if (meta.pauseAfter > 0) {
          inPause = true;
          pauseStart = now;
          nibGlow.classList.remove('active');
          nibCore.classList.remove('active');
        } else {
          strokeIdx += 1;
          strokeStart = now;
        }
      }

      this._rafId = requestAnimationFrame(frame);
    };

    const firstPt = paths[0].getPointAtLength(0);
    nibGlow.setAttribute('cx', firstPt.x.toFixed(2));
    nibGlow.setAttribute('cy', firstPt.y.toFixed(2));
    nibCore.setAttribute('cx', firstPt.x.toFixed(2));
    nibCore.setAttribute('cy', firstPt.y.toFixed(2));
    this._rafId = requestAnimationFrame(frame);
  },

  destroy(): void {
    this._timers.forEach(clearTimeout);
    this._timers = [];
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay);
      this._overlay = null;
    }
    this._refs = null;
    this._started = false;
  }
};
