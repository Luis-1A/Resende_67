import React, { useEffect, useRef, useState } from 'react';
import { BirthdayCanvasHandle } from './BirthdayCanvas';
import { RotateCcw } from 'lucide-react';

interface FinaleSequenceProps {
  canvasRef: React.RefObject<BirthdayCanvasHandle | null>;
  setAmbientTarget: (v: number) => void;
  setCakeTarget: (v: number) => void;
  destinationUrl?: string;
  onRestart: () => void;
}

const HP =
  'M50 86C22 63 5 46 7 29C9 14 24 6 36 10C43 12 48 17 50 22C53 15 60 8 71 7C85 6 95 18 93 31C91 48 74 63 50 86Z';

const ease = (p: number) => 1 - Math.pow(1 - p, 3);
const cl = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const FinaleSequence: React.FC<FinaleSequenceProps> = ({
  canvasRef,
  setAmbientTarget,
  setCakeTarget,
  destinationUrl = '',
  onRestart,
}) => {
  const heartContainerRef = useRef<HTMLDivElement | null>(null);
  const [lines, setLines] = useState<Array<{ text: string; className: string; id: number }>>([]);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [circScaling, setCircScaling] = useState(false);
  const [circOpacity, setCircOpacity] = useState(1);
  const [isEndingDone, setIsEndingDone] = useState(false);
  const [isLow, setIsLow] = useState(false);
  const activeAnimRef = useRef(true);

  // Helper to add a line with animation
  const addLine = (text: string, className = '') => {
    if (!activeAnimRef.current) return;
    setLines((prev) => [...prev, { text, className, id: Date.now() + Math.random() }]);
  };

  // Helper to clear lines
  const clearLines = async () => {
    if (!activeAnimRef.current) return;
    // Animate out
    setLines((prev) => prev.map((l) => ({ ...l, className: l.className + ' opacity-0 -translate-y-2' })));
    await delay(1100);
    if (!activeAnimRef.current) return;
    setLines([]);
  };

  useEffect(() => {
    activeAnimRef.current = true;

    const runFinale = async () => {
      // 1. Initial confetti burst & dim ambient
      setCakeTarget(0);
      setAmbientTarget(0.15);
      canvasRef.current?.addConfetti(40);
      await delay(3500);
      if (!activeAnimRef.current) return;

      // 2. Particle spiral in canvas
      canvasRef.current?.startSpiral();
      await delay(3300);
      if (!activeAnimRef.current) return;

      // 3. Render and draw heart outline
      if (heartContainerRef.current) {
        heartContainerRef.current.innerHTML = `
          <svg class="hs" viewBox="0 0 100 92">
            <defs>
              <clipPath id="hc">
                <rect id="hr" x="0" y="92" width="100" height="0"/>
              </clipPath>
              <linearGradient id="hg" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stop-color="#318DE0"/>
                <stop offset="1" stop-color="#B9E0FF"/>
              </linearGradient>
            </defs>
            <path clip-path="url(#hc)" fill="url(#hg)" opacity=".85" d="${HP}"/>
            <path class="l" pathLength="1" d="${HP}"/>
          </svg>
        `;
        const svgEl = heartContainerRef.current.firstElementChild as SVGElement | null;
        if (svgEl) {
          svgEl.getBoundingClientRect(); // trigger reflow
          svgEl.classList.add('in');
        }
      }

      await delay(4000);
      if (!activeAnimRef.current) return;

      // 4. Liquid fill animation in heart
      const rectEl = document.getElementById('hr');
      if (rectEl) {
        const t0 = performance.now();
        const animateFill = (now: number) => {
          if (!activeAnimRef.current) return;
          const progress = ease(cl((now - t0) / 2400));
          rectEl.setAttribute('y', String(92 * (1 - progress)));
          rectEl.setAttribute('height', String(92 * progress));
          if (progress < 1) {
            requestAnimationFrame(animateFill);
          }
        };
        requestAnimationFrame(animateFill);
      }

      await delay(3200);
      if (!activeAnimRef.current) return;

      // 5. Shift text position down and increase ambient
      setAmbientTarget(0.3);
      setIsLow(true);

      // 6. Line 1: Obrigado por ser meu amigo.
      addLine('Obrigado por ser meu amigo.', 'sub');
      await delay(3000);
      if (!activeAnimRef.current) return;
      await clearLines();
      if (!activeAnimRef.current) return;

      // 7. Lines: Eu te amo, cacete. / Como amigo.
      setAmbientTarget(0.1);
      await delay(800);
      if (!activeAnimRef.current) return;

      addLine('Eu te amo, cacete.', 'hw text-blueBrand');
      await delay(2800);
      if (!activeAnimRef.current) return;

      addLine('Como amigo.', 'sub');
      const svgEl = heartContainerRef.current?.firstElementChild as SVGElement | null;
      if (svgEl) {
        svgEl.classList.add('pulse');
      }

      await delay(4200);
      if (!activeAnimRef.current) return;
      await clearLines();
      if (!activeAnimRef.current) return;

      // 8. Birthday lines
      addLine('Feliz aniversário, Anderson.', 'sub');
      await delay(2200);
      if (!activeAnimRef.current) return;

      addLine('Feliz aniversário, Resende.', 'hw text-blueBrand');
      await delay(3200);
      if (!activeAnimRef.current) return;

      addLine('Que a nossa história ainda tenha muitos capítulos pela frente.');
      await delay(3500);
      if (!activeAnimRef.current) return;

      // 9. Massive confetti celebration
      setAmbientTarget(1);
      canvasRef.current?.addConfetti(90);
      await delay(2500);
      if (!activeAnimRef.current) return;

      canvasRef.current?.addConfetti(60);
      await delay(3500);
      if (!activeAnimRef.current) return;

      setAmbientTarget(0.3);
      await clearLines();
      if (!activeAnimRef.current) return;

      // 10. Conclusion lines
      addLine('Uma amizade que começou por acaso.', 'sub');
      await delay(2600);
      if (!activeAnimRef.current) return;

      addLine('Uma história que ainda não terminou.', 'sub');
      await delay(2600);
      if (!activeAnimRef.current) return;

      // 11. Show "Continuar" button
      setShowContinueButton(true);
    };

    runFinale();

    return () => {
      activeAnimRef.current = false;
      if (heartContainerRef.current) {
        heartContainerRef.current.innerHTML = '';
      }
    };
  }, [canvasRef, setAmbientTarget, setCakeTarget]);

  // Handle final button click
  const handleFinalContinue = async () => {
    setShowContinueButton(false);
    setCircScaling(true);
    await delay(1500);

    let isUrlValid = false;
    try {
      isUrlValid = !!destinationUrl && /^https?:/.test(new URL(destinationUrl).protocol);
    } catch {
      isUrlValid = false;
    }

    if (isUrlValid) {
      window.location.href = destinationUrl;
      return;
    }

    setCircOpacity(0);
    await delay(1000);
    setCircScaling(false);
    setLines([]);
    setIsEndingDone(true);
  };

  return (
    <>
      {/* Top Heart Container */}
      <div id="hv" ref={heartContainerRef} aria-hidden="true" />

      {/* Expanding Circular Transition */}
      {circScaling && (
        <div
          className="circ on"
          style={{ opacity: circOpacity, transition: 'opacity 1s, transform 1.3s cubic-bezier(.6,0,.3,1)' }}
        />
      )}

      {/* Main Text Container */}
      <main id="txt" className={isLow ? 'low' : ''} aria-live="polite">
        {!isEndingDone ? (
          <>
            {lines.map((l) => (
              <p key={l.id} className={`t in ${l.className}`}>
                {l.text}
              </p>
            ))}

            {showContinueButton && (
              <button
                type="button"
                className="btn t in"
                onClick={handleFinalContinue}
              >
                Continuar
              </button>
            )}
          </>
        ) : (
          <div className="max-w-md p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-sky-100 text-center animate-fade-in z-30">
            <p className="sub text-blueBrand mb-3 font-extrabold text-xl">💙 Quase sete anos de amizade</p>
            <p className="text-ink/80 text-sm leading-relaxed mb-5">
              O endereço do próximo site ainda não foi configurado. Por enquanto, a história fica por aqui. 💙
            </p>
            <div className="pt-2">
              <button
                type="button"
                className="btn w-full"
                onClick={onRestart}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reviver Homenagem
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};
