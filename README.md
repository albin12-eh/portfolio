<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1445cfd5-8be8-4c5d-a82f-04d4e1b17f60

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

> **Note:** `node_modules` isn't included in this package to keep the download small —
> run `npm install` first.

## What's new

A round of polish aimed at making the site more memorable and "product-like":

- **Custom cursor** — a small ring + dot that trails the mouse and expands over links/buttons (`src/components/CustomCursor.tsx`). Auto-disabled on touch devices and when the OS has "reduce motion" turned on.
- **Cursor-follow spotlight** — every terminal-style `.win` panel now has a soft glow that tracks the mouse across its surface (`src/components/SpotlightEffect.tsx`).
- **Magnetic buttons** — the main CTAs ("./view-work", "download-resume.pdf", "Send email") pull gently toward the cursor as it approaches (`src/components/MagneticButton.tsx`).
- **Command palette (⌘K / Ctrl+K)** — a searchable quick-nav overlay: jump to any section, copy the email, toggle the theme, open GitHub/LinkedIn, or launch the interactive contact terminal (`src/components/CommandPalette.tsx`). There's also a clickable "⌘K" hint in the header.
- **Konami code easter egg** — try ↑ ↑ ↓ ↓ ← → ← → B A for a small "dev mode unlocked" celebration (`src/components/KonamiEasterEgg.tsx`).
- **`prefers-reduced-motion` support** — all of the above (plus existing animations) respect the visitor's OS-level reduced-motion setting.
- **Favicon + Open Graph image** — link previews on LinkedIn/Twitter/Slack now show a proper icon, title, description, and share image (`public/favicon.svg`, `public/og-image.svg`).

Ideas not yet implemented that would be worth a follow-up pass: project case-study modals, live GitHub stats, and a "now building" status widget.
