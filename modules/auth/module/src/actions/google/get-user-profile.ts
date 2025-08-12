import module from "@module";
import google from "@template/google";

module.registerHandlers({
  google: {
    getUserProfile: async ({ input, context, makeError }) => {
      const profile = await google.getGoogleUser(input.token);

      if (!profile) {
        throw makeError({
          message: "Error fetching google profile",
          type: "INTERNAL",
        });
      }

      return {
        data: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.picture,
          verifiedEmail: profile.verified_email,
        },
        context,
      };
    },
  },
});
