import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';
import ProgressBar from '../components/ProgressBar';
import Track from '../components/Track';
import Origem from '../components/Origem';
import Motion from '../components/Motion';
import AnimatedLogo from '../components/AnimatedLogo';
import JornadaExemplo from '../components/JornadaExemplo';
import { exemploJornada } from '../lib/exemploJornada';

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
  const exemplo = exemploJornada(getLocale());

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
      {/* A marca completa: ONE, com "ONE UP DAY" escrito embaixo.
          Esta é a landing — a tela de quem talvez nunca tenha ouvido falar
          do app. A abreviação sozinha não serve aqui: ela precisa vir
          acompanhada do que abrevia. */}
      <header className="top land-top">
        {/* O logo que se desenha: O -> N -> bojo de cima do E -> bojo de
            baixo, uma vez só. Se a animação falhar ou o aparelho pedir
            menos movimento, o que fica na tela é a marca inteira e
            correta — nunca um pedaço. */}
        <a className="land-mark" href="/" aria-label="One Up Day">
          <AnimatedLogo />
        </a>
      </header>

      <Track type="landing_view" />
      <Origem />
      <Motion />
      <main className="landing">

        {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
        <section className="land-hero">
          {/* O h1 é o nome do app por exigência da verificação de marca do
              Google: ele compara o nome da tela de consentimento com o
              título principal da página. Não trocar. */}
          <h1 className="land-brand">One Up Day</h1>
          <p className="land-headline">{t.landHeadline}</p>
          <p className="land-sub">{t.landSub}</p>
          <p className="land-desc">{t.heroDesc}</p>

          <a className="cta grow land-cta" href="/login">{t.landCta}</a>
          <p className="land-onde">{t.heroOnde}</p>
        </section>

        {/* ═══ 2 · O PRODUTO, IMEDIATAMENTE ════════════════════════
            Vem antes de qualquer explicação: a pessoa precisa ver como é
            usar antes de ler por que importa. Tela real, não maquete
            inventada. */}
        <section className="land-acao">
          <h2 className="sec-titulo">{t.acaoT}</h2>

          <div className="acao-palco">
            {/* A jornada desenhada em HTML, não fotografada. Ver o
                comentário em components/JornadaExemplo.jsx. */}
            <div className="acao-tela">
              <JornadaExemplo j={exemplo} t={t} />
            </div>
            <ul className="acao-chamadas">
              <li>{t.acao1}</li>
              <li>{t.acao2}</li>
              <li>{t.acao3}</li>
            </ul>
          </div>
        </section>

        {/* ═══ 3 · COMO FUNCIONA ══════════════════════════════════
            Quatro cartões, textos de uma linha. O texto curto não é
            economia: é o que impede a quebra feia em duas colunas no
            celular — foi exatamente o que cortou os cards antes. */}
        <section className="land-passos" id="como">
          <h2 className="sec-titulo">{t.comoTitle}</h2>
          <div className="passos-grade">
            {[[t.passo1T, t.passo1D, 'M12 5v14M5 12h14'],
              [t.passo2T, t.passo2D, 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
              [t.passo3T, t.passo3D, 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z'],
              [t.passo4T, t.passo4D, 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5']].map(([tt, dd, path], i) => (
              <div className="passo reveal" key={tt} data-atraso={i * 140}>
                <span className="passo-ico">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
                </span>
                <b>{tt}</b>
                <span>{dd}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 4 · O DIFERENCIAL ══════════════════════════════════ */}
        <section className="land-see">
          <p className="see-1">{t.landSeeTitle1}</p>
          <p className="see-2">{t.landSeeTitle2}</p>
          <ul className="dif-lista">
            {(t.dif || []).map((d) => <li key={d}>{d}</li>)}
          </ul>
        </section>

        {/* ═══ 4b · A LINHA QUE PAUSA E CONTINUA ══════════════════
            A tese da marca virando comportamento: o progresso avança,
            para, e recomeça DO MESMO PONTO — nunca do zero.
            Uma execução só. Não reinicia ao subir e descer a página. */}
        <section className="land-tese">
          <div className="linha-tese" aria-hidden="true">
            <span className="lt-trilho"><i className="lt-barra" /></span>
          </div>
          <p className="tese-frase">{t.tesePausa}</p>
        </section>

        {/* ═══ 5 · SEGURANÇA E CONFIANÇA ══════════════════════════
            A pergunta silenciosa de quem vai expor o que está tentando.
            Cada linha aqui é regra que já está no código. */}
        <section className="land-seg">
          <h2 className="sec-titulo">{t.segTitle}</h2>
          <ul className="seg-lista">
            {(t.seg || []).map((c) => (
              <li key={c}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                  strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
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

        {/* ═══ 6 · CTA FINAL ══════════════════════════════════════ */}
        <section className="land-close">
          <p className="close-1">{t.landClose1}</p>
          <p className="close-2">{t.landClose2}</p>
          <a className="cta grow land-cta" href="/login">{t.landCloseCta}</a>
        </section>

        {/* ═══ 7 · DESCRIÇÃO EXIGIDA PELA VERIFICAÇÃO DO GOOGLE ═══
            NÃO REMOVER e NÃO esconder em acordeão nem carregar por
            JavaScript: o robô precisa ler isto no HTML, direto.
            Fica no fim de propósito — cumpre a exigência sem atravessar
            o caminho de quem está decidindo se cria a conta. */}
        <section className="land-sobre">
          <h2>{t.sobreTitle}</h2>
          <p>{t.sobreTexto}</p>
          <p className="sobre-dados">{t.aboutData}</p>
        </section>

      </main>

      <footer className="foot"><p>One <b>Up</b> Day · {t.tagline} · <a href="/regras" style={{color:"inherit"}}>{t.rulesTitle}</a> · <a href="/privacidade" style={{color:"inherit"}}>{getLocale().startsWith('pt') ? 'Privacidade' : 'Privacy'}</a></p><p className="foot-care">{t.notTherapy}</p></footer>
    </>
  );
}
