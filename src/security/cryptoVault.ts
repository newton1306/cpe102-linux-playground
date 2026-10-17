// Pure TypeScript Cryptographic Vault using Standard SHA-256 (FIPS 180-4) and Counter-Mode Stream Cipher
// Zero external dependencies, pure synchronous runtime execution.
import { VAULT_REGISTRY, VAULT_SALT, type EncryptedPayload } from './vaultData';

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/**
 * Pure TypeScript SHA-256 implementation (FIPS 180-4 standard).
 */
export function sha256(str: string): string {
  let H0 = 0x6a09e667,
    H1 = 0xbb67ae85,
    H2 = 0x3c6ef372,
    H3 = 0xa54ff53a;
  let H4 = 0x510e527f,
    H5 = 0x9b05688c,
    H6 = 0x1f83d9ab,
    H7 = 0x5be0cd19;

  const utf8 = unescape(encodeURIComponent(str));
  const len = utf8.length;
  const words: number[] = [];
  for (let i = 0; i < len; i++) {
    words[i >> 2] = (words[i >> 2] || 0) | (utf8.charCodeAt(i) << (24 - (i % 4) * 8));
  }
  words[len >> 2] = (words[len >> 2] || 0) | (0x80 << (24 - (len % 4) * 8));
  const totalWords = (((len + 8) >> 6) + 1) << 4;
  words[totalWords - 1] = len * 8;
  for (let i = 0; i < totalWords; i++) {
    if (!words[i]) words[i] = 0;
  }

  const W = new Int32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let i = 0; i < totalWords; i += 16) {
    for (let t = 0; t < 16; t++) W[t] = words[i + t];
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }

    let a = H0,
      b = H1,
      c = H2,
      d = H3,
      e = H4,
      f = H5,
      g = H6,
      h = H7;

    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H0 = (H0 + a) | 0;
    H1 = (H1 + b) | 0;
    H2 = (H2 + c) | 0;
    H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0;
    H5 = (H5 + f) | 0;
    H6 = (H6 + g) | 0;
    H7 = (H7 + h) | 0;
  }

  const toHex = (n: number) => ('00000000' + (n >>> 0).toString(16)).slice(-8);
  return (
    toHex(H0) +
    toHex(H1) +
    toHex(H2) +
    toHex(H3) +
    toHex(H4) +
    toHex(H5) +
    toHex(H6) +
    toHex(H7)
  );
}

/**
 * Derives a cryptographic key from an asset target name and salt pepper.
 */
export function deriveVaultKey(targetName: string): string {
  return sha256(`${targetName}::${VAULT_SALT}`);
}

/**
 * Generates pseudorandom keystream bytes using counter-mode SHA-256.
 */
function deriveKeyStream(key: string, lengthInBytes: number): string {
  let stream = '';
  let counter = 0;
  while (stream.length < lengthInBytes * 2) {
    stream += sha256(`${key}::counter_${counter}`);
    counter++;
  }
  return stream;
}

/**
 * Decrypts a hexadecimal counter-mode ciphertext using a derived key.
 * Decodes the resulting bytes as standard UTF-8.
 */
export function decryptVaultPayload(hexCipher: string, key: string): string {
  const byteLen = hexCipher.length / 2;
  const streamHex = deriveKeyStream(key, byteLen);
  const outBytes = new Uint8Array(byteLen);

  for (let i = 0; i < byteLen; i++) {
    const cipherByte = parseInt(hexCipher.substring(i * 2, i * 2 + 2), 16);
    const keyByte = parseInt(streamHex.substring(i * 2, i * 2 + 2), 16);
    outBytes[i] = cipherByte ^ keyByte;
  }

  const decoder = new TextDecoder();
  return decoder.decode(outBytes);
}

/**
 * Retrieves an encrypted payload configuration for a given asset name.
 */
export function getVaultEntry(targetName: string): EncryptedPayload | null {
  const nameHash = sha256(targetName);
  return VAULT_REGISTRY[nameHash] || null;
}

/**
 * Checks whether an asset is a secret Easter egg file.
 */
export function isSecretAsset(targetName: string): boolean {
  const nameHash = sha256(targetName);
  return Boolean(VAULT_REGISTRY[nameHash]);
}

/**
 * Securely unlocks and decrypts file content for terminal output.
 */
export function unlockVaultContent(
  cipherPayload: string,
  targetName: string,
  expectedKeyHash?: string
): string {
  // Try direct key derivation first
  const key = deriveVaultKey(targetName);
  const derivedKeyHash = sha256(key);

  if (expectedKeyHash && derivedKeyHash === expectedKeyHash) {
    return decryptVaultPayload(cipherPayload, key);
  }

  // Fallback: search registered vault keys in case the file was copied or renamed
  for (const entry of Object.values(VAULT_REGISTRY)) {
    if (
      entry.cipherHex === cipherPayload ||
      (expectedKeyHash && entry.keyHash === expectedKeyHash)
    ) {
      // Find matching key from registered items
      for (const knownName of ['.secret_1', '.secret_2']) {
        const testKey = deriveVaultKey(knownName);
        if (sha256(testKey) === entry.keyHash) {
          return decryptVaultPayload(cipherPayload, testKey);
        }
      }
    }
  }

  // If directly derived key produces decodable text
  try {
    return decryptVaultPayload(cipherPayload, key);
  } catch {
    return '[Encrypted Vault Asset: Cryptographic Key Mismatch]';
  }
}
