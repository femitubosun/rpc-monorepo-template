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
}

export interface RequestAuthTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface RequestGithubRepoOptions {
  owner: string;
  repo: string;
}

export interface IGithub {
  generateAuthUrl(input: RequestAuthOptions): string;

  requestAuthenticationToken(
    input: RequestAuthTokenOptions
  ): Promise<RequestAuthTokenResponse | null>;

  getGithubUser(authToken: string): Promise<any>;

  getRepository(
    input: RequestGithubRepoOptions
  ): Promise<any>;
}
