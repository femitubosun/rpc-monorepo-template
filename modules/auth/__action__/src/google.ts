import { A, G } from "@template/action";
import {
  AuthResponseSchema,
  FetchGoogleProfileInput,
  FetchGoogleProfileOutput,
  GenerateGoogleAuthUrlInputSchema,
  GenerateGoogleAuthUrlOutputSchema,
  HandleGoogleCallbackInputSchema,
} from "@template/auth-defs";

export const google = G({
  generateAuthUrl: A("auth.google.generateAuthUrl")
    .input(GenerateGoogleAuthUrlInputSchema)
    .output(GenerateGoogleAuthUrlOutputSchema),

  handleCallbackUrl: A("auth.google.handleCallback")
    .input(HandleGoogleCallbackInputSchema)
    .output(AuthResponseSchema),

  getUserProfile: A("auth.google.getUserProfile")
    .input(FetchGoogleProfileInput)
    .output(FetchGoogleProfileOutput),
});
