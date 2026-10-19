import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChapterData } from '../types';

interface ChapterViewProps {
  chapter: ChapterData;
  onComplete: () => void;
  onFx: (fx: string) => void;
  onRequestWaitHint: (active: boolean) => void;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  onComplete,
  onFx,
  onRequestWaitHint,
}) => {
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const applyFx = useCallback(
    (fxName?: string) => {
      if (!fxName) return;
      if (fxName === 'zoom') {
        setIsZoomed(true);
      }
      onFx(fxName);
    },
    [onFx]
  );

  // Reset state when chapter changes
  useEffect(() => {
    setCurrentGroupIdx(0);
    setIsClosing(false);
    setIsZoomed(false);
    applyFx(chapter.groups[0]?.fx);
    onRequestWaitHint(true);
    return () => {
      onRequestWaitHint(false);
    };
  }, [chapter.id, chapter.groups, applyFx, onRequestWaitHint]);

  // Scroll smoothly to bottom when new paragraphs arrive
  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.scrollTo({
        top: sheetRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentGroupIdx]);

  // Advance group or complete
  const advance = useCallback(() => {
    if (isClosing) return;
    if (currentGroupIdx < chapter.groups.length - 1) {
      const nextIdx = currentGroupIdx + 1;
      setCurrentGroupIdx(nextIdx);
      applyFx(chapter.groups[nextIdx]?.fx);
    } else {
      // Finished all groups in this chapter
      setIsClosing(true);
      onRequestWaitHint(false);
      setTimeout(() => {
        onComplete();
      }, 1100);
    }
  }, [isClosing, currentGroupIdx, chapter.groups, applyFx, onRequestWaitHint, onComplete]);

  // Handle global tap or space/enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      // Ignore if clicking a button (e.g. skip button)
      if (target.closest('button')) return;
      advance();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [advance]);

  const renderParagraph = (text: string, pIdx: number) => {
    let cleanText = text;
    let extraClass = '';

    if (cleanText.startsWith('~')) {
      cleanText = cleanText.slice(1);
      extraClass += ' hw';
    } else if (cleanText.startsWith('!')) {
      cleanText = cleanText.slice(1);
      extraClass += ' em';
    }

    // Replace keywords with highlight spans
    const parts = cleanText.split(/(\b(?:companheiro|confiança|família)\b)/gi);

    return (
      <p key={pIdx} className={`t in ${extraClass}`}>
        {parts.map((part, i) => {
          if (/^(companheiro|confiança|família)$/i.test(part)) {
            return (
              <u key={i} className="hl">
                {part}
              </u>
            );
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div
      ref={sheetRef}
      className={`sheet t in ${chapter.isSm ? 'sm' : ''} ${isZoomed ? 'zoom' : ''} ${
        isClosing ? 'opacity-0 scale-95' : ''
      }`}
    >
      <div className="eb">{chapter.title}</div>
      {chapter.groups.slice(0, currentGroupIdx + 1).map((group, gIdx) => (
        <div key={gIdx} className="mb-4">
          {group.paragraphs.map((p, pIdx) => renderParagraph(p, pIdx))}
        </div>
      ))}
    </div>
  );
};
