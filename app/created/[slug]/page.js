import { redirect, notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { getDict } from '../../../lib/i18n';
import Logo, { Symbol } from '../../../components/Logo';
import ShareButton from '../../[slug]/ShareButton';
import Dia1Card from '../../[slug]/Dia1Card';
import ChallengeButton from '../../[slug]/ChallengeButton';

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
            <Dia1Card journey={journey} owner={owner} theme={journey.title}
              label={t.dia1CardBtn} downloading={t.shareDownloading}
              texts={{ eyebrow: t.dia1Eyebrow, big: t.dia1Big, invite: t.dia1Invite, by: t.dia1By }} />
            <ChallengeButton slug={journey.slug} theme={journey.title}
              label={t.challengeBtn} copiedLabel={t.linkCopied} message={t.challengeMsg} />
            <a className="ghost-btn wide" href={`/${journey.slug}`}>{t.successContinue}</a>
          </div>
        </section>
      </main>
    </>
  );
}
