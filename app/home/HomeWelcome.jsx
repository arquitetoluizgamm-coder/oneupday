'use client';
import { useEffect, useState } from 'react';

// ============================================================
// A TELA DE ENTRADA DE QUEM JÁ TEM JORNADA
//
// A aposta dela continua a mesma, e é rara: quase toda rede abre
// no feed, porque feed retém. Esta abre no seu compromisso.
//
// Quatro mudanças, e a primeira era um defeito de verdade.
//
// 1 · ELA PASSOU A SABER SE VOCÊ JÁ REGISTROU HOJE
//
//     A página já buscava todos os seus registros, mas não olhava
//     a data. Então quem registrava às 8h e voltava às 20h ouvia
//     "como você quer continuar hoje?" de novo, com um botão
//     cobrando o que já tinha sido feito.
//
//     Para um app cuja tese é presença, ignorar que a pessoa já
//     apareceu é ignorar a única coisa que ele deveria celebrar.
//     Agora o tom muda: quem já registrou é recebido com o fato,
//     não com a cobrança.
//
// 2 · A JORNADA VEM ANTES DO DIÁRIO
//
//     Quem abre com 30 dias em andamento vem pela jornada. O
//     diário é um lugar bonito e secundário; na primeira posição
//     ele competia com o motivo de a pessoa ter aberto o app.
//
// 3 · O BOTÃO LEVA A UM LUGAR, NÃO A UMA LISTA
//
//     "Registrar o dia" ia para /perfil. Com uma jornada só isso é
//     uma parada no meio do caminho — agora ele vai direto para
//     ela. Com várias, o rótulo passa a dizer que é uma escolha.
//
// 4 · O FEED DEIXOU DE SER "PULAR"
//
//     "Pular e explorar o feed" tratava como estorvo o lugar onde
//     mora a comunidade. E quando há apoio esperando, o número já
//     está carregado na página: dizer quantas pessoas apareceram
//     transforma uma saída de emergência num convite.
// ============================================================

function diaAtual(jornada) {
  if (jornada.current_day) return jornada.current_day;
  const inicio = jornada.start_date || jornada.created_at;
  if (!inicio) return 1;
  return Math.max(1, Math.floor((Date.now() - new Date(inicio).getTime()) / 86400000) + 1);
}

