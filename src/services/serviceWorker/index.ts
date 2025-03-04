
// Service Worker Manager module - main export file

import { registerServiceWorker, setupCacheManagement } from './registration';
import { isValidCacheUrl, getCacheName, getAssetsList } from './cacheUtils';
import { getServiceWorkerCode } from './codeGenerator';
import { installServiceWorkerForDev } from './devUtils';

// Export all functionality
export {
  registerServiceWorker,
  setupCacheManagement,
  isValidCacheUrl,
  getCacheName,
  getAssetsList,
  getServiceWorkerCode,
  installServiceWorkerForDev
};

// Main registration function that also sets up cache management
export async function registerAndSetupServiceWorker() {
  const registration = await registerServiceWorker();
  if (registration) {
    setupCacheManagement(registration);
  }
  return registration;
}
