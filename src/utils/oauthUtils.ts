/**
 * Get the appropriate OAuth redirect URL based on the current environment
 */
export function getOAuthRedirectUrl(path: string = '/auth/google/callback'): string {
  // In production (Vercel), use the current origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  
  // Fallback for SSR or edge cases
  return path;
}

/**
 * Build OAuth redirect URL with query parameters
 */
export function buildOAuthRedirectUrl(
  basePath: string = '/auth/google/callback',
  params: Record<string, string> = {}
): string {
  const url = new URL(getOAuthRedirectUrl(basePath));
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
}


