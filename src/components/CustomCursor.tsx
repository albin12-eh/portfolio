import { useEffect, useRef } from "react";
import { usePrefersReducedMotion, useIsTouchDevice } from "../hooks/usePrefersReducedMotion";

/**
 * A small ring + dot that trails the real cursor and morphs (scales up,
 * fills in) whenever it passes over a link, button, or anything clickable.
 * Disabled automatically on touch devices and when reduced-motion is set.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const enabled = !reducedMotion && !isTouch;

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("custom-cursor-active");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = 0;
    let hasMoved = false;

    const onMove = (e: MouseEvent) => {
      // Cheap: just record the latest position. All DOM writes happen once
      // per animation frame in tick(), not once per mousemove — mousemove
      // can fire at 2-4x the display's refresh rate on modern mice/trackpads,
      // and writing styles that often was the source of the visible lag.
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMoved = true;

      const hovered = (e.target as Element | null)?.closest?.(
        'a, button, [role="button"], input, textarea, .cursor-hover'
      );
      ringRef.current?.classList.toggle("cursor-ring--active", Boolean(hovered));
    };

    const spawnRipple = (x: number, y: number) => {
      const ripple = document.createElement("div");
      ripple.className = "cursor-ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    };

    const onDown = (e: MouseEvent) => {
      ringRef.current?.classList.add("cursor-ring--click");
      spawnRipple(e.clientX, e.clientY);
    };
    const onUp = () => ringRef.current?.classList.remove("cursor-ring--click");
    const onLeaveWindow = () => {
      dotRef.current?.style.setProperty("opacity", "0");
      ringRef.current?.style.setProperty("opacity", "0");
    };
    const onEnterWindow = () => {
      dotRef.current?.style.setProperty("opacity", "1");
      ringRef.current?.style.setProperty("opacity", "1");
    };

    // Dot tracks almost 1:1 (snappy); ring trails slightly for a soft feel.
    // Both update in the same frame so they never fall out of sync with paint.
    const tick = () => {
      if (hasMoved) {
        dotX += (mouseX - dotX) * 0.65;
        dotY += (mouseY - dotY) * 0.65;
        ringX += (mouseX - ringX) * 0.32;
        ringY += (mouseY - ringY) * 0.32;

        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
        }
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseenter", onEnterWindow);
    rafId = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseenter", onEnterWindow);
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
