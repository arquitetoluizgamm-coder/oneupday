import Link from 'next/link';
import { clienteServico } from '../../lib/dono';

export const dynamic = 'force-dynamic';
const DIA = 86400000;

export default async function Painel() {
  const sb = clienteServico();
  if (!sb) return <p className="fila-vazia">Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> nas variáveis da Vercel.</p>;

  const agora = Date.now();
  const [{ data: perfis }, { data: jornadas }, { data: posts }, { count: pend }] = await Promise.all([
    sb.from('profiles').select('id, created_at, suspenso_em'),
    sb.from('journeys').select('id, owner_id, created_at'),
    sb.from('updates').select('journey_id, created_at'),
    sb.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const P = perfis || [], J = jornadas || [], U = posts || [];
  const desde = (lista, dias) => lista.filter(x => agora - new Date(x.created_at).getTime() < dias * DIA).length;

  // Quem publicou pelo menos um dia depois do primeiro: a única
  // medida que separa curiosidade de uso. Cadastro não é adoção.
  const donos = {}; J.forEach(j => { donos[j.id] = j.owner_id; });
  const porPessoa = {};
  U.forEach(u => { const d = donos[u.journey_id]; if (d) porPessoa[d] = (porPessoa[d] || 0) + 1; });
  const voltaram = Object.values(porPessoa).filter(n => n > 1).length;
  const comJornada = new Set(J.map(j => j.owner_id)).size;

  const cartoes = [
    ['Pessoas', P.length, `${desde(P, 7)} nos últimos 7 dias`],
    ['Contas suspensas', P.filter(p => p.suspenso_em).length, ''],
    ['Jornadas', J.length, `${desde(J, 7)} nos últimos 7 dias`],
    ['Dias publicados', U.length, `${desde(U, 7)} nos últimos 7 dias`],
    ['Criaram jornada', comJornada, P.length ? `${Math.round(comJornada / P.length * 100)}% de quem se cadastrou` : ''],
    ['Publicaram mais de um dia', voltaram, comJornada ? `${Math.round(voltaram / comJornada * 100)}% de quem começou` : ''],
  ];

  return (
    <div className="adm">
      {pend > 0 && (
        <p className="fila-aviso">
          <strong>{pend} comentário{pend > 1 ? 's' : ''} esperando revisão.</strong>{' '}
          <Link href="/admin/comentarios">Abrir a fila →</Link>
        </p>
      )}

      <div className="adm-cartoes">
        {cartoes.map(([rot, n, sub]) => (
          <div key={rot} className="adm-cartao">
            <span className="adm-rot">{rot}</span>
            <b className="adm-num">{n}</b>
            {sub && <small>{sub}</small>}
          </div>
        ))}
      </div>

      <p className="adm-nota">
        <b>Publicaram mais de um dia</b> é o número que importa. Cadastro mede curiosidade;
        o segundo dia mede se o app cumpriu a promessa. Se ele cair, nenhum grupo novo
        no Facebook resolve.
      </p>

      <p className="adm-nota">
        <Link href="/metricas">Ver as métricas completas →</Link> — funil, retenção por
        cohort e funil viral.
      </p>
    </div>
  );
}
