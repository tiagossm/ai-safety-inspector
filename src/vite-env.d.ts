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
}
