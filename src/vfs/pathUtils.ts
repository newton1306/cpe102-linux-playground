export const HOME_DIR = '/home/student';

/**
 * Normalizes a given path against the current working directory (cwd).
 * Handles:
 * - Empty or undefined -> cwd
 * - Home shortcut: "~", "~/...", "~student"
 * - Absolute paths: "/..."
 * - Relative paths: "./...", "../...", "subfolder"
 * - Redundant slashes and "."
 * - Parent traversal ".." (stays at "/" if already at root)
 */
export function resolvePath(pathStr: string, cwd: string = HOME_DIR): string {
  let target = pathStr.trim();

  if (!target) {
    return cwd;
  }

  // Handle tilde ~
  if (target === '~') {
    return HOME_DIR;
  }
  if (target.startsWith('~/')) {
    target = HOME_DIR + target.substring(1);
  }

  // Determine if absolute or relative
  let isAbsolute = target.startsWith('/');
  let rawSegments: string[];

  if (isAbsolute) {
    rawSegments = target.split('/').filter(Boolean);
  } else {
    const cwdSegments = cwd === '/' ? [] : cwd.split('/').filter(Boolean);
    const relSegments = target.split('/').filter(Boolean);
    rawSegments = [...cwdSegments, ...relSegments];
  }

  const resolvedSegments: string[] = [];
  for (const seg of rawSegments) {
    if (seg === '.') {
      continue;
    }
    if (seg === '..') {
      if (resolvedSegments.length > 0) {
        resolvedSegments.pop();
      }
      continue;
    }
    resolvedSegments.push(seg);
  }

  const result = '/' + resolvedSegments.join('/');
  return result;
}

/**
 * Splits normalized path into segments
 */
export function getPathSegments(normalizedPath: string): string[] {
  return normalizedPath.split('/').filter(Boolean);
}

/**
 * Formats a path for the Linux terminal prompt (replacing /home/student with ~)
 */
export function formatPromptPath(normalizedPath: string): string {
  if (normalizedPath === HOME_DIR) {
    return '~';
  }
  if (normalizedPath.startsWith(HOME_DIR + '/')) {
    return '~' + normalizedPath.slice(HOME_DIR.length);
  }
  return normalizedPath;
}

/**
 * Gets parent path and base name
 */
export function splitParentAndName(normalizedPath: string): { parentPath: string; name: string } {
  const segments = getPathSegments(normalizedPath);
  if (segments.length === 0) {
    return { parentPath: '/', name: '' };
  }
  const name = segments[segments.length - 1];
  const parentSegments = segments.slice(0, -1);
  const parentPath = '/' + parentSegments.join('/');
  return { parentPath, name };
}
