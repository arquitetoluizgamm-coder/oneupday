import Link from 'next/link';
import { clienteServico } from '../../../lib/dono';

export const dynamic = 'force-dynamic';

export default async function Denuncias() {
  const sb = clienteServico();
  if (!sb) return <p className="fila-vazia">Falta <code>SUPABASE_SERVICE_ROLE_KEY</code>.</p>;

  const { data: den } = await sb.from('reports')
    .select('id, reporter_id, update_id, reason, created_at')
    .order('created_at', { ascending: false }).limit(200);
  const lista = den || [];

  const upIds = [...new Set(lista.map(r => r.update_id).filter(Boolean))];
  const { data: ups } = upIds.length
    ? await sb.from('updates').select('id, text, journey_id').in('id', upIds) : { data: [] };
  const jIds = [...new Set((ups || []).map(u => u.journey_id))];
  const { data: js } = jIds.length
    ? await sb.from('journeys').select('id, slug, owner_id').in('id', jIds) : { data: [] };
  const pIds = [...new Set((js || []).map(j => j.owner_id))];
  const { data: ps } = pIds.length
    ? await sb.from('profiles').select('id, name, handle').in('id', pIds) : { data: [] };

  const up = {}; (ups || []).forEach(u => { up[u.id] = u; });
  const jo = {}; (js || []).forEach(j => { jo[j.id] = j; });
  const pe = {}; (ps || []).forEach(p => { pe[p.id] = p; });

  return (
    <div className="adm">
      {lista.length === 0
        ? <p className="fila-vazia">Nenhuma denúncia. É assim que deve ficar.</p>
        : lista.map(r => {
          const u = up[r.update_id]; const j = u && jo[u.journey_id]; const a = j && pe[j.owner_id];
          return (
            <article key={r.id} className="adm-pessoa">
              <div className="adm-linha">
                <div className="adm-quem">
                  <strong>{a ? a.name : 'autor desconhecido'}</strong>
                  {a && <span className="adm-arroba">{a.handle}</span>}
                </div>
                <span className="adm-arroba">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              {r.reason && <p className="adm-motivo">Motivo: {r.reason}</p>}
              {u?.text && <p className="fila-corpo">{String(u.text).slice(0, 300)}</p>}
              <div className="adm-dados">
                {j && <Link href={'/' + j.slug}>ver a jornada →</Link>}
                <Link href="/admin/pessoas">gerenciar a pessoa →</Link>
              </div>
            </article>
          );
        })}
    </div>
  );
}
