import React, { useEffect, useState } from 'react';
import { TransitionType } from '../types';

interface TransitionsProps {
  type: TransitionType;
  onFinish: () => void;
  fast?: boolean;
}

const HP =
  'M50 86C22 63 5 46 7 29C9 14 24 6 36 10C43 12 48 17 50 22C53 15 60 8 71 7C85 6 95 18 93 31C91 48 74 63 50 86Z';

export const Transitions: React.FC<TransitionsProps> = ({ type, onFinish, fast }) => {
  const [animStage, setAnimStage] = useState(0);

  useEffect(() => {
    if (fast) {
      onFinish();
      return;
    }

    const durationMap: Record<TransitionType, number> = {
      pages: 3300,
      bubbles: 2700,
      suck: 2500,
      heart: 3400,
      path: 3900,
      glow: 2400,
      unlock: 2400,
    };

    const duration = durationMap[type] || 2000;
    const t = setTimeout(() => {
      onFinish();
    }, duration);

    // Initial trigger
    const tStart = setTimeout(() => setAnimStage(1), 30);

    return () => {
      clearTimeout(t);
      clearTimeout(tStart);
    };
  }, [type, fast, onFinish]);

  if (type === 'pages') {
    const words = ['conversas', 'partidas', 'madrugada', 'amizade'];
    return (
      <>
        {words.map((w, i) => (
          <div
            key={i}
            className="pg"
            style={{
              top: `${16 + i * 17}%`,
              left: '-170px',
              animation: `flyPage 2.4s cubic-bezier(.4,0,.2,1) forwards ${i * 0.26}s`,
            }}
          >
            {w}
          </div>
        ))}
        <style>{`
          @keyframes flyPage {
            0% { transform: translateX(0) rotate(-14deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateX(calc(100vw + 340px)) rotate(18deg); opacity: 0; }
          }
        `}</style>
      </>
    );
  }

  if (type === 'bubbles' || type === 'suck') {
    const bubbles = [
      { text: 'kkkkkk', x: 15, y: 18 },
      { text: '...', x: 72, y: 24 },
      { text: '?', x: 28, y: 45 },
      { text: 'kkkk', x: 65, y: 55 },
      { text: '!', x: 22, y: 68 },
      { text: '...', x: 75, y: 72 },
      { text: 'kkkkkk', x: 42, y: 82 },
      { text: '?', x: 55, y: 35 },
    ];

    return (
      <>
        {bubbles.map((b, i) => (
          <div
            key={i}
            className="bb"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              animation:
                type === 'bubbles'
                  ? `popBubble 1.3s cubic-bezier(.3,.7,.2,1) forwards ${i * 0.16}s`
                  : `suckBubble 1.5s cubic-bezier(.3,.7,.2,1) forwards ${i * 0.16}s`,
            }}
          >
            {b.text}
          </div>
        ))}
        <style>{`
          @keyframes popBubble {
            0% { transform: scale(0) rotate(-20deg); opacity: 0; }
            45% { transform: scale(1.08) rotate(4deg); opacity: 1; }
            100% { transform: scale(1) rotate(-3deg); opacity: 1; }
          }
          @keyframes suckBubble {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: translate(calc(50vw - 50%), calc(50vh - 50%)) scale(0.1); opacity: 0; }
          }
        `}</style>
      </>
    );
  }

  if (type === 'heart') {
    return (
      <div className={`hr ${animStage === 1 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
        <svg viewBox="0 0 100 92">
          <path
            pathLength={1}
            d={HP}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: animStage === 1 ? 0 : 1,
              transition: 'stroke-dashoffset 2s ease-in-out',
            }}
          />
        </svg>
      </div>
    );
  }

  if (type === 'path') {
    return (
      <div className={`pt ${animStage === 1 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
        <svg viewBox="0 0 100 60">
          <path
            pathLength={1}
            d="M20 60C30 40 45 35 50 22"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: animStage === 1 ? 0 : 1,
              transition: 'stroke-dashoffset 2s ease-in-out 0s',
            }}
          />
          <path
            pathLength={1}
            d="M80 60C70 42 55 34 50 22"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: animStage === 1 ? 0 : 1,
              transition: 'stroke-dashoffset 2s ease-in-out 0.35s',
            }}
          />
          <path
            pathLength={1}
            d="M50 60C50 45 50 35 50 22"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: animStage === 1 ? 0 : 1,
              transition: 'stroke-dashoffset 2s ease-in-out 0.7s',
            }}
          />
        </svg>
      </div>
    );
  }

  // glow / unlock
  return (
    <div
      className="gl"
      style={{
        left: '50%',
        top: type === 'unlock' ? '50%' : '62%',
        animation: 'glowPulse 2.4s cubic-bezier(.2,.7,.2,1) forwards',
      }}
    >
      <style>{`
        @keyframes glowPulse {
          0% { transform: scale(0.1); opacity: 0.9; }
          100% { transform: scale(14); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
