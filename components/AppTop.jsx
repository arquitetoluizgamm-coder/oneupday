import { createClient } from '../lib/supabase/server';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';
import BackBtn from './BackBtn';
import Logo, { Wordmark } from './Logo';
import LanguagePicker from './LanguagePicker';

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
// Agora é um componente só. A marca no meio e o avatar à direita
// são sempre iguais; o que muda é o canto esquerdo:
//
//   · feed (`sino`)  → [sino]    [marca] [avatar]
//   · demais páginas → [voltar]  [marca] [avatar]
//   · sem conta      → [marca] [começar sua jornada]
//
// O sino mora no feed porque é de lá que se sai para ver quem
// apoiou. Nas outras telas a pessoa entrou para fazer uma coisa —
// o que ela precisa ali é do caminho de volta.
// ============================================================

// Os números do sino. Ficam aqui para nenhuma página precisar
// saber como se conta um "novo" — e podem vir de fora quando a
// página já os calculou (é o caso da home).
export default async function AppTop({
  sino = false,            // true só no feed
  backHref = '/home', backLabel,
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const locale = getLocale();
  const t = getDict(locale);

  // Sem conta: marca e o convite. Sem sino e sem avatar — não há
  // notificação para ver nem perfil para abrir.
  if (!user) {
    return (
      <header className="top top-visita">
        <Logo />
        <div className="top-right">
          <LanguagePicker current={locale} />
          <a className="cta" href="/login">{t.startYourJourney}</a>
        </div>
      </header>
    );
  }

  // Contar sinal só faz sentido onde o sino aparece. Fora do feed
  // isso seria meia dúzia de consultas por página para desenhar nada.
  return (
    // `top-feed` só no feed. É ele que liga o comportamento de
    // aparecer ao rolar e sumir ao parar — e esse comportamento
    // depende do <ScrollChrome/>, que só existe em /home. Nas outras
    // páginas o cabeçalho carrega o botão VOLTAR e não pode sumir
    // nunca.
    <header className={`top top-3${sino ? ' top-feed' : ''}`}>
      <div className="top-left">
        {sino
          ? <span className="top-left-spacer" aria-hidden="true" />
          : <BackBtn fallback={backHref} label={backLabel || t.back} />}
      </div>

      {/* ONE, a abreviação. Este cabeçalho só existe para quem está
          logado — quem está aqui já sabe o que ONE abrevia. */}
      <a className="top-brand" href="/home" aria-label="One Up Day">
        <Wordmark height={26} />
      </a>

      {/* A criação fica concentrada no botão + da navegação inferior. */}
      <div className="top-right" aria-hidden="true" />
    </header>
  );
}
