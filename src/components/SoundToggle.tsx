import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted, playBeep } from "../lib/sound";

/**
 * Small header control for the optional keyboard-tick / terminal-beep
 * sounds. Defaults to muted on first visit (autoplay-friendly, no
 * surprise noise) and remembers the choice via localStorage.
 */
export default function SoundToggle() {
  const [muted, setMutedState] = useState(true);

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playBeep();
  };

  return (
    <button
      onClick={toggle}
      title={muted ? "Unmute terminal sounds" : "Mute terminal sounds"}
      aria-label={muted ? "Unmute terminal sounds" : "Mute terminal sounds"}
      className="flex items-center justify-center w-7 h-7 rounded-md border border-border text-text-dim hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors cursor-pointer"
    >
      {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
    </button>
  );
}
