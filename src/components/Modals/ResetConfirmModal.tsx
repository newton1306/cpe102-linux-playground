import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-lg border border-red-500/40 bg-slate-950 p-6 shadow-2xl shadow-red-950/50 glow-red">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-red-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2 text-red-400 font-mono text-sm font-semibold tracking-wider">
            <AlertTriangle className="w-5 h-5 animate-pulse text-red-400" />
            <span>CONFIRM SESSION RESET</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 font-mono text-sm text-slate-300">
          <p className="leading-relaxed">
            Are you sure you want to reset your <span className="text-emerald-400 font-bold">Playground</span> back to default?
          </p>
          <div className="rounded border border-red-900/50 bg-red-950/20 p-3 text-xs text-red-300 space-y-1">
            <p className="font-semibold text-red-400">⚠️ What will happen:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>All files and folders you created will be wiped</li>
              <li>Initial default files and structure will be restored</li>
              <li>Working directory will return to home (<code className="text-emerald-400">~ /home/student</code>)</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded border border-red-500 bg-red-600/90 text-white font-semibold hover:bg-red-500 shadow-lg shadow-red-950/60 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yes, Reset Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
