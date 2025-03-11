
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Define singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

const SUPABASE_URL = "https://jkgmgjjtslkozhehwmng.supabase.co";
<<<<<<< HEAD
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDQ5MTUsImV4cCI6MjA1NzI4MDkxNX0.4WiEt8e-j4LHUl7PHda6xvb3mXSU1xiDjZxdrqm5TqU";
=======
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcwNDkxNSwiZXhwIjoyMDU3MjgwOTE1fQ.NaWBX7qlpKAdZPqQ2hTfvjLXFhGNADXbYP5-QhkasSo";
>>>>>>> f58c3ae7f17570ff321b7998afafada0896ad29c

function createSupabaseClient() {
  // Only create the client once
  if (!supabaseInstance) {
    console.log("✅ Creating new Supabase client instance");
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

