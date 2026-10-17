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
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever entries update
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  // Keep input focused when clicking anywhere inside the terminal
  const handleContainerClick = () => {
    inputRef.current?.focus();
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
      setInputVal(entries[nextIdx].command);
      return;
    }

    // Down Arrow: Next command in history
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;

      if (historyIndex < entries.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(entries[nextIdx].command);
      } else {
        setHistoryIndex(null);
        setInputVal('');
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
        setInputVal(matches[0] + ' ');
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
      setInputVal(parts.join(' ') + suffix);
    }
  };

  const promptPath = formatPromptPath(state.cwd);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="flex-1 flex flex-col h-full bg-[#05080f] font-mono text-xs overflow-hidden select-text relative scanlines"
    >
      {/* Terminal Title Bar */}
      <div className="h-8 border-b border-slate-800 bg-slate-950 px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold text-slate-300">
            student@cpe102: {promptPath} (bash)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
      </div>

      {/* Terminal Console Output Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {/* Welcome Banner */}
        <div className="text-slate-400 pb-2 border-b border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm text-glow-green">
            <span>⚡ CPE102 Interactive Linux Terminal</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
              Ubuntu 24.04 LTS
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            ยินดีต้อนรับเข้าสู่ช่วง <span className="text-emerald-400 font-semibold">Let's Try!</span> พิมพ์คำสั่งไปพร้อมกับอาจารย์ได้เลย!
          </p>
          <p className="text-slate-500 text-[11px]">
            พิมพ์ <code className="text-cyan-400 font-semibold">help</code> เพื่อดูโพยคำสั่ง | กด <code className="text-cyan-400">Tab</code> เพื่อเติมคำอัตโนมัติ
          </p>
        </div>

        {/* History Entries */}
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-1">
            {/* Prompt Line */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-emerald-400 font-bold">student@cpe102</span>
              <span className="text-slate-500">:</span>
              <span className="text-blue-400 font-bold">{formatPromptPath(entry.cwd)}</span>
              <span className="text-slate-400 font-bold">$</span>
              <span className="text-slate-100 ml-1">{entry.command}</span>
            </div>

            {/* Command Output */}
            {entry.stdout && (
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed pl-2 font-mono text-[11.5px]">
                {entry.stdout}
              </pre>
            )}

            {/* Command Error */}
            {entry.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap leading-relaxed pl-2 font-mono text-[11.5px]">
                {entry.stderr}
              </pre>
            )}
          </div>
        ))}

        {/* Active Command Line Input */}
        <div className="flex items-center gap-1 flex-wrap pt-1">
          <span className="text-emerald-400 font-bold">student@cpe102</span>
          <span className="text-slate-500">:</span>
          <span className="text-blue-400 font-bold">{promptPath}</span>
          <span className="text-slate-400 font-bold">$</span>
          <div className="flex-1 min-w-[200px] flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono text-xs px-1 caret-emerald-400"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
