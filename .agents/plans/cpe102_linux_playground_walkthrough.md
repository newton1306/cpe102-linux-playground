# Let's Try! Linux Command Playground - Walkthrough & Verification Guide

## 1. Project Overview
- **Course**: CPE102 Engineering Exploration (Operating System Module)
- **Activity**: "Let's Try! Linux Command Playground" (Interactive In-Class Hands-on Session)
- **Target Audience**: ~50 First-year Computer Engineering Students
- **Golden Rule**: Strictly NO use of the word "LAB" or "แล็บ" anywhere in UI, code, or documentation.

---

## 2. Changes in Revision 5

### 1) Light Brown Windows File Explorer Aesthetic (Left Pane Only)
- **Theme**: Warm light brown / sand / beige palette inspired by Windows File Explorer.
- **Components Styled**:
  - `FileExplorer.tsx`: Warm parchment background (`#f8f5f0`) with soft tan border.
  - `AddressBar.tsx`: Warm cream bar (`#f5efe6`) with crisp white address bar (`#ffffff`), warm amber drive icon, and tan breadcrumbs.
  - `SidebarTree.tsx`: Light tan navigation tree pane (`#eee7dc`) with amber folder icons and brown active CWD badge.
  - `FileGrid.tsx`: Warm off-white canvas (`#fcfaf7`) with white/tan cards and iconic golden manila folder icons (`#f59e0b` fill `#fef3c7`).
  - `StatusBar.tsx`: Warm sand footer (`#eee7dd`) displaying item counts, selected node details, and terminal CWD pill.
- **Right Pane Untouched**: Ubuntu Terminal remains authentic retro dark mode (`#05080f`) with glowing green neon accents.

### 2) Fully Visible Filenames & Extensions (No Truncation)
- **Problem Fixed**: Filenames were previously truncated with ellipsis (`...`) because of rigid card dimensions and `truncate` CSS.
- **Solution**:
  - Removed `truncate` class.
  - Added `break-all leading-snug min-h-[2.5rem] flex items-center justify-center` so filenames and extensions (`.txt`, `.py`, `.c`, etc.) wrap cleanly onto multiple lines without cutting off.
  - Adjusted grid column sizing to `repeat(auto-fill, minmax(120px, 1fr))` to provide ample card width.
  - Added `title` tooltip on cards so users can inspect the full name on hover.
  - In Table/Details view, filenames now wrap cleanly without ellipsis.

### 3) Terminal Control & Focus Fix (No Freeze when Clicking Files)
- **Bug Fixed**: When typing text in terminal and then clicking a file card in File Explorer, the terminal input became unresponsive and required a page refresh.
- **Root Cause & Fixes**:
  - `handleContainerClick`: Previously returned early whenever any text selection existed on the page (`selection.toString().length > 0`), which permanently locked out clicks if text was selected in Explorer. Now only preserves internal drag selection within terminal output, ensuring clicks anywhere in the terminal immediately restore focus to the input.
  - `handleGlobalKeyDown`: Now actively catches keystrokes when focus was left on an Explorer item, automatically focusing the input and forwarding characters, Backspace, Tab, and Enter so no keystroke is ever dropped.
  - Active input line now spans the full width (`w-full`) with a flexible click capture area across the entire command prompt row.
  - Added `onFocus` caret synchronization to preserve the exact typing cursor position when re-focusing.

---

## 3. Verification & Test Results
- **Automated Verification**:
  - `npm test` runs forbidden word scan and passes 12/12 VFS unit tests.
  - `node scripts/verify.mjs`: Zero occurrences of "LAB" or "แล็บ".
  - `npm run build`: Production build cleanly created via Vite & TypeScript in `< 500ms`.
