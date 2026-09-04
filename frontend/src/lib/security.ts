/**
 * Open Redirect Protection Utility
 *
 * Validates that a redirection target is strictly a relative internal path.
 * Disallows protocol-relative URLs (e.g. "//evil.com") and absolute external schemes ("https://evil.com").
 *
 * @param url The raw redirect string (typically from URL search params)
 * @param fallback Safe default destination (defaults to '/chat')
 */
export function getSafeRedirectUrl(url: string | null | undefined, fallback = '/chat'): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();

  // Must start with '/' but NOT '//' or '/\' (protocol-relative / Windows path escape)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Must not contain scheme delimiter
  if (trimmed.includes('://')) {
    return fallback;
  }

  return trimmed;
}
