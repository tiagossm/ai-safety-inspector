
// Cache-related utilities for service worker

const CACHE_NAME = 'safetybpm-cache-v2';

// List of assets to pre-cache
const ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/styles.css'
];

/**
 * Check if the URL is valid for caching
 */
export function isValidCacheUrl(url: string): boolean {
  // Only cache HTTP/HTTPS URLs or relative URLs
  return url.startsWith('http') || url.startsWith('/');
}

/**
 * Get the cache name used by the service worker
 */
export function getCacheName(): string {
  return CACHE_NAME;
}

/**
 * Get the list of assets to pre-cache
 */
export function getAssetsList(): string[] {
  return ASSETS;
}
