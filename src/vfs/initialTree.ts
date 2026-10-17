import type { VNode } from '../types/vfs';
import { getVaultEntry } from '../security/cryptoVault';

export function createInitialVFS(): VNode {
  const now = Date.now();

  const createFile = (name: string, content: string, parentId: string, permissions = '-rw-r--r--'): VNode => ({
    id: `file_${name}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    type: 'file',
    content,
    children: {},
    parentId,
    createdAt: now,
    updatedAt: now,
    permissions,
    size: new Blob([content]).size || content.length,
  });

  const createDir = (name: string, parentId: string | null, permissions = 'drwxr-xr-x'): VNode => ({
    id: `dir_${name}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    type: 'dir',
    content: '',
    children: {},
    parentId,
    createdAt: now,
    updatedAt: now,
    permissions,
    size: 4096,
  });

  // Root /
  const root = createDir('', null);

  // /home
  const home = createDir('home', root.id);
  root.children['home'] = home;

  // /home/student (Home ~)
  const student = createDir('student', home.id);
  home.children['student'] = student;

  // 1. welcome.txt (English greeting to freshmen engineers)
  student.children['welcome.txt'] = createFile(
    'welcome.txt',
    `================================================================
   Welcome to CPE102 : Let's Try! Linux Command Playground
================================================================
Welcome freshmen computer engineers to the world of CLI!
This interactive session is designed for you to follow along
and practice Linux commands live with your instructor.

Try starting with these essential commands:
  1. pwd         : Print your current working directory
  2. ls          : List files and directories around you
  3. cat <file>  : Read and display file contents
  4. cd <folder> : Navigate into a directory (e.g., cd cpe102 or cd ..)
  5. help        : Open the command cheat sheet

Pro Tip: Watch the File Explorer on the left side update in real time!
================================================================
`,
    student.id
  );

  // Cryptographically encrypted Easter egg files (Hash-based Key Derivation)
  // Zero plaintext in source code, zero plaintext in JS bundle, zero plaintext in localStorage.
  const _d = (s: string) => atob(s);
  const sec1 = _d('LnNlY3JldF8x');
  const sec2 = _d('LnNlY3JldF8y');

  const v1 = getVaultEntry(sec1);
  if (v1) {
    student.children[sec1] = {
      id: `file_${sec1}_${Math.random().toString(36).substring(2, 9)}`,
      name: sec1,
      type: 'file',
      content: '', // Zero plaintext in memory or localStorage
      children: {},
      parentId: student.id,
      createdAt: now,
      updatedAt: now,
      permissions: '-rw-r--r--',
      size: v1.byteLength,
      isEncrypted: true,
      cipherPayload: v1.cipherHex,
      vaultKeyHash: v1.keyHash,
    };
  }

  const v2 = getVaultEntry(sec2);
  if (v2) {
    student.children[sec2] = {
      id: `file_${sec2}_${Math.random().toString(36).substring(2, 9)}`,
      name: sec2,
      type: 'file',
      content: '', // Zero plaintext in memory or localStorage
      children: {},
      parentId: student.id,
      createdAt: now,
      updatedAt: now,
      permissions: '-rw-r--r--',
      size: v2.byteLength,
      isEncrypted: true,
      cipherPayload: v2.cipherHex,
      vaultKeyHash: v2.keyHash,
    };
  }

  // 4. /home/student/cpe102
  const cpe102 = createDir('cpe102', student.id);
  student.children['cpe102'] = cpe102;

  return root;
}
