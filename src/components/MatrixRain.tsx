import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

interface MatrixRainProps {
  theme: "dark" | "light";
}

/**
 * Animated Matrix digital-rain background rendered on a single <canvas>.
 *
 * Design notes (kept intentionally subtle & cheap per the brief):
 * - One column-based glyph grid, redrawn each frame with a translucent
 *   black "trail" fill instead of clearing — this is what produces the
 *   classic fading-tail look without manually tracking per-glyph opacity.
 * - Runs at a capped ~20fps internally (via a frame-skip counter) even
 *   though requestAnimationFrame fires at display refresh rate, so it
 *   stays GPU/CPU-light and doesn't compete with scroll/hover animations.
 * - A "heavy" mode can be triggered from anywhere in the app by dispatching
 *   a `matrix:heavy-rain` CustomEvent (used by the Konami code and the
 *   hidden `matrix` terminal command) — it temporarily doubles the glyph
 *   density and speed for a few seconds, then eases back to normal.
 * - Respects prefers-reduced-motion by rendering a static, very faint
 *   single frame instead of animating.
 */
export default function MatrixRain({ theme }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const GLYPHS =
      "アイウエオカキクケコサシスセソタチツテト0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/<>[]{}";

    let width = window.innerWidth;
    let height = window.innerHeight;
    let columns = 0;
    const fontSize = 15;
    let drops: number[] = [];
    // Per-column speed & "brightness lead" glyph, so the rain isn't uniform.
    let speeds: number[] = [];

    const isDark = theme === "dark";

    const setup = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      columns = Math.ceil(width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -50));
      speeds = new Array(columns).fill(0).map(() => 0.5 + Math.random() * 0.9);
    };

    setup();
    window.addEventListener("resize", setup);

    // Reduced motion: paint a single ultra-faint static frame and stop.
    if (reducedMotion) {
      ctx.fillStyle = isDark ? "#000000" : "#f4fbf4";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = isDark ? "rgba(0,255,65,0.12)" : "rgba(6,122,46,0.10)";
      for (let i = 0; i < columns; i++) {
        if (Math.random() > 0.6) {
          const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          ctx.fillText(glyph, i * fontSize, Math.random() * height);
        }
      }
      return () => window.removeEventListener("resize", setup);
    }

    let animationId: number;
    let frameCount = 0;
    // Density/speed multiplier, ramped up during "heavy" bursts.
    let intensity = 1;
    let targetIntensity = 1;
    let heavyTimeout: number | undefined;

    const onHeavyRain = (e: Event) => {
      const durationMs = (e as CustomEvent<{ durationMs?: number }>).detail?.durationMs ?? 10000;
      targetIntensity = 2.6;
      if (heavyTimeout) window.clearTimeout(heavyTimeout);
      heavyTimeout = window.setTimeout(() => {
        targetIntensity = 1;
      }, durationMs);
    };
    window.addEventListener("matrix:heavy-rain", onHeavyRain);

    // Global pause hook for the "blue pill" easter egg.
    let paused = false;
    const onPause = () => (paused = true);
    const onResume = () => (paused = false);
    window.addEventListener("matrix:pause-effects", onPause);
    window.addEventListener("matrix:resume-effects", onResume);

    const render = () => {
      frameCount++;
      // Cap the internal update rate for performance; skip frames rather
      // than skipping the RAF loop, so timing stays consistent.
      if (!paused && frameCount % 2 === 0) {
        intensity += (targetIntensity - intensity) * 0.04;

        // Translucent fill (instead of clearRect) creates the fading trail.
        ctx.fillStyle = isDark ? "rgba(0,0,0,0.09)" : "rgba(244,251,244,0.14)";
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
        const headColor = isDark ? "#c9ffcf" : "#0a3d17";
        const trailColor = isDark ? "rgba(0,255,65,0.55)" : "rgba(6,122,46,0.4)";

        for (let i = 0; i < columns; i++) {
          if (Math.random() > 0.985 * (1 / Math.max(intensity, 1))) continue; // sparsity
          const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Leading glyph brighter/whiter, trailing ones dimmer green.
          ctx.fillStyle = Math.random() > 0.93 ? headColor : trailColor;
          ctx.fillText(glyph, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          } else {
            drops[i] += speeds[i] * intensity;
          }
        }
      }
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", setup);
      window.removeEventListener("matrix:heavy-rain", onHeavyRain);
      window.removeEventListener("matrix:pause-effects", onPause);
      window.removeEventListener("matrix:resume-effects", onResume);
      if (heavyTimeout) window.clearTimeout(heavyTimeout);
    };
  }, [theme, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      id="matrix-rain-canvas"
      aria-hidden="true"
      style={{ opacity: theme === "dark" ? 0.85 : 0.35 }}
    />
  );
}
