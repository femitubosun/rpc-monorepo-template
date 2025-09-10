import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt,
} from 'node:crypto';
import { promisify } from 'node:util';
import * as argon2 from 'argon2';

/**
 * Hashes a string using Argon2, a memory-hard key derivation function.
 *
 * Argon2 is designed to be resistant to brute-force attacks and is the recommended
 * algorithm for password hashing. Each hash operation produces a unique result
 * even for identical inputs due to the random salt generation.
 *
 * **Length Limits:**
 * - Theoretical: Up to 4GB input length
 * - Recommended: Keep under 128 characters for optimal performance
 * - Typical passwords: 8-64 characters
 *
 * @param input - The plaintext string to hash (typically a password)
 * @returns Promise that resolves to the Argon2 hash string
 *
 * @example
 * ```typescript
 * const password = 'userPassword123';
 * const hash = await hashString(password);
 * console.log(hash); // $argon2id$v=19$m=65536,t=3,p=4$...
 * ```
 */
export async function hashString(input: string): Promise<string> {
  return await argon2.hash(input);
}

/**
 * Verifies a plaintext string against an Argon2 hash.
 *
 * This function safely compares a plaintext input with a previously generated
 * Argon2 hash. It handles all errors internally and returns false for any
 * invalid hash format or verification failure.
 *
 * **Length Limits:**
 * - Same as hashString: recommended under 128 characters
 * - Performance degrades with very long inputs
 *
 * @param hash - The stored Argon2 hash string to verify against
 * @param input - The plaintext string to verify (typically user input)
 * @returns Promise that resolves to true if the input matches the hash, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await verifyString(storedHash, userInput);
 * if (isValid) {
 *   console.log('Password is correct');
 * } else {
 *   console.log('Invalid password');
 * }
 * ```
 */
export async function verifyString(
  hash: string,
  input: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, input);
  } catch {
    return false;
  }
}

const asyncScrypt = promisify(scrypt);

/**
 * Encrypts a string using AES-256-GCM with a password-derived key.
 *
 * This function provides authenticated encryption, which means it both encrypts
 * the data and provides integrity protection. The password is used with PBKDF2
 * (scrypt) and a random salt to derive a secure encryption key. Each encryption
 * operation uses a unique IV and salt, ensuring different output for identical inputs.
 *
 * Perfect for encrypting sensitive data like social channel access tokens that
 * need to be stored securely but retrieved later for API calls.
 *
 * **Length Limits:**
 * - Theoretical maximum: ~68GB per operation
 * - Practical limit: Node.js memory constraints (~1.5GB)
 * - Recommended: Keep under 100MB for optimal performance
 * - Typical tokens: 50-500 characters (well within limits)
 *
 * @param plaintext - The string to encrypt
 * @param password - The password/key to use for encryption (should be stored securely)
 * @returns Promise that resolves to encrypted data in format: salt:iv:authTag:encryptedData
 *
 * @example
 * ```typescript
 * const tiktokToken = 'act.1234567890abcdef...';
 * const secretKey = process.env.ENCRYPTION_KEY!;
 *
 * const encryptedToken = await encryptString(tiktokToken, secretKey);
 * // Store encryptedToken in database
 * ```
 */
export async function encryptString(
  plaintext: string,
  password: string
): Promise<string> {
  const salt = randomBytes(16);
  const iv = randomBytes(16);

  const key = (await asyncScrypt(password, salt, 32)) as Buffer;

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts data that was encrypted using the encryptString function.
 *
 * This function reverses the encryption process, validating the authentication
 * tag to ensure data integrity and authenticity. It will throw an error if the
 * encrypted data format is invalid, the password is incorrect, or the data has
 * been tampered with.
 *
 * **Length Limits:**
 * - Same as encryptString: ~68GB theoretical, ~1.5GB practical
 * - Performance optimal under 100MB
 * - Encrypted data is ~33% larger than original due to encoding
 *
 * @param encryptedData - The encrypted string in format: salt:iv:authTag:encryptedData
 * @param password - The password/key that was used for encryption
 * @returns Promise that resolves to the decrypted plaintext string
 *
 * @throws {Error} When encrypted data format is invalid or decryption fails
 *
 * @example
 * ```typescript
 * try {
 *   const decryptedToken = await decryptString(encryptedToken, secretKey);
 *   // Use decryptedToken for API calls
 *   console.log('Token decrypted successfully');
 * } catch (error) {
 *   console.error('Decryption failed:', error.message);
 * }
 * ```
 */
export async function decryptString(
  encryptedData: string,
  password: string
): Promise<string> {
  const [saltHex, ivHex, authTagHex, encrypted] = encryptedData.split(':');

  if (!saltHex || !ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted data format');
  }

  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const key = (await asyncScrypt(password, salt, 32)) as Buffer;

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
