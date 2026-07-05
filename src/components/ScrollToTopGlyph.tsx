import { useEffect, useState } from "react";

/**
 * Floating scroll-to-top control styled as a glowing Matrix glyph rather
 * than a literal arrow icon, per the theme brief. Fades in once the
 * visitor has scrolled a bit, fades out near the very top.
 */
export default function ScrollToTopGlyph() {
  const [visible, setVisible] = useState(false);
  const [glyph, setGlyph] = useState("卜");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Cycle the glyph occasionally for a subtle "alive" feel.
    const glyphs = ["卜", "王", "个", "上", "止"];
    const glyphInterval = window.setInterval(() => {
      setGlyph(glyphs[Math.floor(Math.random() * glyphs.length)]);
    }, 2200);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(glyphInterval);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="matrix-scrolltop"
      aria-label="Scroll to top"
      title="Back to the top"
    >
      {glyph}
    </button>
  );
}
