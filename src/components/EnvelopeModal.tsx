import React, { useState } from 'react';

interface EnvelopeModalProps {
  onOpen: () => void;
}

export const EnvelopeModal: React.FC<EnvelopeModalProps> = ({ onOpen }) => {
  const [opened, setOpened] = useState(false);
  const [fading, setFading] = useState(false);

  const handleClick = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        onOpen();
      }, 1100);
    }, 2200);
  };

  return (
    <div className={`t in ${fading ? 'opacity-0 scale-95 transition-all duration-1000' : ''}`}>
      <p className="sub">Existe uma coisa que eu ainda não te contei.</p>
      <div className={`envelope ${opened ? 'open' : ''}`}>
        <div className="glow" />
        <div className="flap" />
        <div className="seal" />
      </div>
      <button
        type="button"
        className="btn"
        onClick={handleClick}
        disabled={opened}
      >
        Descobrir
      </button>
    </div>
  );
};
