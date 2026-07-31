'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const calmo = () => typeof matchMedia === 'function'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

function entrarRegistro(day) {
  if (calmo()) return;
  const node = document.getElementById(`journey-day-${day}`);
  if (!node || !node.animate) return;
  node.animate(
    [{ opacity: 0.35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
    { duration: 180, easing: 'cubic-bezier(.32,.72,.3,1)' }
  );
}

export default function TiraDeDias({ dias = [], labels = {} }) {
  const tabsRef = useRef(null);
  const availableDays = useMemo(() => {
    const seen = new Set();
    return (dias || [])
      .map((item) => ({ day: Number(item.n), tipo: item.tipo }))
      .filter((item) => Number.isFinite(item.day) && item.day > 0 && !seen.has(item.day) && seen.add(item.day))
      .sort((a, b) => a.day - b.day);
  }, [dias]);

  const [index, setIndex] = useState(0);
  const current = availableDays[index] || availableDays[0];

  useEffect(() => {
    setIndex(0);
  }, [availableDays.length]);

  useEffect(() => {
    if (!current) return;
    const cards = Array.from(document.querySelectorAll('.journey-public .journey-day-card'));
    cards.forEach((card) => {
      const day = Number(card.id.replace('journey-day-', ''));
      card.hidden = day !== current.day;
      card.classList.toggle('is-current-day', day === current.day);
    });

    const activeTab = tabsRef.current?.querySelector('[aria-selected="true"]');
    activeTab?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: calmo() ? 'auto' : 'smooth' });
    entrarRegistro(current.day);
  }, [current]);

  if (!availableDays.length || !current) return null;

  const stateLabel = (item) => {
    if (item.tipo === 'f') return labels.difficult || '';
    return labels.published || '';
  };

  const go = (amount) => {
    setIndex((value) => Math.min(availableDays.length - 1, Math.max(0, value + amount)));
  };

  const choose = (nextIndex) => {
    setIndex(nextIndex);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
    if (event.key === 'Home') { event.preventDefault(); choose(0); }
    if (event.key === 'End') { event.preventDefault(); choose(availableDays.length - 1); }
  };

  return (
    <section className="days-strip days-pager" aria-label={labels.title || 'Journey days'}>
      <div className="days-strip-head">
        <button type="button" className="days-strip-arrow" onClick={() => go(-1)} disabled={index <= 0} aria-label={labels.previous || 'Previous day'}>‹</button>
        <div className="days-strip-current" aria-live="polite">
          <b>{labels.day || 'Day'} {current.day}</b>
          <small>{index + 1} / {availableDays.length}{stateLabel(current) ? ` · ${stateLabel(current)}` : ''}</small>
        </div>
        <button type="button" className="days-strip-arrow" onClick={() => go(1)} disabled={index >= availableDays.length - 1} aria-label={labels.next || 'Next day'}>›</button>
      </div>

      <div className="days-pager-tabs" ref={tabsRef} role="tablist" aria-label={labels.title || 'Journey days'} onKeyDown={onKeyDown}>
        {availableDays.map((item, itemIndex) => (
          <button
            type="button"
            key={item.day}
            role="tab"
            className={`days-pager-tab${itemIndex === index ? ' on' : ''}${item.tipo === 'f' ? ' difficult' : ''}`}
            aria-selected={itemIndex === index}
            aria-controls={`journey-day-${item.day}`}
            onClick={() => choose(itemIndex)}
          >
            {labels.day || 'Day'} {item.day}
          </button>
        ))}
      </div>
    </section>
  );
}
