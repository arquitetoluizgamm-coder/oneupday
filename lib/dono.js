import { createClient as createAdmin } from '@supabase/supabase-js';

// O mesmo e-mail que já protege /metricas. Está aqui para deixar de
// ser um valor solto em cada arquivo — quando um dia isso virar um
// campo na tabela de perfis, muda-se um lugar só.
export const OWNER_EMAIL = 'arquitetoluizgamm@gmail.com';

export function ehDono(user) {
  return !!user && (user.email || '').toLowerCase() === OWNER_EMAIL;
}

// Cliente com chave de serviço: passa por cima do RLS.
// Usado só onde é inevitável — mudar o status de um comentário não
// tem (e não deve ter) política de UPDATE aberta a ninguém.
export function clienteServico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return null;
  return createAdmin(url, chave, { auth: { persistSession: false } });
}
