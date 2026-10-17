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
    <footer className="h-7 border-t border-[#dfd5c7] bg-[#eee7dd] px-3 flex items-center justify-between font-mono text-[11px] text-[#6b5845] select-none">
      {/* Left: Item Count */}
      <div className="flex items-center gap-3">
        <span>
          {totalCount} item{totalCount === 1 ? '' : 's'}
          {hiddenCount > 0 && ` (${hiddenCount} hidden)`}
        </span>
        {selectedNode && (
          <span className="text-[#8c5b24] font-medium">
            | Selected: {selectedNode.name.startsWith('.') ? '[ Hidden Item ]' : selectedNode.name}
            {selectedNode.type === 'file' ? ` (${selectedNode.size} B)` : ' [DIR]'}
          </span>
        )}
      </div>

      {/* Right: Terminal CWD */}
      <div className="flex items-center gap-1.5 text-[#7d6b58]">
        <span>Terminal CWD:</span>
        <code className="bg-[#dfd3c2] text-[#2c1d0e] px-1.5 py-0.5 rounded border border-[#cbbaa5] font-semibold">
          {formatPromptPath(cwd)}
        </code>
      </div>
    </footer>
  );
};
