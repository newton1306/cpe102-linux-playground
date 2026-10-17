import assert from 'node:assert';
import {
  sha256,
  deriveVaultKey,
  decryptVaultPayload,
  getVaultEntry,
  isSecretAsset,
  unlockVaultContent,
} from '../src/security/cryptoVault.ts';

console.log('🔒 Testing Cryptographic Vault & Key Derivation System...\n');

// 1. SHA-256 test vectors
console.log('Test 1: SHA-256 Standard Hashing');
assert.strictEqual(
  sha256('abc'),
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
);
assert.strictEqual(
  sha256(''),
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
);
console.log('  ✓ Standard SHA-256 test vectors match FIPS 180-4 standard');

// 2. Vault Registry lookups
console.log('\nTest 2: Vault Registry Lookup by Hashed Identity');
const entry1 = getVaultEntry('.secret_1');
assert.ok(entry1, 'Vault entry for .secret_1 must exist');
assert.ok(entry1.cipherHex.length > 500, 'Ciphertext should be sufficiently sized');

const entry2 = getVaultEntry('.secret_2');
assert.ok(entry2, 'Vault entry for .secret_2 must exist');
assert.ok(entry2.cipherHex.length > 500, 'Ciphertext should be sufficiently sized');

const dummyEntry = getVaultEntry('welcome.txt');
assert.strictEqual(dummyEntry, null, 'Unencrypted files must not be in vault registry');
console.log('  ✓ Registered vault entries correctly isolated and retrieved');

// 3. Secret asset detection
console.log('\nTest 3: Secret Asset Detection');
assert.strictEqual(isSecretAsset('.secret_1'), true);
assert.strictEqual(isSecretAsset('.secret_2'), true);
assert.strictEqual(isSecretAsset('welcome.txt'), false);
assert.strictEqual(isSecretAsset('cpe102'), false);
console.log('  ✓ isSecretAsset accurately identifies Easter egg targets');

// 4. Key Derivation & Decryption for .secret_1
console.log('\nTest 4: Unlock Vault Content for .secret_1');
const text1 = unlockVaultContent(entry1.cipherHex, '.secret_1', entry1.keyHash);
assert.ok(text1.includes('Congratulations! You discovered .secret_1!'), 'Must include speech banner');
assert.ok(text1.includes('█'), 'Must contain rendered QR Unicode block art');
console.log('  ✓ .secret_1 unlocked and decrypted on-the-fly successfully');

// 5. Key Derivation & Decryption for .secret_2
console.log('\nTest 5: Unlock Vault Content for .secret_2');
const text2 = unlockVaultContent(entry2.cipherHex, '.secret_2', entry2.keyHash);
assert.ok(text2.includes('Great job! You discovered .secret_2!'), 'Must include speech banner');
assert.ok(text2.includes('█'), 'Must contain rendered QR Unicode block art');
console.log('  ✓ .secret_2 unlocked and decrypted on-the-fly successfully');

// 6. Anti-Tamper & Wrong Key Resistance
console.log('\nTest 6: Anti-Tamper & Wrong Key Resistance');
const forgedKey = sha256('forged_key_attack');
const badDecryption = decryptVaultPayload(entry1.cipherHex, forgedKey);
assert.notStrictEqual(badDecryption, text1, 'Forged key must never decrypt secret content');
assert.ok(!badDecryption.includes('Congratulations'), 'Forged key output must be garbled ciphertext');
console.log('  ✓ Cryptographic counter-mode stream cipher completely blocks unauthorized keys');

console.log('\n🎉 ALL CRYPTOGRAPHIC VAULT TESTS PASSED PERFECTLY!\n');
