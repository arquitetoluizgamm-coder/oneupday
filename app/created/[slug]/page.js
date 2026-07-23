import { redirect, notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { getDict } from '../../../lib/i18n';
import Logo, { Symbol } from '../../../components/Logo';
import ShareButton from '../../[slug]/ShareButton';

export const dynamic = 'force-dynamic';

export default async function Created({ params }) {
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
  const latest = (updates && updates.length) ? updates[updates.length - 1] : null;

  return (
    <>
      <header className="top"><Logo href="/home" /></header>
      <main className="wrap">
        <section className="success">
          <div className="success-mark"><Symbol size={64} /></div>
          <h1>{t.successTitle}</h1>
          <p>{t.successSub}</p>
          <div className="success-journey">
            <b>{journey.title}</b>
            <span>{t.cardDay} 1 · {journey.total_days} {t.cardOf}</span>
          </div>
          <div className="success-actions">
            <ShareButton journey={journey} owner={owner} stats={stats || {}} latest={latest}
              label={t.successShare} downloading={t.shareDownloading}
              card={{ day: t.cardDay, of: t.cardOf, streak: t.cardStreak, setback: t.cardSetback }} />
            <a className="cta" href={`/${journey.slug}`}>{t.successView}</a>
            <a className="ghost-btn wide" href="/home">{t.successMore}</a>
            <a className="ghost-btn wide" href="/explore">{t.successExplore}</a>
          </div>
        </section>
      </main>
    </>
  );
}
