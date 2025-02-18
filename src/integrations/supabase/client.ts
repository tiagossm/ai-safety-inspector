
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Usar as variáveis de ambiente do Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("🚨 ERRO: Supabase URL ou API Key não configurados corretamente.");
}

export const supabase = createClient<Database>(
  SUPABASE_URL || "",
  SUPABASE_ANON_KEY || ""
);