export default function HomeWelcome({ journeys = [], name = '', naoLidas = 0, labels = {} }) {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    try { if (sessionStorage.getItem('oud-home-welcome-seen') === '1') setVisivel(false); } catch {}
  }, []);

  function sair() {
    try { sessionStorage.setItem('oud-home-welcome-seen', '1'); } catch {}
    setVisivel(false);
    requestAnimationFrame(() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  if (!visivel) return null;
  const primeiroNome = (name || '').split(' ')[0];
  const temJornadas = journeys.length > 0;
  const L = labels;

  const pendentes = journeys.filter((j) => !j.hoje);
  const jaRegistrou = temJornadas && pendentes.length === 0;

  const alvo = pendentes.length === 1 ? `/perfil/jornada/${pendentes[0].slug}` : '/perfil';
  const rotuloPrimario = pendentes.length === 1 ? L.register : (L.choose || L.register);

  // O mesmo cartão, com uma frase diferente na primeira vez: ali ele
  // precisa se explicar como ALTERNATIVA ("se preferir escrever só
  // para você, por enquanto"), não como o que o app faz.
  const cartaoDiario = (sub) => (
    <a className="home-welcome-journey home-welcome-diary" href="/diario">
      <span><b>{L.diaryTitle}</b><small>{sub}</small></span>
      <strong aria-hidden="true">›</strong>
    </a>
  );
  const diario = cartaoDiario(L.diarySub);

  return (
    <section className="home-welcome" aria-labelledby="home-welcome-title">
      <div className="home-welcome-mark"><img className="upi-char bob" src="/upi.svg" alt="Upi" /></div>
      <span className="home-welcome-eyebrow">
        {temJornadas ? (L.backEyebrow || '').replace('{name}', primeiroNome) : L.newEyebrow}
      </span>
      <h1 id="home-welcome-title">
        {!temJornadas ? L.newTitle : (jaRegistrou ? L.doneTitle : L.backTitle)}
      </h1>
      <p className="home-welcome-copy">
        {!temJornadas ? L.newSub : (jaRegistrou ? L.doneSub : L.backSub)}
      </p>

      {temJornadas ? (
        <div className="home-welcome-journeys">
          {journeys.slice(0, 4).map((j) => {
            const dia = Math.min(j.total_days || 999, diaAtual(j));
            return (
              <a className={`home-welcome-journey${j.hoje ? ' feito' : ''}`}
                href={`/perfil/jornada/${j.slug}`} key={j.id}>
                <span>
                  <b>{j.title}</b>
                  <small>
                    {(L.day || 'Dia {d} de {t}').replace('{d}', dia).replace('{t}', j.total_days || '—')}
                    {j.hoje && <em className="hw-feito">{L.doneToday}</em>}
                  </small>
                </span>
                <strong aria-hidden="true">›</strong>
              </a>
            );
          })}
          {diario}

          {/* Quem já registrou tudo não recebe um botão cobrando de novo:
              a ação principal passa a ser ver o que aconteceu. */}
          {jaRegistrou ? (
            <button type="button" className="home-welcome-primary" onClick={sair}>
              {naoLidas > 0 ? (L.feedWithNews || '').replace('{n}', naoLidas) : (L.seeFeed || L.skip)}
            </button>
          ) : (
            <a className="home-welcome-primary" href={alvo}>{rotuloPrimario}</a>
          )}
        </div>
      ) : (
        /* ============================================================
           A PRIMEIRA VEZ

           Era a tela mais fraca do app, e fazia a pergunta mais
           difícil para quem tinha menos informação para responder:
           "qual é o seu primeiro passo?" pede que a pessoa já tenha
           decidido o objetivo E o primeiro passo dele.

           Três mudanças:

           1 · A pergunta virou "O que você quer mudar?", que é a
               PRIMEIRA pergunta do wizard. A tela deixa de ser um
               portão e passa a ser o começo da conversa.

           2 · Quatro exemplos tocáveis. Quem veio da Play Store viu
               uma história ("Voltei a estudar aos 38") e chegava
               aqui num campo em branco — o exemplo que convenceu
               sumia justo quando faria falta. Cada um leva ao
               wizard com `?tema=` já preenchido.

           3 · O diário desceu para DEPOIS do botão. Ele era o único
               cartão da tela, então lia como a sugestão principal —
               e ninguém baixa este app para escrever num caderno
               privado.

           E o atalho do feed deixou de ser "pular". Para quem já
           tem jornada, o feed é secundário. Para quem chegou agora,
           ver outras pessoas é a melhor primeira ação possível: é o
           que ensina o que o app é.
           ============================================================ */
        <>
          <div className="hw-exemplos">
            {(L.exemplos || []).slice(0, 4).map((ex) => (
              <a className="hw-exemplo" key={ex} href={`/new?tema=${encodeURIComponent(ex)}`}>{ex}</a>
            ))}
          </div>
          <a className="home-welcome-primary" href="/new">{L.newCta}</a>
          <div className="home-welcome-journeys hw-depois">{cartaoDiario(L.diaryLater || L.diarySub)}</div>
        </>
      )}

      {/* o atalho de baixo só existe quando ele não é a ação principal */}
      {!jaRegistrou && (
        <button type="button" className="home-welcome-skip" onClick={sair}>
          {!temJornadas
            ? (L.seeOthers || L.seeFeed || L.skip)
            : (naoLidas > 0 ? (L.feedWithNews || '').replace('{n}', naoLidas) : (L.seeFeed || L.skip))}
        </button>
      )}
    </section>
  );
}
