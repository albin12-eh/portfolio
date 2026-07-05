import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  ExternalLink, 
  Mail, 
  Github, 
  Linkedin, 
  Twitter, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Send,
  Sparkles,
  ArrowRight,
  Monitor,
  Code2,
  Search
} from "lucide-react";
import { SKILL_CATEGORIES, PROJECTS, EXPERIENCES } from "./data";
import { ProjectItem } from "./types";
import MatrixRain from "./components/MatrixRain";
import ScanlineOverlay from "./components/ScanlineOverlay";
import FloatingCore from "./components/FloatingCore";
import Loader from "./components/Loader";
import DecryptedText from "./DecryptedText";
import Reveal from "./components/Reveal";
import CustomCursor from "./components/CustomCursor";
import SpotlightEffect from "./components/SpotlightEffect";
import MagneticButton from "./components/MagneticButton";
import CommandPalette, { PaletteCommand } from "./components/CommandPalette";
import KonamiEasterEgg from "./components/KonamiEasterEgg";
import MatrixEasterEggs from "./components/MatrixEasterEggs";
import SoundToggle from "./components/SoundToggle";
import ScrollToTopGlyph from "./components/ScrollToTopGlyph";
import { showMatrixToast } from "./lib/matrixToast";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLoading, setIsLoading] = useState(true);
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [skillProgressActive, setSkillProgressActive] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  
  // Interactive command-line simulation state for sending a message
  const [cliOpen, setCliOpen] = useState(false);
  const [cliStep, setCliStep] = useState(0); // 0: prompt, 1: enter name, 2: enter email, 3: enter message, 4: sending, 5: success
  const [cliInput, setCliInput] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderMsg, setSenderMsg] = useState("");
  const [cliHistory, setCliHistory] = useState<string[]>([
    "albin@portfolio ~ % ./send-email --now",
    "Initializing contact stream securely...",
  ]);

  const skillsSectionRef = useRef<HTMLDivElement | null>(null);
  const terminalInputRef = useRef<HTMLInputElement | null>(null);

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [theme]);

  // Initial loading screen: wait for the window to finish loading,
  // then fade the loader out and unmount it shortly after.
  useEffect(() => {
    const MIN_DISPLAY_TIME = 1800; // ms — long enough to see the matrix animation
    const start = Date.now();

    const finishLoading = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(MIN_DISPLAY_TIME - elapsed, 0);
      setTimeout(() => {
        setLoaderHidden(true); // trigger fade-out transition
        setTimeout(() => setIsLoading(false), 550); // unmount after transition
      }, remaining);
    };

    if (document.readyState === "complete") {
      finishLoading();
    } else {
      window.addEventListener("load", finishLoading);
      return () => window.removeEventListener("load", finishLoading);
    }
  }, []);

  // Command Typing Animation
