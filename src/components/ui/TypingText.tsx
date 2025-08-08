import React, { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  cursor?: boolean;
  cursorClassName?: string;
  onComplete?: () => void;
}

export const TypingText: React.FC<TypingTextProps> = ({
  text,
  delay = 0,
  speed = 100,
  className = '',
  cursor = true,
  cursorClassName = '',
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isStarted || currentIndex >= text.length) {
      if (currentIndex >= text.length && !isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, isStarted, isComplete, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && (
        <span 
          className={`inline-block animate-pulse h-5 ${cursorClassName}`}
          style={{ 
            animation: isComplete ? 'none' : 'pulse 1s infinite',
            opacity: isComplete ? 0 : 1,
            transition: 'opacity 0.5s ease-out'
          }}
        >
          |
        </span>
      )}
    </span>
  );
};