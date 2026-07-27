'use client';

import { useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function scrollToDay(day) {
  const node = document.getElementById(`journey-day-${day}`);
  if (!node) return;
  // O CSS já desliga as transições em prefers-reduced-motion, mas a
  // rolagem suave é JavaScript e passava por fora da regra — que é a
  // parte que mais incomoda quem tem sensibilidade a movimento.
  const calmo = typeof matchMedia === 'function'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
  node.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' });
}

export default function TiraDeDias({ dias = [], hoje = 0, total = 0, labels = {} }) {
  const maxDay = Math.min(Math.max(Number(hoje) || 0, 0), Math.max(Number(total) || 0, 0));
  const totalDays = Math.max(Number(total) || 0, maxDay);
  const trackRef = useRef(null);
  const draggingRef = useRef(false);
  const previewRef = useRef(maxDay || 1);
  const [selected, setSelected] = useState(maxDay || 1);
  const [preview, setPreview] = useState(maxDay || 1);
  const [dragging, setDragging] = useState(false);
  const [focado, setFocado] = useState(false);

  useEffect(() => {
    const next = clamp(maxDay || 1, 1, Math.max(maxDay, 1));
    setSelected(next);
    setPreview(next);
    previewRef.current = next;
  }, [maxDay]);

  if (!totalDays || !maxDay) return null;

  const byDay = new Map((dias || []).map((item) => [Number(item.n), item.tipo]));
  const dayState = (day) => {
    if (day > maxDay) return 'future';
    const tipo = byDay.get(day);
    if (tipo === 'f') return 'difficult';
    if (tipo === 'v') return 'missed';
    return tipo ? 'published' : 'missed';
  };

  const labelFor = (day) => {
    const state = dayState(day);
    const stateLabel = {
      published: labels.published,
      difficult: labels.difficult,
      missed: labels.missed,
      future: labels.future,
    }[state] || '';
    return `${labels.day || 'Day'} ${day} ${labels.of || 'of'} ${totalDays}${stateLabel ? ` · ${stateLabel}` : ''}`;
  };

  // A régua do dedo tem que ser a MESMA que a tira desenha.
  //
  // A tira desenha `totalDays` colunas — dia 1 na esquerda, dia 60 na
  // direita. Este cálculo usava `maxDay` (o dia de hoje), então o dedo
  // no meio da tira selecionava o dia 18 enquanto a marca embaixo dele
  // era o dia 31. Treze dias de diferença, crescendo até 26 na ponta.
  //
  // Agora converte pela régua completa e só depois limita ao presente:
  // arrastar para dentro do futuro para em "hoje", que é o certo, sem
  // desalinhar o resto do percurso.
  const dayFromPointer = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || totalDays <= 1) return 1;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return clamp(Math.round(1 + ratio * (totalDays - 1)), 1, maxDay);
  };

  const updatePreview = (day) => {
    const next = clamp(day, 1, maxDay);
    // O toque marca a MUDANÇA de dia, não o fim do arraste. É o que
    // deixa a pessoa contar os dias sem olhar — e por isso não pode
    // repetir quando o dedo anda dentro da mesma marca.
    if (next !== previewRef.current && navigator.vibrate) navigator.vibrate(6);
    previewRef.current = next;
    setPreview(next);
  };

  const commit = (day, shouldScroll = true) => {
    const next = clamp(day, 1, maxDay);
    setSelected(next);
    setPreview(next);
    previewRef.current = next;
    if (shouldScroll) scrollToDay(next);
  };

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    draggingRef.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updatePreview(dayFromPointer(event.clientX));
  };

  const onPointerMove = (event) => {
    if (!draggingRef.current) return;
    updatePreview(dayFromPointer(event.clientX));
  };

  const onPointerUp = (event) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    commit(previewRef.current);
  };

  const step = (amount) => {
    const next = clamp((selected || 1) + amount, 1, maxDay);
    if (next !== selected && navigator.vibrate) navigator.vibrate(6);
    commit(next);
  };

  const onKeyDown = (event) => {
    let amount = 0;
    if (event.key === 'ArrowLeft') amount = -1;
    if (event.key === 'ArrowRight') amount = 1;
    // Convenção de slider da ARIA: PageUp aumenta o valor, PageDown
    // diminui. Estava invertido — quem usa teclado aprendeu essa
    // direção em todo controle do sistema operacional.
    if (event.key === 'PageUp') amount = 7;
    if (event.key === 'PageDown') amount = -7;
    if (event.key === 'Home') { event.preventDefault(); commit(1); return; }
    if (event.key === 'End') { event.preventDefault(); commit(maxDay); return; }
    if (!amount) return;
    event.preventDefault();
    step(amount);
  };

  const activeDay = dragging ? preview : selected;

  return (
    <section className="days-strip" aria-label={labels.title || 'Journey days'}>
      <div className="days-strip-head">
        <button type="button" className="days-strip-arrow" onClick={() => step(-1)} disabled={selected <= 1} aria-label={labels.previous || 'Previous day'}>‹</button>
        {/* Sem aria-live: o próprio slider já anuncia pelo aria-valuetext.
            Com os dois ligados, cada pixel do arraste virava duas falas. */}
        <div className="days-strip-current">
          <b>{labelFor(activeDay)}</b>
          <small>{dragging ? (labels.release || 'Release to stay here') : (labels.hint || 'Drag to move through the journey')}</small>
        </div>
        <button type="button" className="days-strip-arrow" onClick={() => step(1)} disabled={selected >= maxDay} aria-label={labels.next || 'Next day'}>›</button>
      </div>

      <div
        ref={trackRef}
        className={`days-strip-track${dragging ? ' is-dragging' : ''}${focado ? ' is-focado' : ''}`}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        style={{ '--days-count': totalDays, '--active-ratio': totalDays > 1 ? (activeDay - 1) / (totalDays - 1) : 0 }}
        role="slider"
        tabIndex={0}
        aria-valuemin={1}
        aria-valuemax={maxDay}
        aria-valuenow={activeDay}
        aria-valuetext={labelFor(activeDay)}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {Array.from({ length: totalDays }, (_, index) => {
          const day = index + 1;
          const state = dayState(day);
          return <span key={day} className={`days-strip-mark is-${state}${day === activeDay ? ' is-active' : ''}`} aria-hidden="true" />;
        })}
        <span className="days-strip-tooltip" aria-hidden="true">{labelFor(activeDay)}</span>
      </div>

      <div className="days-strip-legend" aria-hidden="true">
        <span><i className="published" />{labels.published || 'Published'}</span>
        <span><i className="difficult" />{labels.difficult || 'Hard day'}</span>
        <span><i className="missed" />{labels.missed || 'Didn’t happen'}</span>
      </div>
      <small className="days-strip-keyhint">{labels.keyHint || '← → 1 day · PageUp / PageDown 7 days'}</small>
    </section>
  );
}
