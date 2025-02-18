
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabaseAdmin = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || 'https://jkgmgjjtslkozhehwmng.supabase.co',
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODE3NzQyNiwiZXhwIjoyMDUzNzUzNDI2fQ.S6LmDWEJhzgzuVwhdLFkFaHJnAKQKOKrEfSTogRv5W0',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);
