import Env from '@template/env';
import http from '@template/http';
import { makeLogger } from '@template/logging';
import type {
  GoogleUser,
  IGoogle,
  RequestAuthOptions,
  RequestAuthTokenOptions,
  RequestAuthTokenResponse,
} from './__defs__';

const logger = makeLogger('GoogleClient');

export class Google implements IGoogle {
  /**
   * Generates the endpoint URL for requesting user identity in GitHub.
   *
   * @param input {RequestAuthOptions<T>} - Object containing parameters for constructing the request:
   *   - state: The current authentication state string or null if none provided
   *   - scopes: Array of OAuth scopes (strings) or null
   *   - codeChallenge: String representing the client challenge, or undefined
   * @returns {string} URL endpoint to use for this identity request
   */
  generateAuthUrl(input: RequestAuthOptions): string {
    const { state, scopes, codeChallenge } = input;

    const endpointUrl = new URL(Env.GOOGLE_REQUEST_IDENTITY_URL);

    endpointUrl.searchParams.append('client_id', Env.GOOGLE_CLIENT_ID);
    endpointUrl.searchParams.append('response_type', 'code');
    endpointUrl.searchParams.append(
      'scope',
      (scopes ?? ['openid', 'email', 'profile']).join(' ')
    );
    endpointUrl.searchParams.append('state', state);
    endpointUrl.searchParams.append('code_challenge', codeChallenge);
    endpointUrl.searchParams.append('code_challenge_method', 'S256');
    endpointUrl.searchParams.append(
      'redirect_uri',
      `${Env.API_URL}/api/v1/auth/google/callback`
    );

    return endpointUrl.toString();
  }

  async requestAuthenticationToken(
    input: RequestAuthTokenOptions
  ): Promise<RequestAuthTokenResponse | null> {
    const { code, codeVerifier: code_verifier } = input;

    const endpointUrl = Env.GOOGLE_REQUEST_TOKEN_URL;

    try {
      const response = await http.post<any, RequestAuthTokenResponse>({
        endpointUrl,
        requestConfig: {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
        dataPayload: new URLSearchParams({
          client_id: Env.GOOGLE_CLIENT_ID,
          client_secret: Env.GOOGLE_CLIENT_SECRET,
          code,
          code_verifier,
          grant_type: 'authorization_code',
          redirect_uri: `${Env.API_URL}/api/v1/auth/google/callback`,
        }).toString(),
      });

      return response.apiResponse;
    } catch (e) {
      logger.error('Error requesting authentication token', e);

      return null;
    }
  }

  async getGoogleUser(authToken: string) {
    try {
      const response = await http.get<GoogleUser>({
        endpointUrl: Env.GOOGLE_USER_INFO_URL,
        requestConfig: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      });

      return response.apiResponse;
    } catch (e) {
      logger.error('Error fetching google user info', e);

      return null;
    }
  }
}
