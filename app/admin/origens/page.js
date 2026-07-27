import { clienteServico } from '../../../lib/dono';

export const dynamic = 'force-dynamic';

// De onde veio quem se cadastrou. Visita não entra aqui de propósito:
// grupo grande gera visita e não gera ninguém, e olhar visita leva
// a voltar no grupo errado.
export default async function Origens() {
  const sb = clienteServico();
  if (!sb) return <p className="fila-vazia">Falta <code>SUPABASE_SERVICE_ROLE_KEY</code>.</p>;

  const [{ data: perfis }, { data: jornadas }] = await Promise.all([
    sb.from('profiles').select('id, origem'),
    sb.from('journeys').select('owner_id'),
  ]);

  const comJornada = new Set((jornadas || []).map(j => j.owner_id));
  const mapa = {};
  (perfis || []).forEach(p => {
    const k = p.origem || '(sem marcação)';
    mapa[k] = mapa[k] || { cadastros: 0, jornadas: 0 };
    mapa[k].cadastros++;
    if (comJornada.has(p.id)) mapa[k].jornadas++;
  });

  const linhas = Object.entries(mapa).sort((a, b) => b[1].jornadas - a[1].jornadas);

  return (
    <div className="adm">
      <p className="adm-nota">
        Publique cada link com uma marca no fim — <code>oneupday.app/?fb=nome-do-grupo</code>.
        Quem chegar por ele fica marcado por 30 dias, mesmo que só se cadastre dias depois.
      </p>

      {linhas.length === 0 ? (
        <p className="fila-vazia">Ninguém se cadastrou ainda.</p>
      ) : (
        <table className="adm-tab">
          <thead><tr><th>Origem</th><th>Cadastros</th><th>Criaram jornada</th><th></th></tr></thead>
          <tbody>
            {linhas.map(([k, v]) => (
              <tr key={k}>
                <td><b>{k}</b></td>
                <td>{v.cadastros}</td>
                <td>{v.jornadas}</td>
                <td className="adm-taxa">{v.cadastros ? Math.round(v.jornadas / v.cadastros * 100) + '%' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
