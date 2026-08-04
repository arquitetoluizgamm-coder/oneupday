'use client';
import { useState } from 'react';
import './home-welcome.css';
import UpiCongratulations from './UpiCongratulations';

function diaAtual(j) {
  if (j.current_day) return j.current_day;
  const i = j.start_date || j.created_at;
  return i ? Math.max(1, Math.floor((Date.now() - new Date(i).getTime()) / 86400000) + 1) : 1;
}

export default function HomeWelcome({ journeys = [], completedJourneys = [], name = '', naoLidas = 0, labels: L = {} }) {
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
      {tem && <span className="home-welcome-mark" aria-hidden="true"><img className="upi-char" src="/upi.svg" alt="" /></span>}
      <span className="home-welcome-eyebrow">
        {tem ? (L.backEyebrow || '').replace('{name}', (name || '').split(' ')[0]) : L.newEyebrow}
      </span>
      <h1 id="home-welcome-title">{!tem ? L.newTitle : (feito ? L.doneTitle : L.backTitle)}</h1>
      {tem && !feito && L.backLead && <p className="home-welcome-lead">{L.backLead}</p>}
      {(!tem || feito || !L.backLead) && (
        <p className="home-welcome-copy">{!tem ? L.newSub : (feito ? L.doneSub : L.backSub)}</p>
      )}

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

      {completedJourneys.length > 0 && (
        <section className="home-welcome-completed" aria-label={L.completedTitle || 'Jornadas concluídas'}>
          <span className="home-welcome-completed-seal" aria-hidden="true">✓</span>
          <div><b>{L.completedTitle || 'Jornada concluída'}</b><p>{L.completedSub || 'Você chegou até aqui, e isso merece ser reconhecido.'}</p>
            {completedJourneys.slice(0, 2).map((j) => <div key={j.id}><a href={`/perfil/jornada/${j.slug}`}><strong>{j.title}</strong><em>{L.completedBadge || 'Concluída'}</em></a><UpiCongratulations journey={j} /></div>)}
          </div>
        </section>
      )}

      {!feito && (
        tem ? (
          <a className="home-welcome-skip home-welcome-diary-link" href="/diario">
            {L.diaryWrite || L.diaryTitle || 'Diário privado'}
          </a>
        ) : (
          <button type="button" className="home-welcome-skip" onClick={feed}>
            {L.seeOthers || L.seeFeed || L.skip}
          </button>
        )
      )}
    </section>
  );
}
