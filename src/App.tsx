import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { SplitLayout } from './components/SplitLayout';
import { FileExplorer } from './components/Explorer/FileExplorer';
import { Terminal } from './components/Terminal/Terminal';
import { ResetConfirmModal } from './components/Modals/ResetConfirmModal';
import type { TerminalEntry, VNode } from './types/vfs';
import {
  loadVFSState,
  persistVFSState,
  resetVFSState,
  STORAGE_KEY_HISTORY,
} from './vfs/vfsEngine';
import { executeCommand } from './vfs/commandExecutor';

export function App() {
  const [vfsState, setVfsState] = useState(() => loadVFSState());
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    return [];
  });
  const [selectedNode, setSelectedNode] = useState<VNode | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(terminalEntries));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, [terminalEntries]);

  // Trigger celebration confetti when secret Easter egg is found
  const handleSecretFound = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff66', '#00f0ff', '#f59e0b', '#ec4899'],
    });
  }, []);

  // Execute command from terminal
  const handleExecuteCommand = useCallback(
    (commandLine: string) => {
      if (commandLine === 'clear') {
        setTerminalEntries([]);
        return;
      }

      const { result, nextState } = executeCommand({
        state: vfsState,
        commandLine,
        onSecretFound: handleSecretFound,
      });

      if (result.stdout === '__CLEAR__') {
        setTerminalEntries([]);
        return;
      }

      const newEntry: TerminalEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        command: commandLine,
        cwd: vfsState.cwd,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        timestamp: Date.now(),
      };

      setTerminalEntries((prev) => [...prev, newEntry]);
      setVfsState(nextState);
    },
    [vfsState, handleSecretFound]
  );

  // Navigate folder directly from Explorer
  const handleNavigateFromExplorer = useCallback(
    (targetPath: string) => {
      const nextState = {
        ...vfsState,
        cwd: targetPath,
        lastAction: {
          type: 'cd' as const,
          targetPath,
          timestamp: Date.now(),
        },
      };
      setVfsState(nextState);
      persistVFSState(nextState);
    },
    [vfsState]
  );

  // Reset entire session
  const handleConfirmReset = useCallback(() => {
    const newState = resetVFSState();
    setVfsState(newState);
    setTerminalEntries([]);
    setSelectedNode(null);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-slate-100 overflow-hidden">
      {/* Top Header with title and Reset Session button */}
      <Header onOpenReset={() => setIsResetModalOpen(true)} />

      {/* 50:50 Split Screen: Windows File Explorer (Left) & Ubuntu Terminal (Right) */}
      <SplitLayout
        leftPane={
          <FileExplorer
            root={vfsState.root}
            cwd={vfsState.cwd}
            lastAction={vfsState.lastAction}
            onNavigate={handleNavigateFromExplorer}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />
        }
        rightPane={
          <Terminal
            state={vfsState}
            onExecute={handleExecuteCommand}
            entries={terminalEntries}
            onClear={() => setTerminalEntries([])}
          />
        }
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}

export default App;
