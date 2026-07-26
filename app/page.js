import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';
import Logo from '../components/Logo';
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';
import ProgressBar from '../components/ProgressBar';
import Track from '../components/Track';

export const dynamic = 'force-dynamic';

// Curadoria manual (futuro): defina LANDING_FEATURED_JOURNEY_SLUG na Vercel
// para destacar UMA jornada real escolhida a dedo. Sem a variável, a landing
// mostra sempre a demonstração fixa — nunca conteúdo automático sem curadoria.
async function loadFeatured() {
  const slug = process.env.LANDING_FEATURED_JOURNEY_SLUG;
  if (!slug) return null;
  try {
    const { getSupabase } = await import('../lib/supabase');
    const sb = getSupabase();
    const { data: journey } = await sb.from('journeys')
      .select('id, slug, title, cover_color, total_days, owner_id')
      .eq('slug', slug).eq('visibility', 'public').maybeSingle();
    if (!journey) return null;
    const [{ data: stats }, { data: photo }, { data: owner }] = await Promise.all([
      sb.from('journey_stats').select('*').eq('journey_id', journey.id).maybeSingle(),
      sb.from('updates').select('photo_url').eq('journey_id', journey.id).not('photo_url', 'is', null).order('day_number', { ascending: false }).limit(1).maybeSingle(),
      sb.from('profiles').select('name, avatar_color, avatar_url').eq('id', journey.owner_id).maybeSingle(),
    ]);
    if (!stats || (stats.current_day || 0) < 1) return null;
    return { journey, stats, owner: owner || {}, photo: photo?.photo_url || null };
  } catch (e) { return null; }
}

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/home');
  const t = getDict(getLocale());
  const featured = await loadFeatured();

  // Demonstração fixa e controlada — a primeira impressão da marca não
  // depende das fotos dos primeiros usuários.
  const demo = {
    name: t.landDemoName,
    title: t.landDemoTitle,
    update: t.landDemoUpdate,
    badge: t.landDemoBadge,
    day: 12,
    total: 30,
  };

  const ideas = [
    { k: 'start', b: t.ideaStart, l: t.ideaStartL, d: 'M12 5v14M5 12h14' },
    { k: 'share', b: t.ideaShare, l: t.ideaShareL, d: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13' },
    { k: 'support', b: t.ideaSupport, l: t.ideaSupportL, d: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z' },
    { k: 'continue', b: t.ideaContinue, l: t.ideaContinueL, d: 'M5 12h14M13 6l6 6-6 6' },
  ];

  return (
    <>
      <header className="top land-top"><Logo href="/" size={40} showText /></header>

      <Track type="landing_view" />
      <main className="landing">
        <section className="land-hero">
          {/* O h1 precisa ser o nome do app: a verificacao de marca do Google
              compara o nome da tela de consentimento com o titulo principal
              da pagina. A frase de marketing continua logo abaixo, no mesmo
              tamanho de antes — muda a tag, nao o peso visual. */}
          <h1 className="land-brand">One Up Day</h1>
          <p className="land-headline">{t.landHeadline}</p>
          <p className="land-sub">{t.landSub}</p>
          <p className="land-identity"><span>{t.landIdentity1}</span><b>{t.landIdentity2}</b></p>
          <a className="cta grow land-cta" href="/login">{t.landCta}</a>
          <p className="land-safety">{t.landExplain}</p>
        </section>

        {/* Exigido pela verificação de marca do Google: a página inicial
            precisa dizer, em texto, o nome do app e para que ele serve. */}
        <section className="land-about">
          <h2>{t.aboutTitle}</h2>
          <p>{t.aboutText}</p>
          <p className="land-about-data">{t.aboutData}</p>
        </section>

        <section className="land-see">
          <p className="see-1">{t.landSeeTitle1}</p>
          <p className="see-2">{t.landSeeTitle2}</p>
        </section>

        {featured ? (
          <section className="land-demo">
            <span className="land-demo-label">{t.demoLabel}</span>
            <a className="demo-card" href={`/${featured.journey.slug}`}>
              <div className="demo-cover" style={featured.photo
                ? { backgroundImage: `linear-gradient(180deg, rgba(9,12,42,.05), rgba(9,12,42,.55)), url(${featured.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: `linear-gradient(135deg, var(--night), ${featured.journey.cover_color})` }}>
                <span className="demo-day">{t.cardDay} {featured.stats.current_day || 0}</span>
              </div>
              <div className="demo-body">
                <div className="demo-who">
                  <span className="demo-ava" style={{ background: featured.owner.avatar_color || 'var(--orange)' }}>
                    {featured.owner.avatar_url ? <img src={featured.owner.avatar_url} alt="" /> : (featured.owner.name || '?')[0]}
                  </span>
                  <b>{featured.journey.title}</b>
                </div>
                <ProgressBar day={featured.stats.current_day || 0} total={featured.journey.total_days} dayTpl={t.dayXofY} goalWord={t.goalWord} />
              </div>
            </a>
          </section>
        ) : (
          <section className="land-demo">
            <span className="land-demo-label">{t.demoLabelDemo}</span>
            <a className="demo-card" href="/login">
              <div className="demo-cover" style={{ backgroundImage: 'linear-gradient(180deg, rgba(9,12,42,.05), rgba(9,12,42,.55)), url(/demo-cover.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <span className="demo-day">{t.cardDay} {demo.day}</span>
                <span className="demo-example">{t.demoExample}</span>
              </div>
              <div className="demo-body">
                <div className="demo-who">
                  <span className="demo-ava" style={{ background: 'var(--orange)' }}>
                    <img src="/demo-avatar.jpg" alt="" />
                  </span>
                  <b>{demo.title}</b>
                  <span className="demo-flag">{demo.badge}</span>
                </div>
                <p className="demo-update">{demo.update}</p>
                <ProgressBar day={demo.day} total={demo.total} dayTpl={t.dayXofY} goalWord={t.goalWord} />
              </div>
            </a>
          </section>
        )}

        <section className="land-ideas-wrap">
          <p className="ideas-intro">{t.landDemoCaption}</p>
          <div className="land-ideas ideas-4">
            {ideas.map(i => (
              <div key={i.k}>
                <span className="idea-ico">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={i.d} /></svg>
                </span>
                <b>{i.b}</b>
                <span className="idea-l">{i.l}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="examples land-somewhere">
          <b>{t.examplesTitle}</b>
          <div className="example-pills">
            {[t.landEx1, t.landEx2, t.landEx3, t.landEx4, t.landEx5].map((ex, i) => (
              <a key={i} href="/login" className="example-pill">{ex}</a>
            ))}
          </div>
          <p className="somewhere-note">{t.landExNote1}<b> {t.landExNote2}</b></p>
        </section>

        <section className="land-close">
          <p className="close-1">{t.landClose1}</p>
          <p className="close-2">{t.landClose2}</p>
          <a className="cta grow land-cta" href="/login">{t.landCloseCta}</a>
        </section>
      </main>

      <footer className="foot"><p>One <b>Up</b> Day · {t.tagline} · <a href="/regras" style={{color:"inherit"}}>{t.rulesTitle}</a> · <a href="/privacidade" style={{color:"inherit"}}>{getLocale().startsWith('pt') ? 'Privacidade' : 'Privacy'}</a></p><p className="foot-care">{t.notTherapy}</p></footer>
    </>
  );
}
