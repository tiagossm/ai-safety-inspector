import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://jkgmgjjtslkozhehwmng.supabase.co'; // URL do seu Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjMwNDAsImV4cCI6MjA1NzI5OTA0MH0.VHL_5dontJ5Zin2cPTrQgkdx-CbnqWtRkVq-nNSnAZg'; // 🔴 Troque pela sua API Key correta

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

if (!supabaseInstance) {
  console.log("✅ Criando nova instância do Supabase client");
  supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
    },
  });
}

export const supabase = supabaseInstance;
