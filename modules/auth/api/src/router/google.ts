import {
  GenerateGoogleAuthUrlOutputSchema,
  HandleGoogleCallbackInputSchema,
} from "@template/auth-defs";
import { Route } from "@template/router";
import z from "zod";

export const google = {
  generateAuthUrl: Route.get("auth/google/auth")
    .tags(["Auth", "Oauth", "Google"])
    .jsonResponse(
      200,
      "Success",
      GenerateGoogleAuthUrlOutputSchema.omit({
        sessionId: true,
      }),
    )
    .build(),

  callback: Route.get("auth/google/callback")
    .tags(["Auth", "Oauth", "Google"])
    .query(
      HandleGoogleCallbackInputSchema.omit({
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
