import React from 'react';

interface SplitLayoutProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({ leftPane, rightPane }) => {
  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-[calc(100vh-3rem)] overflow-hidden">
      {/* Left Pane (50%): Visual Windows File Explorer */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col overflow-hidden relative">
        {leftPane}
      </div>

      {/* Center Divider cleanly separating Windows File Explorer and Ubuntu Terminal */}
      <div className="hidden md:block w-[1px] bg-[#dfd5c7]" />

      {/* Right Pane (50%): Interactive Web Terminal */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col overflow-hidden relative">
        {rightPane}
      </div>
    </div>
  );
};
