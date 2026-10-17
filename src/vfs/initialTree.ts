import type { VNode } from '../types/vfs';

const RICK_ROLL_QR = `                                 
  █▀▀▀▀▀█ ██  ██▀▀▄█ ▀  █▀▀▀▀▀█  
  █ ███ █ ▄ █▄▀ ▄▄▀ ▀ █ █ ███ █  
  █ ▀▀▀ █  ▀█▀ ▄▀▄████  █ ▀▀▀ █  
  ▀▀▀▀▀▀▀ █ ▀ ▀ ▀▄█▄█ ▀ ▀▀▀▀▀▀▀  
  █▄▀▀ ▀▀█ ▄▄▀██▄█ ▀██▀ █▄▄▀ ▀█  
  ▀█▄██▀▀▀▀▄▄▀▀▀  █ █ ▄█▄█  ▀▀▄  
  ▄ ▀▄█▄▀█▄▀█ ▀ █▀▄ ▄▄▀▀▄▀ ▀█▄▄  
  ▄▄▀ ██▀▀ █▀ █▀▄▀█ ▄▀▀█▄█▄ ▀█▀  
  ▀▄▄  ▀▀▄█▀██▄ █▀█ ▀▄▄▀ ▄▀█▄█   
  ▀ █▄  ▀▄▀█▄ ███▀▀██  ▀▄▀▄ █    
   ▀▀▀▀▀▀ ▄▀█▀█▀▀▄█ ▀▀█▀▀▀███▄▄  
  █▀▀▀▀▀█ █ ▄ █▄██ ▀▄▀█ ▀ ██ ▀▄  
  █ ███ █ ▄█ ██   ▀ ▀▄▀█▀██▄▀▄▀  
  █ ▀▀▀ █ ▀ ▄ ▄▄▀▄ ██ █  █▄▄▀▄▀  
  ▀▀▀▀▀▀▀ ▀ ▀ ▀    ▀▀ ▀▀ ▀▀▀ ▀   
                                 `;

const GOOGLE_QR = `                             
  █▀▀▀▀▀█    ▄█ ▄▄▀ █▀▀▀▀▀█  
  █ ███ █ █▀█▄▀▄▀▀▀ █ ███ █  
  █ ▀▀▀ █ ██▄███▄▄█ █ ▀▀▀ █  
  ▀▀▀▀▀▀▀ █▄█▄▀ ▀ █ ▀▀▀▀▀▀▀  
  █▄██▀▀▀   ▀█ ▀▀▀▄▄▀█▀▀▀▄   
  ▀▄▀▄▄ ▀▄ ▄▀  ▀▄▀██▀█▀▀ ▀█  
  ▄▀██  ▀▄ ▀▀ ▄█▀ ▄█▀█▀▄▀█▀  
  █ ▀█ █▀▄ █  ▄▀█▀██▀██▀ ▀█  
  ▀    ▀▀▀▄▀▀ ▀█▀▄█▀▀▀█▄▀    
  █▀▀▀▀▀█ ▄█▄█▀ █ █ ▀ █▄▀▀▀  
  █ ███ █ █ ▄▀▄▄ ▀█▀█▀█▄███  
  █ ▀▀▀ █ ▀▄▄ ▄█▀▄▄▄ ▄▄█▀ █  
  ▀▀▀▀▀▀▀ ▀   ▀ ▀    ▀▀▀▀▀▀  
                             `;

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

  // Obfuscated dynamic loading for Easter egg files (prevents AI web-scraping & static source leak)
  const _d = (s: string) => atob(s);
  const sec1 = _d('LnNlY3JldF8x');
  const sec2 = _d('LnNlY3JldF8y');

  student.children[sec1] = createFile(
    sec1,
    ` __________________________________________________
/ Congratulations! You discovered ${sec1}!       \\
\\ Scan the QR Code below to claim your surprise!   /
 --------------------------------------------------

${RICK_ROLL_QR}
`,
    student.id
  );

  student.children[sec2] = createFile(
    sec2,
    ` __________________________________________________
/ Great job! You discovered ${sec2}!             \\
\\ Scan the QR Code below to open the URL!          /
 --------------------------------------------------

${GOOGLE_QR}
`,
    student.id
  );

  // 4. /home/student/cpe102
  const cpe102 = createDir('cpe102', student.id);
  student.children['cpe102'] = cpe102;

  return root;
}
