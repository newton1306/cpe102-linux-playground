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
    <div className="flex flex-col border-b border-[#dfd5c7] bg-[#f5efe6] font-mono text-xs select-none">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-1 text-[#6b5845]">
          <button
            onClick={() => onNavigate(canGoUp ? parentPath : '/')}
            disabled={!canGoUp}
            className={`p-1.5 rounded transition-all ${
              canGoUp
                ? 'hover:bg-[#e6dcce] text-[#3d2f21] hover:text-[#1f150b] cursor-pointer active:scale-95'
                : 'text-[#baa794] cursor-not-allowed opacity-50'
            }`}
            title="Up to Parent Directory (cd ..)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate(cwd)}
            className="p-1.5 rounded hover:bg-[#e6dcce] text-[#6b5845] hover:text-[#1f150b] transition-all cursor-pointer"
            title="Refresh View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Windows Explorer Style Address Bar */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto rounded border border-[#d6c7b2] bg-white px-2.5 py-1 text-[#2c1d0e] shadow-xs">
          <HardDrive className="w-3.5 h-3.5 text-[#b45309] shrink-0" />
          <div className="flex items-center gap-1 flex-wrap">
            {breadcrumbList.map((crumb, idx) => {
              const isLast = idx === breadcrumbList.length - 1;
              return (
                <React.Fragment key={crumb.fullPath}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-[#9c8974] shrink-0" />}
                  <button
                    onClick={() => onNavigate(crumb.fullPath)}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      isLast
                        ? 'bg-[#eadecc] text-[#2c1d0e] font-semibold border border-[#cdbfae]'
                        : 'text-[#5c4a38] hover:text-[#1f150b] hover:bg-[#f2ece2]'
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
        <div className="flex items-center border border-[#d6c7b2] rounded bg-[#ebe2d5] p-0.5">
          <button
            onClick={() => onToggleViewMode('grid')}
            className={`p-1 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-[#8c5b24] shadow-xs font-semibold'
                : 'text-[#82715e] hover:text-[#2c1d0e]'
            }`}
            title="Large Icons View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleViewMode('details')}
            className={`p-1 rounded transition-colors ${
              viewMode === 'details'
                ? 'bg-white text-[#8c5b24] shadow-xs font-semibold'
                : 'text-[#82715e] hover:text-[#2c1d0e]'
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
