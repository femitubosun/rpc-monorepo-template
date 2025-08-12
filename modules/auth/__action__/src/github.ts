import { A, G } from "@template/action";
import {
  AuthResponseSchema,
  FetchGithubProfileInput,
  FetchGithubProfileOutput,
  GenerateGithubAuthUrlInputSchema,
  GenerateGithubAuthUrlOutputSchema,
  HandleCallbackInputSchema,
} from "@template/auth-defs";

export const github = G({
  generateAuthUrl: A("auth.github.generateAuthUrl")
    .input(GenerateGithubAuthUrlInputSchema)
    .output(GenerateGithubAuthUrlOutputSchema),

  handleCallbackUrl: A("auth.github.handleCallback")
    .input(HandleCallbackInputSchema)
    .output(AuthResponseSchema)
    .async(),

  getUserProfile: A("auth.github.getUserProfile")
    .input(FetchGithubProfileInput)
    .output(FetchGithubProfileOutput)
    .async(),
});
