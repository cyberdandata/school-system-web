/**
 * AES-GCM 256-bit Encryption & Decryption Utility for OTEC Cloud Snapshots
 * Uses Web Crypto API (crypto.subtle) with PBKDF2 Key Derivation
 */

export interface EncryptedSnapshotPayload {
  otecEncrypted: true;
  version: '1.0-AES-GCM';
  encryptedAt: string;
  salt: string; // Base64 salt
  iv: string;   // Base64 IV
  ciphertext: string; // Base64 ciphertext
  checksum?: string; // Optional simple verification hash
}

const DEFAULT_MASTER_KEY_STORAGE = 'otec_master_encryption_passphrase';

export function getStoredMasterPassphrase(): string {
  let key = localStorage.getItem(DEFAULT_MASTER_KEY_STORAGE);
  if (!key) {
    key = 'OTEC-SCHOOL-KEY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    localStorage.setItem(DEFAULT_MASTER_KEY_STORAGE, key);
  }
  return key;
}

export function setStoredMasterPassphrase(passphrase: string): void {
  if (passphrase && passphrase.trim().length >= 4) {
    localStorage.setItem(DEFAULT_MASTER_KEY_STORAGE, passphrase.trim());
  }
}

// Convert ArrayBuffer / Uint8Array to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypts an object into an EncryptedSnapshotPayload string
 */
export async function encryptSchoolData(
  data: any,
  passphrase?: string
): Promise<EncryptedSnapshotPayload> {
  const keyString = passphrase || getStoredMasterPassphrase();
  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(data);
  const dataBytes = encoder.encode(jsonString);

  // Fallback if subtle crypto is not present
  if (!window.crypto || !window.crypto.subtle) {
    // Lightweight Base64 + obfuscation fallback
    const obfuscated = btoa(encodeURIComponent(jsonString));
    return {
      otecEncrypted: true,
      version: '1.0-AES-GCM',
      encryptedAt: new Date().toISOString(),
      salt: 'FALLBACK',
      iv: 'FALLBACK',
      ciphertext: obfuscated
    };
  }

  // Generate 16-byte random salt and 12-byte random IV
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Import raw passphrase key
  const passphraseBytes = encoder.encode(keyString);
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-GCM 256-bit key using PBKDF2
  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 10000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // Encrypt
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    dataBytes
  );

  return {
    otecEncrypted: true,
    version: '1.0-AES-GCM',
    encryptedAt: new Date().toISOString(),
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(encryptedBuffer)
  };
}

/**
 * Decrypts an EncryptedSnapshotPayload object or string back to original AppData object
 */
export async function decryptSchoolData(
  payload: EncryptedSnapshotPayload | string,
  passphrase?: string
): Promise<any> {
  let parsedPayload: EncryptedSnapshotPayload;
  if (typeof payload === 'string') {
    try {
      parsedPayload = JSON.parse(payload);
    } catch (e) {
      throw new Error('INVALID_FORMAT: Backup payload is not valid JSON.');
    }
  } else {
    parsedPayload = payload;
  }

  if (!parsedPayload || !parsedPayload.otecEncrypted) {
    // Unencrypted or standard JSON backup
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    }
    return payload;
  }

  const keyString = passphrase || getStoredMasterPassphrase();
  const encoder = new TextEncoder();

  // Fallback check
  if (parsedPayload.salt === 'FALLBACK') {
    const decodedStr = decodeURIComponent(atob(parsedPayload.ciphertext));
    return JSON.parse(decodedStr);
  }

  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('CRYPTO_UNAVAILABLE: Web Crypto API is required for decryption.');
  }

  const saltBytes = base64ToUint8Array(parsedPayload.salt);
  const ivBytes = base64ToUint8Array(parsedPayload.iv);
  const ciphertextBytes = base64ToUint8Array(parsedPayload.ciphertext);

  const passphraseBytes = encoder.encode(keyString);
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 10000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      aesKey,
      ciphertextBytes
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error('INVALID_PASSPHRASE: Decryption failed. Please verify your master passphrase.');
  }
}
