import React from 'react';
import { ArrowUp, RefreshCw, HardDrive, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { getPathSegments, splitParentAndName } from '../../vfs/pathUtils';

interface AddressBarProps {
  cwd: string;
  onNavigate: (path: string) => void;
  viewMode: 'grid' | 'details';
  onToggleViewMode: (mode: 'grid' | 'details') => void;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  cwd,
  onNavigate,
  viewMode,
  onToggleViewMode,
}) => {
  const segments = getPathSegments(cwd);
  const { parentPath } = splitParentAndName(cwd);
  const canGoUp = cwd !== '/';

  // Construct clickable breadcrumbs
  const breadcrumbList: Array<{ name: string; fullPath: string }> = [
    { name: 'CPE-OS (/)', fullPath: '/' },
  ];

  let accumulated = '';
  for (const seg of segments) {
    accumulated += '/' + seg;
    breadcrumbList.push({ name: seg, fullPath: accumulated });
  }

  return (
    <div className="flex flex-col border-b border-slate-800 bg-slate-900/90 font-mono text-xs select-none">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => onNavigate(canGoUp ? parentPath : '/')}
            disabled={!canGoUp}
            className={`p-1.5 rounded transition-all ${
              canGoUp
                ? 'hover:bg-slate-800 text-slate-200 hover:text-emerald-400 cursor-pointer active:scale-95'
                : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Up to Parent Directory (cd ..)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate(cwd)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
            title="Refresh View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Windows Explorer Style Address Bar */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto rounded border border-slate-800 bg-slate-950 px-2.5 py-1 text-slate-300 shadow-inner">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="flex items-center gap-1 flex-wrap">
            {breadcrumbList.map((crumb, idx) => {
              const isLast = idx === breadcrumbList.length - 1;
              return (
                <React.Fragment key={crumb.fullPath}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
                  <button
                    onClick={() => onNavigate(crumb.fullPath)}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      isLast
                        ? 'bg-emerald-950/60 text-emerald-400 font-semibold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-slate-800 rounded bg-slate-950 p-0.5">
          <button
            onClick={() => onToggleViewMode('grid')}
            className={`p-1 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Large Icons View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleViewMode('details')}
            className={`p-1 rounded transition-colors ${
              viewMode === 'details'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Details View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
