import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict, fill } from '../../lib/i18n';
import Logo from '../../components/Logo';
import BottomNav from '../../components/BottomNav';
import MuteTopic from './MuteTopic';

export const dynamic = 'force-dynamic';
const COLORS = ['#ff7a45', '#6c5ce7', '#2563eb', '#16a34a', '#0ea5e9', '#f02f87'];

async function ensureProfile(supabase, user) {
  const meta = user.user_metadata || {};
  const googleAvatar = meta.avatar_url || meta.picture || null;
  const { data: existing } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color, muted_cats, notif_paused').eq('id', user.id).maybeSingle();
  if (existing) {
    if (!existing.avatar_url && googleAvatar) { await supabase.from('profiles').update({ avatar_url: googleAvatar }).eq('id', user.id); existing.avatar_url = googleAvatar; }
    return existing;
  }
  const base = (user.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');
  let handle = '@' + base;
  const { data: taken } = await supabase.from('profiles').select('id').eq('handle', handle).maybeSingle();
  if (taken) handle = '@' + base + Math.floor(1000 + Math.random() * 9000);
  const profile = { id: user.id, name: meta.full_name || meta.name || base, handle, avatar_color: COLORS[Math.floor(Math.random() * COLORS.length)], avatar_url: googleAvatar };
  await supabase.from('profiles').insert(profile);
  return profile;
}

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const profile = await ensureProfile(supabase, user);
  const t = getDict(getLocale());

  const { count: unread } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('recipient_id', user.id).eq('read', false);

  const { data: blk } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
  const blocked = new Set((blk || []).map(b => b.blocked_id));
  const mutedCats = new Set((profile.muted_cats || '').split(',').filter(Boolean));
  const { data: pub } = await supabase.from('journeys')
    .select('id, owner_id, category').eq('visibility', 'public').neq('owner_id', user.id)
    .order('created_at', { ascending: false }).limit(40);
  const targetIds = (pub || []).filter(j => !blocked.has(j.owner_id) && !mutedCats.has(j.category)).map(j => j.id);

  let feed = [];
  if (targetIds.length) {
    const { data: feedUpdates } = await supabase.from('updates')
      .select('id, day_number, kind, text, photo_url, video_url, created_at, journey_id')
      .in('journey_id', targetIds).or('photo_url.not.is.null,video_url.not.is.null')
      .order('created_at', { ascending: false }).limit(24);
    const ups = feedUpdates || [];
    const jIds = [...new Set(ups.map(u => u.journey_id))];
    const { data: js } = await supabase.from('journeys').select('id, slug, title, cover_color, owner_id, category').in('id', jIds);
    const jMap = {}; (js || []).forEach(j => { jMap[j.id] = j; });
    const oIds = [...new Set((js || []).map(j => j.owner_id))];
    const { data: profs } = await supabase.from('profiles').select('id, name, avatar_color, avatar_url, handle').in('id', oIds);
    const pMap = {}; (profs || []).forEach(pr => { pMap[pr.id] = pr; });
    feed = ups.map(u => { const j = jMap[u.journey_id]; if (!j) return null; return { ...u, journey: j, owner: pMap[j.owner_id] || {} }; }).filter(Boolean);
  }
  const kindTag = { setback: t.tagSetback, win: t.tagWin };

  return (
    <>
      <header className="top">
        <Logo href="/home" />
        <div className="top-right">
          <a className="bell" href="/notifications" aria-label={t.notifications}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            {unread > 0 && !profile.notif_paused && <b>{unread > 9 ? '9+' : unread}</b>}
          </a>
          <a className="ghost-btn" href="/explore">{t.explore}</a>
          <a className="header-ava" href="/perfil" aria-label={profile.name} style={{ background: profile.avatar_color || 'var(--orange)' }}>
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : profile.name[0]}
          </a>
        </div>
      </header>

      <main className="wrap feed-page">
        {feed.length === 0 && (
          <div className="feed-invite">
            <b>{t.feedInviteTitle}</b>
            <p>{t.feedInviteSub}</p>
            <a className="cta grow" href="/explore">{t.feedInviteCta}</a>
          </div>
        )}
        {feed.map(f => (
          <article className="mcard" key={f.id}>
            {f.photo_url && <a href={`/${f.journey.slug}`} className="mcard-media"><img src={f.photo_url} alt="" /></a>}
            {f.video_url && !f.photo_url && <div className="mcard-media"><video src={f.video_url} controls playsInline preload="metadata" /></div>}
            <div className="mcard-body">
              <a className="mcard-who" href={`/${f.owner.handle || f.journey.slug}`}>
                <span className="mcard-ava" style={{ background: f.owner.avatar_color || 'var(--orange)' }}>
                  {f.owner.avatar_url ? <img src={f.owner.avatar_url} alt="" /> : (f.owner.name || '?')[0]}
                </span>
                <span className="mcard-id"><b>{f.owner.name}</b><small>{fill(t.dayShort, { d: f.day_number })} · {f.journey.title}</small></span>
              </a>
              {kindTag[f.kind] && <span className={`post-tag ${f.kind}`}>{kindTag[f.kind]}</span>}
              {f.text && f.text !== '\u{1F4F7}' && f.text !== '\u{1F3A5}' && <p>{f.text}</p>}
              <div className="mcard-actions">
                <a className="feed-open" href={`/${f.journey.slug}`}>{t.viewPublic}</a>
                <MuteTopic category={f.journey.category} current={profile.muted_cats} label={t.muteTopic} />
              </div>
            </div>
          </article>
        ))}
      </main>
      <BottomNav active="home" t={t} />
    </>
  );
}
