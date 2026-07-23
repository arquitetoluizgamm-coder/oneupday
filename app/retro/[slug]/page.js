import { redirect, notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { getDict, fill } from '../../../lib/i18n';
import Logo from '../../../components/Logo';
import ShareButton from '../../[slug]/ShareButton';

export const dynamic = 'force-dynamic';

export default async function Retro({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const t = getDict(getLocale());

  const { data: journey } = await supabase.from('journeys')
    .select('*').eq('slug', params.slug).eq('owner_id', user.id).maybeSingle();
  if (!journey) notFound();

  const [{ data: owner }, { data: updates }, { data: stats }] = await Promise.all([
    supabase.from('profiles').select('name, avatar_color, avatar_url').eq('id', user.id).maybeSingle(),
    supabase.from('updates').select('*').eq('journey_id', journey.id).order('day_number', { ascending: true }),
    supabase.from('journey_stats').select('*').eq('journey_id', journey.id).maybeSingle(),
  ]);
  const ups = updates || [];
  const st = stats || {};
  const daysShown = st.days_posted || 0;
  const cameBack = ups.filter(u => u.kind === 'setback').length;
  const pct = Math.min(100, st.progress_pct || 0);
  const latest = ups.length ? ups[ups.length - 1] : null;

  const withPhoto = ups.filter(u => u.photo_url);
  const before = withPhoto[0];
  const now = withPhoto.length > 1 ? withPhoto[withPhoto.length - 1] : null;
  const showBN = before && now && before.id !== now.id;
  const highlights = ups.filter(u => u.kind === 'win' || u.kind === 'setback').slice(-6).reverse();
  const started = new Date(journey.created_at).toLocaleDateString(getLocale() === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <header className="top"><Logo href="/home" /><div className="top-right"><a className="ghost-btn" href="/home">{t.navHome}</a></div></header>
      <main className="wrap">
        <section className="retro-cover" style={{ background: `linear-gradient(135deg, var(--night), ${journey.cover_color})` }}>
          <p className="eyebrow">{t.retroTitle}</p>
          <h1>{journey.title}</h1>
        </section>

        <div className="retro-stats">
          <article><b>{daysShown}</b><span>{t.retroDays}</span></article>
          <article className="hl"><b>{cameBack}</b><span>{t.retroBack}</span></article>
          <article><b>{pct}%</b><span>{t.retroProgress}</span></article>
        </div>

        <p className="retro-started">{fill(t.retroStarted, { d: started })}</p>

        {showBN && (
          <section className="before-now">
            <figure><img src={before.photo_url} alt="" /><figcaption><span>{t.before}</span></figcaption></figure>
            <figure><img src={now.photo_url} alt="" /><figcaption><span>{t.now}</span></figcaption></figure>
          </section>
        )}

        {highlights.length > 0 && (
          <section className="retro-hl">
            <h2>{t.retroHighlights}</h2>
            {highlights.map(u => (
              <article key={u.id} className={`retro-item ${u.kind}`}>
                <span className="retro-day">{fill(t.dayShort, { d: u.day_number })}</span>
                {u.kind === 'setback' ? <span className="post-tag setback">{t.tagSetback}</span> : <span className="post-tag win">{t.tagWin}</span>}
                {u.text && u.text !== '\u{1F4F7}' && u.text !== '\u{1F3A5}' && <p>{u.text}</p>}
              </article>
            ))}
          </section>
        )}

        {ups.length === 0 && <div className="empty"><b>{t.retroNothing}</b></div>}

        <section className="share-card-section">
          <div className="share-copy"><h3>{t.shareTitle}</h3><p>{t.shareSub}</p></div>
          <ShareButton journey={journey} owner={owner} stats={st} latest={latest}
            label={t.shareCard} downloading={t.shareDownloading}
            card={{ day: t.cardDay, of: t.cardOf, streak: t.cardStreak, setback: t.cardSetback }} />
        </section>
      </main>
    </>
  );
}
