
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jkgmgjjtslkozhehwmng.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNzc0MjYsImV4cCI6MjA1Mzc1MzQyNn0.KVx6pqvHJZ0m-tnI-M_oaBhRoxva0PJRYcaRorKWzEA";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("🚨 ERRO: Supabase URL ou API Key não configurados corretamente.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
