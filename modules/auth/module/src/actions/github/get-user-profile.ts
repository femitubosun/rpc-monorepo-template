import module from "@module";
import github from "@template/github";

module.registerHandlers({
  github: {
    getUserProfile: async ({ input, context, makeError }) => {
      const profile = await github.getGithubUser(input.token);

      if (!profile) {
        throw makeError({
          message: "Error fetching github profile",
          type: "INTERNAL",
        });
      }

      return {
        data: {
          id: profile.id.toString(),
          email: profile.email,
          avatarUrl: profile.avatar_url,
          name: profile.name,
        },
        context,
      };
    },
  },
});
