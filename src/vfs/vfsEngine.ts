import type { VNode, VFSState } from '../types/vfs';
import { createInitialVFS } from './initialTree';
import { getPathSegments, splitParentAndName, HOME_DIR } from './pathUtils';

export const STORAGE_KEY_VFS = 'cpe102_vfs_state_v2';
export const STORAGE_KEY_CWD = 'cpe102_vfs_cwd_v2';
export const STORAGE_KEY_HISTORY = 'cpe102_vfs_history_v2';

/**
 * Deep clone a VNode tree
 */
export function cloneVNode(node: VNode, newParentId: string | null = node.parentId): VNode {
  const newNode: VNode = {
    ...node,
    id: `node_${Math.random().toString(36).substring(2, 9)}`,
    parentId: newParentId,
    children: {},
  };

  if (node.type === 'dir' && node.children) {
    for (const [childName, childNode] of Object.entries(node.children)) {
      newNode.children[childName] = cloneVNode(childNode, newNode.id);
    }
  }

  return newNode;
}

/**
 * Traverses the VNode tree to find the node at a normalized path
 */
export function getNodeByPath(root: VNode, normalizedPath: string): VNode | null {
  const segments = getPathSegments(normalizedPath);
  let current: VNode = root;

  for (const seg of segments) {
    if (current.type !== 'dir' || !current.children[seg]) {
      return null;
    }
    current = current.children[seg];
  }

  return current;
}

/**
 * Gets the parent directory node and the base name for a given normalized path
 */
export function getParentAndName(root: VNode, normalizedPath: string): { parent: VNode; name: string } | null {
  const { parentPath, name } = splitParentAndName(normalizedPath);
  const parent = getNodeByPath(root, parentPath);
  if (!parent || parent.type !== 'dir') {
    return null;
  }
  return { parent, name };
}

/**
 * Creates a file node at the specified path
 */
export function addFile(
  root: VNode,
  normalizedPath: string,
  content: string = ''
): { success: boolean; error?: string } {
  const target = getNodeByPath(root, normalizedPath);
  const now = Date.now();

  // If already exists, update timestamp
  if (target) {
    if (target.type === 'file') {
      target.updatedAt = now;
      if (content) {
        target.content = content;
        target.size = new Blob([content]).size;
      }
      return { success: true };
    } else {
      return { success: false, error: 'Is a directory' };
    }
  }

  const parentInfo = getParentAndName(root, normalizedPath);
  if (!parentInfo) {
    return { success: false, error: 'No such file or directory' };
  }

  const { parent, name } = parentInfo;
  parent.children[name] = {
    id: `file_${name}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    type: 'file',
    content,
    children: {},
    parentId: parent.id,
    createdAt: now,
    updatedAt: now,
    permissions: '-rw-r--r--',
    size: new Blob([content]).size,
  };
  parent.updatedAt = now;

  return { success: true };
}

/**
 * Creates a directory node at the specified path
 */
export function addDir(
  root: VNode,
  normalizedPath: string
): { success: boolean; error?: string } {
  const target = getNodeByPath(root, normalizedPath);
  if (target) {
    return { success: false, error: 'File exists' };
  }

  const parentInfo = getParentAndName(root, normalizedPath);
  if (!parentInfo) {
    return { success: false, error: 'No such file or directory' };
  }

  const { parent, name } = parentInfo;
  const now = Date.now();
  parent.children[name] = {
    id: `dir_${name}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    type: 'dir',
    content: '',
    children: {},
    parentId: parent.id,
    createdAt: now,
    updatedAt: now,
    permissions: 'drwxr-xr-x',
    size: 4096,
  };
  parent.updatedAt = now;

  return { success: true };
}

/**
 * Removes a file or directory
 */
export function removeNode(
  root: VNode,
  normalizedPath: string,
  recursive: boolean
): { success: boolean; error?: string } {
  if (normalizedPath === '/') {
    return { success: false, error: 'cannot remove root directory' };
  }

  const parentInfo = getParentAndName(root, normalizedPath);
  if (!parentInfo) {
    return { success: false, error: 'No such file or directory' };
  }

  const { parent, name } = parentInfo;
  const target = parent.children[name];
  if (!target) {
    return { success: false, error: 'No such file or directory' };
  }

  if (target.type === 'dir' && !recursive) {
    return { success: false, error: 'Is a directory' };
  }

  delete parent.children[name];
  parent.updatedAt = Date.now();
  return { success: true };
}

