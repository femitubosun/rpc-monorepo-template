export interface RequestAuthOptions {
  state: string;
  scopes?: string[];
  codeChallenge: string;
}

export interface RequestAuthTokenOptions {
  code: string;
  codeVerifier: string;
}

export interface RequestAuthTokenBody {
  code: string;
  client_id: string;
  client_secret: string;
  code_verifier: string;
  grant_type: 'authorization_code';
  redirect_uri: string;
}

export interface RequestAuthTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
  id_token: string;
}

export interface GoogleUser {
  id: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  verified_email: boolean;
  locale: string;
}

export interface IGoogle {
  /**
   * Generates the endpoint URL for requesting user identity in GitHub.
   *
   * @param input {RequestAuthOptions<T>} - Object containing parameters for constructing the request:
   *   - state: The current authentication state string or null if none provided
   *   - scopes: Array of OAuth scopes (strings) or null
   *   - codeChallenge: String representing the client challenge, or undefined
   * @returns {string} URL endpoint to use for this identity request
   */
  generateAuthUrl(input: RequestAuthOptions): string;

  requestAuthenticationToken(
    input: RequestAuthTokenOptions
  ): Promise<RequestAuthTokenResponse | null>;

  getGoogleUser(authToken: string): Promise<GoogleUser | null>;
}
