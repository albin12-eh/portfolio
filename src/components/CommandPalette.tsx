import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";

export interface PaletteCommand {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  action: () => void;
}

interface CommandPaletteProps {
  commands: PaletteCommand[];
}

/**
 * A searchable ⌘K / Ctrl+K overlay for jumping around the site — on brand
 * for a terminal-themed portfolio. Opens with the shortcut, filters commands
 * as you type, and supports arrow-key + enter navigation.
 */
export default function CommandPalette({ commands }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      c => c.label.toLowerCase().includes(q) || c.keywords?.toLowerCase().includes(q)
    );
  }, [query, commands]);

  // Global shortcut to open/close.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCombo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCombo) {
        e.preventDefault();
        setOpen(prev => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    const onExternalOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("command-palette:open", onExternalOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("command-palette:open", onExternalOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const runCommand = (cmd: PaletteCommand) => {
    cmd.action();
    setOpen(false);
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) runCommand(cmd);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={() => setOpen(false)}
    >
      <div
        className="win w-full max-w-[560px] bg-bg-panel border border-accent-cyan/40 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-accent-cyan flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Type a command or search…"
            className="flex-grow bg-transparent border-0 outline-none text-text-primary placeholder:text-text-dim font-mono text-sm ring-0 focus:ring-0 p-0"
          />
          <span className="font-mono text-[10px] text-text-dim border border-border px-1.5 py-0.5 rounded flex-shrink-0">
            ESC
          </span>
        </div>

        <div className="max-h-[320px] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center font-mono text-xs text-text-dim">
              No matching commands.
            </div>
          )}
          {filtered.map((cmd, idx) => (
            <button
              key={cmd.id}
              onClick={() => runCommand(cmd)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 font-mono text-xs md:text-sm transition-colors cursor-pointer ${
                idx === activeIndex
                  ? "bg-accent-cyan/10 text-accent-cyan"
                  : "text-text-secondary hover:bg-bg-panel-alt"
              }`}
            >
              <span>{cmd.label}</span>
              {cmd.hint && <span className="text-[10px] text-text-dim">{cmd.hint}</span>}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border font-mono text-[10px] text-text-dim">
          <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> navigate</span>
          <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> select</span>
        </div>
      </div>
    </div>
  );
}
