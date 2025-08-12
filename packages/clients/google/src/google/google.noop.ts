import type {
  GoogleUser,
  IGoogle,
  RequestAuthOptions,
  RequestAuthTokenOptions,
  RequestAuthTokenResponse,
} from './__defs__';

export class GoogleNoop implements IGoogle {
  generateAuthUrl(_input: RequestAuthOptions): string {
    return '';
  }

  getGoogleUser(
    _authToken: string
  ): Promise<GoogleUser | null> {
    return Promise.resolve({} as unknown as GoogleUser);
  }

  requestAuthenticationToken(
    _input: RequestAuthTokenOptions
  ): Promise<RequestAuthTokenResponse | null> {
    return Promise.resolve(
      {} as unknown as RequestAuthTokenResponse
    );
  }
}