useEffect(() => {
  const fullText = "Albin Johnson — Full-Stack Developer, building for the web";

  let index = 0;

  const interval = setInterval(() => {
    index++;

    setTypedText(fullText.slice(0, index));

    if (index >= fullText.length) {
      clearInterval(interval);
    }
  }, 45);

  return () => clearInterval(interval);
}, []);

  // Intersection Observer for Active Tabs & Skills Animation
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id) {
            setActiveTab(id);
          }
          if (id === "skills") {
            setSkillProgressActive(true);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0.1
    });

    const sections = ["about", "skills", "projects", "experience", "contact"];
    sections.forEach(secId => {
      const el = document.getElementById(secId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Copy to clipboard utility
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  // Extract all unique tech tags for filter buttons
  const allTags = Array.from(
    new Set(PROJECTS.flatMap(p => p.tags))
  );

  const filteredProjects = selectedTags.size === 0
    ? PROJECTS
    : PROJECTS.filter(p => p.tags.some(tag => selectedTags.has(tag)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  // CLI Contact workflow
  const startCliForm = () => {
    setCliOpen(true);
    setCliStep(1);
    setCliInput("");
    setCliHistory([
      "albin@portfolio ~ % ./send-email --now",
      "Initializing secure message pipeline...",
      "Enter your Name:"
    ]);
    setTimeout(() => terminalInputRef.current?.focus(), 150);
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const currentInput = cliInput.trim();
    setCliInput("");

    if (cliStep === 1) {
      setSenderName(currentInput);
      setCliHistory(prev => [
        ...prev,
        `> ${currentInput}`,
        `Nice to meet you, ${currentInput}!`,
        "Enter your Email address:"
      ]);
      setCliStep(2);
    } else if (cliStep === 2) {
      // Basic email verification
      if (!currentInput.includes("@")) {
        setCliHistory(prev => [
          ...prev,
          `> ${currentInput}`,
          "Invalid email format. Please enter a valid email:"
        ]);
        return;
      }
      setSenderEmail(currentInput);
      setCliHistory(prev => [
        ...prev,
        `> ${currentInput}`,
        "Awesome. Now enter your message:"
      ]);
      setCliStep(3);
    } else if (cliStep === 3) {
      setSenderMsg(currentInput);
      setCliHistory(prev => [
        ...prev,
        `> ${currentInput}`,
        "Compiling message metadata...",
        "Executing connection.send()..."
      ]);
      setCliStep(4);

      // Simulate network request
      setTimeout(() => {
        setCliHistory(prev => [
          ...prev,
          "✔ Message delivered successfully!",
          "Thank you! Albin will get back to you shortly.",
          "Connection closed safely."
        ]);
        setCliStep(5);
      }, 1500);
    }
  };

  const resetCli = () => {
    setCliOpen(false);
    setCliStep(0);
    setSenderName("");
    setSenderEmail("");
    setSenderMsg("");
  };

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveTab(id);
  };

  // Easter egg: clicking the logo 7 times reveals a hidden message.
  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 7) {
        showMatrixToast("There is no spoon.");
        return 0;
      }
      return next;
    });
  };

  const paletteCommands: PaletteCommand[] = [
    { id: "goto-about", label: "Go to About", hint: "section", action: () => goTo("about") },
    { id: "goto-skills", label: "Go to Skills", hint: "section", action: () => goTo("skills") },
    { id: "goto-projects", label: "Go to Projects", hint: "section", action: () => goTo("projects") },
    { id: "goto-experience", label: "Go to Experience", hint: "section", action: () => goTo("experience") },
    { id: "goto-contact", label: "Go to Contact", hint: "section", action: () => goTo("contact") },
    {
      id: "toggle-theme",
      label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      hint: "toggle",
      action: () => setTheme(prev => (prev === "dark" ? "light" : "dark")),
    },
    {
      id: "copy-email",
      label: "Copy email address",
      hint: "clipboard",
      keywords: "albinjohnson913@gmail.com contact",
      action: () => copyToClipboard("albinjohnson913@gmail.com", "email"),
    },
    {
      id: "open-github",
      label: "Open GitHub profile",
      hint: "external",
      keywords: "github source code",
      action: () => window.open("https://github.com/albin12-eh", "_blank", "noreferrer"),
    },
    {
      id: "open-linkedin",
      label: "Open LinkedIn profile",
      hint: "external",
      keywords: "linkedin",
      action: () => window.open("https://www.linkedin.com/in/albin-johnson-886809307/", "_blank", "noreferrer"),
    },
    {
      id: "send-message",
      label: "Send a message (interactive terminal)",
      hint: "contact",
      keywords: "email contact cli send",
      action: () => {
        goTo("contact");
        setTimeout(startCliForm, 400);
      },
    },
  ];

  return (
    <div className="relative min-h-screen text-text-primary transition-all duration-300">
      {/* INITIAL LOADING SCREEN */}
      {isLoading && <Loader fadingOut={loaderHidden} />}

      {/* CUSTOM CURSOR + CURSOR-FOLLOW SPOTLIGHT ON PANELS */}
      <CustomCursor />
      <SpotlightEffect />

      {/* ⌘K COMMAND PALETTE */}
      <CommandPalette commands={paletteCommands} />

      {/* KONAMI CODE EASTER EGG (↑ ↑ ↓ ↓ ← → ← → B A) */}
      <KonamiEasterEgg />

      {/* HIDDEN EASTER EGGS: type "neo" / "follow the white rabbit", ` for
          a hidden terminal, red/blue pills, rare "Knock... Knock..." toast */}
      <MatrixEasterEggs />

      {/* MATRIX DIGITAL RAIN BACKGROUND */}
      <MatrixRain theme={theme} />

      {/* CRT SCANLINES / FLICKER / VIGNETTE OVERLAY */}
      <ScanlineOverlay />

      {/* FLOATING SCROLL-TO-TOP GLYPH */}
      <ScrollToTopGlyph />

      {/* CUSTOM MOUSE REACTIVE GLOW */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-radial-gradient from-accent-cyan/10 to-transparent blur-3xl" />

      {/* HEADER / NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-bg/60 border-b border-border transition-all duration-300">
        <nav className="max-w-[1080px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div
            onClick={handleLogoClick}
            className="font-mono font-bold text-sm tracking-tight text-text-primary flex items-center gap-2 select-none group cursor-pointer"
            title="~/portfolio"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-[0_0_12px_rgba(0,255,65,0.8)] animate-pulse" />
            <span className="text-text-dim group-hover:text-accent-cyan transition-colors">~/</span>
            <span className="glitch-text hover-distort" data-glitch="portfolio">portfolio</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Nav Tabs */}
            <div className="hidden md:flex gap-1">
              {[
                { label: "about", ext: ".js", id: "about" },
                { label: "skills", ext: ".json", id: "skills" },
                { label: "projects", ext: "/", id: "projects" },
                { label: "experience", ext: ".log", id: "experience" },
                { label: "contact", ext: ".sh", id: "contact" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    document.getElementById(tab.id)?.scrollIntoView({ behavior: "smooth" });
                    setActiveTab(tab.id);
                  }}
                  className={`font-mono text-xs px-3.5 py-1.5 rounded-md transition-all duration-200 cursor-pointer relative ${
                    activeTab === tab.id
                      ? "text-accent-cyan font-semibold neon-glow"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span className="text-text-dim/70">&gt;</span> {tab.label}
                  <span className="text-text-dim/60 font-light">{tab.ext}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent-cyan shadow-[0_0_8px_rgba(0,255,65,0.8)] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* SOUND TOGGLE (optional terminal typing/beep sounds) */}
            <SoundToggle />

            {/* COMMAND PALETTE HINT */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("command-palette:open"))}
              className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-text-dim border border-border rounded-md px-2 py-1 hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors cursor-pointer"
              title="Open command palette"
            >
              <Search className="w-3 h-3" />
              <span className="border border-border-soft rounded px-1">⌘K</span>
            </button>

            {/* THEME TOGGLE (PIXEL PERFECT STAR SPARKLE TOGGLE) */}
            <div className="relative">
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={theme === "light"}
                  onChange={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-950 rounded-full border border-gray-600 peer-checked:bg-slate-200 transition-all duration-300 relative flex items-center p-0.5">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-b ${theme === "dark" ? "from-indigo-900 to-indigo-600" : "from-amber-400 to-orange-500"} transition-all duration-300 transform ${theme === "light" ? "translate-x-5 rotate-45" : "translate-x-0"} flex items-center justify-center shadow-md relative overflow-hidden`}>
                    {theme === "dark" ? (
                      <span className="absolute w-1 h-1 bg-white rounded-full top-1 left-2 animate-pulse" />
                    ) : (
                      <span className="w-2.5 h-2.5 bg-white/40 rounded-full" />
                    )}
                  </div>
                  {/* Small decorative sparkles inside toggle */}
                  <Sparkles className="absolute right-1 w-3 h-3 text-amber-300/40 peer-checked:opacity-10 pointer-events-none" />
                </div>
              </label>
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE HEADER BAR TABS */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border px-4 py-2.5 flex gap-1.5 overflow-x-auto scrollbar-none transition-all duration-300">
        {[
          { label: "about", id: "about" },
          { label: "skills", id: "skills" },
          { label: "projects", id: "projects" },
          { label: "experience", id: "experience" },
          { label: "contact", id: "contact" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              document.getElementById(tab.id)?.scrollIntoView({ behavior: "smooth" });
              setActiveTab(tab.id);
            }}
            className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan font-semibold neon-glow"
                : "bg-bg-panel border-border text-text-secondary"
            }`}
          >
            &gt; {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1080px] mx-auto px-6 pt-24 md:pt-16 pb-24 relative z-10">
        
        {/* ============ HERO SECTION ============ */}
        <section id="hero" className="min-h-[85vh] flex items-center py-16 md:py-24">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Info */}
            <div className="lg:col-span-7 space-y-6">
              <Reveal y={28} duration={0.7} className="win bg-bg-panel border border-border rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-accent-cyan hover:shadow-cyan-500/10">
                <div className="bg-bg-panel-alt px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-accent-red" />
                    <span className="w-3 h-3 rounded-full bg-accent-amber" />
                    <span className="w-3 h-3 rounded-full bg-accent-green" />
                    <span className="font-mono text-xs text-text-dim ml-2 select-none">matrix_terminal — 80×24</span>
                  </div>
                  <Terminal className="w-4 h-4 text-text-dim" />
                </div>
                
                <div className="p-6 md:p-8 space-y-6">
                  {/* Boot / identity sequence */}
                  <div className="font-mono text-[11px] md:text-xs text-accent-green space-y-1 select-none">
                    <p><span className="text-text-dim">&gt;</span> wake_up()</p>
                    <p className="text-text-secondary">Initializing Portfolio...</p>
                    <p className="text-text-secondary">Identity Found.</p>
                    <p>
                      <span className="text-text-dim">Status:</span>{" "}
                      <span className="text-accent-cyan font-bold neon-glow">ONLINE</span>
                    </p>
                  </div>

                  <div>
                    <div className="font-mono text-xs md:text-sm text-text-secondary flex items-center gap-2 select-none">
                      <span className="text-accent-green">➜</span>
                      <span className="text-accent-violet">~</span>
                      <span>whoami</span>
                    </div>
                    
                    {/* Interactive typing display */}
                    <div className="font-mono text-xs md:text-sm text-text-primary mt-1 min-h-[1.5rem] flex items-center">
                      <span>{typedText}</span>
                      <span className="w-1.5 h-4 bg-accent-cyan ml-1 animate-ping" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h1 className="font-mono font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none bg-gradient-to-r from-text-primary via-accent-cyan to-accent-violet bg-clip-text text-transparent">
                      Albin Johnson
                    </h1>
                    <p className="font-mono text-sm md:text-base text-accent-cyan font-semibold flex flex-wrap gap-1.5 items-center">
                      Full-Stack Developer
                      <span className="text-text-dim">/</span>
                      Fresh Graduate
                      <span className="text-text-dim">/</span>
                      Eager to build &amp; learn fast
                    </p>
                  </div>

                  <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-[580px]">
                    I'm a <strong className="text-text-primary font-semibold">Computer Science graduate</strong> who builds <strong className="text-text-primary font-semibold">web applications end-to-end</strong> — from modular data models and robust APIs to responsive interfaces people actually enjoy using. No production job yet, but I've got a strong foundation, practical projects, and a passion for learning.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <MagneticButton>
                      <button
                        onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                        className="btn bg-accent-cyan text-[#001a06] font-mono text-xs font-bold px-5 py-3 rounded-lg flex items-center gap-2 hover:translate-y-[-2px] hover:shadow-[0_8px_20px_-6px_rgba(0,255,65,0.6)] transition-all cursor-pointer"
                      >
                        [ACCESS_PROJECTS] <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </MagneticButton>
                    <MagneticButton>
                      <a
                        href="/Albin_Johnson_Resume.pdf"
                        download
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Simulated PDF Resume download for Albin Johnson. (Ensure PDF asset exists in static builds)");
                        }}
                        className="btn border border-border text-text-primary font-mono text-xs font-bold px-5 py-3 rounded-lg flex items-center gap-2 hover:border-accent-cyan hover:text-accent-cyan hover:translate-y-[-2px] transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> [DOWNLOAD_RESUME]
                      </a>
                    </MagneticButton>
                  </div>

                  <p className="font-mono text-[11px] text-text-dim select-none">
                    Press ENTER to continue<span className="blink-cursor" aria-hidden="true" />
                  </p>
                </div>
              </Reveal>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                {[
                  { label: "Graduate", value: "2025" },
                  { label: "Projects Built", value: "5+" },
                  { label: "Certifications", value: "3+" },
                  { label: "Internships", value: "2" }
                ].map((stat, idx) => (
                  <Reveal key={idx} y={16} delay={0.15 + idx * 0.08} className="p-2 border-r border-border/40 last:border-0">
                    <div className="font-mono text-2xl font-bold text-text-primary">
                      <DecryptedText
                        text={stat.value}
                        animateOn="view"
                        speed={45}
                        maxIterations={10}
                        revealDirection="start"
                        className="text-text-primary"
                        encryptedClassName="text-text-dim"
                      />
                    </div>
                    <div className="text-[10px] md:text-xs text-text-dim uppercase tracking-wider font-semibold">
                      <DecryptedText
                        text={stat.label}
                        animateOn="view"
                        speed={45}
                        maxIterations={10}
                        revealDirection="start"
                        className="text-text-dim"
                        encryptedClassName="text-text-dim/50"
                      />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Hero Right Interactive 3D Orbit Node */}
            <Reveal x={30} y={0} delay={0.25} duration={0.8} className="lg:col-span-5 hidden lg:block h-[400px] w-full relative">
              <div className="absolute inset-0 z-0 bg-radial-gradient from-accent-cyan/10 to-transparent blur-2xl" />
              <FloatingCore theme={theme} />
            </Reveal>

          </div>
        </section>

        {/* ============ ABOUT SECTION ============ */}
        <section id="about" className="py-20 border-t border-border/30">
          <div className="space-y-12">
            <Reveal className="space-y-2">
              <div className="font-mono text-xs text-accent-pink tracking-wider flex items-center gap-2">
                <span className="text-text-dim">//</span> 01 — ABOUT
              </div>
              <h2 className="font-mono text-2xl md:text-3xl font-bold text-text-primary">
                <DecryptedText
                  text="A little context"
                  animateOn="view"
                  speed={40}
                  maxIterations={12}
                  sequential
                  revealDirection="start"
                  className="text-text-primary"
                  encryptedClassName="text-text-dim"
                />
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="win bg-bg-panel border border-border rounded-xl shadow-xl overflow-hidden hover:border-accent-cyan transition-all-300">
              <div className="bg-bg-panel-alt px-4 py-2.5 border-b border-border flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-red mr-1.5" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent-amber mr-1.5" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent-green mr-1.5" />
                <span className="font-mono text-[11px] text-text-dim ml-2">about.js</span>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visual Comment Code Block */}
                <div className="lg:col-span-7 font-mono text-xs md:text-sm text-text-secondary leading-relaxed space-y-1 select-text">
                  <p className="text-text-dim">/**</p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">Hi, I'm <strong className="text-accent-amber font-semibold">Albin</strong> — a recent Computer Science</span>
                  </p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">graduate who taught myself to build full web</span>
                  </p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">apps by shipping <em className="text-accent-cyan not-italic font-medium">real projects</em>, not just</span>
                  </p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">coursework. I care about writing clean code,</span>
                  </p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">understanding things from first principles, and</span>
                  </p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">interfaces that stay out of the user's way.</span>
                  </p>
                  <p className="pl-4 text-text-dim">*</p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">I don't have a full-time job yet — what I do have</span>
                  </p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">is a solid grasp of the fundamentals, a habit of</span>
                  </p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">finishing what I start, and real hunger to grow</span>
                  </p>
                  <p className="pl-4 text-text-dim">
                    * <span className="text-text-secondary">fast on a team that'll teach me.</span>
                  </p>
                  <p className="text-text-dim"> */</p>
                </div>

                {/* Structured Metadata List */}
                <div className="lg:col-span-5 bg-bg-panel-alt/50 border border-border/60 rounded-lg p-5">
                  <h3 className="font-mono text-xs font-bold text-accent-cyan uppercase tracking-wider mb-4 pb-2 border-b border-border/40 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" /> profile_manifest
                  </h3>
                  <ul className="space-y-3.5 font-mono text-xs">
                    <li className="flex justify-between items-baseline gap-4 pb-2.5 border-b border-border-soft/60">
                      <span className="text-text-dim">status:</span>
                      <span className="text-text-primary text-right font-medium">Fresher — open to opportunities</span>
                    </li>
                    <li className="flex justify-between items-baseline gap-4 pb-2.5 border-b border-border-soft/60">
                      <span className="text-text-dim">focus:</span>
                      <span className="text-text-primary text-right font-medium">Web apps · APIs · Learning fast</span>
                    </li>
                    <li className="flex justify-between items-baseline gap-4 pb-2.5 border-b border-border-soft/60">
                      <span className="text-text-dim">stack:</span>
                      <span className="text-text-primary text-right font-medium">JavaScript, React, Node.js, Express, Flutter, AWS</span>
                    </li>
                    <li className="flex justify-between items-baseline gap-4 pb-2.5 border-b border-border-soft/60">
                      <span className="text-text-dim">available_for:</span>
                      <span className="text-text-primary text-right font-medium">Entry-level Full-time</span>
                    </li>
                    <li className="flex justify-between items-baseline gap-4">
                      <span className="text-text-dim">location:</span>
                      <span className="text-text-primary text-right font-medium">Kerala, India</span>
                    </li>
                  </ul>
                </div>

              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ SKILLS SECTION ============ */}
        <section id="skills" ref={skillsSectionRef} className="py-20 border-t border-border/30">
          <div className="space-y-12">
            <Reveal className="space-y-2">
              <div className="font-mono text-xs text-accent-pink tracking-wider flex items-center gap-2">
                <span className="text-text-dim">//</span> 02 — SKILLS
              </div>
              <h2 className="font-mono text-2xl md:text-3xl font-bold text-text-primary">
                <DecryptedText
                  text="Tools of the trade"
                  animateOn="view"
                  speed={40}
                  maxIterations={12}
                  sequential
                  revealDirection="start"
                  className="text-text-primary"
                  encryptedClassName="text-text-dim"
                />
              </h2>
            </Reveal>

            {/* Import layout block */}
            <Reveal delay={0.08} className="font-mono text-xs md:text-sm text-text-secondary">
              <span className="text-accent-violet">import</span> <span className="text-text-primary">{"{ Frontend, Backend, Tooling }"}</span> <span className="text-accent-violet">from</span> <span className="text-accent-green">'./stack'</span><span className="text-text-dim">;</span>
            </Reveal>

            {/* Skill categories columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SKILL_CATEGORIES.map((cat, idx) => (
                <Reveal
                  key={idx}
                  delay={idx * 0.1}
                  className="bg-bg-panel border border-border hover:border-accent-cyan rounded-xl p-6 transition-all duration-300 shadow-lg hover:translate-y-[-4px] flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <h3 className="font-mono text-sm font-bold text-accent-cyan flex items-center gap-2 border-b border-border/50 pb-3">
                      <span className="text-text-dim">▸</span> {cat.title}
                    </h3>

                    <div className="space-y-4">
                      {cat.items.map((skill, sIdx) => {
                        const STATUS_WORDS = ["LOADED", "LOADED", "LOADED", "LOADED", "LOADED"];
                        const statusWord = STATUS_WORDS[(idx * 3 + sIdx) % STATUS_WORDS.length];
                        return (
                          <div key={sIdx} className="space-y-2">
                            <div className="flex justify-between font-mono text-xs text-text-secondary">
                              <span>{skill.name}</span>
                              <span
                                className={`font-bold tracking-wider transition-colors duration-500 ${
                                  skillProgressActive ? "text-accent-cyan neon-glow" : "text-text-dim"
                                }`}
                              >
                                {skillProgressActive ? statusWord : "LOADING..."}
                                <span className="text-text-dim font-medium ml-2">{skill.percentage}%</span>
                              </span>
                            </div>

                            {/* Animated progress bar tracks */}
                            <div className="h-1.5 w-full bg-bg-panel-alt border border-border-soft rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-accent-cyan to-accent-violet rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: skillProgressActive ? `${skill.percentage}%` : "0%"
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PROJECTS SECTION ============ */}
        <section id="projects" className="py-20 border-t border-border/30">
          <div className="space-y-10">
            <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="font-mono text-xs text-accent-pink tracking-wider flex items-center gap-2">
                  <span className="text-text-dim">//</span> 03 — PROJECTS
                </div>
                <h2 className="font-mono text-2xl md:text-3xl font-bold text-text-primary">
                  <DecryptedText
                    text="Selected work"
                    animateOn="view"
                    speed={40}
                    maxIterations={12}
                    sequential
                    revealDirection="start"
                    className="text-text-primary"
                    encryptedClassName="text-text-dim"
                  />
                </h2>
              </div>

              {/* Tag filtering buttons */}
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px] md:text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedTags(new Set())}
                  aria-pressed={selectedTags.size === 0}
                  className={`px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                    selectedTags.size === 0
                      ? "bg-accent-cyan text-slate-950 border-accent-cyan font-bold shadow-[0_4px_12px_rgba(0,255,65,0.3)]"
                      : "bg-bg-panel border-border text-text-secondary hover:text-text-primary hover:border-gray-500"
                  }`}
                >
                                  </button>
                {allTags.map((tag, tIdx) => (
                  <button
                    type="button"
                    key={tIdx}
                    onClick={() => toggleTag(tag)}
                    aria-pressed={selectedTags.has(tag)}
                    className={`px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                      selectedTags.has(tag)
                        ? "bg-accent-cyan text-slate-950 border-accent-cyan font-bold shadow-[0_4px_12px_rgba(0,255,65,0.3)]"
                        : "bg-bg-panel border-border text-text-secondary hover:text-text-primary hover:border-gray-500"
                    }`}
                  >
                    {tag.toUpperCase()}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Projects list */}
            <div className="space-y-5">
              {filteredProjects.length === 0 && (
                <div className="text-center py-12 font-mono text-sm text-text-secondary border border-dashed border-border rounded-xl">
                  No projects match the selected filters.
                </div>
              )}
              {filteredProjects.map((proj, pIdx) => (
                <Reveal
                  key={proj.id}
                  delay={Math.min(pIdx, 5) * 0.08}
                  className="corner-brackets bg-bg-panel border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:border-accent-cyan/60 hover:shadow-lg group"
                >
                  {/* Left slide stripe indicator */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-accent-cyan to-accent-pink transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                  <div className="flex gap-4 items-start flex-grow">
                    <div className="font-mono text-xs md:text-sm text-text-dim pt-1 font-semibold select-none">
                      {proj.num}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="font-mono text-[9px] text-accent-cyan/70 tracking-widest select-none">
                        ACCESSING SYSTEM RECORD...
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-[10px] text-text-dim">Project Name:</span>
                        <h3 className="font-mono text-base md:text-lg font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                          {proj.title}
                        </h3>
                        <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          proj.status === "live"
                            ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
                            : "bg-accent-amber/10 border-accent-amber/30 text-accent-amber"
                        }`}>
                          STATUS: {proj.status}
                        </span>
                      </div>

                      <p className="text-text-secondary text-xs md:text-sm leading-relaxed max-w-[640px]">
                        {proj.description}
                      </p>

                      <div className="font-mono text-[10px] text-text-dim">Technologies:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.tags.map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            onClick={() => toggleTag(tag)}
                            className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              selectedTags.has(tag)
                                ? "bg-accent-cyan/25 border-accent-cyan text-text-primary"
                                : "bg-accent-cyan/5 border-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan/15"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Links columns */}
                  <div className="flex md:flex-col gap-3 md:gap-2 items-end self-end md:self-center font-mono text-xs text-text-secondary w-full md:w-auto border-t border-border/40 md:border-0 pt-3 md:pt-0">
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-accent-cyan flex items-center gap-1 transition-colors hover:underline"
                      >
                        live <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {proj.notesUrl && (
                      <a
                        href={proj.notesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-accent-cyan flex items-center gap-1 transition-colors hover:underline"
                      >
                        notes <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {proj.sourceUrl && (
                      <a
                        href={proj.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-accent-cyan flex items-center gap-1 transition-colors hover:underline"
                      >
                        source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ EXPERIENCE / EDUCATION SECTION ============ */}
        <section id="experience" className="py-20 border-t border-border/30">
          <div className="space-y-12">
            <Reveal className="space-y-2">
              <div className="font-mono text-xs text-accent-pink tracking-wider flex items-center gap-2">
                <span className="text-text-dim">//</span> 04 — EXPERIENCE
              </div>
              <h2 className="font-mono text-2xl md:text-3xl font-bold text-text-primary">
                <DecryptedText
                  text={'git log --author="albin"'}
                  animateOn="view"
                  speed={40}
                  maxIterations={12}
                  sequential
                  revealDirection="start"
                  className="text-text-primary"
                  encryptedClassName="text-text-dim"
                />
              </h2>
            </Reveal>

            {/* Timeline commit tree */}
            <div className="relative pl-6 md:pl-8 border-l border-border space-y-12">
              {EXPERIENCES.map((exp, eIdx) => (
                <Reveal key={exp.id} x={-16} y={8} delay={Math.min(eIdx, 5) * 0.1} className="relative group">
                  
                  {/* Neon timeline node circle */}
                  <span className="absolute -left-[31px] md:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-bg border-2 border-accent-cyan group-hover:bg-accent-cyan shadow-[0_0_8px_rgba(0,255,65,0.8)] transition-all duration-300" />
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/30 select-text">
                        [{(exp.date.match(/\d{4}/g) ?? ["----"])[0]}]
                      </span>
                      <span className="font-mono text-xs font-bold text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded border border-accent-amber/30 select-text">
                        {exp.hash}
                      </span>
                      <span className="font-mono text-xs text-text-dim font-medium">
                        {exp.date}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-mono text-base md:text-lg font-extrabold text-text-primary group-hover:text-accent-cyan transition-colors">
                        {exp.title}
                      </h3>
                      <p className="font-mono text-xs text-accent-cyan font-semibold">
                        {exp.org}
                      </p>
                    </div>

                    <p className="text-text-secondary text-xs md:text-sm leading-relaxed max-w-[680px]">
                      <span className="text-accent-green font-mono mr-1.5 font-bold">+</span>
                      {exp.description}
                    </p>

                    <p className="font-mono text-[10px] font-bold tracking-widest text-accent-green">
                      {(() => {
                        const years = exp.date.match(/\d{4}/g);
                        const endYear = years ? parseInt(years[years.length - 1], 10) : 0;
                        return endYear > 2026 ? "STATUS: IN_PROGRESS" : "STATUS: COMPLETED ✔";
                      })()}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CONTACT SECTION ============ */}
        <section id="contact" className="py-20 border-t border-border/30">
          <div className="space-y-12">
            <Reveal className="win bg-bg-panel border border-border rounded-xl shadow-2xl overflow-hidden hover:border-accent-cyan transition-all-300">
              <div className="bg-bg-panel-alt px-4 py-2.5 border-b border-border flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-red mr-1.5" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent-amber mr-1.5" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent-green mr-1.5" />
                <span className="font-mono text-[11px] text-text-dim ml-2">contact.sh</span>
              </div>

              <div className="p-6 md:p-10 space-y-8">
                <div className="space-y-3">
                  <p className="font-mono text-xs text-accent-green select-none">
                    <span className="text-text-dim">➜</span> connect --user albin
                  </p>
                  <h2 className="font-mono text-3xl md:text-4xl font-extrabold text-text-primary">
                    Let's talk opportunities.
                  </h2>
                  <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-[560px]">
                    Actively looking for my first role or internship as a developer. If you're hiring — or just want to chat about code — I'd love to hear from you.
                  </p>
                </div>

                {/* Contact Rows / Badges */}
                <div className="space-y-1.5 font-mono text-xs md:text-sm">
                  {[
                    { flag: "--email", val: "albinjohnson913@gmail.com", url: "mailto:albinjohnson913@gmail.com", copyable: true },
                    { flag: "--github", val: "github.com/albin12-eh", url: "https://github.com/albin12-eh", copyable: false },
                    { flag: "--linkedin", val: "linkedin.com/in/albinjohnson", url: "https://www.linkedin.com/in/albin-johnson-886809307/", copyable: false }
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg-panel-alt transition-all-300 group/row border border-transparent hover:border-border-soft"
                    >
                      <span className="text-accent-violet w-24 flex-shrink-0">{row.flag}</span>
                      
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-text-primary group-hover/row:text-accent-cyan transition-colors truncate hover:underline"
                      >
                        {row.val}
                      </a>

                      <div className="ml-auto flex items-center gap-2">
                        {row.copyable && (
                          <button
                            onClick={() => copyToClipboard(row.val, "email")}
                            className="p-1.5 rounded bg-bg border border-border text-text-dim hover:text-accent-cyan hover:border-accent-cyan/40 transition-all cursor-pointer relative"
                            title="Copy email to clipboard"
                          >
                            {copiedText === "email" ? (
                              <Check className="w-3.5 h-3.5 text-accent-green animate-scale" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-bg border border-border text-text-dim hover:text-accent-cyan hover:border-accent-cyan/40 transition-all opacity-0 group-hover/row:opacity-100 focus:opacity-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated CLI Terminal Message Sender */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    <MagneticButton>
                      <a
                        href="https://mail.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="btn bg-accent-cyan text-slate-950 font-mono text-xs font-bold px-6 py-3.5 rounded-lg flex items-center gap-2.5 hover:translate-y-[-2px] hover:shadow-[0_8px_20px_-6px_rgba(0,255,65,0.6)] transition-all"
                      >
                        [EXECUTE_EMAIL] <Mail className="w-4 h-4" />
                      </a>
                    </MagneticButton>
                  </div>

                  <p className="font-mono text-[11px] text-accent-green select-none">
                    ✔ Connection Established.
                  </p>

                  {/* CLI Modal Drawer inline with the section */}
                  {cliOpen && (
                    <div className="mt-4 border border-accent-cyan/40 rounded-lg overflow-hidden bg-slate-950 shadow-2xl animate-fadeIn">
                      <div className="bg-slate-900 px-4 py-2 border-b border-accent-cyan/20 flex items-center justify-between">
                        <span className="font-mono text-xs text-accent-cyan flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 animate-pulse" /> interactive_sender.sh
                        </span>
                        <button 
                          onClick={resetCli}
                          className="text-text-dim hover:text-accent-red font-bold text-xs font-mono px-1.5 py-0.5 cursor-pointer"
                        >
                          [ESC] Exit
                        </button>
                      </div>
                      
                      <div className="p-4 font-mono text-xs md:text-sm space-y-2 max-h-[220px] overflow-y-auto">
                        {cliHistory.map((line, lIdx) => (
                          <div key={lIdx} className={line.startsWith(">") ? "text-accent-amber" : line.startsWith("✔") ? "text-accent-green font-bold" : "text-gray-300"}>
                            {line}
                          </div>
                        ))}
                        
                        {cliStep > 0 && cliStep < 4 && (
                          <form onSubmit={handleCliSubmit} className="flex items-center gap-1.5 pt-1.5">
                            <span className="text-accent-green">➜</span>
                            <input
                              ref={terminalInputRef}
                              type={cliStep === 2 ? "email" : "text"}
                              value={cliInput}
                              onChange={(e) => setCliInput(e.target.value)}
                              placeholder="Type here and press Enter..."
                              className="flex-grow bg-transparent border-0 outline-none text-text-primary p-0 ring-0 focus:ring-0 font-mono text-xs md:text-sm"
                              required
                              autoFocus
                            />
                            <button type="submit" className="text-accent-cyan hover:text-white p-1">
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        )}

                        {cliStep === 4 && (
                          <div className="flex items-center gap-2 text-accent-cyan animate-pulse py-1">
                            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
                            <span>Sending data payload over HTTPS protocol...</span>
                          </div>
                        )}

                        {cliStep === 5 && (
                          <button 
                            onClick={resetCli}
                            className="text-xs text-accent-cyan hover:underline mt-2 font-bold block"
                          >
                            Exit CLI Mode
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </Reveal>
          </div>
        </section>

        {/* Hidden binary message — decodes to "Follow the White Rabbit".
            Intentionally near-invisible; present for anyone who inspects
            the page or highlights the footer. Purely an easter egg. */}
      

      </main>

  
    </div>
  );
}
