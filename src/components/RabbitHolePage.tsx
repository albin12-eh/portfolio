import { X } from "lucide-react";

interface RabbitHolePageProps {
  onClose: () => void;
}

/**
 * Hidden "developer page" unlocked by typing `follow the white rabbit`.
 * Purely an easter egg — doesn't touch or replace any real portfolio
 * content, just a fun bonus screen for anyone curious enough to find it.
 */
export default function RabbitHolePage({ onClose }: RabbitHolePageProps) {
  return (
    <div className="fixed inset-0 z-[230] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="win w-full max-w-[560px] bg-bg-panel border border-accent-cyan/60 rounded-lg shadow-2xl overflow-hidden neon-border-glow">
        <div className="bg-bg-panel-alt px-4 py-2.5 border-b border-border flex items-center justify-between">
          <span className="font-mono text-xs text-accent-cyan">rabbit_hole.sh</span>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-accent-red cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 md:p-8 space-y-4 font-mono text-xs md:text-sm text-accent-cyan leading-relaxed">
          <p>&gt; You followed the white rabbit.</p>
          <p className="text-text-secondary">
            There is no spoon, no secret job offer hidden down here — just a small
            thank-you for actually poking around instead of skimming.
          </p>
          <p className="text-text-secondary">
            Curiosity like this is exactly what makes a good engineer. If you're
            reading this, you've officially spent more time exploring this portfolio
            than most recruiters do — so hey, maybe reach out and say hi.
          </p>
          <p className="text-accent-green">01110000 01100101 01100001 01100011 01100101</p>
          <button
            onClick={onClose}
            className="mt-2 font-mono text-xs border border-accent-cyan/50 text-accent-cyan px-4 py-2 rounded hover:bg-accent-cyan/10 transition-colors cursor-pointer"
          >
            [ WAKE UP ]
          </button>
        </div>
      </div>
    </div>
  );
}
