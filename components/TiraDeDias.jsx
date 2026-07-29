'use client';

import { useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const calmo = () => typeof matchMedia === 'function'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// A PASSAGEM DOS DIAS
//
// Faltavam duas coisas que a especificação pedia e a implementação
// não trouxe — e eu revisei este componente e não peguei:
//
//   1. Durante o arraste, o conteúdo não acompanhava. A marca se
//      mexia, o balão mudava de número, e a história embaixo ficava
//      parada até você soltar. O dedo percorria 60 dias e a tela
//      não percorria nenhum: o balão virava um seletor abstrato em
//      vez de uma viagem pela jornada.
//
//   2. O registro entrava sem transição nenhuma. Trocar de dia era
//      um corte seco, sem dizer de onde veio o novo conteúdo.
//
// Durante o arraste a rolagem é INSTANTÂNEA de propósito: rolagem
// suave briga com o dedo — o conteúdo chegaria atrasado e a
// sensação seria de peso, não de fluidez. O 'smooth' fica para
// setas, teclado e o momento de soltar, onde não há competição.
// ============================================================
function scrollToDay(day, instantaneo = false) {
  const node = document.getElementById(`journey-day-${day}`);
  if (!node) return;
  node.scrollIntoView({
    behavior: (instantaneo || calmo()) ? 'auto' : 'smooth',
    block: 'start',
    inline: 'center',
  });
}

// fade + 8px, 180ms — o registro entra dizendo de onde veio
function entrarRegistro(day) {
  if (calmo()) return;
  const node = document.getElementById(`journey-day-${day}`);
  if (!node || !node.animate) return;
  node.animate(
    [{ opacity: 0.35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
    { duration: 180, easing: 'cubic-bezier(.32,.72,.3,1)' }
  );
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

  // Durante o arraste: acompanha o dedo, sem suavização e sem fade —
  // a 60 quadros por segundo, animação por cima de animação vira borrão.
  const updatePreview = (day, shouldVibrate = false) => {
    const next = clamp(day, 1, maxDay);
    // O toque marca a MUDANÇA de dia, não o fim do arraste. É o que
    // deixa a pessoa contar os dias sem olhar — e por isso não pode
    // repetir quando o dedo anda dentro da mesma marca.
    const mudou = next !== previewRef.current;
    if (shouldVibrate && draggingRef.current && mudou && navigator.vibrate) navigator.vibrate(6);
    previewRef.current = next;
    setPreview(next);
    // A história acompanha o dedo. É isto que faz o arraste ser uma
    // viagem pela jornada em vez de um seletor de número.
    if (mudou && draggingRef.current) scrollToDay(next, true);
  };

  const commit = (day, shouldScroll = true) => {
    const next = clamp(day, 1, maxDay);
    setSelected(next);
    setPreview(next);
    previewRef.current = next;
    if (!shouldScroll) return;
    scrollToDay(next);
    // Só fora do arraste: durante ele o conteúdo já está passando, e
    // um fade a cada dia seria pisca-pisca.
    if (!draggingRef.current) entrarRegistro(next);
  };

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    draggingRef.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updatePreview(dayFromPointer(event.clientX), false);
  };

  const onPointerMove = (event) => {
    if (!draggingRef.current) return;
    updatePreview(dayFromPointer(event.clientX), true);
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
