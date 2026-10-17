import React from 'react';
import type { VNode } from '../../types/vfs';
import { formatPromptPath } from '../../vfs/pathUtils';

interface StatusBarProps {
  currentDir: VNode | null;
  selectedNode: VNode | null;
  cwd: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ currentDir, selectedNode, cwd }) => {
  const children = currentDir?.type === 'dir' ? Object.values(currentDir.children || {}) : [];
  const totalCount = children.length;
  const hiddenCount = children.filter((c) => c.name.startsWith('.')).length;

  return (
    <footer className="h-7 border-t border-slate-800 bg-slate-950 px-3 flex items-center justify-between font-mono text-[11px] text-slate-500 select-none">
      {/* Left: Item Count */}
      <div className="flex items-center gap-3">
        <span>
          {totalCount} item{totalCount === 1 ? '' : 's'}
          {hiddenCount > 0 && ` (${hiddenCount} hidden)`}
        </span>
        {selectedNode && (
          <span className="text-emerald-400 font-medium">
            | Selected: {selectedNode.name.startsWith('.') ? '[ Hidden Item ]' : selectedNode.name}
            {selectedNode.type === 'file' ? ` (${selectedNode.size} B)` : ' [DIR]'}
          </span>
        )}
      </div>

      {/* Right: Terminal CWD */}
      <div className="flex items-center gap-1.5 text-slate-400">
        <span className="text-slate-600">Terminal CWD:</span>
        <code className="text-emerald-400 font-semibold">{formatPromptPath(cwd)}</code>
      </div>
    </footer>
  );
};
