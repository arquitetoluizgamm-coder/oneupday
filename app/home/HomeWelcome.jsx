'use client';
import { useEffect, useState } from 'react';

function diaAtual(jornada) {
  if (jornada.current_day) return jornada.current_day;
  const inicio = jornada.start_date || jornada.created_at;
  if (!inicio) return 1;
  return Math.max(1, Math.floor((Date.now() - new Date(inicio).getTime()) / 86400000) + 1);
}

export default function HomeWelcome({ journeys = [], name = '' }) {
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

  return (
    <section className="home-welcome" aria-labelledby="home-welcome-title">
      <div className="home-welcome-mark"><img className="upi-char bob" src="/upi.svg" alt="Upi" /></div>
      <span className="home-welcome-eyebrow">{temJornadas ? `Bom ver você, ${primeiroNome}.` : 'Um passo de cada vez.'}</span>
      <h1 id="home-welcome-title">{temJornadas ? 'Como você quer continuar hoje?' : 'Qual é o seu primeiro passo?'}</h1>
      <p className="home-welcome-copy">{temJornadas ? 'Escolha uma jornada para registrar o dia ou encontre alguém para acompanhar.' : 'Crie uma jornada simples e registre o que acontece de verdade, sem pressão.'}</p>

      {temJornadas ? (
        <div className="home-welcome-journeys">
          {journeys.slice(0, 4).map((j) => {
            const dia = Math.min(j.total_days || 999, diaAtual(j));
            return (
              <a className="home-welcome-journey" href={`/perfil/jornada/${j.slug}`} key={j.id}>
                <span><b>{j.title}</b><small>Dia {dia} de {j.total_days || '—'}</small></span>
                <strong aria-hidden="true">›</strong>
              </a>
            );
          })}
          <a className="home-welcome-primary" href="/perfil">Registrar o dia</a>
        </div>
      ) : (
        <a className="home-welcome-primary" href="/new">Começar minha jornada</a>
      )}

      <button type="button" className="home-welcome-skip" onClick={sair}>Pular e explorar o feed</button>
    </section>
  );
}
