import type { ReactNode } from "react";
import { motion } from "motion/react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Extra delay (seconds) added on top of the base transition — handy for staggering lists. */
  delay?: number;
  /** Vertical offset (px) the content slides in from. Use 0 for a pure fade. */
  y?: number;
  /** Horizontal offset (px) the content slides in from. */
  x?: number;
  duration?: number;
  /** Replay every time the element re-enters the viewport instead of only once. */
  repeat?: boolean;
  /** Fraction of the element that must be visible before it triggers. */
  amount?: number;
}

/**
 * Fades + slides content in as it scrolls into view.
 * Pure presentation wrapper — carries the same className as a normal <div>,
 * so it drops into existing flex/grid layouts without changing behavior.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  x = 0,
  duration = 0.6,
  repeat = false,
  amount = 0.2,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: !repeat, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
