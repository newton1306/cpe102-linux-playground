import React from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Key,
  Eye,
  File,
  Sparkles,
} from 'lucide-react';
import type { VFSActionEffect, VNode } from '../../types/vfs';

interface FileGridProps {
  currentDir: VNode | null;
  cwd: string;
  onNavigate: (path: string) => void;
  onSelectFile: (file: VNode | null) => void;
  selectedNode: VNode | null;
  lastAction: VFSActionEffect;
  viewMode: 'grid' | 'details';
}

export const FileGrid: React.FC<FileGridProps> = ({
  currentDir,
  cwd,
  onNavigate,
  onSelectFile,
  selectedNode,
  lastAction,
  viewMode,
}) => {

  if (!currentDir || currentDir.type !== 'dir') {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-sm text-slate-500">
        Directory not found
      </div>
    );
  }

  const items = Object.values(currentDir.children || {}).sort((a, b) => {
    // Directories first, then files
    if (a.type !== b.type) {
      return a.type === 'dir' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  const getItemIcon = (item: VNode) => {
    if (item.type === 'dir') {
      return <Folder className="w-8 h-8 text-cyan-400 fill-cyan-950/40" />;
    }
    if (item.name === '.secret_flag') {
      return <Key className="w-8 h-8 text-amber-400 animate-bounce" />;
    }
    if (item.name.endsWith('.py')) {
      return <FileCode className="w-8 h-8 text-emerald-400" />;
    }
    if (item.name.endsWith('.html') || item.name.endsWith('.css')) {
      return <FileCode className="w-8 h-8 text-blue-400" />;
    }
    if (item.name.startsWith('.')) {
      return <Eye className="w-8 h-8 text-slate-400" />;
    }
    return <FileText className="w-8 h-8 text-slate-300" />;
  };

  const getSmallItemIcon = (item: VNode) => {
    if (item.type === 'dir') {
      return <Folder className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
    if (item.name === '.secret_flag') {
      return <Key className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (item.name.endsWith('.py')) {
      return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (item.name.endsWith('.html') || item.name.endsWith('.css')) {
      return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    }
    return <File className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleItemClick = (item: VNode) => {
    onSelectFile(item);
  };

  const handleItemDoubleClick = (item: VNode) => {
    if (item.type === 'dir') {
      const nextPath = cwd === '/' ? `/${item.name}` : `${cwd}/${item.name}`;
      onNavigate(nextPath);
    }
  };

  // Determine item animation classes
  const getItemAnimClass = (item: VNode) => {
    const isTarget =
      lastAction.targetName === item.name ||
      lastAction.targetPath?.endsWith(`/${item.name}`);

    // Hidden file revealed by ls -a
    if (item.name.startsWith('.') && lastAction.type === 'ls-a') {
      return 'anim-ghost-reveal border-emerald-400 glow-green';
    }

    // Newly created file/folder
    if (isTarget && (lastAction.type === 'touch' || lastAction.type === 'mkdir')) {
      return 'anim-pop border-emerald-400 glow-green';
    }

    // Read file via cat
    if (isTarget && lastAction.type === 'cat') {
      return 'border-cyan-400 glow-cyan ring-1 ring-cyan-400';
    }

    return '';
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center font-mono text-slate-500">
        <Folder className="w-12 h-12 text-slate-700 mb-2 stroke-1" />
        <p className="text-sm">This folder is empty</p>
        <p className="text-xs text-slate-600 mt-1">
          Use <code className="text-emerald-400 font-bold">touch &lt;filename&gt;</code> to create a file!
        </p>
      </div>
    );
  }

  // Large Icons / Grid View
  if (viewMode === 'grid') {
    return (
      <div className="flex-1 p-4 overflow-y-auto select-none">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => {
            const isHidden = item.name.startsWith('.');
            const isSelected = selectedNode?.id === item.id;
            const animClass = getItemAnimClass(item);

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer font-mono ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-md glow-green-sm'
                    : isHidden
                    ? 'border-dashed border-slate-700 bg-slate-900/30 text-slate-400 opacity-60 hover:opacity-100 hover:border-slate-500'
                    : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60'
                } ${animClass}`}
              >
                {/* Hidden File Badge */}
                {isHidden && (
                  <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[9px] bg-slate-800/80 text-slate-400 px-1 rounded border border-slate-700/60">
                    <Eye className="w-2.5 h-2.5" />
                    <span>hidden</span>
                  </span>
                )}

                {/* Secret Easter Egg Indicator */}
                {item.name === '.secret_flag' && (
                  <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 text-[9px] bg-amber-950/80 text-amber-300 px-1 rounded border border-amber-500/40 glow-amber">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    <span>secret</span>
                  </span>
                )}

                {/* Icon */}
                <div className="my-2 transition-transform group-hover:scale-105">
                  {getItemIcon(item)}
                </div>

                {/* Name */}
                <span className="w-full truncate text-xs font-medium px-1">
                  {item.name}
                </span>

                {/* Subtitle / Type */}
                <span className="text-[10px] text-slate-500 mt-1 truncate">
                  {item.type === 'dir' ? 'Folder' : formatSize(item.size)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Details View (Windows File Explorer Table Mode)
  return (
    <div className="flex-1 overflow-y-auto select-none font-mono text-xs">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="py-2 px-3 font-semibold">Name</th>
            <th className="py-2 px-3 font-semibold hidden sm:table-cell">Type</th>
            <th className="py-2 px-3 font-semibold">Size</th>
            <th className="py-2 px-3 font-semibold hidden md:table-cell">Permissions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-850">
          {items.map((item) => {
            const isHidden = item.name.startsWith('.');
            const isSelected = selectedNode?.id === item.id;
            const animClass = getItemAnimClass(item);

            return (
              <tr
                key={item.id}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                className={`transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/50 text-emerald-300 font-semibold'
                    : isHidden
                    ? 'opacity-60 hover:opacity-100 hover:bg-slate-900/80 text-slate-400'
                    : 'text-slate-300 hover:bg-slate-900/80'
                } ${animClass}`}
              >
                <td className="py-2 px-3 flex items-center gap-2">
                  {getSmallItemIcon(item)}
                  <span className="truncate">{item.name}</span>
                  {isHidden && (
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded border border-slate-700">
                      hidden
                    </span>
                  )}
                  {item.name === '.secret_flag' && (
                    <span className="text-[9px] bg-amber-950 text-amber-300 px-1 py-0.2 rounded border border-amber-500/50">
                      ★ secret
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-500 hidden sm:table-cell">
                  {item.type === 'dir' ? 'File Folder' : 'Document'}
                </td>
                <td className="py-2 px-3 text-slate-500">
                  {item.type === 'dir' ? '—' : formatSize(item.size)}
                </td>
                <td className="py-2 px-3 text-slate-600 hidden md:table-cell font-mono">
                  {item.permissions}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
