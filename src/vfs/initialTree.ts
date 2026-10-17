import type { VNode } from '../types/vfs';

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

  // /home/student
  const student = createDir('student', home.id);
  home.children['student'] = student;

  // /etc
  const etc = createDir('etc', root.id);
  root.children['etc'] = etc;
  etc.children['os-release'] = createFile(
    'os-release',
    `NAME="CPE102-OS"
VERSION="2025.1 LTS (Interactive Exploration)"
ID=cpe102-linux
PRETTY_NAME="CPE102 Engineering Exploration Linux 2025"
`,
    etc.id
  );

  // /var
  const varDir = createDir('var', root.id);
  root.children['var'] = varDir;
  const logDir = createDir('log', varDir.id);
  varDir.children['log'] = logDir;
  logDir.children['sysinfo.log'] = createFile(
    'sysinfo.log',
    `[BOOT] System started successfully.
[MEM] Initialized 8192MB Virtual Memory.
[CPE102] Interactive Classroom Session active.
`,
    logDir.id
  );

  // Files in /home/student
  student.children['welcome.txt'] = createFile(
    'welcome.txt',
    `================================================================
   ยินดีต้อนรับสู่ CPE102 : Let's Try! Linux Command Playground
================================================================
ยินดีต้อนรับเพื่อนๆ นักศึกษา CPE สู่โลกของ Command Line Interface (CLI)
กิจกรรมช่วงนี้คือการลองเล่นและฝึกพิมพ์คำสั่งไปพร้อมกับอาจารย์ในห้องเรียน!

ลองเริ่มทดลองด้วยคำสั่งพื้นฐานต่อไปนี้:
  1. pwd         : ตรวจสอบตำแหน่งโฟลเดอร์ที่เรากำลังยืนอยู่
  2. ls          : สำรวจดูรายชื่อไฟล์และโฟลเดอร์รอบตัว
  3. ls -a       : ค้นหาความลับที่ซ่อนอยู่ (ไฟล์ที่ขึ้นต้นด้วยจุด .)
  4. cat <file>  : เปิดอ่านข้อความข้างในไฟล์
  5. cd <folder> : เดินทางเข้าสู่โฟลเดอร์อื่น (เช่น cd cpe102 หรือ cd ..)
  6. help        : เปิดดูโพยสรุปคำสั่งทั้งหมดที่มีในระบบ

เคล็ดลับ: สังเกตหน้าจอฝั่งซ้าย (File Explorer) ทุกครั้งที่พิมพ์คำสั่ง
คุณจะเห็นการเปลี่ยนแปลงเกิดขึ้นแบบ Real-Time!
================================================================
`,
    student.id
  );

  student.children['.secret_flag'] = createFile(
    '.secret_flag',
    `
 __________________________________________________
/ 🎉 ยอดเยี่ยมมาก! คุณค้นพบไฟล์ซ่อนสำเร็จแล้ว!      \\
\\ ด้วยคำสั่ง 'ls -a' คุณคิดแบบวิศวกรคอมพิวเตอร์!    /
 --------------------------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||

[EASTER EGG KEY]: CPE102{hidden_files_are_not_secret_anymore}
`,
    student.id
  );

  student.children['.bashrc'] = createFile(
    '.bashrc',
    `# ~/.bashrc: executed by bash for non-login shells.
# CPE102 Linux Playground Configuration
export PS1='\\u@cpe102:\\w\\$ '
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
`,
    student.id
  );

  // /home/student/cpe102
  const cpe102 = createDir('cpe102', student.id);
  student.children['cpe102'] = cpe102;

  cpe102.children['syllabus.txt'] = createFile(
    'syllabus.txt',
    `CPE102 Engineering Exploration : Operating System (OS)
------------------------------------------------------
หัวข้อสำคัญที่เราจะเรียนรู้ร่วมกัน:
- Computer Hardware & System Architecture
- Operating System Core & Kernel Responsibilities
- Process Management & Scheduling (CPU Sharing)
- Memory Hierarchy & Virtual Memory
- File System Management (Hierarchical Trees, Paths, Permissions)
- Interactive Command Line & Shell Fundamentals
`,
    cpe102.id
  );

  cpe102.children['assignment_draft.txt'] = createFile(
    'assignment_draft.txt',
    `ร่างรายงานวิชา CPE102
หัวข้อ: บทบาทของระบบปฏิบัติการในโลกวิศวกรรมคอมพิวเตอร์
(ใช้ไฟล์นี้สำหรับฝึกคำสั่ง mv เช่น mv assignment_draft.txt final_report.txt)
`,
    cpe102.id
  );

  const backupDir = createDir('backup', cpe102.id);
  cpe102.children['backup'] = backupDir;

  // /home/student/playground
  const playground = createDir('playground', student.id);
  student.children['playground'] = playground;

  playground.children['game_demo.py'] = createFile(
    'game_demo.py',
    `# Let's Try! Python Retro Simulation
print("🎮 Welcome to CPE102 Retro Game Demo!")
player = "Student Engineer"
score = 100
print(f"Player: {player} | Exploration Score: {score}")
`,
    playground.id,
    '-rwxr-xr-x'
  );

  playground.children['notes.txt'] = createFile(
    'notes.txt',
    `โพยบันทึกย่อ (Quick Cheat Sheet)
-------------------------------
pwd       = Print Working Directory (บอกพิกัดปัจจุบัน)
cd ..     = ถอยหลังกลับไป 1 โฟลเดอร์
cd ~      = กลับสู่บ้าน (/home/student)
touch f   = สร้างไฟล์ใหม่ชื่อ f
mkdir d   = สร้างโฟลเดอร์ใหม่ชื่อ d
cp a b    = คัดลอกไฟล์ a ไปเป็น b
mv a b    = ย้ายหรือเปลี่ยนชื่อไฟล์ a ไปเป็น b
rm f      = ลบไฟล์ f
rm -r d   = ลบโฟลเดอร์ d และของข้างในทั้งหมด
`,
    playground.id
  );

  const tempTrash = createDir('temp_trash', playground.id);
  playground.children['temp_trash'] = tempTrash;
  tempTrash.children['junk1.log'] = createFile('junk1.log', 'temporary junk log file 1\n', tempTrash.id);
  tempTrash.children['junk2.tmp'] = createFile('junk2.tmp', 'temporary junk cache file 2\n', tempTrash.id);

  // /home/student/projects
  const projects = createDir('projects', student.id);
  student.children['projects'] = projects;

  const webServer = createDir('web_server', projects.id);
  projects.children['web_server'] = webServer;

  webServer.children['index.html'] = createFile(
    'index.html',
    `<!DOCTYPE html>
<html>
<head>
  <title>CPE102 Web Server Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello from CPE102 Web Server!</h1>
  <p>Operating Systems connect software with world-changing hardware.</p>
</body>
</html>
`,
    webServer.id
  );

  webServer.children['style.css'] = createFile(
    'style.css',
    `body {
  background-color: #0d1117;
  color: #00ff66;
  font-family: monospace;
  text-align: center;
  padding-top: 50px;
}
`,
    webServer.id
  );

  return root;
}
