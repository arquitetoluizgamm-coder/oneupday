import { createClient } from '../lib/supabase/server';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';
import HeaderHeart from './HeaderHeart';
import Logo from './Logo';

// ============================================================
// TOPO — um só, para todo o app
//
// Existiam três topos diferentes: a home tinha [sino] [marca]
// [avatar]; as páginas internas tinham [voltar] [marca] [avatar];
// e as páginas públicas (ver público, jornada) tinham [marca]
// [começar sua jornada] — inclusive para quem já estava logado.
//
// Resultado: a pessoa saía do perfil, tocava em "ver público" e
// o app parecia outro app, sem sino e sem avatar, oferecendo que
// ela criasse a conta que ela já tinha.
//
// Agora é um componente com duas caras, decididas pela sessão:
//   · com conta  → [sino] [marca] [avatar]
//   · sem conta  → [marca] [começar sua jornada]
//
// O botão "voltar" saiu. Não porque atrapalhava, mas porque era a
// única coisa que quebrava o padrão — e o caminho de volta existe
// em três outros lugares: o botão do Android, o gesto do
// navegador e a barra de baixo.
// ============================================================

// Os números do sino. Ficam aqui para nenhuma página precisar
// saber como se conta um "novo" — e podem vir de fora quando a
// página já os calculou (é o caso da home).
async function contarSinais(sb, userId) {
  let unread = 0, likes = 0;
  const seguidores = new Set();
  try {
    const { count } = await sb.from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId).eq('read', false);
    unread = count || 0;
  } catch { }
  try {
    const { data: js } = await sb.from('journeys').select('id').eq('owner_id', userId);
    const jIds = (js || []).map((j) => j.id);
    if (jIds.length) {
      const { data: ups } = await sb.from('updates').select('id').in('journey_id', jIds);
      const uIds = (ups || []).map((u) => u.id);
      if (uIds.length) {
        const { count } = await sb.from('encouragements')
          .select('*', { count: 'exact', head: true })
          .in('update_id', uIds).neq('user_id', userId);
        likes = count || 0;
      }
      const { data: jf } = await sb.from('follows').select('user_id').in('journey_id', jIds);
      (jf || []).forEach((f) => seguidores.add(f.user_id));
    }
    const { data: pf } = await sb.from('profile_follows').select('follower_id').eq('following_id', userId);
    (pf || []).forEach((f) => seguidores.add(f.follower_id));
  } catch { }
  seguidores.delete(userId);
  return { unread, likes, follows: seguidores.size };
}

export default async function AppTop({ likes, follows, unread, avatarStyle }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = getDict(getLocale());

  // Sem conta: marca e o convite. Sem sino e sem avatar — não há
  // notificação para ver nem perfil para abrir.
  if (!user) {
    return (
      <header className="top top-visita">
        <Logo />
        <div className="top-right">
          <a className="cta" href="/login">{t.startYourJourney}</a>
        </div>
      </header>
    );
  }

  const { data: profile } = await supabase.from('profiles')
    .select('name, handle, avatar_url, avatar_color').eq('id', user.id).maybeSingle();

  // se a página já contou, não conta de novo
  const jaTem = unread !== undefined && likes !== undefined && follows !== undefined;
  const sinais = jaTem ? { unread, likes, follows } : await contarSinais(supabase, user.id);

  return (
    <header className="top top-3">
      <div className="top-left">
        <HeaderHeart likes={sinais.likes} follows={sinais.follows}
          unread={sinais.unread} ariaLabel={t.notifications} />
      </div>

      <a className="top-brand" href="/home" aria-label="One Up Day">
        <img src="/logo-name.png" alt="One Up Day" />
      </a>

      <div className="top-right">
        {profile && (
          <a className="header-ava" href="/perfil" aria-label={profile.name || ''}
            style={{ background: profile.avatar_color || 'var(--orange)', ...(avatarStyle || {}) }}>
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile.name || '?')[0]}
          </a>
        )}
      </div>
    </header>
  );
}
