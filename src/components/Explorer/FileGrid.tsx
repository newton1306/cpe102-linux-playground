import React from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Eye,
  File,
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
      return <Folder className="w-9 h-9 text-[#f59e0b] fill-[#fef3c7] stroke-[#b45309]" />;
    }
    if (item.name.startsWith('.')) {
      return <Eye className="w-9 h-9 text-[#d97706] animate-pulse" />;
    }
    if (item.name.endsWith('.py')) {
      return <FileCode className="w-9 h-9 text-[#0284c7] fill-[#f0f9ff]" />;
    }
    if (item.name.endsWith('.html') || item.name.endsWith('.css')) {
      return <FileCode className="w-9 h-9 text-[#0284c7] fill-[#f0f9ff]" />;
    }
    return <FileText className="w-9 h-9 text-[#78716c] fill-[#fbfaf8]" />;
  };

  const getSmallItemIcon = (item: VNode) => {
    if (item.type === 'dir') {
      return <Folder className="w-4 h-4 text-[#f59e0b] fill-[#fef3c7] stroke-[#b45309] shrink-0" />;
    }
    if (item.name.startsWith('.')) {
      return <Eye className="w-4 h-4 text-[#d97706] shrink-0" />;
    }
    if (item.name.endsWith('.py')) {
      return <FileCode className="w-4 h-4 text-[#0284c7] shrink-0" />;
    }
    if (item.name.endsWith('.html') || item.name.endsWith('.css')) {
      return <FileCode className="w-4 h-4 text-[#0284c7] shrink-0" />;
    }
    return <File className="w-4 h-4 text-[#78716c] shrink-0" />;
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
      return 'anim-ghost-reveal border-[#d97706] ring-2 ring-[#f59e0b]/50 bg-[#fef3c7]';
    }

    // Newly created file/folder
    if (isTarget && (lastAction.type === 'touch' || lastAction.type === 'mkdir')) {
      return 'anim-pop border-[#d97706] ring-2 ring-[#f59e0b]/50 bg-[#fef9c3]';
    }

    // Read file via cat
    if (isTarget && lastAction.type === 'cat') {
      return 'border-[#c2782b] ring-2 ring-[#c2782b]/40 bg-[#fdf5eb]';
    }

    return '';
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center font-mono text-[#82715e] bg-[#fcfaf7]">
        <Folder className="w-12 h-12 text-[#cbb9a3] mb-2 stroke-1" />
        <p className="text-sm font-medium">This folder is empty</p>
        <p className="text-xs text-[#9c8974] mt-1">
          Use <code className="text-[#b45309] font-bold">touch &lt;filename&gt;</code> to create a file!
        </p>
      </div>
    );
  }

  // Large Icons / Grid View
  if (viewMode === 'grid') {
    return (
      <div className="flex-1 p-4 overflow-y-auto select-none bg-[#fcfaf7]">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3.5">
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
                    ? 'border-[#bfae96] bg-[#eae0d2] text-[#1c1208] shadow-sm ring-1 ring-[#bfae96]'
                    : isHidden
                    ? 'border-dashed border-[#d8c8b4] bg-[#fbf8f2] text-[#5c4a38] hover:border-[#cbbaa5] hover:bg-[#f5efe6]'
                    : 'border-[#e2d8cb] bg-white text-[#2c1d0e] hover:border-[#cbbaa5] hover:bg-[#f5efe6] shadow-xs'
                } ${animClass}`}
              >
                {/* Hidden File Status Badge */}
                {isHidden && (
                  <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[9px] bg-[#fbf2e6] text-[#b45309] px-1.5 py-0.2 rounded border border-[#e8d5be]">
                    <Eye className="w-2.5 h-2.5" />
                    <span>hidden</span>
                  </span>
                )}

                {/* Icon */}
                <div className="my-2 transition-transform group-hover:scale-105">
                  {getItemIcon(item)}
                </div>

                {/* Name: Full filename + extension clearly visible without ellipsis */}
                <span
                  className="w-full text-xs font-medium px-1 text-center break-all leading-snug min-h-[2.5rem] flex items-center justify-center select-text"
                  title={isHidden ? '[ Hidden Item ]' : item.name}
                >
                  {isHidden ? (
                    <span className="text-[#b45309] font-semibold italic tracking-wide">[ Hidden Item ]</span>
                  ) : (
                    <span className="text-[#2c1d0e]">{item.name}</span>
                  )}
                </span>

                {/* Subtitle / Type */}
                <span className="text-[10px] text-[#8c7965] mt-1 truncate">
                  {isHidden ? 'Hidden File' : item.type === 'dir' ? 'Folder' : formatSize(item.size)}
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
    <div className="flex-1 overflow-y-auto select-none font-mono text-xs bg-[#fcfaf7]">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 bg-[#f0ebe1] border-b border-[#dfd5c7] text-[11px] text-[#7d6b58] uppercase tracking-wider">
          <tr>
            <th className="py-2.5 px-3 font-semibold">Name</th>
            <th className="py-2.5 px-3 font-semibold hidden sm:table-cell">Type</th>
            <th className="py-2.5 px-3 font-semibold">Size</th>
            <th className="py-2.5 px-3 font-semibold hidden md:table-cell">Permissions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eee6db]">
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
                    ? 'bg-[#eae0d2] text-[#1c1208] font-semibold'
                    : isHidden
                    ? 'bg-[#fcf9f2] text-[#7c634a] hover:bg-[#f5efe6]'
                    : 'text-[#3d2f21] hover:bg-[#f6f0e6]'
                } ${animClass}`}
              >
                <td className="py-2.5 px-3 flex items-center gap-2 max-w-[280px]">
                  {getSmallItemIcon(item)}
                  {isHidden ? (
                    <span className="text-[#b45309] font-semibold italic tracking-wide">[ Hidden Item ]</span>
                  ) : (
                    <span className="break-all font-medium select-text">{item.name}</span>
                  )}
                  {isHidden && (
                    <span className="text-[9px] bg-[#fbf2e6] text-[#b45309] px-1 py-0.2 rounded border border-[#e8d5be]">
                      hidden
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-[#7d6b58] hidden sm:table-cell">
                  {isHidden ? 'Hidden File' : item.type === 'dir' ? 'File Folder' : 'Document'}
                </td>
                <td className="py-2.5 px-3 text-[#7d6b58]">
                  {isHidden ? '—' : item.type === 'dir' ? '—' : formatSize(item.size)}
                </td>
                <td className="py-2.5 px-3 text-[#8c7965] hidden md:table-cell font-mono">
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
