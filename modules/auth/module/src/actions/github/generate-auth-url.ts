import { generateSessionId, makeOauthSessionCacheKey } from "@logic";
import module from "@module";
import cache from "@template/cache";
import github from "@template/github";
import pkce from "@template/pkce";

module.registerHandlers({
  github: {
    generateAuthUrl: async ({ input, context }) => {
      const sessionId = input.sessionId || generateSessionId();

      const codeVerifier = pkce.generateCodeVerifier();
      const codeChallenge = pkce.generateCodeChallenge(codeVerifier);
      const state = pkce.generateState();

      const ck = makeOauthSessionCacheKey(sessionId);

      await cache.set(ck, {
        codeVerifier,
        state,
        createdAt: Date.now(),
      });

      const authUrl = github.generateAuthUrl({
        codeChallenge,
        state,
      });

      const data = {
        sessionId,
        authUrl,
      };

      return {
        data,
        context,
      };
    },
  },
});
