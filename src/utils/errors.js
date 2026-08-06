const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

export function getUserFriendlyErrorMessage(
  error,
  fallback = DEFAULT_ERROR_MESSAGE,
) {
  const status = Number(error?.status);
  const rawMessage = String(error?.message || "").trim();

  if (!navigator.onLine) {
    return "No internet connection. Please check your network and try again.";
  }

  if (
    !status &&
    /network|timeout|failed to fetch|load failed/i.test(rawMessage)
  ) {
    return "Cannot reach the server right now. Please try again shortly.";
  }

  if (status === 401) {
    return "Your session is invalid or expired. Please log in again.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource was not found.";
  }

  if (status === 409 || /already exists/i.test(rawMessage)) {
    return "This email already exists. Please use a different email.";
  }

  if (status === 422 || status === 400) {
    return (
      rawMessage || "Some fields are invalid. Please review and try again."
    );
  }

  if (
    status === 423 ||
    status === 429 ||
    /lock|locked|24\s*hours?/i.test(rawMessage)
  ) {
    return "Account is temporarily locked after multiple failed login attempts. Please try again in 24 hours or contact support.";
  }

  if (status === 500) {
    return "Server error. Please try again later.";
  }

  if (
    /invalid credentials|wrong password|incorrect password|invalid login/i.test(
      rawMessage,
    )
  ) {
    return "Invalid email or password.";
  }

  return rawMessage || fallback;
}
