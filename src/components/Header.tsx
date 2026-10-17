import React from 'react';
import { Terminal, RefreshCw, Cpu } from 'lucide-react';

interface HeaderProps {
  onOpenReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReset }) => {
  return (
    <header className="h-12 w-full border-b border-emerald-900/40 bg-slate-950/90 px-4 flex items-center justify-between font-mono text-xs select-none backdrop-blur-xs">
      {/* Title & Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
          <Terminal className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <span className="font-bold text-slate-100 tracking-wider">
            CPE102
          </span>
          <span className="text-slate-600 mx-1.5">|</span>
          <span className="text-emerald-400 font-semibold tracking-wide text-glow-green">
            LET'S TRY! LINUX COMMAND PLAYGROUND
          </span>
        </div>
      </div>

      {/* Right controls: Local sandbox status & Single Action Button */}
      <div className="flex items-center gap-4">
        {/* Sandbox Status */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>SANDBOX ISOLATED</span>
          </span>
        </div>

        {/* The ONLY action button */}
        <button
          onClick={onOpenReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-amber-500/50 bg-amber-950/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-200 transition-all font-mono font-medium shadow-xs shadow-amber-950/30 cursor-pointer active:scale-95"
          title="Reset your session back to default files"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>
    </header>
  );
};
