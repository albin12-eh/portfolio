import { useEffect } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * Tracks the cursor over any ".win" panel and sets --spot-x/--spot-y CSS
 * variables (as percentages of the panel's own box) so index.css can paint a
 * soft radial highlight that follows the mouse, like a flashlight over the
 * panel's surface. No per-panel markup changes required — this mounts once
 * and delegates from a single document-level listener.
 */
export default function SpotlightEffect() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let lastPanel: HTMLElement | null = null;

    const onMove = (e: MouseEvent) => {
      const panel = (e.target as Element | null)?.closest?.(".win") as HTMLElement | null;

      if (lastPanel && lastPanel !== panel) {
        lastPanel.style.setProperty("--spot-opacity", "0");
      }

      if (panel) {
        const rect = panel.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        panel.style.setProperty("--spot-x", `${x}%`);
        panel.style.setProperty("--spot-y", `${y}%`);
        panel.style.setProperty("--spot-opacity", "1");
      }

      lastPanel = panel;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reducedMotion]);

  return null;
}
