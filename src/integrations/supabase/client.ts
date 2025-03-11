
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Define singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

const SUPABASE_URL = "https://jkgmgjjtslkozhehwmng.supabase.co";
<<<<<<< HEAD
<<<<<<< HEAD
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjMwNDAsImV4cCI6MjA1NzI5OTA0MH0.VHL_5dontJ5Zin2cPTrQgkdx-CbnqWtRkVq-nNSnAZg";
=======
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcyMzA0MCwiZXhwIjoyMDU3Mjk5MDQwfQ.7kXi0M9bazS2j23dJm6WN6jn5tIk5N6--SAiglDgGsY";
>>>>>>> f58c3ae7f17570ff321b7998afafada0896ad29c
=======
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcyMzA0MCwiZXhwIjoyMDU3Mjk5MDQwfQ.7kXi0M9bazS2j23dJm6WN6jn5tIk5N6--SAiglDgGsY";
>>>>>>> cbc7c027abf84e9f7ac4045606d92314fe5f3d63

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
