import { notFound } from 'next/navigation';
import { getLocale } from '../../../lib/locale';
import { getDict } from '../../../lib/i18n';
import { createClient } from '../../../lib/supabase/server';
import Logo from '../../../components/Logo';
import LevarJornada from './LevarJornada';

export const dynamic = 'force-dynamic';

// ============================================================
// O LINK PESSOAL — ONDE A PROMESSA É PAGA
//
// A tela de confirmação disse: "quando você entrar, a sua jornada
// estará esperando exatamente como você a escreveu hoje".
//
// Esta página é o lugar onde isso acontece — 40 dias depois, em
// outro aparelho, e possivelmente com a pessoa criando a conta com
// um e-mail diferente do que ela digitou lá atrás.
//
// É por isso que o caminho é um TOKEN e não o e-mail. Casar por
// e-mail falharia calado justamente na hora que mais importa, e
// "o app esqueceu de mim" é a ferida exata de quem o ONE quer
// alcançar.
//
// O link vai na resposta que o Fernando manda à mão. O gesto humano
// que ele prometeu é, também, o transporte do dado — as duas
// decisões se sustentam.
//
// ------------------------------------------------------------
// COMO ELE LÊ, SE NINGUÉM PODE LER A TABELA
//
// Pela função `resgatar_convite`, SECURITY DEFINER, que devolve
// UMA coluna de UMA linha achada por UUID. Sem token não se acha
// nada; com o token não se descobre quem é a pessoa — a função não
// devolve e-mail nem data.
// ============================================================
export default async function Convite({ params }) {
  const { token } = params;
  const t = getDict(getLocale());

  // UUID malformado nem chega ao banco.
  const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!RE_UUID.test(String(token || ''))) notFound();

  const supabase = createClient();
  const { data: jornada } = await supabase.rpc('resgatar_convite', { p_token: token });

  if (!jornada) notFound();

  return (
    <>
      <header className="top land-top"><Logo href="/" size={40} /></header>
      <main className="landing convite-page">
        <section className="cv-intro">
          <p className="cv-selo">{t.cvVoltaSelo}</p>
          <h1 className="cv-titulo">{t.cvVoltaTitulo}</h1>
        </section>

        {/* a frase dela, intacta. É o produto inteiro em uma tela. */}
        <div className="cv-card cv-card-volta">
          <span className="cv-card-topo">{t.cvCardTopo}</span>
          <p className="cv-card-texto">{jornada}</p>
        </div>

        <p className="cv-p cv-volta-p">{t.cvVoltaP}</p>

        <LevarJornada tema={jornada} rotulo={t.cvVoltaCta} />
      </main>
      <footer className="foot"><p>One <b>Up</b> Day · {t.tagline}</p></footer>
    </>
  );
}
