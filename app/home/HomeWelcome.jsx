'use client';
import { useState } from 'react';
import './home-welcome.css';

function diaAtual(j) {
  if (j.current_day) return j.current_day;
  const i = j.start_date || j.created_at;
  return i ? Math.max(1, Math.floor((Date.now() - new Date(i).getTime()) / 86400000) + 1) : 1;
}

export default function HomeWelcome({ journeys = [], name = '', naoLidas = 0, labels: L = {} }) {
  const [visivel, setVisivel] = useState(true);
  const tem = journeys.length > 0;
  const pendentes = journeys.filter((j) => !j.hoje);
  const feito = tem && pendentes.length === 0;
  const jornada = pendentes[0] || journeys[0];
  const alvo = pendentes.length === 1 ? `/perfil/jornada/${pendentes[0].slug}` : '/perfil';

  function feed() {
    setVisivel(false);
    requestAnimationFrame(() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  if (!visivel) return null;

  return (
    <section className="home-welcome" aria-labelledby="home-welcome-title">
      <span className="home-welcome-eyebrow">
        {tem ? (L.backEyebrow || '').replace('{name}', (name || '').split(' ')[0]) : L.newEyebrow}
      </span>
      <h1 id="home-welcome-title">{!tem ? L.newTitle : (feito ? L.doneTitle : L.backTitle)}</h1>
      <p className="home-welcome-copy">{!tem ? L.newSub : (feito ? L.doneSub : L.backSub)}</p>

      {tem ? (
        <div className="home-welcome-journeys">
          {jornada && (
            <a className={`home-welcome-journey${jornada.hoje ? ' feito' : ''}`} href={`/perfil/jornada/${jornada.slug}`}>
              <span>
                <b>{jornada.title}</b>
                <small>
                  {(L.day || 'Dia {d} de {t}')
                    .replace('{d}', Math.min(jornada.total_days || 999, diaAtual(jornada)))
                    .replace('{t}', jornada.total_days || '—')}
                  {jornada.hoje && <em className="hw-feito">{L.doneToday}</em>}
                </small>
              </span>
              <strong aria-hidden="true">›</strong>
            </a>
          )}
          {feito ? (
            <button type="button" className="home-welcome-primary" onClick={feed}>
              {naoLidas > 0 ? (L.feedWithNews || '').replace('{n}', naoLidas) : (L.seeFeed || L.skip)}
            </button>
          ) : (
            <a className="home-welcome-primary" href={alvo}>
              {pendentes.length === 1 ? L.register : (L.choose || L.register)}
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="hw-exemplos">
            {(L.exemplos || []).slice(0, 4).map((ex) => (
              <a className="hw-exemplo" key={ex} href={`/new?tema=${encodeURIComponent(ex)}`}>{ex}</a>
            ))}
          </div>
          <a className="home-welcome-primary" href="/new">{L.newCta}</a>
        </>
      )}

      {!feito && (
        <button type="button" className="home-welcome-skip" onClick={feed}>
          {!tem
            ? (L.seeOthers || L.seeFeed || L.skip)
            : (naoLidas > 0 ? (L.feedWithNews || '').replace('{n}', naoLidas) : (L.seeFeed || L.skip))}
        </button>
      )}
    </section>
  );
}
