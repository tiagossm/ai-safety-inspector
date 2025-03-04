
/**
 * Invalidates the service worker cache and reloads the application
 */
export function invalidateCache() {
  if (window.refreshApp) {
    window.refreshApp();
    return true;
  }
  
  // Fallback if refreshApp isn't available
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'INVALIDATE_CACHE'
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
    return true;
  }
  
  // Manual reload as last resort
  window.location.reload();
  return false;
}

/**
 * Adds version parameters to static asset URLs to prevent caching issues
 * @param url The URL to append a version parameter to
 * @returns The URL with a version parameter
 */
export function versionedUrl(url: string): string {
  if (!url) return url;
  
  // Skip URLs that already have version params or are external
  if (url.includes('?v=') || url.includes('http://') || url.includes('https://')) {
    return url;
  }
  
  const appVersion = '1.0.0'; // Should match version in main.tsx
  const timestamp = new Date().getTime(); // Add timestamp for more granular control
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${appVersion}-${timestamp}`;
}

// Add the versionedUrl to the window for use in templates
if (typeof window !== 'undefined') {
  (window as any).versionedUrl = versionedUrl;
}

// Add a type declaration to make TypeScript happy
declare global {
  interface Window {
    refreshApp?: () => void;
    versionedUrl?: (url: string) => string;
  }
}
