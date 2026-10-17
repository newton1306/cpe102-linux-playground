# Let's Try! Linux Command Playground - Walkthrough & Verification Guide

## 1. Project Overview
- **Course**: CPE102 Engineering Exploration (Operating System Module)
- **Activity**: "Let's Try! Linux Command Playground" (Interactive In-Class Hands-on Session)
- **Target Audience**: ~50 First-year Computer Engineering Students
- **Golden Rule**: Strictly NO use of the word "LAB" or "แล็บ" anywhere in UI, code, or documentation.

---

## 2. Changes in Revision 4

### 1) Authentic Terminal Blinking Cursor
- **Behavior**: Single glowing green block cursor (`█`) rendered continuously right after the prompt (`$ `) or directly after currently typed text.
- **Fix**: Replaced the previous trailing full-width input container layout with an inline cursor structure. Hidden transparent input with `caret-transparent` captures all keyboard and mobile inputs without showing duplicate carets.
- **No Edge Drift**: Cursor never floats to the right edge.

### 2) Ubuntu Bash Prompt Standardization
- **Behavior**: When standing in `/home/student`, the prompt cleanly displays:
  ```bash
  student@cpe102:~$
  ```
  It maps `/home/student` strictly to `~` without displaying `student` as folder name.
- When navigating into subdirectories, e.g. `cpe102`:
  ```bash
  student@cpe102:~/cpe102$
  ```
- When navigating to root (`/`):
  ```bash
  student@cpe102:/$
  ```

### 3) One-Way Terminal-to-Explorer Interaction
- **Terminal (Right) -> Explorer (Left)**:
  - When commands are executed in the Terminal (e.g., `cd`, `touch`, `mkdir`, `rm`, `cp`, `mv`, `ls -a`), the Explorer automatically updates its view to the terminal CWD and triggers visual animations (green pop, ghost reveal, cat highlight).
- **Explorer (Left) -> Terminal (Right)**:
  - Clicking, double-clicking, or navigating folders in the Explorer only updates the left pane view for file inspection. It NEVER affects or changes the Terminal prompt or CWD.

### 4) Freshman Welcome & Instruction in `welcome.txt`
- `welcome.txt` now greets freshmen computer engineers warmly with essential starter commands (`pwd`, `ls`, `cat`, `cd`, `help`).
- Does NOT give away secret flags or `-a`.

### 5) 100% English Localization
- All UI strings, terminal banners, command cheat sheets (`help`), address bars, modal dialogs, and status messages are 100% English.

---

## 3. Verification & Test Results
- **Automated Verification**:
  - `npm test` runs forbidden word scan and passes 12/12 VFS unit tests.
  - `node scripts/verify.mjs`: Zero occurrences of "LAB" or "แล็บ".
  - `npm run build`: Production build cleanly created via Vite & TypeScript in `< 500ms`.
