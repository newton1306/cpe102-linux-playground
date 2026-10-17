import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  Home,
  ChevronRight,
  ChevronDown,
  HardDrive,
  Pin,
  Terminal,
  Gamepad2,
  Globe,
} from 'lucide-react';
import type { VNode } from '../../types/vfs';

interface SidebarTreeProps {
  root: VNode;
  cwd: string;
  onNavigate: (path: string) => void;
}

export const SidebarTree: React.FC<SidebarTreeProps> = ({ root, cwd, onNavigate }) => {
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({
    '/': true,
    '/home': true,
    '/home/student': true,
  });

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Quick Access items
  const quickAccessItems = [
    { name: 'Home (~)', path: '/home/student', icon: Home },
    { name: 'cpe102', path: '/home/student/cpe102', icon: Terminal },
    { name: 'playground', path: '/home/student/playground', icon: Gamepad2 },
    { name: 'projects', path: '/home/student/projects', icon: Globe },
    { name: 'Root (/)', path: '/', icon: HardDrive },
  ];

  // Recursive tree renderer for directory nodes
  const renderDirNode = (node: VNode, currentPath: string, depth = 0) => {
    const isCwd = cwd === currentPath;
    const isExpanded = expandedPaths[currentPath] ?? (depth <= 2);

    // Get subdirectories
    const subDirs = Object.values(node.children || {}).filter((child) => child.type === 'dir');
    const hasSubDirs = subDirs.length > 0;

    return (
      <div key={currentPath} className="flex flex-col">
        <div
          onClick={() => onNavigate(currentPath)}
          className={`group flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-all ${
            isCwd
              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-xs shadow-emerald-950 glow-green-sm font-semibold'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
          }`}
          style={{ paddingLeft: `${Math.max(6, depth * 14)}px` }}
        >
          {/* Chevron */}
          {hasSubDirs ? (
            <button
              onClick={(e) => toggleExpand(currentPath, e)}
              className="p-0.5 text-slate-500 hover:text-emerald-400"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-3.5 inline-block" />
          )}

          {/* Folder Icon */}
          {isExpanded ? (
            <FolderOpen
              className={`w-3.5 h-3.5 shrink-0 ${
                isCwd ? 'text-emerald-400' : 'text-cyan-400'
              }`}
            />
          ) : (
            <Folder
              className={`w-3.5 h-3.5 shrink-0 ${
                isCwd ? 'text-emerald-400' : 'text-cyan-400/80'
              }`}
            />
          )}

          {/* Folder Name */}
          <span className="truncate text-xs">
            {node.name || '/'}
          </span>

          {/* CWD Pin Highlight */}
          {isCwd && (
            <span className="ml-auto flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40 font-mono tracking-wider animate-pulse shrink-0">
              <Pin className="w-2.5 h-2.5" />
              <span>CWD</span>
            </span>
          )}
        </div>

        {/* Subdirectories */}
        {hasSubDirs && isExpanded && (
          <div className="flex flex-col">
            {subDirs.map((child) => {
              const childPath = currentPath === '/' ? `/${child.name}` : `${currentPath}/${child.name}`;
              return renderDirNode(child, childPath, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-48 sm:w-56 shrink-0 border-r border-slate-800 bg-slate-950/90 flex flex-col font-mono text-xs overflow-y-auto select-none p-2 space-y-4">
      {/* Quick Access Section */}
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-2 mb-1 flex items-center gap-1">
          <Pin className="w-2.5 h-2.5" />
          <span>Quick Access</span>
        </div>
        <div className="space-y-0.5">
          {quickAccessItems.map((item) => {
            const isCwd = cwd === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all cursor-pointer text-left ${
                  isCwd
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 glow-green-sm font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isCwd ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {isCwd && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Tree Section */}
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-2 mb-1 flex items-center gap-1">
          <HardDrive className="w-2.5 h-2.5" />
          <span>File System Tree</span>
        </div>
        <div className="space-y-0.5">{renderDirNode(root, '/', 0)}</div>
      </div>
    </aside>
  );
};
