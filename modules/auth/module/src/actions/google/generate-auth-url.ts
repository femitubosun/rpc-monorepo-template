import { generateSessionId, makeOauthSessionCacheKey } from "@logic";
import module from "@module";
import cache from "@template/cache";
import google from "@template/google";
import pkce from "@template/pkce";

module.registerHandlers({
  google: {
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

      const authUrl = google.generateAuthUrl({
        state,
        codeChallenge,
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
