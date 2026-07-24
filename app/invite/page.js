import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import Logo from '../../components/Logo';
import Track from '../../components/Track';
import { createClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const t = getDict(getLocale());
  return { title: `One Up Day — ${t.inviteEyebrow}`, description: t.inviteTitle };
}

export default async function Invite() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/home');
  const t = getDict(getLocale());
  return (
    <>
      <header className="top land-top"><Logo href="/" size={40} /></header>
      <Track type="landing_view" meta={{ page: 'invite' }} />
      <main className="landing invite">
        <section className="invite-card">
          <p className="eyebrow">{t.inviteEyebrow}</p>
          <h1>{t.inviteTitle}</h1>
          <p className="invite-p">{t.inviteP1}</p>
          <p className="invite-p strong">{t.inviteP2}</p>
          <p className="invite-p">{t.inviteP3}</p>
          <a className="cta grow land-cta" href="/login">{t.inviteCta}</a>
          <p className="invite-creed">{t.inviteCreed}</p>
        </section>
      </main>
      <footer className="foot"><p>One <b>Up</b> Day · {t.tagline}</p></footer>
    </>
  );
}
