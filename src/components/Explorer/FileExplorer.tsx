import React, { useState } from 'react';
import type { VFSActionEffect, VNode } from '../../types/vfs';
import { getNodeByPath } from '../../vfs/vfsEngine';
import { AddressBar } from './AddressBar';
import { SidebarTree } from './SidebarTree';
import { FileGrid } from './FileGrid';
import { StatusBar } from './StatusBar';

interface FileExplorerProps {
  root: VNode;
  terminalCwd: string;
  explorerCwd: string;
  lastAction: VFSActionEffect;
  onNavigateExplorer: (path: string) => void;
  selectedNode: VNode | null;
  onSelectNode: (node: VNode | null) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  root,
  terminalCwd,
  explorerCwd,
  lastAction,
  onNavigateExplorer,
  selectedNode,
  onSelectNode,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'details'>('grid');
  const currentDir = getNodeByPath(root, explorerCwd) || getNodeByPath(root, terminalCwd);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 overflow-hidden border-r border-slate-800">
      {/* Top Address & Navigation Bar (Views explorerCwd) */}
      <AddressBar
        cwd={explorerCwd}
        onNavigate={onNavigateExplorer}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Center: Sidebar + Main File Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <SidebarTree
          root={root}
          terminalCwd={terminalCwd}
          explorerCwd={explorerCwd}
          onNavigate={onNavigateExplorer}
        />

        {/* Main Folder Items Canvas */}
        <FileGrid
          currentDir={currentDir}
          cwd={explorerCwd}
          onNavigate={onNavigateExplorer}
          onSelectFile={onSelectNode}
          selectedNode={selectedNode}
          lastAction={lastAction}
          viewMode={viewMode}
        />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar currentDir={currentDir} selectedNode={selectedNode} cwd={terminalCwd} />
    </div>
  );
};
