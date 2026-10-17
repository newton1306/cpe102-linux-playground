import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Checking codebase for forbidden word "LAB" / "แล็บ"...');

function checkFile(full) {
  const content = fs.readFileSync(full, 'utf8');
  
  // Check for forbidden word
  const thaiMatch = content.match(/แล็บ/);
  if (thaiMatch) {
    throw new Error(`Forbidden word "แล็บ" found in ${full}`);
  }
  
  // regex for standalone lab word (case-insensitive)
  const labMatch = content.match(/\b(LAB|lab|Lab)\b/);
  if (labMatch) {
    throw new Error(`Forbidden word "${labMatch[0]}" found in ${full}`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git' || f === 'dist') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(full);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.html') || f.endsWith('.json') || f.endsWith('.css')) {
      checkFile(full);
    }
  }
}

scanDir(path.join(rootDir, 'src'));
checkFile(path.join(rootDir, 'index.html'));
console.log('✅ PASS: Zero occurrences of "LAB" or "แล็บ" found in UI and codebase!');
