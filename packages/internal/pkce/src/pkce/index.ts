import { createHash, randomBytes } from 'node:crypto';

class PKCE {
  /**
   * @description Generate a cryptographically secure code verifier
   * Length: 43-128 characters, URL-safe base64
   */
  generateCodeVerifier(length = 43): string {
    return randomBytes(32).toString('base64url').slice(0, length);
  }

  /**
   * @description Generate code challenge from verifier using SHA256
   * Only S256 method is supported by GitHub
   */
  generateCodeChallenge(verifier: string): string {
    return createHash('sha256').update(verifier).digest('base64url');
  }

  /**
   *
   * @description Generate cryptographically secure state parameter
   */
  generateState(): string {
    return randomBytes(32).toString('base64url');
  }
}

export default new PKCE();
