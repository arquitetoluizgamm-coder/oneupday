import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { clienteServico, ehDono } from '../../../lib/dono';
import FilaClient from './FilaClient';

export const dynamic = 'force-dynamic';

function espera(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return 'há menos de uma hora';
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'há 1 dia' : `há ${d} dias`;
}

export default async function FilaComentarios() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) redirect('/login');
  if (!ehDono(user)) redirect('/home');

  const sb = clienteServico();
  let itens = [];
  let semChave = !sb;
  // Sem OPENAI_API_KEY o reprocessamento automático não libera ninguém,
  // de propósito. Se a tela não disser isso, a fila parada vira mistério.
  const semIA = !process.env.OPENAI_API_KEY;

  if (sb) {
    const { data: pend } = await sb.from('comments')
      .select('id, body, user_id, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(200);
    const lista = pend || [];
    const ids = [...new Set(lista.map(c => c.user_id).filter(Boolean))];
    const { data: perfis } = ids.length
      ? await sb.from('profiles').select('id, name').in('id', ids)
      : { data: [] };
    const nome = {}; (perfis || []).forEach(p => { nome[p.id] = p.name; });
    itens = lista.map(c => ({ id: c.id, body: c.body, autor: nome[c.user_id] || '', espera: espera(c.created_at) }));
  }

  return (
    <div className="adm">
      <h2 className="adm-titulo">Comentários esperando revisão</h2>
      <p className="admin-sub">
        Um comentário só cai aqui quando a moderação por IA <strong>não conseguiu rodar</strong> —
        API fora do ar, lenta ou sem resposta. Não é um comentário suspeito: é um comentário
        que ninguém conseguiu ler ainda.
      </p>
      <p className="admin-sub">
        Na maioria das vezes a fila se esvazia sozinha: sempre que alguém comenta e a IA responde,
        o app aproveita e reprocessa os pendentes mais antigos. O botão abaixo faz isso na hora.
      </p>

      {semIA && !semChave && (
        <p className="fila-aviso">
          <strong>A moderação por IA não está configurada.</strong> Falta <code>OPENAI_API_KEY</code>.
          Comentários novos são publicados direto — mas quem já está nesta fila
          <strong> não sai daqui sozinho</strong>: ele foi retido justamente porque a IA
          não conseguiu analisá-lo. Só a sua decisão libera.
        </p>
      )}

      {semChave
        ? <p className="fila-vazia">Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> nas variáveis da Vercel.</p>
        : <FilaClient itens={itens} semIA={semIA} />}
    </div>
  );
}
