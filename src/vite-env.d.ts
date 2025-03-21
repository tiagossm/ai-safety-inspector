/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
  // other env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add types for cache control functions
interface Window {
  refreshApp?: () => void;
  versionedUrl?: (url: string) => string;
  checkConnection?: () => {
    online: boolean;
    type: string;
    version: string;
  };
  // Add ImageCapture to Window interface
  ImageCapture?: {
    prototype: ImageCapture;
    new(track: MediaStreamTrack): ImageCapture;
  }
}

// Add Connection API type definitions
interface Navigator {
  connection?: {
    type: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    onchange?: () => void;
  };
}

// Add SyncManager interface for background sync
interface SyncManager {
  register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistration {
  sync?: SyncManager;
}

// Add ImageCapture API type definitions
interface ImageCapture {
  grabFrame(): Promise<ImageBitmap>;
  takePhoto(): Promise<Blob>;
}
