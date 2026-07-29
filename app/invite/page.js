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
  return { title: `One Up Day - ${t.cvTitulo}`, description: t.cvSub };
}

// ============================================================
// /invite â€” NÃƒO Ã‰ UMA LISTA DE ESPERA
//
// A pÃ¡gina nÃ£o tenta convencer ninguÃ©m de que o app Ã© bom. Ela
// tenta fazer uma pessoa pensar "esse lugar foi feito para alguÃ©m
// como eu" â€” e a Ãºnica aÃ§Ã£o que ela faz Ã© escrever a prÃ³pria
// jornada.
//
// A sequÃªncia Ã© deliberada:
//
//   1. comeÃ§a pela dor, nÃ£o pelo produto
//   2. diz o que o ONE Ã©, em uma frase
//   3. mostra como a comunidade funciona
//   4. explica o acesso gradual sem falar em escassez
//   5. convida a pessoa a falar dela, nÃ£o de nÃ³s
//
// ------------------------------------------------------------
// O QUE FOI CORTADO, E POR QUÃŠ
//
// "VocÃª foi convidado" saiu: numa pÃ¡gina pÃºblica, Ã© falso no
// instante em que alguÃ©m chega.
//
// "Vagas limitadas" saiu: Ã© competiÃ§Ã£o, e competiÃ§Ã£o Ã© o que fez
// essa pessoa parar de postar em outro lugar.
//
// "NÃ£o para competir, nÃ£o para impressionar" saiu: nomear a
// objeÃ§Ã£o Ã© plantÃ¡-la â€” e "impressionar" Ã© justamente a palavra
// que ela carrega. Ficou sÃ³ o lado de cÃ¡: continuar Ã© progresso.
//
// O contador de pessoas saiu: nÃºmero inventado, num app cuja marca
// Ã© nÃ£o fingir que estÃ¡ tudo bem, seria a contradiÃ§Ã£o mais cara
// possÃ­vel. E nÃºmero real pequeno lÃª como produto morto. Nenhum
// nÃºmero Ã© a Ãºnica saÃ­da que Ã© honesta e nÃ£o se sabota.
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

      {/* ============================================================
          A ORDEM MUDOU, O TEXTO NÃƒO

          Antes: tÃ­tulo, subtÃ­tulo e DOIS parÃ¡grafos explicativos â€”
          367px de prosa â€” e sÃ³ entÃ£o a pergunta. Numa tela de 390 a
          aÃ§Ã£o comeÃ§ava a 44% da altura; num iPhone SE o botÃ£o ficava
          fora da dobra.

          Medido tambÃ©m: a pergunta, que Ã© a Ãºnica coisa que a pessoa
          faz aqui, tinha peso 400 â€” mais leve que o subtÃ­tulo, que
          tem 650. O item mais importante da pÃ¡gina era o mais fraco
          dela.

          Agora a pÃ¡gina tem trÃªs tempos claros:

            1. o convite      tÃ­tulo + uma linha
            2. O LUGAR        pergunta, campo, botÃ£o â€” num bloco sÃ³
            3. o rodapÃ©       como funciona, para quem quiser ler

          O que explica o app desceu para depois da aÃ§Ã£o. NÃ£o sumiu:
          quem precisa de contexto rola dez centÃ­metros. Quem jÃ¡
          entendeu no tÃ­tulo escreve na hora.
          ============================================================ */}
      <main className="landing convite-page">
        <section className="cv-intro">
          <h1 className="cv-titulo">{t.cvTitulo}</h1>
          <p className="cv-sub">{t.cvSub}</p>
        </section>

        <FormConvite t={t} locale={locale} />

        {/* Depois do bloco: o que era o meio da pÃ¡gina. Aqui embaixo
            ele deixa de competir com a aÃ§Ã£o e vira o que sempre foi â€”
            explicaÃ§Ã£o para quem quer. */}
        <section className="cv-depois">
          <p className="cv-p">{t.cvComoFunciona}</p>
          <p className="cv-p">{t.cvGradual}</p>
        </section>
      </main>

      <footer className="foot"><p>One <b>Up</b> Day Â· {t.tagline}</p></footer>
    </>
  );
}

