import assert from 'node:assert';
import { createInitialVFS } from '../src/vfs/initialTree.ts';
import { executeCommand } from '../src/vfs/commandExecutor.ts';
import type { VFSState } from '../src/types/vfs.ts';

console.log('🧪 Starting Virtual File System & Command Test Suite (Revision 2)...\n');

let state: VFSState = {
  root: createInitialVFS(),
  cwd: '/home/student',
  lastAction: { type: 'none', timestamp: Date.now() },
};

function run(cmd: string) {
  const res = executeCommand({ state, commandLine: cmd });
  state = res.nextState;
  return res.result;
}

// 1. pwd
console.log('Test 1: pwd');
const rPwd = run('pwd');
assert.strictEqual(rPwd.stdout, '/home/student');
assert.strictEqual(rPwd.exitCode, 0);
console.log('  ✓ pwd outputs /home/student');

// 2. ls
console.log('Test 2: ls');
const rLs = run('ls');
assert.ok(rLs.stdout.includes('welcome.txt'));
assert.ok(!rLs.stdout.includes('.secret_1')); // Hidden by default
assert.ok(!rLs.stdout.includes('.secret_2')); // Hidden by default
assert.strictEqual(rLs.exitCode, 0);
console.log('  ✓ ls shows normal files, hides dotfiles');

// 3. ls -a
console.log('Test 3: ls -a');
const rLsA = run('ls -a');
assert.ok(rLsA.stdout.includes('.secret_1'));
assert.ok(rLsA.stdout.includes('.secret_2'));
assert.ok(rLsA.stdout.includes('welcome.txt'));
console.log('  ✓ ls -a reveals hidden files .secret_1 and .secret_2');

// 4. ls -F
console.log('Test 4: ls -F');
const rLsF = run('ls -F');
assert.ok(rLsF.stdout.includes('cpe102/'));
console.log('  ✓ ls -F appends / to directories');

// 5. cat
console.log('Test 5: cat');
const rCat = run('cat welcome.txt');
assert.ok(rCat.stdout.includes('CPE102'));
assert.strictEqual(rCat.exitCode, 0);

let secret1Triggered = false;
executeCommand({
  state,
  commandLine: 'cat .secret_1',
  onSecretFound: () => {
    secret1Triggered = true;
  },
});
assert.strictEqual(secret1Triggered, true);

let secret2Triggered = false;
executeCommand({
  state,
  commandLine: 'cat .secret_2',
  onSecretFound: () => {
    secret2Triggered = true;
  },
});
assert.strictEqual(secret2Triggered, true);
console.log('  ✓ cat reads .secret_1 and .secret_2 and triggers confetti');

// 6. cd
console.log('Test 6: cd');
run('cd cpe102');
assert.strictEqual(state.cwd, '/home/student/cpe102');

run('cd ..');
assert.strictEqual(state.cwd, '/home/student');

run('cd /');
assert.strictEqual(state.cwd, '/');

run('cd ~');
assert.strictEqual(state.cwd, '/home/student');

const rCdErr = run('cd not_found_dir');
assert.ok(rCdErr.stderr.includes('No such file or directory'));
console.log('  ✓ cd navigates relative, .., /, ~ and handles errors');

// 7. touch
console.log('Test 7: touch');
run('touch hello.c');
const rCheckTouch = run('ls');
assert.ok(rCheckTouch.stdout.includes('hello.c'));
console.log('  ✓ touch creates new file');

// 8. mkdir
console.log('Test 8: mkdir');
run('mkdir new_folder');
const rCheckMkdir = run('ls -F');
assert.ok(rCheckMkdir.stdout.includes('new_folder/'));
console.log('  ✓ mkdir creates new directory');

// 9. cp & cp -r
console.log('Test 9: cp & cp -r');
run('cp hello.c hello_copy.c');
const rCheckCp = run('ls');
assert.ok(rCheckCp.stdout.includes('hello_copy.c'));

// cp directory without -r should error
const rCpDirErr = run('cp new_folder folder_copy');
assert.ok(rCpDirErr.stderr.includes('omitting directory'));

// cp directory with -r succeeds
const rCpDirOk = run('cp -r new_folder folder_copy');
assert.strictEqual(rCpDirOk.exitCode, 0);
console.log('  ✓ cp and cp -r work with directory omission checks');

// 10. mv
console.log('Test 10: mv');
run('mv hello_copy.c renamed.c');
const rCheckMv = run('ls');
assert.ok(!rCheckMv.stdout.includes('hello_copy.c'));
assert.ok(rCheckMv.stdout.includes('renamed.c'));
console.log('  ✓ mv renames and moves file');

// 11. rm & rm -r
console.log('Test 11: rm & rm -r');
// rm directory without -r should error
const rRmDirErr = run('rm new_folder');
assert.ok(rRmDirErr.stderr.includes('Is a directory'));

// rm -r deletes directory
const rRmDirOk = run('rm -r new_folder');
assert.strictEqual(rRmDirOk.exitCode, 0);
const rCheckRm = run('ls');
assert.ok(!rCheckRm.stdout.includes('new_folder'));

// rm file
run('rm renamed.c');
const rCheckRmFile = run('ls');
assert.ok(!rCheckRmFile.stdout.includes('renamed.c'));
console.log('  ✓ rm protects directories and rm -r removes them recursively');

// 12. help
console.log('Test 12: help');
const rHelp = run('help');
assert.ok(rHelp.stdout.includes('pwd'));
assert.ok(rHelp.stdout.includes('help'));
console.log('  ✓ help displays cheat sheet');

console.log('\n🎉 ALL 12 TESTS PASSED PERFECTLY!\n');
