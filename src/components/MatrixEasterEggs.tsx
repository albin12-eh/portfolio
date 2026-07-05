import { useEffect, useRef, useState } from "react";
import RabbitHolePage from "./RabbitHolePage";
import { playEasterEggChime, playBeep } from "../lib/sound";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * Everything "hidden" about the Matrix theme lives in one place so it's
 * easy to reason about and doesn't scatter global key-listeners across
 * the codebase:
 *
 *  - Typing "neo" anywhere on the page       -> "Welcome, Mr. Anderson."
 *  - Typing "follow the white rabbit"        -> opens the hidden dev page
 *  - Backtick (`) key                        -> opens a hidden terminal
 *      supporting: whoami, matrix, help, neo, rabbit, clear, exit
 *  - Tiny red/blue pill dots (bottom-left)    -> red = heavier Matrix mode,
 *      blue = briefly pause all decorative effects
 *  - `matrix:toast` window event              -> shows a message toast
 *      (used by the logo-click-7-times "There is no spoon." egg, etc.)
 *  - Rare random "Knock... Knock... Neo." toast, purely atmospheric
 */
export default function MatrixEasterEggs() {
  const reducedMotion = usePrefersReducedMotion();
  const [toast, setToast] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "hidden_terminal v1.0 — type `help` for a list of commands",
  ]);
  const [rabbitOpen, setRabbitOpen] = useState(false);
  const terminalInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimeoutRef = useRef<number | undefined>(undefined);

  const showToast = (message: string, chime = true) => {
    setToast(message);
    if (chime) playEasterEggChime();
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3600);
  };

  // Listen for externally-triggered toasts (e.g. "There is no spoon.")
  useEffect(() => {
    const onToastEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      if (detail?.message) showToast(detail.message);
    };
    window.addEventListener("matrix:toast", onToastEvent);
    return () => window.removeEventListener("matrix:toast", onToastEvent);
  }, []);

  // Global typing-buffer listener for "neo" and "follow the white rabbit",
  // plus the backtick shortcut to open the hidden terminal.
  useEffect(() => {
    let buffer = "";

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingField =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      if (e.key === "`" && !isTypingField) {
        e.preventDefault();
        setTerminalOpen(prev => !prev);
        return;
      }

      if (isTypingField || terminalOpen) return;

      if (e.key.length === 1) {
        buffer = (buffer + e.key.toLowerCase()).slice(-40);

        if (buffer.endsWith("neo")) {
          showToast("Welcome, Mr. Anderson.");
          buffer = "";
        } else if (buffer.endsWith("follow the white rabbit")) {
          setRabbitOpen(true);
          playEasterEggChime();
          buffer = "";
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [terminalOpen]);

  useEffect(() => {
    if (terminalOpen) window.setTimeout(() => terminalInputRef.current?.focus(), 30);
  }, [terminalOpen]);

  // Rare, atmospheric "Knock... Knock... Neo." message.
  useEffect(() => {
    if (reducedMotion) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (Math.random() < 0.04) {
        showToast("Knock...\nKnock...\nNeo.");
      }
    }, 60000);
    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  const runTerminalCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    let output: string[] = [];

    switch (cmd) {
      case "whoami":
        output = ["Full Stack Developer", "AWS Cloud Practitioner", "Problem Solver"];
        break;
      case "matrix":
        window.dispatchEvent(new CustomEvent("matrix:heavy-rain", { detail: { durationMs: 10000 } }));
        window.dispatchEvent(new Event("matrix:crt-burst"));
        output = ["Heavier rain engaged for 10 seconds..."];
        break;
      case "neo":
        output = ["Welcome, Mr. Anderson."];
        break;
      case "rabbit":
      case "follow the white rabbit":
        setRabbitOpen(true);
        output = ["Opening hidden page..."];
        break;
      case "help":
        output = [
          "Available commands:",
          "  whoami   — print identity",
          "  matrix   — heavier digital rain for 10s",
          "  neo      — ???",
          "  rabbit   — follow the white rabbit",
          "  clear    — clear this terminal",
          "  exit     — close this terminal",
        ];
        break;
      case "clear":
        setTerminalLines([]);
        setTerminalInput("");
        return;
      case "exit":
        setTerminalOpen(false);
        setTerminalInput("");
        return;
      case "":
        return;
      default:
        output = [`command not found: ${cmd}`];
    }

    playBeep();
    setTerminalLines(prev => [...prev, `> ${raw}`, ...output]);
    setTerminalInput("");
  };

  return (
    <>
      {/* RED / BLUE PILL — deliberately subtle, bottom-left corner */}
      <div className="pill-easter-egg" title="???">
        <button
          className="pill-dot pill-dot--red"
          aria-label="Red pill"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("matrix:heavy-rain", { detail: { durationMs: 8000 } }));
            window.dispatchEvent(new Event("matrix:crt-burst"));
            showToast("You take the red pill... you stay in Wonderland.");
          }}
        />
        <button
          className="pill-dot pill-dot--blue"
          aria-label="Blue pill"
          onClick={() => {
            window.dispatchEvent(new Event("matrix:pause-effects"));
            showToast("You take the blue pill... the story ends, for now.");
            window.setTimeout(() => window.dispatchEvent(new Event("matrix:resume-effects")), 6000);
          }}
        />
      </div>

      {/* TOAST */}
      {toast && (
        <div className="matrix-toast" role="status">
          {toast}
        </div>
      )}

      {/* HIDDEN TERMINAL (backtick key) */}
      {terminalOpen && (
        <div className="hidden-terminal-overlay" onClick={() => setTerminalOpen(false)}>
          <div className="hidden-terminal-box" onClick={e => e.stopPropagation()}>
            <div className="bg-bg-panel-alt px-4 py-2 border-b border-border flex items-center justify-between">
              <span className="font-mono text-xs text-accent-cyan">hidden_terminal</span>
              <span className="font-mono text-[10px] text-text-dim">` to toggle</span>
            </div>
            <div className="p-4 font-mono text-xs text-accent-green space-y-1 max-h-[260px] overflow-y-auto">
              {terminalLines.map((line, i) => (
                <div key={i} className={line.startsWith(">") ? "text-accent-amber" : ""}>
                  {line}
                </div>
              ))}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  runTerminalCommand(terminalInput);
                }}
                className="flex items-center gap-1.5 pt-1"
              >
                <span className="text-accent-cyan">➜</span>
                <input
                  ref={terminalInputRef}
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  className="flex-grow bg-transparent border-0 outline-none text-text-primary p-0 font-mono text-xs"
                  autoFocus
                  spellCheck={false}
                />
                <span className="blink-cursor" aria-hidden="true" />
              </form>
            </div>
          </div>
        </div>
      )}

      {rabbitOpen && <RabbitHolePage onClose={() => setRabbitOpen(false)} />}
    </>
  );
}
