import {
  GenerateGithubAuthUrlOutputSchema,
  HandleCallbackInputSchema,
} from "@template/auth-defs";
import { Route } from "@template/router";
import z from "zod";

export const github = {
  generateAuthUrl: Route.get("/auth/github/auth")
    .tags(["Auth", "Oauth", "Github"])
    .jsonResponse(
      200,
      "Success",
      GenerateGithubAuthUrlOutputSchema.omit({
        sessionId: true,
      }),
    )
    .build(),

  callback: Route.get("auth/github/callback")
    .tags(["Auth", "Oauth", "Github"])
    .query(
      HandleCallbackInputSchema.omit({
        sessionId: true,
      }),
    )
    .response(302, "Redirect to success page", {
      "text/html": {
        schema: z.string().describe("Page with auth token"),
      },
    })
    .build(),
};
