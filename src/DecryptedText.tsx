import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import type { HTMLAttributes } from 'react';
import { motion } from 'motion/react';

type AnimateOn = 'hover' | 'view' | 'inViewHover' | 'click';
type ClickMode = 'once' | 'toggle';
type RevealDirection = 'start' | 'end' | 'center';

interface DecryptedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: RevealDirection;
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: AnimateOn;
  clickMode?: ClickMode;
}

const styles = {
  wrapper: {
    display: 'inline-block',
    whiteSpace: 'pre-wrap' as const
  },
  srOnly: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0
  }
};

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  clickMode = 'once',
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== 'click');

  const containerRef = useRef<HTMLSpanElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealedRef = useRef<Set<number>>(new Set());
  const stepRef = useRef(0);

  const availableChars = useMemo(() => {
    return useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter((char) => char !== ' ')
      : characters.split('');
  }, [useOriginalCharsOnly, text, characters]);

  const getRandomChar = useCallback(() => {
    const pool = availableChars.length > 0 ? availableChars : ['A', 'B', 'C', '1', '2', '3', '?'];
    return pool[Math.floor(Math.random() * pool.length)];
  }, [availableChars]);

  const scrambleText = useCallback((originalText: string, currentRevealed: Set<number>) => {
    return originalText
      .split('')
      .map((char, index) => {
        if (char === ' ') return ' ';
        if (currentRevealed.has(index)) return char;
        return getRandomChar();
      })
      .join('');
  }, [getRandomChar]);

  const clearAnimation = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    clearAnimation();

    revealedRef.current = new Set();
    stepRef.current = 0;
    setRevealedIndices(new Set());
    setDisplayText(scrambleText(text, new Set()));
    setIsAnimating(true);
    setIsDecrypted(false);
  }, [clearAnimation, scrambleText, text]);

  const resetToPlainText = useCallback(() => {
    clearAnimation();

    revealedRef.current = new Set();
    stepRef.current = 0;
    setRevealedIndices(new Set());
    setDisplayText(text);
    setIsAnimating(false);
    setIsDecrypted(true);
  }, [clearAnimation, text]);

  useEffect(() => {
    if (!isAnimating) return;

    intervalRef.current = window.setInterval(() => {
      const nextRevealed = new Set(revealedRef.current);
      const remainingIndices = Array.from({ length: text.length }, (_, index) => index).filter((index) => !nextRevealed.has(index));

      if (remainingIndices.length === 0 || stepRef.current >= maxIterations) {
        clearAnimation();
        setRevealedIndices(new Set(Array.from(nextRevealed).concat(remainingIndices)));
        setDisplayText(text);
        setIsAnimating(false);
        setIsDecrypted(true);
        return;
      }

      const revealOrder = revealDirection === 'start'
        ? remainingIndices[0]
        : revealDirection === 'end'
          ? remainingIndices[remainingIndices.length - 1]
          : remainingIndices[Math.floor(remainingIndices.length / 2)];

      const safeIndex = Math.max(0, Math.min(text.length - 1, revealOrder));
      if (!nextRevealed.has(safeIndex)) {
        nextRevealed.add(safeIndex);
      }

      revealedRef.current = nextRevealed;
      stepRef.current += 1;
      setRevealedIndices(nextRevealed);
      setDisplayText(scrambleText(text, nextRevealed));

      if (nextRevealed.size >= text.length || stepRef.current >= maxIterations) {
        clearAnimation();
        setDisplayText(text);
        setIsAnimating(false);
        setIsDecrypted(true);
      }
    }, Math.max(20, speed));

    return () => {
      clearAnimation();
    };
  }, [clearAnimation, isAnimating, text, speed, revealDirection, scrambleText, maxIterations]);

  useEffect(() => {
    if (animateOn === 'click') {
      setDisplayText(scrambleText(text, new Set()));
      setIsDecrypted(false);
    } else {
      setDisplayText(text);
      setIsDecrypted(true);
    }

    revealedRef.current = new Set();
    stepRef.current = 0;
    setRevealedIndices(new Set());
    setIsAnimating(false);
  }, [animateOn, text, scrambleText]);

  useEffect(() => {
    if (animateOn !== 'view' && animateOn !== 'inViewHover') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          startAnimation();
          setHasAnimated(true);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    });

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [animateOn, hasAnimated, startAnimation]);

  const handleClick = () => {
    if (animateOn !== 'click') return;

    if (clickMode === 'once') {
      if (isDecrypted) return;
      startAnimation();
    }

    if (clickMode === 'toggle') {
      if (isDecrypted) {
        startAnimation();
      } else {
        resetToPlainText();
      }
    }
  };

  const animateProps =
    animateOn === 'hover' || animateOn === 'inViewHover'
      ? {
          onMouseEnter: startAnimation,
          onMouseLeave: resetToPlainText
        }
      : animateOn === 'click'
        ? {
            onClick: handleClick
          }
        : {};

  return (
    <motion.span className={parentClassName} ref={containerRef} style={styles.wrapper} {...animateProps} {...props}>
      <span style={styles.srOnly}>{displayText}</span>

      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          const isRevealedOrDone = revealedIndices.has(index) || (!isAnimating && isDecrypted);

          return (
            <span key={index} className={isRevealedOrDone ? className : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
