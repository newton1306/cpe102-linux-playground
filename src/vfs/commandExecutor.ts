import type { CommandResult, VFSState, VNode } from '../types/vfs';
import {
  addDir,
  addFile,
  copyNode,
  getNodeByPath,
  moveNode,
  removeNode,
  persistVFSState,
} from './vfsEngine';
import {
  formatPromptPath,
  resolvePath,
} from './pathUtils';

export interface ExecuteOptions {
  state: VFSState;
  commandLine: string;
  onSecretFound?: () => void;
}

/**
 * Parses Linux command line string respecting quotes
 */
function parseArgs(cmdLine: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < cmdLine.length; i++) {
    const char = cmdLine[i];
    if (inQuotes) {
      if (char === quoteChar) {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"' || char === "'") {
        inQuotes = true;
        quoteChar = char;
      } else if (char === ' ' || char === '\t') {
        if (current.length > 0) {
          args.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
  }

  if (current.length > 0) {
    args.push(current);
  }

  return args;
}

/**
 * Executes a single command on the VFS
 */
export function executeCommand({ state, commandLine, onSecretFound }: ExecuteOptions): {
  result: CommandResult;
  nextState: VFSState;
} {
  const trimmed = commandLine.trim();
  if (!trimmed) {
    return {
      result: { stdout: '', stderr: '', exitCode: 0 },
      nextState: state,
    };
  }

  const args = parseArgs(trimmed);
  const command = args[0];
  const params = args.slice(1);

  // Clone state to apply immutable updates
  let nextState: VFSState = {
    ...state,
    root: state.root, // mutations inside VFS functions modify node tree
    lastAction: { type: 'none', timestamp: Date.now() },
  };

  switch (command) {
    case 'pwd': {
      return {
        result: {
          stdout: state.cwd,
          stderr: '',
          exitCode: 0,
        },
        nextState,
      };
    }

    case 'ls': {
      return executeLs(state, params);
    }

    case 'cd': {
      const targetArg = params[0] || '~';
      const resolved = resolvePath(targetArg, state.cwd);
      const targetNode = getNodeByPath(state.root, resolved);

      if (!targetNode) {
        return {
          result: {
            stdout: '',
            stderr: `bash: cd: ${targetArg}: No such file or directory`,
            exitCode: 1,
            actionEffect: { type: 'error', timestamp: Date.now() },
          },
          nextState,
        };
      }

      if (targetNode.type !== 'dir') {
        return {
          result: {
            stdout: '',
            stderr: `bash: cd: ${targetArg}: Not a directory`,
            exitCode: 1,
            actionEffect: { type: 'error', timestamp: Date.now() },
          },
          nextState,
        };
      }

      nextState.cwd = resolved;
      nextState.lastAction = {
        type: 'cd',
        targetPath: resolved,
        timestamp: Date.now(),
      };
      persistVFSState(nextState);

      return {
        result: {
          stdout: '',
          stderr: '',
          exitCode: 0,
          actionEffect: nextState.lastAction,
        },
        nextState,
      };
    }

    case 'cat': {
      if (params.length === 0) {
        return {
          result: { stdout: '', stderr: 'cat: missing file operand', exitCode: 1 },
          nextState,
        };
      }

      const outputs: string[] = [];
      const errors: string[] = [];

      for (const fileArg of params) {
        const resolved = resolvePath(fileArg, state.cwd);
        const node = getNodeByPath(state.root, resolved);

        if (!node) {
          errors.push(`cat: ${fileArg}: No such file or directory`);
        } else if (node.type === 'dir') {
          errors.push(`cat: ${fileArg}: Is a directory`);
        } else {
          outputs.push(node.content);
          if ((node.name === atob('LnNlY3JldF8x') || node.name === atob('LnNlY3JldF8y')) && onSecretFound) {
            onSecretFound();
          }
        }
      }

      nextState.lastAction = {
        type: 'cat',
        targetPath: resolvePath(params[0], state.cwd),
        targetName: params[0],
        timestamp: Date.now(),
      };

      return {
        result: {
          stdout: outputs.join('\n'),
          stderr: errors.join('\n'),
          exitCode: errors.length > 0 ? 1 : 0,
          actionEffect: nextState.lastAction,
        },
        nextState,
      };
    }

    case 'touch': {
      if (params.length === 0) {
        return {
          result: { stdout: '', stderr: 'touch: missing file operand', exitCode: 1 },
          nextState,
        };
      }

      const errors: string[] = [];
      for (const fileArg of params) {
        const resolved = resolvePath(fileArg, state.cwd);
        const res = addFile(state.root, resolved, '');
        if (!res.success) {
          errors.push(`touch: cannot touch '${fileArg}': ${res.error}`);
        }
      }

      if (errors.length === 0) {
        nextState.lastAction = {
          type: 'touch',
          targetPath: resolvePath(params[0], state.cwd),
          targetName: params[0],
          timestamp: Date.now(),
        };
        persistVFSState(nextState);
      }

      return {
        result: {
          stdout: '',
          stderr: errors.join('\n'),
          exitCode: errors.length > 0 ? 1 : 0,
          actionEffect: nextState.lastAction,
        },
        nextState,
      };
    }

    case 'mkdir': {
      if (params.length === 0) {
        return {
          result: { stdout: '', stderr: 'mkdir: missing operand', exitCode: 1 },
          nextState,
        };
      }

      const errors: string[] = [];
      for (const dirArg of params) {
        const resolved = resolvePath(dirArg, state.cwd);
        const res = addDir(state.root, resolved);
        if (!res.success) {
          errors.push(`mkdir: cannot create directory '${dirArg}': ${res.error}`);
        }
      }

      if (errors.length === 0) {
        nextState.lastAction = {
          type: 'mkdir',
          targetPath: resolvePath(params[0], state.cwd),
          targetName: params[0],
          timestamp: Date.now(),
        };
        persistVFSState(nextState);
      }

      return {
        result: {
          stdout: '',
          stderr: errors.join('\n'),
          exitCode: errors.length > 0 ? 1 : 0,
          actionEffect: nextState.lastAction,
        },
        nextState,
      };
    }

    case 'cp': {
      let recursive = false;
      const paths: string[] = [];

      for (const arg of params) {
        if (arg === '-r' || arg === '-R' || arg === '--recursive') {
          recursive = true;
        } else {
          paths.push(arg);
        }
      }

      if (paths.length < 2) {
        return {
          result: {
            stdout: '',
            stderr: `cp: missing destination file operand after '${paths[0] || ''}'`,
            exitCode: 1,
          },
          nextState,
        };
      }

      const src = paths[0];
      const dest = paths[1];
      const srcResolved = resolvePath(src, state.cwd);
      const destResolved = resolvePath(dest, state.cwd);

      const res = copyNode(state.root, srcResolved, destResolved, recursive);
      if (!res.success) {
        return {
          result: {
            stdout: '',
            stderr: `cp: ${res.error}`,
            exitCode: 1,
            actionEffect: { type: 'error', timestamp: Date.now() },
          },
          nextState,
        };
      }

      nextState.lastAction = {
        type: 'cp',
        targetPath: destResolved,
        timestamp: Date.now(),
      };
      persistVFSState(nextState);

      return {
        result: {
          stdout: '',
          stderr: '',
          exitCode: 0,
          actionEffect: nextState.lastAction,
        },
        nextState,
      };
    }

    case 'mv': {
      if (params.length < 2) {
        return {
          result: {
            stdout: '',
            stderr: `mv: missing destination file operand after '${params[0] || ''}'`,
            exitCode: 1,
          },
          nextState,
        };
      }

      const src = params[0];
      const dest = params[1];
      const srcResolved = resolvePath(src, state.cwd);
      const destResolved = resolvePath(dest, state.cwd);

      const res = moveNode(state.root, srcResolved, destResolved);
      if (!res.success) {
        return {
          result: {
            stdout: '',
            stderr: `mv: ${res.error}`,
            exitCode: 1,
            actionEffect: { type: 'error', timestamp: Date.now() },
          },
          nextState,
        };
      }

      nextState.lastAction = {
        type: 'mv',
        targetPath: destResolved,
        timestamp: Date.now(),
      };
      persistVFSState(nextState);

      return {
        result: {
          stdout: '',
          stderr: '',
          exitCode: 0,
          actionEffect: nextState.lastAction,
        },
        nextState,
      };
    }

    case 'rm': {
      let recursive = false;
      const paths: string[] = [];

      for (const arg of params) {
        if (arg === '-r' || arg === '-R' || arg === '-rf' || arg === '--recursive') {
          recursive = true;
        } else if (arg.startsWith('-') && arg.includes('r')) {
          recursive = true;
        } else if (!arg.startsWith('-')) {
          paths.push(arg);
        }
      }

      if (paths.length === 0) {
        return {
          result: { stdout: '', stderr: 'rm: missing operand', exitCode: 1 },
          nextState,
        };
      }

      const errors: string[] = [];
      for (const target of paths) {
        const resolved = resolvePath(target, state.cwd);
        const res = removeNode(state.root, resolved, recursive);
        if (!res.success) {
          errors.push(`rm: cannot remove '${target}': ${res.error}`);
        }
      }

      if (errors.length === 0) {
        nextState.lastAction = {
          type: 'rm',
          targetName: paths[0],
          timestamp: Date.now(),
        };
        persistVFSState(nextState);
      }

      return {
        result: {
          stdout: '',
          stderr: errors.join('\n'),
          exitCode: errors.length > 0 ? 1 : 0,
          actionEffect: errors.length === 0 ? nextState.lastAction : { type: 'error', timestamp: Date.now() },
        },
        nextState,
      };
    }

    case 'clear': {
      return {
        result: { stdout: '__CLEAR__', stderr: '', exitCode: 0 },
        nextState,
      };
    }

    case 'help': {
      return {
        result: {
          stdout: getHelpOutput(),
          stderr: '',
          exitCode: 0,
        },
        nextState,
      };
    }

    default: {
      return {
        result: {
          stdout: '',
          stderr: `bash: ${command}: command not found. Type 'help' to see available commands.`,
          exitCode: 127,
          actionEffect: { type: 'error', timestamp: Date.now() },
        },
        nextState,
      };
    }
  }
}

/**
 * Handles ls with -a, -l, -F, -R and combination flags
 */
function executeLs(state: VFSState, params: string[]): { result: CommandResult; nextState: VFSState } {
  let showAll = false;
  let longFormat = false;
  let classify = false;
  let recursive = false;
  const targetPaths: string[] = [];

  for (const arg of params) {
    if (arg.startsWith('-') && arg.length > 1) {
      for (let i = 1; i < arg.length; i++) {
        const flag = arg[i];
        if (flag === 'a') showAll = true;
        if (flag === 'l') longFormat = true;
        if (flag === 'F') classify = true;
        if (flag === 'R') recursive = true;
      }
    } else {
      targetPaths.push(arg);
    }
  }

  const targetPath = targetPaths[0] || state.cwd;
  const resolved = resolvePath(targetPath, state.cwd);
  const targetNode = getNodeByPath(state.root, resolved);

  if (!targetNode) {
    return {
      result: {
        stdout: '',
        stderr: `ls: cannot access '${targetPath}': No such file or directory`,
        exitCode: 2,
      },
      nextState: state,
    };
  }

  if (targetNode.type === 'file') {
    let out = targetNode.name;
    if (classify && targetNode.isExecutable) out += '*';
    if (longFormat) {
      out = `${targetNode.permissions} 1 student student ${targetNode.size} Oct 18 ${out}`;
    }
    return {
      result: { stdout: out, stderr: '', exitCode: 0 },
      nextState: state,
    };
  }

  const formatDir = (dirNode: VNode, pathForHeading?: string): string[] => {
    const lines: string[] = [];
    if (pathForHeading) {
      lines.push(`${pathForHeading}:`);
    }

    const items: Array<{ name: string; node?: VNode; isPseudo?: boolean; isDir: boolean }> = [];

    if (showAll) {
      items.push({ name: '.', isPseudo: true, isDir: true });
      items.push({ name: '..', isPseudo: true, isDir: true });
    }

    const childNames = Object.keys(dirNode.children).sort();
    for (const name of childNames) {
      if (!showAll && name.startsWith('.')) {
        continue;
      }
      const child = dirNode.children[name];
      items.push({ name, node: child, isDir: child.type === 'dir' });
    }

    if (longFormat) {
      lines.push(`total ${items.length * 4}`);
      for (const item of items) {
        if (item.isPseudo) {
          lines.push(`drwxr-xr-x 2 student student 4096 Oct 18 ${item.name}${classify ? '/' : ''}`);
        } else if (item.node) {
          const suffix = classify ? (item.isDir ? '/' : item.node.isExecutable ? '*' : '') : '';
          lines.push(`${item.node.permissions} 1 student student ${item.node.size.toString().padStart(5, ' ')} Oct 18 ${item.name}${suffix}`);
        }
      }
    } else {
      const formatted = items.map((item) => {
        const suffix = classify ? (item.isDir ? '/' : item.node?.isExecutable ? '*' : '') : '';
        return `${item.name}${suffix}`;
      });
      lines.push(formatted.join('  '));
    }

    if (recursive) {
      for (const name of childNames) {
        if (!showAll && name.startsWith('.')) continue;
        const child = dirNode.children[name];
        if (child.type === 'dir') {
          lines.push('');
          const subPath = (pathForHeading ? pathForHeading : formatPromptPath(resolved)) + '/' + name;
          lines.push(...formatDir(child, subPath));
        }
      }
    }

    return lines;
  };

  const lines = formatDir(targetNode, recursive ? formatPromptPath(resolved) : undefined);

  const nextState = {
    ...state,
    lastAction: {
      type: (showAll ? 'ls-a' : 'none') as any,
      timestamp: Date.now(),
    },
  };

  return {
    result: {
      stdout: lines.join('\n'),
      stderr: '',
      exitCode: 0,
      actionEffect: showAll ? { type: 'ls-a', timestamp: Date.now() } : undefined,
    },
    nextState,
  };
}

function getHelpOutput(): string {
  return `⚡ CPE102 : Let's Try! Linux Command Playground - Quick Cheat Sheet
──────────────────────────────────────────────────────────────────────────
COMMAND          DESCRIPTION & EXAMPLES
──────────────────────────────────────────────────────────────────────────
pwd              Print current working directory
                 Example: pwd

ls [options]     List files and directories
                 Options:
                   ls       : List normal files and directories
                   ls -F    : Append indicator (/ for directories)
                   ls -R    : List directory contents recursively
                   ls -l    : Detailed long listing format

cd <path>        Change directory
                 Examples:
                   cd cpe102     : Enter cpe102 directory
                   cd ..         : Go up one directory level
                   cd ~ or cd    : Return to home directory (~ /home/student)
                   cd /          : Go to root directory

cat <file>       Concatenate and print file content
                 Example: cat welcome.txt

touch <file>     Create a new empty file
                 Example: touch program.c

mkdir <dir>      Create a new directory
                 Example: mkdir my_folder

cp <src> <dst>   Copy file to destination
                 Example: cp file.txt copy.txt
cp -r <src> <dst>Copy directory recursively
                 Example: cp -r dir1 dir2

mv <src> <dst>   Move or rename a file or directory
                 Example: mv old.txt new.txt

rm <file>        Remove a file
                 Example: rm test.txt
rm -r <dir>      Remove directory and its contents recursively
                 Example: rm -r old_folder

clear            Clear terminal screen (or press Ctrl+L)
help             Display this command reference sheet
──────────────────────────────────────────────────────────────────────────
💡 Tips: Press Tab key anytime to auto-complete commands and filenames!`;
}
