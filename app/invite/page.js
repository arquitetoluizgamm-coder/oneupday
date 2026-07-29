import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import Logo from '../../components/Logo';
import Track from '../../components/Track';
import { createClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import FormConvite from './FormConvite';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const t = getDict(getLocale());
  return { title: `One Up Day — ${t.cvTitulo}`, description: t.cvSub };
}

// ============================================================
// /invite — NÃO É UMA LISTA DE ESPERA
//
// A página não tenta convencer ninguém de que o app é bom. Ela
// tenta fazer uma pessoa pensar "esse lugar foi feito para alguém
// como eu" — e a única ação que ela faz é escrever a própria
// jornada.
//
// A sequência é deliberada:
//
//   1. começa pela dor, não pelo produto
//   2. diz o que o ONE é, em uma frase
//   3. mostra como a comunidade funciona
//   4. explica o acesso gradual sem falar em escassez
//   5. convida a pessoa a falar dela, não de nós
//
// ------------------------------------------------------------
// O QUE FOI CORTADO, E POR QUÊ
//
// "Você foi convidado" saiu: numa página pública, é falso no
// instante em que alguém chega.
//
// "Vagas limitadas" saiu: é competição, e competição é o que fez
// essa pessoa parar de postar em outro lugar.
//
// "Não para competir, não para impressionar" saiu: nomear a
// objeção é plantá-la — e "impressionar" é justamente a palavra
// que ela carrega. Ficou só o lado de cá: continuar é progresso.
//
// O contador de pessoas saiu: número inventado, num app cuja marca
// é não fingir que está tudo bem, seria a contradição mais cara
// possível. E número real pequeno lê como produto morto. Nenhum
// número é a única saída que é honesta e não se sabota.
// ============================================================
export default async function Invite() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/home');
  const locale = getLocale();
  const t = getDict(locale);

  return (
    <>
      <header className="top land-top"><Logo href="/" size={40} /></header>
      <Track type="landing_view" meta={{ page: 'invite' }} />

      <main className="landing convite-page">
        <section className="cv-intro">
          <h1 className="cv-titulo">{t.cvTitulo}</h1>
          <p className="cv-sub">{t.cvSub}</p>
          <p className="cv-p">{t.cvComoFunciona}</p>
          <p className="cv-p">{t.cvGradual}</p>
        </section>

        <FormConvite t={t} locale={locale} />
      </main>

      <footer className="foot"><p>One <b>Up</b> Day · {t.tagline}</p></footer>
    </>
  );
}
