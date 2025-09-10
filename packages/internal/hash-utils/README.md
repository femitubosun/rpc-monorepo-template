# @template/hash-utils

A secure cryptographic utilities package providing password hashing and symmetric encryption/decryption functions for the Axon AI platform.

## Features

- **Password Hashing**: Argon2-based secure password hashing and verification
- **Symmetric Encryption**: AES-256-GCM encryption for sensitive data like social channel tokens
- **Authenticated Encryption**: Built-in integrity protection against tampering
- **Key Derivation**: PBKDF2 (scrypt) for secure password-based encryption

## Installation

```bash
pnpm add @template/hash-utils
```

## API Reference

### Password Hashing Functions

#### `hashString(input: string): Promise<string>`

Hashes a password using Argon2, a memory-hard key derivation function designed to be resistant to brute-force attacks.

**Parameters:**
- `input`: The plaintext password to hash

**Returns:**
- `Promise<string>`: The Argon2 hash string

**Example:**
```typescript
import { hashString } from '@template/hash-utils';

const password = 'userPassword123';
const hashedPassword = await hashString(password);
console.log(hashedPassword); // $argon2id$v=19$m=65536,t=3,p=4$...
```

#### `verifyString(hash: string, input: string): Promise<boolean>`

Verifies a plaintext password against an Argon2 hash.

**Parameters:**
- `hash`: The stored Argon2 hash
- `input`: The plaintext password to verify

**Returns:**
- `Promise<boolean>`: `true` if the password matches, `false` otherwise

**Example:**
```typescript
import { verifyString } from '@template/hash-utils';

const isValid = await verifyString(storedHash, userInput);
if (isValid) {
  console.log('Password is correct');
} else {
  console.log('Invalid password');
}
```

### Encryption Functions

#### `encryptString(plaintext: string, password: string): Promise<string>`

Encrypts a string using AES-256-GCM with a password-derived key. Perfect for encrypting sensitive data like social channel access tokens.

**Parameters:**
- `plaintext`: The string to encrypt
- `password`: The password/key to use for encryption

**Returns:**
- `Promise<string>`: Encrypted data in format `salt:iv:authTag:encryptedData`

**Example:**
```typescript
import { encryptString } from '@template/hash-utils';

const tiktokToken = 'act.1234567890abcdef...';
const secretKey = process.env.ENCRYPTION_KEY!;

const encryptedToken = await encryptString(tiktokToken, secretKey);
console.log(encryptedToken); // a1b2c3....:d4e5f6....:g7h8i9....:j0k1l2....
```

#### `decryptString(encryptedData: string, password: string): Promise<string>`

Decrypts data that was encrypted using `encryptString`. Validates the authentication tag to ensure data integrity.

**Parameters:**
- `encryptedData`: The encrypted string in format `salt:iv:authTag:encryptedData`
- `password`: The password/key used for encryption

**Returns:**
- `Promise<string>`: The decrypted plaintext

**Throws:**
- `Error`: If the encrypted data format is invalid or decryption fails

**Example:**
```typescript
import { decryptString } from '@template/hash-utils';

try {
  const decryptedToken = await decryptString(encryptedToken, secretKey);
  // Use decryptedToken for API calls
  console.log('Token decrypted successfully');
} catch (error) {
  console.error('Decryption failed:', error.message);
}
```

## Usage Patterns

### Storing Social Channel Tokens

```typescript
import { encryptString, decryptString } from '@template/hash-utils';

// When storing a new social channel token
async function storeSocialToken(userId: string, platform: string, accessToken: string) {
  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY!;
  const encryptedToken = await encryptString(accessToken, encryptionKey);

  await db.socialChannel.create({
    data: {
      userId,
      platform,
      encryptedAccessToken: encryptedToken,
    }
  });
}

// When retrieving a token for API calls
async function getSocialToken(userId: string, platform: string): Promise<string> {
  const channel = await db.socialChannel.findFirst({
    where: { userId, platform }
  });

  if (!channel?.encryptedAccessToken) {
    throw new Error('No token found');
  }

  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY!;
  return await decryptString(channel.encryptedAccessToken, encryptionKey);
}
```

### User Authentication

```typescript
import { hashString, verifyString } from '@template/hash-utils';

// During user registration
async function registerUser(email: string, password: string) {
  const hashedPassword = await hashString(password);

  await db.user.create({
    data: {
      email,
      hashedPassword,
    }
  });
}

// During user login
async function authenticateUser(email: string, password: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user) return false;

  return await verifyString(user.hashedPassword, password);
}
```

## Security Considerations

### Encryption Key Management

- **Never hardcode encryption keys** in your source code
- Use strong, randomly generated keys (at least 32 characters)
- Store encryption keys in secure environment variables
- Consider using separate keys for different data types
- Implement key rotation strategies for production systems

```typescript
// ✅ Good - Use environment variables
const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY!;

// ❌ Bad - Never hardcode keys
const encryptionKey = 'my-secret-key-123';
```

### Password Security

- **Argon2 parameters** are automatically configured for security
- The hash output includes salt, making rainbow table attacks ineffective
- Each hash operation produces a unique result even for identical inputs

### Encryption Details

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 using scrypt with random salt
- **Authentication**: Built-in authentication tag prevents tampering
- **IV/Nonce**: Randomly generated for each encryption operation

## Length Limits and Performance

Understanding the practical limits of each operation helps ensure optimal performance:

### Password Hashing Functions

| Function | Theoretical Limit | Recommended Limit | Performance Notes |
|----------|------------------|-------------------|-------------------|
| `hashString()` | 4GB | 128 characters | Linear time increase with length |
| `verifyString()` | 4GB | 128 characters | Same as hashing performance |

**Best Practices:**
- Keep passwords under 64-128 characters for optimal performance
- Consider implementing client-side length validation
- Typical social platform passwords: 8-64 characters

### Encryption Functions

| Function | Theoretical Limit | Practical Limit | Recommended Limit |
|----------|------------------|-----------------|-------------------|
| `encryptString()` | ~68GB | ~1.5GB (Node.js memory) | 100MB |
| `decryptString()` | ~68GB | ~1.5GB (Node.js memory) | 100MB |

**Important Notes:**
- **Social tokens**: Typically 50-500 characters (well within all limits)
- **Encrypted output**: ~33% larger than input due to hex encoding
- **Memory usage**: Entire string loaded into memory during processing
- **Large data**: Consider streaming encryption for files >100MB

### Real-World Examples

```typescript
// ✅ Typical social channel tokens (optimal)
const tiktokToken = 'act.1234567890abcdef...'; // ~100-500 chars
const instagramToken = 'IGQVJ...'; // ~200-800 chars

// ✅ User passwords (optimal)
const password = 'MySecurePassword123!'; // 20 chars

// ⚠️ Large but acceptable
const largeConfig = JSON.stringify(configObject); // ~50KB

// ❌ Too large - consider alternative approach
const hugeFile = fs.readFileSync('video.mp4', 'utf8'); // Several GB
```

## Error Handling

All functions use proper error handling:

```typescript
try {
  const decrypted = await decryptString(encryptedData, key);
  // Success
} catch (error) {
  // Handle decryption failure
  console.error('Decryption failed:', error.message);
}

// verifyString never throws - returns false on any error
const isValid = await verifyString(hash, password); // boolean
```

## Dependencies

- `argon2`: Password hashing library
- `node:crypto`: Node.js built-in cryptographic functions
- `node:util`: Node.js utilities for promisifying functions

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Type checking
pnpm check-types

# Linting
pnpm lint
```

## License

Internal package for Axon AI platform.
