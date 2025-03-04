
// Development utilities for service worker

import { getServiceWorkerCode } from './codeGenerator';
import { setupCacheManagement } from './registration';

/**
 * Manually install a service worker for development
 */
export async function installServiceWorkerForDev(): Promise<boolean> {
  try {
    const blob = new Blob([getServiceWorkerCode()], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    
    const registration = await navigator.serviceWorker.register(url, {
      scope: '/'
    });
    
    // Revoke the object URL since the registration is complete
    URL.revokeObjectURL(url);
    
    console.log('Development service worker installed successfully');
    setupCacheManagement(registration);
    return true;
  } catch (error) {
    console.error('Failed to install development service worker:', error);
    return false;
  }
}
