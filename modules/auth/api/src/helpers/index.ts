import { AppError } from "@template/error";

/**
 * Appends an appropriate authentication error message to the given redirect URL.
 * This function is useful for OAuth or login flows where you want to communicate
 * the type of error back to the frontend via query parameters (e.g., `/callback?error=session_expired`).
 */
export function appendErrorToRedirectUrl(
  error: AppError | unknown,
  redirectUrl: URL,
) {
  if (error instanceof AppError) {
    switch (error.type) {
      case "NOT_FOUND":
        redirectUrl.searchParams.append("error", "session_expired");
        break;
      case "BAD_REQUEST":
        redirectUrl.searchParams.append("error", "invalid_request");
        break;
      default:
        redirectUrl.searchParams.append("error", "auth_failed");
    }
  } else {
    redirectUrl.searchParams.append("error", "auth_failed");
  }
}

export function getSuccessRedirectUrl(url: URL, authToken: string): string {
  url.pathname = `${url.pathname.replace(/\/$/, "")}/auth`;

  url.searchParams.append("authToken", authToken);

  return url.toString();
}
