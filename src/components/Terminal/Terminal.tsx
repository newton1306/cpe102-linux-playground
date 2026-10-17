import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import type { TerminalEntry, VFSState } from '../../types/vfs';
import { formatPromptPath } from '../../vfs/pathUtils';
import { getNodeByPath } from '../../vfs/vfsEngine';

interface TerminalProps {
  state: VFSState;
  onExecute: (cmdLine: string) => void;
  entries: TerminalEntry[];
  onClear: () => void;
}

const AVAILABLE_COMMANDS = ['pwd', 'ls', 'cd', 'cat', 'touch', 'mkdir', 'cp', 'mv', 'rm', 'clear', 'help'];

export const Terminal: React.FC<TerminalProps> = ({
  state,
  onExecute,
  entries,
  onClear,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [caretPos, setCaretPos] = useState(0);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const prevEntriesCountRef = useRef(entries.length);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Global keydown listener so user can start typing anytime without manual focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if modifier keys (except Ctrl+L which is handled)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // If activeElement is another text input/textarea outside terminal, don't intercept
      if (
        document.activeElement &&
        document.activeElement !== inputRef.current &&
        (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      // If terminal input is not currently focused, focus it and forward the key!
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus({ preventScroll: true });

        // Forward single character typing
        if (e.key.length === 1) {
          e.preventDefault();
          setInputVal((prev) => {
            const next = prev + e.key;
            setCaretPos(next.length);
            return next;
          });
          return;
        }

        // Forward Backspace
        if (e.key === 'Backspace') {
          e.preventDefault();
          setInputVal((prev) => {
            const next = prev.slice(0, -1);
            setCaretPos(next.length);
            return next;
          });
          return;
        }

        // Forward Enter
        if (e.key === 'Enter') {
          e.preventDefault();
          const cmd = inputVal.trim();
          setHistoryIndex(null);
          setInputVal('');
          setCaretPos(0);
          onExecute(cmd);
          return;
        }

        // Forward Tab
        if (e.key === 'Tab') {
          e.preventDefault();
          handleTabCompletion();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [inputVal, onExecute]);

  // Only auto-scroll to bottom when NEW commands are entered, allowing free manual scrolling anytime
  useEffect(() => {
    if (entries.length > prevEntriesCountRef.current) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevEntriesCountRef.current = entries.length;
  }, [entries.length]);

  // Keep input focused when clicking inside terminal without disrupting scroll position
  const handleContainerClick = (_e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      // Check if selection was made inside the terminal output
      if (!scrollAreaRef.current?.contains(selection.anchorNode)) {
        // Selection is from outside (e.g. explorer file click), clear it and focus
        selection.removeAllRanges();
      } else {
        return;
      }
    }

    inputRef.current?.focus({ preventScroll: true });
  };

  const updateCaret = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    setCaretPos(target.selectionStart ?? target.value.length);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    setCaretPos(e.target.selectionStart ?? e.target.value.length);
  };

  // Keyboard navigation & Shortcuts (Up/Down history, Tab completion, Ctrl+L)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+L to clear screen
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      onClear();
      return;
    }

    // Up Arrow: Previous command in history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (entries.length === 0) return;

      const nextIdx =
        historyIndex === null
          ? entries.length - 1
          : Math.max(0, historyIndex - 1);

      setHistoryIndex(nextIdx);
      const cmd = entries[nextIdx].command;
      setInputVal(cmd);
      setCaretPos(cmd.length);
      return;
    }

    // Down Arrow: Next command in history
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;

      if (historyIndex < entries.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        const cmd = entries[nextIdx].command;
        setInputVal(cmd);
        setCaretPos(cmd.length);
      } else {
        setHistoryIndex(null);
        setInputVal('');
        setCaretPos(0);
      }
      return;
    }

    // Tab key: Auto-completion
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
      return;
    }

    // Enter key: Submit command
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = inputVal.trim();
      setHistoryIndex(null);
      setInputVal('');
      setCaretPos(0);
      onExecute(cmd);
    }
  };

  // Tab completion helper
  const handleTabCompletion = () => {
    const raw = inputVal;
    if (!raw.trim()) return;

    const parts = raw.split(/\s+/);

    // If typing the command name
    if (parts.length === 1) {
      const prefix = parts[0].toLowerCase();
      const matches = AVAILABLE_COMMANDS.filter((cmd) => cmd.startsWith(prefix));
      if (matches.length === 1) {
        const completed = matches[0] + ' ';
        setInputVal(completed);
        setCaretPos(completed.length);
      }
      return;
    }

    // If typing argument (file or folder name in CWD)
    const currentDir = getNodeByPath(state.root, state.cwd);
    if (!currentDir || currentDir.type !== 'dir') return;

    const lastArg = parts[parts.length - 1];
    const availableItems = Object.keys(currentDir.children || {});
    const matches = availableItems.filter((item) => item.startsWith(lastArg));

    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      const child = currentDir.children[matches[0]];
      const suffix = child?.type === 'dir' ? '/' : ' ';
      const completed = parts.join(' ') + suffix;
      setInputVal(completed);
      setCaretPos(completed.length);
    }
  };

  const currentPromptPath = formatPromptPath(state.cwd);

  // Dedicated renderer for stdout: detect QR codes and render them in high-contrast scannable cards
  const renderStdout = (stdout: string) => {
    if (!stdout.includes('█▀▀▀▀▀█')) {
      return (
        <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed pl-2 font-mono text-[11.5px]">
          {stdout}
        </pre>
      );
    }

    // Separate text message and QR block
    const lines = stdout.split('\n');
    const preQrLines: string[] = [];
    const qrLines: string[] = [];
    const postQrLines: string[] = [];
    let qrStarted = false;
    let qrEnded = false;

    for (const line of lines) {
      if (line.includes('█▀▀▀▀▀█')) {
        qrStarted = true;
      }

      if (qrStarted && !qrEnded) {
        if (line.includes('█') || line.includes('▀') || line.includes('▄') || line.trim() === '') {
          qrLines.push(line);
        } else {
          qrEnded = true;
          postQrLines.push(line);
        }
      } else if (!qrStarted) {
        preQrLines.push(line);
      } else {
        postQrLines.push(line);
      }
    }

    return (
      <div className="pl-2 space-y-1">
        {preQrLines.length > 0 && (
          <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono text-[11.5px]">
            {preQrLines.join('\n')}
          </pre>
        )}

        {/* High-contrast crisp white QR card with seamless line-height: 1.0 */}
        {qrLines.length > 0 && (
          <div className="inline-block bg-white text-black p-3.5 rounded-lg shadow-2xl border border-slate-300 my-1">
            <pre
              className="font-mono text-black font-bold select-all tracking-normal"
              style={{
                lineHeight: '1.02',
                letterSpacing: '0px',
                fontSize: '13px',
                margin: 0,
              }}
            >
              {qrLines.join('\n')}
            </pre>
          </div>
        )}

        {postQrLines.length > 0 && (
          <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono text-[11.5px]">
            {postQrLines.join('\n')}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={handleContainerClick}
      className="flex-1 flex flex-col h-full bg-[#05080f] font-mono text-xs overflow-hidden select-text relative scanlines"
    >
      {/* Terminal Title Bar */}
      <div className="h-8 border-b border-slate-800 bg-slate-950 px-3 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold text-slate-300">
            student@cpe102: {currentPromptPath} (bash)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
      </div>

      {/* Terminal Console Output Scroll Area (smooth free scrolling) */}
      <div
        ref={scrollAreaRef}
        className="flex-1 p-3 overflow-y-auto space-y-3 overscroll-contain"
      >
        {/* Welcome Banner */}
        <div className="text-slate-400 pb-2 border-b border-slate-800/80 space-y-1 select-none">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm text-glow-green">
            <span>⚡ CPE102 Interactive Linux Terminal</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
              Ubuntu 24.04 LTS
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Welcome to the <span className="text-emerald-400 font-semibold">Let's Try!</span> session. Follow along and type commands with your instructor!
          </p>
          <p className="text-slate-500 text-[11px]">
            Type <code className="text-cyan-400 font-semibold">help</code> for the command reference sheet | Press <code className="text-cyan-400">Tab</code> to auto-complete
          </p>
        </div>

        {/* History Entries */}
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-1">
            {/* Prompt Line */}
            <div className="flex items-center flex-wrap font-mono text-xs">
              <span className="text-emerald-400 font-bold">student@cpe102</span>
              <span className="text-slate-500">:</span>
              <span className="text-blue-400 font-bold">{formatPromptPath(entry.cwd)}</span>
              <span className="text-slate-400 font-bold mr-1.5">$</span>
              <span className="text-slate-100">{entry.command}</span>
            </div>

            {/* Command Output */}
            {entry.stdout && renderStdout(entry.stdout)}

            {/* Command Error */}
            {entry.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap leading-relaxed pl-2 font-mono text-[11.5px]">
                {entry.stderr}
              </pre>
            )}
          </div>
        ))}

        {/* Active Command Line Input with Continuous Blinking Block Cursor */}
        <div
          className="flex items-center flex-wrap pt-1 font-mono text-xs cursor-text w-full"
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          <span className="text-emerald-400 font-bold shrink-0">student@cpe102</span>
          <span className="text-slate-500 shrink-0">:</span>
          <span className="text-blue-400 font-bold shrink-0">{currentPromptPath}</span>
          <span className="text-slate-400 font-bold mr-1.5 shrink-0">$</span>

          <div
            className="flex-1 min-w-[200px] relative flex items-center cursor-text"
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onSelect={updateCaret}
              onKeyUp={updateCaret}
              onClick={updateCaret}
              onFocus={(e) => {
                const len = e.currentTarget.value.length;
                const pos = caretPos <= len ? caretPos : len;
                e.currentTarget.setSelectionRange(pos, pos);
              }}
              className="absolute inset-0 opacity-0 w-full cursor-text z-10 caret-transparent font-mono text-xs"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            {/* Text before cursor */}
            <span className="text-emerald-300 whitespace-pre select-text">
              {inputVal.slice(0, caretPos)}
            </span>
            {/* Single continuous blinking block cursor right at insertion point */}
            <span className="inline-block w-2 h-3.5 bg-emerald-400 animate-pulse glow-green-sm select-none" />
            {/* Text after cursor */}
            <span className="text-emerald-300 whitespace-pre select-text">
              {inputVal.slice(caretPos)}
            </span>
          </div>
        </div>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
