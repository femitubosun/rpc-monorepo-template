import * as argon2 from 'argon2';

export async function hashString(input: string): Promise<string> {
  return await argon2.hash(input);
}

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
