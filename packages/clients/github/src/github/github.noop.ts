import type {
  IGithub,
  RequestAuthOptions,
  RequestAuthTokenOptions,
  RequestAuthTokenResponse,
  RequestGithubRepoOptions,
} from './__defs__';

export class GithubNoop implements IGithub {
  generateAuthUrl(_input: RequestAuthOptions): string {
    return '';
  }

  requestAuthenticationToken(
    _input: RequestAuthTokenOptions
  ): Promise<RequestAuthTokenResponse | null> {
    return Promise.resolve({} as unknown as RequestAuthTokenResponse);
  }
  getGithubUser(_authToken: string) {
    return Promise.resolve({} as any);
  }

  getRepository(_input: RequestGithubRepoOptions): Promise<any> {
    return Promise.resolve({} as any);
  }
}
