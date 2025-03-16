
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jkgmgjjtslkozhehwmng.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcwNDkxNSwiZXhwIjoyMDU3MjgwOTE1fQ.4WiEt8e-j4LHUl7PHda6xvb3mXSU1xiDjZxdrqm5TqU";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
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
