import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 🔹 Usar as variáveis de ambiente corretamente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jkgmgjjtslkozhehwmng.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// 🔹 Testar se as variáveis foram carregadas corretamente
console.log("✅ URL do Supabase:", SUPABASE_URL);
console.log("✅ API Key do Supabase:", SUPABASE_ANON_KEY ? "OK" : "❌ Faltando!");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("🚨 ERRO: Supabase URL ou API Key não configurados corretamente.");
}

// 🔹 Criar o cliente do Supabase com as variáveis seguras
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
