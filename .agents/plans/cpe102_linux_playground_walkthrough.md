# Let's Try! Linux Command Playground - Walkthrough & Verification Guide

## 1. Project Overview
- **Course**: CPE102 Engineering Exploration (Operating System Module)
- **Activity**: "Let's Try! Linux Command Playground" (Interactive In-Class Hands-on Session)
- **Target Audience**: ~50 First-year Computer Engineering Students
- **Golden Rule**: Strictly NO use of the word "LAB" or "แล็บ" anywhere in UI, code, or documentation.

---

## 2. Changes in Revision 6

### 1) Terminal Smooth Scrolling & Grabbable Scrollbar
- **Root Cause Fixed**: The previous wrapper element had a `.scanlines` CSS class with `pointer-events: none;`, which inadvertently blocked all mouse wheel and pointer events on the terminal container.
- **Fixes Applied**:
  - Removed `pointer-events: none` from container; converted scanlines into a non-intrusive background overlay (`opacity-60 z-0`).
  - Added dedicated custom scrollbar `.terminal-scroll` with a distinct, easily grabbable thumb.
  - Added keyboard scrolling (`PageUp` / `PageDown`) in terminal handler.
  - User can now freely scroll up and down using mouse wheel, trackpad, scrollbar drag, and PageUp/PageDown keys.

### 2) Animation Effects Harmonized with Light Brown Theme (Zero Black Artifacts)
- **Root Cause Fixed**: The previous `@keyframes ghostReveal` had a `100% { background-color: rgba(15, 23, 42, 0.6) }` keyframe, which turned revealed hidden files into dark slate/black rectangles.
- **Fixes Applied**:
  - Re-engineered `@keyframes popIn` to use a warm amber bounce and settle on clean white.
  - Re-engineered `@keyframes ghostReveal` to use a golden amber glow and settle on the soft cream `#fbf8f2` hidden card background (0% black).
  - Re-engineered `@keyframes glitchDissolve` to use a soft reddish-amber shrink and fade.
  - Re-engineered all file card rings and borders in `FileGrid.tsx` with warm amber and sky-blue accents.

### 3) Anti-Cheat & Anti-Inspect Security Engine
- **Protection Features Implemented**:
  - **Context Menu Prevention**: Right-click is globally disabled across the entire application (`contextmenu` listener with capture).
  - **DevTools Shortcut Blocking**: Intercepts and blocks `F12`, `Ctrl+Shift+I` / `Cmd+Opt+I`, `Ctrl+Shift+J` / `Cmd+Opt+J`, `Ctrl+Shift+C` / `Cmd+Opt+C`, `Ctrl+U` (View Source), and `Ctrl+S`.
  - **Anti-Scraping & Anti-AI Code Leak**:
    - Obfuscated `.secret_1` and `.secret_2` filenames and banners using runtime Base64 decoding (`_d('LnNlY3JldF8x')` / `_d('LnNlY3JldF8y')`).
    - Verified that neither `.secret_1`, `.secret_2`, nor Rick Roll exist in plaintext in the compiled bundle (`indexOf === -1`).
    - Added `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">` and `<meta name="googlebot" ...>`.
  - **Console Suppression & Tamper Deterrence**:
    - Disabled `console.log`, `console.info`, `console.debug`, `console.dir`, `console.table`.
    - Added periodic window dimension checking to clear the console if DevTools is forcibly docked.

---

## 3. Verification & Test Results
- **Automated Verification**:
  - `npm test`: Zero occurrences of "LAB" or "แล็บ" (verified via `scripts/verify.mjs`).
  - All 12/12 VFS unit tests pass.
  - `npm run build`: Production bundle cleanly created via Vite & TypeScript in `< 500ms`.
  - Static search verification: `.secret_1` and `.secret_2` indices are `-1` in production JS bundle.
