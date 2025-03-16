
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Define singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Read from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables!");
}

function createSupabaseClient() {
  // Only create the client once
  if (!supabaseInstance) {
    console.log("✅ Creating new Supabase client instance");
    console.log("URL:", SUPABASE_URL);
    console.log("ANON KEY (first 10 chars):", SUPABASE_ANON_KEY?.substring(0, 10) + "...");
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase environment variables. Check your .env file.");
    }
    
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'supabase_auth_token'
      },
    });
  }
  return supabaseInstance;
}

// Export a singleton instance
export const supabase = createSupabaseClient();

// Log to confirm the client is initialized
console.log("✅ Supabase client initialized successfully");
