import { useEffect, useState } from "react";

/**
 * Returns true if the user has requested reduced motion at the OS/browser level.
 * Used to gate purely decorative animation (custom cursor, magnetic buttons,
 * easter-egg effects) so the site stays comfortable for motion-sensitive visitors.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reduced;
}

/**
 * Returns true on devices whose primary input is touch/coarse (phones, tablets).
 * Cursor-follow effects don't make sense there since there's no persistent cursor.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    setIsTouch(query.matches);

    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return isTouch;
}
