import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * Purely decorative CRT monitor overlay: scanlines + soft vignette +
 * a low-frequency flicker. Sits above everything (high z-index) but is
 * fully `pointer-events: none`, so it never interferes with clicks.
 *
 * Listens for a `matrix:crt-burst` event to trigger a brief, heavier
 * flicker — used when hidden commands / easter eggs fire, to sell the
 * "something just happened" feeling without a modal popup.
 */
export default function ScanlineOverlay() {
  const flickerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = flickerRef.current;
    if (!el) return;

    const onBurst = () => {
      el.classList.remove("crt-flicker--burst");
      // restart the animation
      void el.offsetWidth;
      el.classList.add("crt-flicker--burst");
    };

    window.addEventListener("matrix:crt-burst", onBurst);
    return () => window.removeEventListener("matrix:crt-burst", onBurst);
  }, []);

  if (reducedMotion) return null;

  return (
    <div className="crt-overlay" aria-hidden="true">
      <div className="crt-scanlines" />
      <div ref={flickerRef} className="crt-flicker" />
      <div className="crt-vignette" />
    </div>
  );
}
