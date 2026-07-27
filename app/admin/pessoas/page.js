import { clienteServico } from '../../../lib/dono';
import PessoasClient from './PessoasClient';

export const dynamic = 'force-dynamic';

export default async function Pessoas() {
  const sb = clienteServico();
  if (!sb) {
    return <p className="fila-vazia">Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> nas variáveis da Vercel.</p>;
  }

  const [{ data: perfis }, { data: jornadas }, { data: posts }, { data: denuncias }] = await Promise.all([
    sb.from('profiles').select('id, name, handle, created_at, origem, suspenso_em, suspenso_motivo')
      .order('created_at', { ascending: false }).limit(500),
    sb.from('journeys').select('id, owner_id'),
    sb.from('updates').select('journey_id, created_at'),
    sb.from('reports').select('reporter_id, update_id'),
  ]);

  // e-mail mora em auth.users, não em profiles
  const email = {};
  try {
    const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    (data?.users || []).forEach(u => { email[u.id] = u.email || ''; });
  } catch { }

  // dono de cada jornada, para contar post por pessoa
  const donoDaJornada = {};
  (jornadas || []).forEach(j => { donoDaJornada[j.id] = j.owner_id; });

  const contaJornada = {}, contaPost = {}, ultimo = {};
  (jornadas || []).forEach(j => { contaJornada[j.owner_id] = (contaJornada[j.owner_id] || 0) + 1; });
  (posts || []).forEach(u => {
    const dono = donoDaJornada[u.journey_id];
    if (!dono) return;
    contaPost[dono] = (contaPost[dono] || 0) + 1;
    const t = new Date(u.created_at).getTime();
    if (!ultimo[dono] || t > ultimo[dono]) ultimo[dono] = t;
  });

  // denúncia é feita CONTRA um post; o alvo é o dono do post
  const donoDoPost = {};
  (posts || []).forEach(() => { });
  const { data: postsIds } = await sb.from('updates').select('id, journey_id');
  (postsIds || []).forEach(u => { donoDoPost[u.id] = donoDaJornada[u.journey_id]; });
  const contaDenuncia = {};
  (denuncias || []).forEach(r => {
    const alvo = donoDoPost[r.update_id];
    if (alvo) contaDenuncia[alvo] = (contaDenuncia[alvo] || 0) + 1;
  });

  const itens = (perfis || []).map(p => ({
    id: p.id,
    nome: p.name || '',
    handle: p.handle || '',
    email: email[p.id] || '',
    entrou: p.created_at,
    origem: p.origem || '',
    jornadas: contaJornada[p.id] || 0,
    dias: contaPost[p.id] || 0,
    ultimo: ultimo[p.id] || null,
    denuncias: contaDenuncia[p.id] || 0,
    suspenso: !!p.suspenso_em,
    motivo: p.suspenso_motivo || '',
  }));

  return <PessoasClient itens={itens} />;
}
