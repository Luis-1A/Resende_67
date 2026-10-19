import React, { useEffect, useState } from 'react';

interface SquadDiagramProps {
  onComplete: () => void;
  fast?: boolean;
}

export const SquadDiagram: React.FC<SquadDiagramProps> = ({ onComplete, fast }) => {
  const [step, setStep] = useState(0); // 0: init, 1: luis, 2: francielle, 3: resende, 4: spin & exit

  useEffect(() => {
    const delays = fast ? [200, 300, 400, 600, 500] : [800, 1500, 1800, 2800, 1900];

    const t1 = setTimeout(() => setStep(1), delays[0]);
    const t2 = setTimeout(() => setStep(2), delays[0] + delays[1]);
    const t3 = setTimeout(() => setStep(3), delays[0] + delays[1] + delays[2]);
    const t4 = setTimeout(() => setStep(4), delays[0] + delays[1] + delays[2] + delays[3]);
    const t5 = setTimeout(() => {
      onComplete();
    }, delays[0] + delays[1] + delays[2] + delays[3] + delays[4]);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [fast, onComplete]);

  return (
    <div id="sq" className={`on ${step === 4 ? 'spin' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 300 220">
        <path pathLength={1} className={step >= 2 ? 'in' : ''} d="M60 160 L150 55" />
        <path pathLength={1} className={step >= 3 ? 'in' : ''} d="M150 55 L245 140" />
      </svg>
      <div className={`nd ${step >= 1 ? 'in' : ''}`} style={{ left: '20%', top: '73%' }}>
        <i></i>
        <b>Luis</b>
      </div>
      <div className={`nd ${step >= 2 ? 'in' : ''}`} style={{ left: '50%', top: '25%' }}>
        <i></i>
        <b>Francielle</b>
      </div>
      <div className={`nd ${step >= 3 ? 'in' : ''}`} style={{ left: '82%', top: '64%' }}>
        <i></i>
        <b>Resende</b>
      </div>
    </div>
  );
};
