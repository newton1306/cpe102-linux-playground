import React, { useState } from 'react';
import type { VFSActionEffect, VNode } from '../../types/vfs';
import { getNodeByPath } from '../../vfs/vfsEngine';
import { AddressBar } from './AddressBar';
import { SidebarTree } from './SidebarTree';
import { FileGrid } from './FileGrid';
import { StatusBar } from './StatusBar';

interface FileExplorerProps {
  root: VNode;
  cwd: string;
  lastAction: VFSActionEffect;
  onNavigate: (path: string) => void;
  selectedNode: VNode | null;
  onSelectNode: (node: VNode | null) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  root,
  cwd,
  lastAction,
  onNavigate,
  selectedNode,
  onSelectNode,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'details'>('grid');
  const currentDir = getNodeByPath(root, cwd);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 overflow-hidden border-r border-slate-800">
      {/* Top Address & Navigation Bar */}
      <AddressBar
        cwd={cwd}
        onNavigate={onNavigate}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Center: Sidebar + Main File Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <SidebarTree root={root} cwd={cwd} onNavigate={onNavigate} />

        {/* Main Folder Items Canvas */}
        <FileGrid
          currentDir={currentDir}
          cwd={cwd}
          onNavigate={onNavigate}
          onSelectFile={onSelectNode}
          selectedNode={selectedNode}
          lastAction={lastAction}
          viewMode={viewMode}
        />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar currentDir={currentDir} selectedNode={selectedNode} cwd={cwd} />
    </div>
  );
};
