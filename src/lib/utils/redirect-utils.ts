/**
 * Utility functions for handling redirect messages and URLs
 */

/**
 * Extracts a user-friendly page name from a redirect URL
 * @param redirectUrl - The callback URL or next parameter from search params
 * @returns A user-friendly page name or null if no specific message should be shown
 */
export function getRedirectMessage(redirectUrl: string | null): string | null {
  if (!redirectUrl) {
    return null;
  }

  try {
    // Handle both full URLs and path-only URLs
    const url = redirectUrl.startsWith('http')
      ? new URL(redirectUrl)
      : new URL(redirectUrl, 'http://localhost');

    const pathname = url.pathname.toLowerCase();

    // Don't show message for default dashboard routes (user just clicked login)
    if (pathname === '/dashboard' || pathname === '/') {
      return null;
    }

    // Show message for dashboard subpaths (user was on a specific dashboard page)
    if (pathname.startsWith('/dashboard/')) {
      return 'Please sign in to view your Dashboard';
    }

    // Extract the main route from the pathname
    const segments = pathname.split('/').filter(Boolean);
    const mainRoute = segments[0];

    // Map route names to user-friendly labels
    const routeLabels: Record<string, string> = {
      'settings': 'Settings',
      'parties': 'Parties',
      'characters': 'Characters',
      'encounters': 'Encounters',
      'combat': 'Combat',
      'dashboard': 'Dashboard',
    };

    const label = routeLabels[mainRoute];

    if (label) {
      return `Please sign in to view your ${label}`;
    }

    return null;
  } catch {
    // If URL parsing fails, don't show a message
    return null;
  }
}