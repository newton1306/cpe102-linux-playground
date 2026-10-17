export type NodeType = 'file' | 'dir';

export interface VNode {
  id: string;
  name: string;
  type: NodeType;
  content: string; // File text content or empty
  children: Record<string, VNode>; // Keyed by file/folder name
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  permissions: string; // e.g. "drwxr-xr-x" or "-rw-r--r--"
  size: number; // in bytes
  isExecutable?: boolean;
  isEncrypted?: boolean;
  cipherPayload?: string;
  vaultKeyHash?: string;
}

export interface VFSActionEffect {
  type: 'touch' | 'mkdir' | 'rm' | 'cp' | 'mv' | 'cd' | 'cat' | 'ls-a' | 'error' | 'reset' | 'none';
  targetPath?: string;
  targetName?: string;
  timestamp: number;
}

export interface VFSState {
  root: VNode;
  cwd: string; // Current Working Directory, e.g. "/home/student"
  lastAction: VFSActionEffect;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  actionEffect?: VFSActionEffect;
}

export interface TerminalEntry {
  id: string;
  command: string;
  cwd: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  timestamp: number;
}
