import { Octokit } from "@octokit/core";
import Env from "@template/env";
import http from "@template/http";
import { makeLogger } from "@template/logging";
import type {
  IGithub,
  RequestAuthOptions,
  RequestAuthTokenBody,
  RequestAuthTokenOptions,
  RequestAuthTokenResponse,
  RequestGithubRepoOptions,
} from "./__defs__";

const logger = makeLogger("GithubClient");

export class Github implements IGithub {
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

    const endpointUrl = new URL(Env.GITHUB_REQUEST_IDENTITY_URL);

    endpointUrl.searchParams.append("client_id", Env.GITHUB_CLIENT_ID);
    endpointUrl.searchParams.append("state", state);
    endpointUrl.searchParams.append("code_challenge", codeChallenge);
    endpointUrl.searchParams.append("code_challenge_method", "S256");
    endpointUrl.searchParams.append(
      "scope",
      (scopes ?? ["user:email"]).join(","),
    );

    return endpointUrl.toString();
  }

  /**
   * Requests an authentication token from GitHub.
   *
   * @param {RequestAuthTokenOptions<K>} input - Object containing parameters for the authentication request:
   *   - code: The authorization code (string)
   *   - redirectUri: The client's redirect URI (string)
   *   - codeVerifier: String representation of the code verifier
   * @returns {RequestAuthTokenResponse} Authentication token information object with properties like:
   *   - accessToken: The obtained access token string
   *   - tokenType: Type of token (string), e.g., 'refresh'
   */
  async requestAuthenticationToken(
    input: RequestAuthTokenOptions,
  ): Promise<RequestAuthTokenResponse | null> {
    const {
      code,

      codeVerifier: code_verifier,
    } = input;

    const endpointUrl = Env.GITHUB_REQUEST_TOKEN_URL;

    try {
      const response = await http.post<
        RequestAuthTokenBody,
        RequestAuthTokenResponse
      >({
        endpointUrl,
        requestConfig: {
          headers: {
            accept: "application/json",
          },
        },
        dataPayload: {
          code,
          client_id: Env.GITHUB_CLIENT_ID,
          client_secret: Env.GITHUB_CLIENT_SECRET,
          code_verifier,
        },
      });

      return response.apiResponse;
    } catch (e) {
      logger.error(`Error requesting auth token`, e);

      return null;
    }
  }

  async getGithubUser(authToken: string) {
    const octoKit = new Octokit({
      auth: authToken,
    });

    try {
      const result = await octoKit.request("GET /user", {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      return result.data;
    } catch (e) {
      logger.error(`could not fetch github user`, e);

      return null;
    }
  }

  async getRepository(input: RequestGithubRepoOptions) {
    const { repo, owner } = input;
    const octoKit = new Octokit();
    try {
      const result = await octoKit.request("GET /repos/{owner}/{repo}", {
        owner,
        repo,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
          accept: "application/vnd.github+json",
        },
      });

      return result.data;
    } catch (e) {
      logger.error(`could not fetch github repository`, e);

      return null;
    }
  }
}
