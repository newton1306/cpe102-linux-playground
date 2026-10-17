/**
 * Security & Anti-Cheat Protection Engine
 * Prevents DevTools inspection, right-clicking, shortcut tampering, and scraping.
 */

export function initAntiCheat() {
  if (typeof window === 'undefined') return;

  // 1. Prevent Right-Click Context Menu globally
  window.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      return false;
    },
    { capture: true }
  );

  // 2. Prevent DevTools & Source Inspection Keyboard Shortcuts
  window.addEventListener(
    'keydown',
    (e) => {
      // F12: Developer Tools
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
      // Ctrl+Shift+K (Firefox Web Console)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+Option+U (View Page Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    { capture: true }
  );

  // 3. Prevent Drag & Drop tampering
  window.addEventListener('dragstart', (e) => e.preventDefault(), { capture: true });
  window.addEventListener('drop', (e) => e.preventDefault(), { capture: true });

  // 4. Suppress console methods in production to prevent inspecting internal state
  try {
    const noop = () => {};
    // Keep error logging clean
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    console.dir = noop;
    console.table = noop;
  } catch (_e) {
    // Ignore if console is frozen
  }

  // 5. Lightweight timing-based DevTools detection
  let devToolsOpen = false;
  const threshold = 160;

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        try {
          console.clear();
        } catch (_e) {}
      }
    } else {
      devToolsOpen = false;
    }
  };

  window.addEventListener('resize', checkDevTools);
  setInterval(checkDevTools, 2000);
}
