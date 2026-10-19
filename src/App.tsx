import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BirthdayCanvas, BirthdayCanvasHandle } from './components/BirthdayCanvas';
import { ChapterView } from './components/ChapterView';
import { EnvelopeModal } from './components/EnvelopeModal';
import { SquadDiagram } from './components/SquadDiagram';
import { Transitions } from './components/Transitions';
import { FinaleSequence } from './components/FinaleSequence';
import { CHAPTERS_DATA } from './data/story';
import { TransitionType } from './types';
import { Compass, Sparkles } from 'lucide-react';

type FlowStage =
  | 'INTRO_COSMIC'
  | 'INTRO_LINE1'
  | 'INTRO_LINE2'
  | 'INTRO_DATE'
  | 'INTRO_SQUAD'
  | 'CHAPTER'
  | 'TRANSITION'
  | 'ENVELOPE'
  | 'FINALE';

export const App: React.FC = () => {
  const canvasRef = useRef<BirthdayCanvasHandle | null>(null);

  // Flow State
  const [stage, setStage] = useState<FlowStage>('INTRO_COSMIC');
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [activeTransition, setActiveTransition] = useState<TransitionType | null>(null);

  // Visual Environment States
  const [skyOn, setSkyOn] = useState(false);
  const [darkOpacity, setDarkOpacity] = useState(1);
  const [blueOn, setBlueOn] = useState(false);
  const [isLowLayout, setIsLowLayout] = useState(false);
  const [ambientTarget, setAmbientTarget] = useState(0);
  const [edgeTarget, setEdgeTarget] = useState(0);
  const [cakeTarget, setCakeTarget] = useState(0);
  const [cosmicActive, setCosmicActive] = useState(true);
  const [cosmicRate, setCosmicRate] = useState(1);
  const [fastMode, setFastMode] = useState(false);

  // FX & UI
  const [distanceWidth, setDistanceWidth] = useState<string | null>(null);
  const [activeBubbles, setActiveBubbles] = useState<Array<{ id: number; left: number; size: number }>>([]);
  const [waitingHint, setWaitingHint] = useState(false);
  const [destinationUrl] = useState<string>(() => {
    return localStorage.getItem('resende_destination_url') || '';
  });
  const [showChapterMenu, setShowChapterMenu] = useState(false);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Handle distance line & bubbles
  const handleFx = useCallback((fxName: string) => {
    if (fxName === 'bub') {
      const newBubs = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        left: 60 + Math.random() * 35,
        size: 10 + Math.random() * 22,
      }));
      setActiveBubbles((prev) => [...prev, ...newBubs]);
      setTimeout(() => {
        setActiveBubbles((prev) => prev.filter((b) => !newBubs.find((nb) => nb.id === b.id)));
      }, 5000);
    } else if (fxName === 'far') {
      const w = Math.min(window.innerWidth * 0.6, 220);
      setDistanceWidth(`${w}px`);
    } else if (fxName === 'near') {
      setDistanceWidth('16px');
      setTimeout(() => {
        setDistanceWidth(null);
      }, 3800);
    } else if (fxName === 'conf') {
      canvasRef.current?.addConfetti(60);
    }
  }, []);

  // Intro Sequence Orchestration
  useEffect(() => {
    if (stage !== 'INTRO_COSMIC') return;

    if (reducedMotion) {
      setBlueOn(true);
      setDarkOpacity(0);
      setCosmicActive(false);
      setStage('INTRO_LINE1');
      return;
    }

    const tBlue = setTimeout(() => {
      setBlueOn(true);
    }, 11400 / cosmicRate);

    const tEndCosmic = setTimeout(() => {
      setCosmicActive(false);
      setDarkOpacity(0);
      setStage('INTRO_LINE1');
    }, 12800 / cosmicRate);

    return () => {
      clearTimeout(tBlue);
      clearTimeout(tEndCosmic);
    };
  }, [stage, cosmicRate, reducedMotion]);

  // Intro text steps
  useEffect(() => {
    if (stage === 'INTRO_LINE1') {
      const t = setTimeout(() => setStage('INTRO_LINE2'), fastMode ? 1000 : 4200);
      return () => clearTimeout(t);
    }
    if (stage === 'INTRO_LINE2') {
      const t = setTimeout(() => setStage('INTRO_DATE'), fastMode ? 1000 : 4200);
      return () => clearTimeout(t);
    }
    if (stage === 'INTRO_DATE') {
      const t = setTimeout(() => setStage('INTRO_SQUAD'), fastMode ? 1000 : 3200);
      return () => clearTimeout(t);
    }
  }, [stage, fastMode]);

  // Squad diagram finished
  const handleSquadComplete = useCallback(() => {
    setFastMode(false);
    setAmbientTarget(0.5);
    setEdgeTarget(1);
    setBlueOn(false);
    setSkyOn(true);
    setStage('CHAPTER');
    setCurrentChapterIndex(0);
  }, []);

  // Skip Intro
  const skipIntro = () => {
    setFastMode(true);
    setCosmicRate(8);
    setDarkOpacity(0);
    setBlueOn(false);
    setSkyOn(true);
    setAmbientTarget(0.5);
    setEdgeTarget(1);
    setCosmicActive(false);
    setStage('CHAPTER');
    setCurrentChapterIndex(0);
  };

  // Jump to specific chapter directly (navigation capability)
  const jumpToChapter = (chapterIdx: number) => {
    setSkyOn(true);
    setDarkOpacity(0);
    setBlueOn(false);
    setCosmicActive(false);
    setIsLowLayout(false);
    setCakeTarget(chapterIdx === 8 ? 1 : 0);
    if (chapterIdx === 8) {
      canvasRef.current?.trigger18();
    } else {
      canvasRef.current?.clear18();
    }
    setAmbientTarget(0.4);
    setCurrentChapterIndex(chapterIdx);
    setStage('CHAPTER');
    setShowChapterMenu(false);
  };

  const jumpToFinale = () => {
    setSkyOn(true);
    setDarkOpacity(0);
    setBlueOn(false);
    setCosmicActive(false);
    setIsLowLayout(false);
    canvasRef.current?.clear18();
    setStage('FINALE');
    setShowChapterMenu(false);
  };

  // Chapter Progression
  const handleChapterComplete = useCallback(() => {
    setDistanceWidth(null);
    const chapterNum = currentChapterIndex + 1;

    // Transitions after chapters 1, 2, 3, 4
    if (chapterNum === 1) {
      setActiveTransition('pages');
      setStage('TRANSITION');
    } else if (chapterNum === 2) {
      setActiveTransition('bubbles');
      setStage('TRANSITION');
    } else if (chapterNum === 3) {
      setActiveTransition('suck');
      setStage('TRANSITION');
    } else if (chapterNum === 4) {
      setActiveTransition('heart');
      setStage('TRANSITION');
    } else if (chapterNum === 5) {
      // Reached envelope secret
      setStage('ENVELOPE');
    } else if (chapterNum === 6) {
      setActiveTransition('unlock');
      setAmbientTarget(0.2);
      setStage('TRANSITION');
    } else if (chapterNum === 7) {
      setActiveTransition('path');
      setStage('TRANSITION');
    } else if (chapterNum === 8) {
      setActiveTransition('glow');
      setStage('TRANSITION');
    } else if (chapterNum === 9) {
      // Cake celebration finished, move to chapter 10
      canvasRef.current?.clear18();
      setIsLowLayout(false);
      setAmbientTarget(0.15);
      setCakeTarget(0);
      setCurrentChapterIndex(9);
      setStage('CHAPTER');
    } else if (chapterNum === 10) {
      // Move to Finale!
      setStage('FINALE');
    }
  }, [currentChapterIndex]);

  // Transition Completed
  const handleTransitionFinish = useCallback(() => {
    setActiveTransition(null);
    const nextChapter = currentChapterIndex + 1;

    if (currentChapterIndex === 7) {
      // Transition after chapter 8 -> Prepare birthday cake & chapter 9!
      setAmbientTarget(1);
      setIsLowLayout(true);
      setCakeTarget(1);
      canvasRef.current?.trigger18();
      canvasRef.current?.addConfetti(70);
      setTimeout(() => {
        setCurrentChapterIndex(8);
        setStage('CHAPTER');
      }, 4500);
      return;
    }

    setCurrentChapterIndex(nextChapter);
    setStage('CHAPTER');
  }, [currentChapterIndex]);

  // Envelope Opened
  const handleEnvelopeOpened = useCallback(() => {
    setAmbientTarget(0.3);
    setCurrentChapterIndex(5); // Chapter 6
    setStage('CHAPTER');
  }, []);

  const handleRestart = () => {
    setSkyOn(true);
    setDarkOpacity(0);
    setBlueOn(false);
    setCosmicActive(false);
    setIsLowLayout(false);
    setCakeTarget(0);
    canvasRef.current?.clear18();
    setAmbientTarget(0.5);
    setCurrentChapterIndex(0);
    setStage('CHAPTER');
  };

  const isIntro =
    stage === 'INTRO_COSMIC' ||
    stage === 'INTRO_LINE1' ||
    stage === 'INTRO_LINE2' ||
    stage === 'INTRO_DATE' ||
    stage === 'INTRO_SQUAD';

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* Background Skies and Gradients */}
      <div className={`sky ${skyOn ? 'on' : ''}`} id="sky" />
      <div className="dark" style={{ opacity: darkOpacity }} id="dark" />
      <div className={`blue ${blueOn ? 'on' : ''}`} id="blue" />

      {/* Interactive Birthday Canvas */}
      <BirthdayCanvas
        ref={canvasRef}
        ambientTarget={ambientTarget}
        edgeTarget={edgeTarget}
        cakeTarget={cakeTarget}
        cosmicActive={cosmicActive}
        cosmicRate={cosmicRate}
        reducedMotion={reducedMotion}
      />

      {/* Floating dot & ring */}
      <div className="dot" id="dot" />

      {/* Distance indicator */}
      <div
        id="dist"
        className={distanceWidth ? 'on' : ''}
        style={{ '--w': distanceWidth || '18px' } as React.CSSProperties}
        aria-hidden="true"
      >
        <i />
        <b />
        <i />
      </div>

      {/* Dynamic Floating Bubbles */}
      {activeBubbles.map((b) => (
        <div
          key={b.id}
          className="bub"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
          }}
        />
      ))}

      {/* Free Fire Squad Constellation */}
      {stage === 'INTRO_SQUAD' && (
        <SquadDiagram onComplete={handleSquadComplete} fast={fastMode} />
      )}

      {/* Transitions between chapters */}
      {stage === 'TRANSITION' && activeTransition && (
        <Transitions
          type={activeTransition}
          onFinish={handleTransitionFinish}
          fast={fastMode}
        />
      )}

      {/* Main Content Area */}
      {stage !== 'FINALE' && (
        <main
          id="txt"
          className={`${isLowLayout ? 'low' : ''} ${isIntro && !skyOn ? 'onblue' : ''}`}
          aria-live="polite"
        >
          {stage === 'INTRO_LINE1' && (
            <p className="t in sub">Existem pessoas que aparecem na nossa vida por acaso...</p>
          )}

          {stage === 'INTRO_LINE2' && (
            <p className="t in sub">E existem aquelas que acabam se tornando parte dela.</p>
          )}

          {stage === 'INTRO_DATE' && (
            <p className="t in dt">31.12.2019</p>
          )}

          {stage === 'CHAPTER' && (
            <ChapterView
              key={`chapter-${currentChapterIndex}`}
              chapter={CHAPTERS_DATA[currentChapterIndex]}
              onComplete={handleChapterComplete}
              onFx={handleFx}
              onRequestWaitHint={setWaitingHint}
            />
          )}

          {stage === 'ENVELOPE' && (
            <EnvelopeModal onOpen={handleEnvelopeOpened} />
          )}
        </main>
      )}

      {/* Finale Sequence (Heart outline draw, liquid fill, emotional dialogs, pulse, massive confetti, circular outro) */}
      {stage === 'FINALE' && (
        <FinaleSequence
          canvasRef={canvasRef}
          setAmbientTarget={setAmbientTarget}
          setCakeTarget={setCakeTarget}
          destinationUrl={destinationUrl}
          onRestart={handleRestart}
        />
      )}

      {/* Touch to continue hint */}
      <div id="hint" className={waitingHint && stage === 'CHAPTER' ? 'on' : ''}>
        toque para continuar
      </div>

      {/* Skip Intro Button */}
      {isIntro && (
        <button id="sk" type="button" onClick={skipIntro}>
          Pular introdução
        </button>
      )}

      {/* Chapter Quick Menu / Jump (Subtle bottom-left control for accessibility & testing) */}
      {!isIntro && (
        <div className="fixed left-4 bottom-4 z-30">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-ink/70 hover:text-ink bg-white/80 hover:bg-white backdrop-blur-md rounded-full border border-celBrand shadow-sm transition-all cursor-pointer"
            onClick={() => setShowChapterMenu(!showChapterMenu)}
            aria-label="Capítulos"
          >
            <Compass className="w-3.5 h-3.5 text-blueBrand" />
            <span>
              {stage === 'FINALE'
                ? 'Animação Final'
                : `Capítulo ${currentChapterIndex + 1}/10`}
            </span>
          </button>

          {showChapterMenu && (
            <div className="absolute bottom-10 left-0 w-64 max-h-80 overflow-y-auto bg-white/95 backdrop-blur-md border border-celBrand rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1 font-extrabold text-blueBrand uppercase tracking-wider border-b border-mistBrand mb-1 flex items-center justify-between">
                <span>Navegar pela Homenagem</span>
                <span className="text-[10px] text-gray-400">18 anos</span>
              </div>
              <div className="space-y-0.5">
                {CHAPTERS_DATA.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => jumpToChapter(idx)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      stage === 'CHAPTER' && currentChapterIndex === idx
                        ? 'bg-blueBrand text-white font-bold'
                        : 'text-ink/80 hover:bg-mistBrand'
                    }`}
                  >
                    {ch.id}. {ch.title.replace(/^CAPÍTULO \d+ · /, '')}
                  </button>
                ))}

                <button
                  onClick={jumpToFinale}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer mt-1 pt-1.5 border-t border-mistBrand ${
                    stage === 'FINALE'
                      ? 'bg-blueBrand text-white font-bold'
                      : 'text-blueBrand hover:bg-mistBrand'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-skyBrand" />
                  <span>Assistir Animação Final</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default App;
