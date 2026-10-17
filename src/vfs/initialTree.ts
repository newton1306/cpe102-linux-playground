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

  // /home/student
  const student = createDir('student', home.id);
  home.children['student'] = student;

  // 1. welcome.txt (Do NOT mention -a or secret)
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
  3. cat <file>  : เปิดอ่านข้อความข้างในไฟล์
  4. cd <folder> : เดินทางเข้าสู่โฟลเดอร์อื่น (เช่น cd cpe102 หรือ cd ..)
  5. help        : เปิดดูโพยสรุปคำสั่งทั้งหมดที่มีในระบบ

เคล็ดลับ: สังเกตหน้าจอฝั่งซ้าย (File Explorer) ทุกครั้งที่พิมพ์คำสั่ง
คุณจะเห็นการเปลี่ยนแปลงเกิดขึ้นแบบ Real-Time!
================================================================
`,
    student.id
  );

  // 2. .secret_1 (Scannable Rick Roll QR code, HINT removed)
  student.children['.secret_1'] = createFile(
    '.secret_1',
    ` __________________________________________________
/ 🎉 ยอดเยี่ยมมาก! คุณค้นพบไฟล์ลับ .secret_1 สำเร็จ! \\
\\ สแกน QR Code ด้านล่างนี้เพื่อเปิดดูความลับพิเศษ!   /
 --------------------------------------------------

${RICK_ROLL_QR}
`,
    student.id
  );

  // 3. .secret_2 (Scannable Google.com QR code)
  student.children['.secret_2'] = createFile(
    '.secret_2',
    ` __________________________________________________
/ 🔍 คุณค้นพบไฟล์ลับ .secret_2 สำเร็จ!             \\
\\ สแกน QR Code ด้านล่างนี้เพื่อเปิดดูข้อมูล!       /
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
