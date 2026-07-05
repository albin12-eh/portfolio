import { cloneElement, isValidElement, useRef } from "react";
import type { ReactElement } from "react";
import { usePrefersReducedMotion, useIsTouchDevice } from "../hooks/usePrefersReducedMotion";

interface MagneticButtonProps {
  children: ReactElement;
  /** How strongly the element follows the cursor (0-1). */
  strength?: number;
  /** Radius (px) around the element within which the pull is felt. */
  radius?: number;
}

/**
 * Wraps a single button/anchor and makes it drift a few pixels toward the
 * cursor as it gets close, then spring back on mouse leave. Purely additive —
 * clones the child and adds ref + mouse handlers, no markup changes needed.
 */
export default function MagneticButton({ children, strength = 0.35, radius = 80 }: MagneticButtonProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();

  if (reducedMotion || isTouch || !isValidElement(children)) {
    return children;
  }

  const childProps = children.props as Record<string, unknown>;

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = elRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < radius + rect.width / 2) {
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    } else {
      el.style.transform = "translate(0px, 0px)";
    }
  };

  const handleMouseLeave = () => {
    if (elRef.current) elRef.current.style.transform = "translate(0px, 0px)";
  };

  return cloneElement(children, {
    ref: elRef,
    onMouseMove: (e: React.MouseEvent) => {
      handleMouseMove(e);
      (childProps.onMouseMove as ((e: React.MouseEvent) => void) | undefined)?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      (childProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e);
    },
    style: {
      ...(childProps.style as React.CSSProperties | undefined),
      transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      willChange: "transform",
    },
  } as Partial<unknown>);
}
