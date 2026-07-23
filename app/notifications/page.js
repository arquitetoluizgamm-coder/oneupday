import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import Logo from '../../components/Logo';

export const dynamic = 'force-dynamic';

export default async function Notifications() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const t = getDict(getLocale());

  const { data: notifs } = await supabase.from('notifications')
    .select('*').eq('recipient_id', user.id).order('created_at', { ascending: false }).limit(50);
  const list = notifs || [];

  const actorIds = [...new Set(list.map(n => n.actor_id).filter(Boolean))];
  const jIds = [...new Set(list.map(n => n.journey_id).filter(Boolean))];
  const [{ data: actors }, { data: journeys }] = await Promise.all([
    actorIds.length ? supabase.from('profiles').select('id, name, avatar_url, avatar_color, handle').in('id', actorIds) : Promise.resolve({ data: [] }),
    jIds.length ? supabase.from('journeys').select('id, slug, title').in('id', jIds) : Promise.resolve({ data: [] }),
  ]);
  const aMap = {}; (actors || []).forEach(a => { aMap[a.id] = a; });
  const jMap = {}; (journeys || []).forEach(j => { jMap[j.id] = j; });

  // marca como lidas
  await supabase.from('notifications').update({ read: true }).eq('recipient_id', user.id).eq('read', false);

  return (
    <>
      <header className="top">
        <Logo href="/home" />
        <div className="top-right"><a className="ghost-btn" href="/home">{t.navHome}</a></div>
      </header>
      <main className="wrap">
        <div className="create-head"><p className="eyebrow">{t.notifications}</p><h1>{t.notifications}</h1></div>
        {list.length === 0 && <div className="empty"><b>{t.notifEmpty}</b></div>}
        <div className="notif-list">
          {list.map(n => {
            const a = aMap[n.actor_id] || {};
            const j = jMap[n.journey_id] || {};
            const text = n.type === 'follow'
              ? fill(t.notifFollow, { name: a.name || '' })
              : fill(t.notifEncourage, { name: a.name || '' });
            return (
              <a className={`notif-item${n.read ? '' : ' unread'}`} key={n.id} href={j.slug ? `/${j.slug}` : '/home'}>
                <span className="notif-ava" style={{ background: a.avatar_color || 'var(--orange)' }}>
                  {a.avatar_url ? <img src={a.avatar_url} alt="" /> : (a.name || '?')[0]}
                </span>
                <div><p>{text}</p>{j.title && <small>{j.title}</small>}</div>
              </a>
            );
          })}
        </div>
      </main>
    </>
  );
}
