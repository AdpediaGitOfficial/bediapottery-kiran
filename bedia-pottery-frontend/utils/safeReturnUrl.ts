/**
 * Returns `returnUrl` only if it is a same-site relative path, otherwise "/".
 *
 * Blocks absolute URLs, protocol-relative URLs ("//evil.com") and the
 * backslash variants browsers normalise to "/" ("/\evil.com", "/\\evil.com"),
 * which would otherwise turn a login redirect into an open redirect.
 */
export function getSafeReturnUrl(returnUrl: string | null | undefined): string {
  if (!returnUrl) return "/";

  if (!returnUrl.startsWith("/")) return "/";
  if (returnUrl.startsWith("//") || returnUrl.startsWith("/\\")) return "/";
  // Control characters / backslashes can be used to smuggle a host.
  if (/[\\\u0000-\u001f]/.test(returnUrl)) return "/";

  return returnUrl;
}
