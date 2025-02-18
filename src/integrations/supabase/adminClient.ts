
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Usar as variáveis de ambiente do Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY || ""
);
