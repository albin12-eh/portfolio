import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

/**
 * Classic Konami code (↑ ↑ ↓ ↓ ← → ← → B A) unlocks a small full-screen
 * "dev mode" celebration — a nod for anyone who tries it, on brand for a
 * terminal-themed portfolio. Purely cosmetic, auto-dismisses.
 */
export default function KonamiEasterEgg() {
  const [active, setActive] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let progress: string[] = [];

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress.push(key);
      progress = progress.slice(-KONAMI_SEQUENCE.length);

      if (progress.length === KONAMI_SEQUENCE.length && progress.every((k, i) => k === KONAMI_SEQUENCE[i])) {
        setActive(true);
        progress = [];
        window.dispatchEvent(new CustomEvent("matrix:heavy-rain", { detail: { durationMs: 10000 } }));
        window.dispatchEvent(new Event("matrix:crt-burst"));
        window.setTimeout(() => setActive(false), 3200);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn pointer-events-none">
      <div className={`text-center space-y-4 ${reducedMotion ? "" : "konami-pop"}`}>
        <div className="flex items-center justify-center gap-3">
          <Terminal className="w-8 h-8 text-accent-cyan" />
          <span className="font-mono text-2xl md:text-3xl font-extrabold text-accent-cyan neon-glow">
            The Matrix has you...
          </span>
        </div>
        <p className="font-mono text-sm text-accent-green">
          ✔ Konami sequence recognized. Dev mode unlocked.
        </p>
        <p className="font-mono text-xs text-text-dim">
          Albin appreciates the curiosity. That's a good sign in a developer.
        </p>
      </div>
      {!reducedMotion && (
        <div className="konami-rain" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${(i / 24) * 100}%`,
                animationDelay: `${(i % 8) * 0.15}s`,
                animationDuration: `${1.6 + (i % 5) * 0.25}s`,
              }}
            >
              {"</>"[i % 3]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
