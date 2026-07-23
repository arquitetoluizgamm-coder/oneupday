import { createClient } from '@supabase/supabase-js';

// Client de leitura pública (server-side). Usa a chave anon.
// As páginas públicas /[slug] só leem dados de jornadas públicas,
// então a chave anon + RLS já é segura.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