/**
 * Copies a file or directory
 */
export function copyNode(
  root: VNode,
  srcNormalized: string,
  destNormalized: string,
  recursive: boolean
): { success: boolean; error?: string } {
  const srcNode = getNodeByPath(root, srcNormalized);
  if (!srcNode) {
    return { success: false, error: `cannot stat '${srcNormalized}': No such file or directory` };
  }

  if (srcNode.type === 'dir' && !recursive) {
    return { success: false, error: `-r not specified; omitting directory '${srcNormalized}'` };
  }

  // Check destination
  let destParent: VNode;
  let destName: string;

  const existingDest = getNodeByPath(root, destNormalized);
  if (existingDest && existingDest.type === 'dir') {
    // If dest is directory, copy inside it with source's name
    destParent = existingDest;
    destName = srcNode.name;
  } else {
    const parentInfo = getParentAndName(root, destNormalized);
    if (!parentInfo) {
      return { success: false, error: `cannot create '${destNormalized}': No such file or directory` };
    }
    destParent = parentInfo.parent;
    destName = parentInfo.name;
  }

  const cloned = cloneVNode(srcNode, destParent.id);
  cloned.name = destName;
  destParent.children[destName] = cloned;
  destParent.updatedAt = Date.now();

  return { success: true };
}

/**
 * Moves or renames a file or directory
 */
export function moveNode(
  root: VNode,
  srcNormalized: string,
  destNormalized: string
): { success: boolean; error?: string } {
  const srcParentInfo = getParentAndName(root, srcNormalized);
  if (!srcParentInfo) {
    return { success: false, error: `cannot stat '${srcNormalized}': No such file or directory` };
  }

  const { parent: srcParent, name: srcName } = srcParentInfo;
  const srcNode = srcParent.children[srcName];
  if (!srcNode) {
    return { success: false, error: `cannot stat '${srcNormalized}': No such file or directory` };
  }

  // Check destination
  const existingDest = getNodeByPath(root, destNormalized);
  if (existingDest && existingDest.type === 'dir') {
    // Move inside existing directory
    existingDest.children[srcName] = srcNode;
    srcNode.parentId = existingDest.id;
    existingDest.updatedAt = Date.now();
    delete srcParent.children[srcName];
    srcParent.updatedAt = Date.now();
    return { success: true };
  }

  const destParentInfo = getParentAndName(root, destNormalized);
  if (!destParentInfo) {
    return { success: false, error: `cannot move to '${destNormalized}': No such file or directory` };
  }

  const { parent: destParent, name: destName } = destParentInfo;
  delete srcParent.children[srcName];
  srcParent.updatedAt = Date.now();

  srcNode.name = destName;
  srcNode.parentId = destParent.id;
  destParent.children[destName] = srcNode;
  destParent.updatedAt = Date.now();

  return { success: true };
}

/**
 * Loads VFS State from localStorage or creates initial state
 */
export function loadVFSState(): VFSState {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const savedVFS = localStorage.getItem(STORAGE_KEY_VFS);
      const savedCwd = localStorage.getItem(STORAGE_KEY_CWD);

      if (savedVFS) {
        const parsedRoot = JSON.parse(savedVFS) as VNode;
        const cwd = savedCwd || HOME_DIR;
        return {
          root: parsedRoot,
          cwd,
          lastAction: { type: 'none', timestamp: Date.now() },
        };
      }
    }
  } catch (e) {
    console.error('Failed to load VFS from localStorage:', e);
  }

  const initialRoot = createInitialVFS();
  return {
    root: initialRoot,
    cwd: HOME_DIR,
    lastAction: { type: 'none', timestamp: Date.now() },
  };
}

/**
 * Saves VFS State to localStorage
 */
export function persistVFSState(state: VFSState): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_VFS, JSON.stringify(state.root));
      localStorage.setItem(STORAGE_KEY_CWD, state.cwd);
    }
  } catch (e) {
    console.error('Failed to save VFS to localStorage:', e);
  }
}

/**
 * Resets VFS state back to default
 */
export function resetVFSState(): VFSState {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_VFS);
    localStorage.removeItem(STORAGE_KEY_CWD);
  }
  const initialRoot = createInitialVFS();
  const newState: VFSState = {
    root: initialRoot,
    cwd: HOME_DIR,
    lastAction: { type: 'reset', timestamp: Date.now() },
  };
  persistVFSState(newState);
  return newState;
}
