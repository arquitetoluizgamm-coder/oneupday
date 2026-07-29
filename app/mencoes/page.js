import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import AppTop from '../../components/AppTop';

export const dynamic = 'force-dynamic';

// ============================================================
// ONDE VOCÊ FOI MARCADO
//
// A notificação avisa uma vez e se perde na lista. Esta página é o
// lugar de voltar: todas as vezes em que alguém te marcou, com o
// trecho do que escreveu.
//
// ------------------------------------------------------------
// O QUE ELA NÃO MOSTRA, E POR QUÊ
//
// A tabela `mentions` é legível por qualquer pessoa logada — a
// menção sozinha não conta nada. Mas o REGISTRO tem visibilidade
// própria, e a RLS de `updates` decide se ele volta ou não.
//
// Então uma menção feita num registro que você não pode ver chega
// aqui sem o `update` correspondente. Em vez de mostrar uma linha
// vazia ou um link que dá em nada, ela é descartada: se você não
// pode abrir o conteúdo, ele não aparece na sua lista.
//
// É o mesmo princípio do gatilho de notificação, que não avisa
// sobre jornada não pública. Se eu deixasse passar aqui, esta
// página viraria a porta dos fundos daquela regra.
// ============================================================
export default async function Mencoes() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const t = getDict(getLocale());

  const { data: linhas } = await supabase
    .from('mentions')
    .select('id, created_at, update_id, author_id')
    .eq('profile_id', user.id)
    .not('update_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(60);

  const lista = linhas || [];
  const updateIds = [...new Set(lista.map((m) => m.update_id).filter(Boolean))];
  const autorIds = [...new Set(lista.map((m) => m.author_id).filter(Boolean))];

  const [{ data: ups }, { data: autores }] = await Promise.all([
    updateIds.length
      ? supabase.from('updates').select('id, text, day_number, journey_id, photo_url').in('id', updateIds)
      : Promise.resolve({ data: [] }),
    autorIds.length
      ? supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', autorIds)
      : Promise.resolve({ data: [] }),
  ]);

  const upMap = {}; (ups || []).forEach((u) => { upMap[u.id] = u; });
  const jIds = [...new Set((ups || []).map((u) => u.journey_id).filter(Boolean))];
  const { data: jornadas } = jIds.length
    ? await supabase.from('journeys').select('id, slug, title').in('id', jIds)
    : { data: [] };
  const jMap = {}; (jornadas || []).forEach((j) => { jMap[j.id] = j; });
  const aMap = {}; (autores || []).forEach((a) => { aMap[a.id] = a; });

  // só o que a pessoa realmente pode abrir
  const visiveis = lista.filter((m) => {
    const u = upMap[m.update_id];
    return !!(u && jMap[u.journey_id]);
  });

  return (
    <>
      <AppTop backHref="/perfil" backLabel={t.epCancel} />
      <main className="wrap mencoes-page">
        <p className="eyebrow">{t.mentionsEyebrow}</p>
        <h1 className="mencoes-titulo">{t.mentionsTitle}</h1>
        <p className="mencoes-sub">{t.mentionsSub}</p>

        {!visiveis.length && <p className="tab-empty">{t.mentionsEmpty}</p>}

        <div className="mencoes-lista">
          {visiveis.map((m) => {
            const u = upMap[m.update_id];
            const j = jMap[u.journey_id];
            const a = aMap[m.author_id] || {};
            const trecho = String(u.text || '').trim().slice(0, 160);
            return (
              <a className="mencao-card" key={m.id} href={`/${j.slug}`}>
                <span className="mc-ava" style={{ background: a.avatar_color || 'var(--orange)' }}>
                  {a.avatar_url ? <img src={a.avatar_url} alt="" /> : (a.name || '?').trim().charAt(0).toUpperCase()}
                </span>
                <span className="mc-corpo">
                  <b className="mc-quem">{fill(t.mentionsBy, { name: a.name || '' })}</b>
                  <small className="mc-onde">
                    {j.title} · {fill(t.dayShort, { d: u.day_number })}
                  </small>
                  {trecho && <span className="mc-trecho">{trecho}{u.text.length > 160 ? '…' : ''}</span>}
                </span>
              </a>
            );
          })}
        </div>
      </main>
    </>
  );
}
