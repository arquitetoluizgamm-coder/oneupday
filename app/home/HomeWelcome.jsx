'use client';
import { useEffect, useState } from 'react';

function diaAtual(jornada) {
  if (jornada.current_day) return jornada.current_day;
  const inicio = jornada.start_date || jornada.created_at;
  if (!inicio) return 1;
  return Math.max(1, Math.floor((Date.now() - new Date(inicio).getTime()) / 86400000) + 1);
}

export default function HomeWelcome({ journeys = [], name = '', labels = {} }) {
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

  return (
    <section className="home-welcome" aria-labelledby="home-welcome-title">
      <div className="home-welcome-mark"><img className="upi-char bob" src="/upi.svg" alt="Upi" /></div>
      <span className="home-welcome-eyebrow">{temJornadas ? (L.backEyebrow || '').replace('{name}', primeiroNome) : L.newEyebrow}</span>
      <h1 id="home-welcome-title">{temJornadas ? L.backTitle : L.newTitle}</h1>
      <p className="home-welcome-copy">{temJornadas ? L.backSub : L.newSub}</p>

      {temJornadas ? (
        <div className="home-welcome-journeys">
          <a className="home-welcome-journey home-welcome-diary" href="/diario">
            <span><b>{L.diaryTitle}</b><small>{L.diarySub}</small></span>
            <strong aria-hidden="true">›</strong>
          </a>
          {journeys.slice(0, 4).map((j) => {
            const dia = Math.min(j.total_days || 999, diaAtual(j));
            return (
              <a className="home-welcome-journey" href={`/perfil/jornada/${j.slug}`} key={j.id}>
                <span><b>{j.title}</b><small>{(L.day || 'Dia {d} de {t}').replace('{d}', dia).replace('{t}', j.total_days || '—')}</small></span>
                <strong aria-hidden="true">›</strong>
              </a>
            );
          })}
          <a className="home-welcome-primary" href="/perfil">{L.register}</a>
        </div>
      ) : (
        <>
          <a className="home-welcome-journey home-welcome-diary" href="/diario">
            <span><b>{L.diaryTitle}</b><small>{L.diarySub}</small></span>
            <strong aria-hidden="true">›</strong>
          </a>
          <a className="home-welcome-primary" href="/new">{L.newCta}</a>
        </>
      )}

      <button type="button" className="home-welcome-skip" onClick={sair}>{L.skip}</button>
    </section>
  );
}
