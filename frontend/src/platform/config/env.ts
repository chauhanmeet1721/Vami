/**
 * Frontend env — only NEXT_PUBLIC_* values are available in the browser.
 * Lives under platform/config (infrastructure adapter), not feature code.
 */
function requirePublicApiUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Copy frontend/.env.example to frontend/.env.local",
    );
  }
  try {
    new URL(value);
  } catch {
    throw new Error(`NEXT_PUBLIC_API_URL must be an absolute URL. Got: ${value}`);
  }
  return value.replace(/\/$/, "");
}

export const env = {
  apiUrl: requirePublicApiUrl(),
} as const;
