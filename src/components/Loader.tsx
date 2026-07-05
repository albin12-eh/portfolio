import { useEffect, useState } from "react";
import "./Loader.css";
import { playTypingTick, playBeep } from "../lib/sound";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

interface LoaderProps {
  fadingOut: boolean;
}

const BOOT_LINES = [
  "Initializing...",
  "Loading kernel modules...",
  "Mounting encrypted filesystem...",
  "Loading Modules...",
];

/**
 * Full-screen Matrix-style boot sequence shown before the portfolio
 * renders. Lines type themselves out one at a time, followed by a
 * progress bar that fills to 100%, then a closing "Connected to the
 * Matrix... Welcome." line before the whole overlay fades.
 */
export default function Loader({ fadingOut }: LoaderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleLines(BOOT_LINES);
      setProgress(100);
      setShowWelcome(true);
      return;
    }

    let lineIndex = 0;
    const lineTimer = window.setInterval(() => {
      lineIndex++;
      setVisibleLines(BOOT_LINES.slice(0, lineIndex));
      playTypingTick();
      if (lineIndex >= BOOT_LINES.length) {
        window.clearInterval(lineTimer);

        let pct = 0;
        const progressTimer = window.setInterval(() => {
          pct += 4 + Math.random() * 8;
          if (pct >= 100) {
            pct = 100;
            window.clearInterval(progressTimer);
            playBeep();
            window.setTimeout(() => setShowWelcome(true), 200);
          }
          setProgress(Math.min(pct, 100));
        }, 90);
      }
    }, 220);

    return () => window.clearInterval(lineTimer);
  }, [reducedMotion]);

  const barLength = 24;
  const filled = Math.round((progress / 100) * barLength);
  const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

  return (
    <div className={`app-loader-screen ${fadingOut ? "app-loader-screen--hidden" : ""}`}>
      <div className="app-loader-terminal" role="status" aria-live="polite">
        {visibleLines.map((line, i) => (
          <p key={i} className="app-loader-line">
            <span className="app-loader-prompt">&gt;</span> {line}
          </p>
        ))}

        {visibleLines.length >= BOOT_LINES.length && (
          <p className="app-loader-line app-loader-bar">
            {bar} {Math.round(progress)}%
          </p>
        )}

        {showWelcome && (
          <>
            <p className="app-loader-line app-loader-connected">Connected to the Matrix...</p>
            <p className="app-loader-line app-loader-welcome">
              Welcome<span className="blink-cursor" aria-hidden="true" />
            </p>
          </>
        )}
      </div>
    </div>
  );
}
