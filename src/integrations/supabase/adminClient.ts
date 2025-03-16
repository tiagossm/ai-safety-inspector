
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://jkgmgjjtslkozhehwmng.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcyMzA0MCwiZXhwIjoyMDU3Mjk5MDQwfQ.7kXi0M9bazS2j23dJm6WN6jn5tIk5N6--SAiglDgGsY';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
}

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log("✅ Supabase Admin client initialized successfully");
console.log("URL:", SUPABASE_URL);
console.log("SERVICE ROLE KEY (first 10 chars):", SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + "...");
