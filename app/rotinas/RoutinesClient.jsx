'use client';

import { useMemo, useState } from 'react';
import { dateDiff, localDate, metricsFor, scheduledOn, scheduleLabel, weeklyPresence } from '../../lib/routines/core';

function fill(text, values) { return String(text || '').replace(/\{(\w+)\}/g, (_, key) => values[key] ?? ''); }
function tomorrow(days = 1) { const d = new Date(`${localDate()}T12:00:00`); d.setDate(d.getDate() + days); return localDate(d); }

export default function RoutinesClient({ initialRoutines, initialLogs, journeys, labels, migrationMissing }) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [logs, setLogs] = useState(initialLogs);
  const [tab, setTab] = useState('today');
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [returning, setReturning] = useState(null);
  const [error, setError] = useState(migrationMissing ? labels.migration : '');
  const [busy, setBusy] = useState(false);
  const [pauseId, setPauseId] = useState(null);
  const [form, setForm] = useState({ name: '', ideal_text: '', minimum_text: '', schedule_type: 'daily', weekdays: [1, 3, 5], weekly_target: 3, linked_journey_id: '', privacy: 'private' });
  const today = localDate();
  const scheduled = useMemo(() => routines.filter((routine) => scheduledOn(routine, today)), [routines, today]);

  function resetWizard() { setForm({ name: '', ideal_text: '', minimum_text: '', schedule_type: 'daily', weekdays: [1, 3, 5], weekly_target: 3, linked_journey_id: '', privacy: 'private' }); setStep(0); setWizard(false); }
  function update(key, value) { setForm((old) => ({ ...old, [key]: value })); }
  function toggleDay(day) { update('weekdays', form.weekdays.includes(day) ? form.weekdays.filter((item) => item !== day) : [...form.weekdays, day].sort()); }

  async function send(body) {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/routines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) { setError(data.error === 'migration_required' ? labels.migration : labels.error); return null; }
      return data;
    } catch { setError(labels.error); return null; } finally { setBusy(false); }
  }

  async function createRoutine() {
    const data = await send({ action: 'create', ...form });
    if (!data?.routine) return;
    setRoutines((old) => [...old, data.routine]);
    resetWizard();
  }
  async function logRoutine(routine, state) {
    const data = await send({ action: 'log', routine_id: routine.id, state, log_date: today });
    if (!data?.log) return;
    setLogs((old) => [data.log, ...old.filter((log) => !(log.routine_id === data.log.routine_id && log.log_date === data.log.log_date))]);
    if (data.returning) setReturning(routine);
  }
  async function pauseRoutine(routine, until) {
    const data = await send({ action: 'pause', routine_id: routine.id, pause_until: until });
    if (data?.routine) { setRoutines((old) => old.map((item) => item.id === routine.id ? data.routine : item)); setPauseId(null); }
  }
  async function resumeRoutine(routine) {
    const data = await send({ action: 'resume', routine_id: routine.id });
    if (data?.routine) setRoutines((old) => old.map((item) => item.id === routine.id ? data.routine : item));
  }
  async function archiveRoutine(routine) {
    if (!window.confirm(labels.archiveConfirm)) return;
    const data = await send({ action: 'archive', routine_id: routine.id });
    if (data?.routine) setRoutines((old) => old.filter((item) => item.id !== routine.id));
  }

  function next() {
    if (step === 0 && (!form.name.trim() || !form.ideal_text.trim())) { setError(labels.required); return; }
    if (step === 2 && form.schedule_type === 'weekdays' && !form.weekdays.length) { setError(labels.frequencyQ); return; }
    setError(''); setStep((value) => Math.min(4, value + 1));
  }
  const journeyTitle = (id) => journeys.find((journey) => journey.id === id)?.title || labels.noJourney;

  return (<div className="routine-shell">
    <header className="routine-intro"><p className="eyebrow">{labels.eyebrow}</p><h1>{labels.title}</h1><p>{labels.intro}</p><p className="routine-start-small">{labels.startSmall}</p></header>
    <div className="routine-tabs" role="tablist"><button className={tab === 'today' ? 'on' : ''} onClick={() => setTab('today')} role="tab" aria-selected={tab === 'today'}>{labels.today}</button><button className={tab === 'rhythm' ? 'on' : ''} onClick={() => setTab('rhythm')} role="tab" aria-selected={tab === 'rhythm'}>{labels.rhythm}</button></div>
    {error && <p className={`routine-message${migrationMissing ? ' warm' : ''}`} role="status">{error}</p>}
    {returning && <section className="routine-return" role="status"><div><span className="routine-return-mark" aria-hidden="true">↗</span><div><strong>{labels.returnTitle}</strong><p>{labels.returnSub}</p></div></div><button className="ghost-btn" onClick={() => setReturning(null)}>{labels.continue}</button></section>}
    {tab === 'today' ? <section className="routine-today"><div className="routine-section-head"><div><p className="eyebrow">{new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${today}T12:00:00`))}</p><h2>{labels.today}</h2><p>{labels.todaySub}</p></div><button className="routine-add" onClick={() => setWizard(true)}>{labels.create}</button></div>
      {scheduled.length === 0 && <div className="routine-empty"><span aria-hidden="true">⌁</span><h3>{labels.emptyTitle}</h3><p>{routines.length ? labels.noToday : labels.emptySub}</p><button className="cta" onClick={() => setWizard(true)}>{labels.create}</button></div>}
      <div className="routine-list">{scheduled.slice(0, 3).map((routine) => <RoutineCard key={routine.id} routine={routine} logs={logs} labels={labels} journeyTitle={journeyTitle(routine.linked_journey_id)} busy={busy} pauseId={pauseId} setPauseId={setPauseId} onLog={logRoutine} onPause={pauseRoutine} onResume={resumeRoutine} onArchive={archiveRoutine} />)}</div>
      {scheduled.length > 3 && <button className="routine-more" onClick={() => setTab('rhythm')}>{labels.seeMore}</button>}
    </section> : <Rhythm routines={routines} logs={logs} labels={labels} journeyTitle={journeyTitle} busy={busy} pauseId={pauseId} setPauseId={setPauseId} onLog={logRoutine} onPause={pauseRoutine} onResume={resumeRoutine} onArchive={archiveRoutine} />}
    {wizard && <div className="routine-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) resetWizard(); }}><section className="routine-dialog" role="dialog" aria-modal="true" aria-labelledby="routine-dialog-title"><div className="routine-dialog-top"><div><p className="eyebrow">{step + 1} / 5</p><h2 id="routine-dialog-title">{labels.newTitle}</h2></div><button className="icon-close" onClick={resetWizard} aria-label={labels.close}>×</button></div>{step === 0 && <div className="routine-form"><label>{labels.nameQ}<input autoFocus value={form.name} onChange={(e) => update('name', e.target.value)} placeholder={labels.namePh} maxLength={120} /></label><label>{labels.idealQ}<textarea value={form.ideal_text} onChange={(e) => update('ideal_text', e.target.value)} placeholder={labels.idealPh} rows={3} maxLength={240} /></label></div>}{step === 1 && <div className="routine-form"><label>{labels.minimumQ}<textarea autoFocus value={form.minimum_text} onChange={(e) => update('minimum_text', e.target.value)} placeholder={labels.minimumPh} rows={3} maxLength={240} /></label><p className="routine-hint">{labels.minimumHint}</p></div>}{step === 2 && <div className="routine-form"><label>{labels.frequencyQ}<select value={form.schedule_type} onChange={(e) => update('schedule_type', e.target.value)}><option value="daily">{labels.everyDay}</option><option value="weekdays">{labels.weekdays}</option><option value="weekly_target">{fill(labels.weeklyTarget, { n: form.weekly_target })}</option></select></label>{form.schedule_type === 'weekdays' && <div className="routine-days" aria-label={labels.weekdays}>{labels.days.map((day, index) => <button type="button" className={form.weekdays.includes(index) ? 'on' : ''} key={`${day}-${index}`} onClick={() => toggleDay(index)}>{day}</button>)}</div>}{form.schedule_type === 'weekly_target' && <input type="range" min="1" max="7" value={form.weekly_target} onChange={(e) => update('weekly_target', Number(e.target.value))} aria-label={labels.weeklyTarget} />}<label>{labels.period}<select value={form.period || 'anytime'} onChange={(e) => update('period', e.target.value)}><option value="anytime">{labels.anytime}</option><option value="morning">{labels.morning}</option><option value="afternoon">{labels.afternoon}</option><option value="evening">{labels.evening}</option></select></label></div>}{step === 3 && <div className="routine-form"><label>{labels.linkQ}<select value={form.linked_journey_id} onChange={(e) => update('linked_journey_id', e.target.value)}><option value="">{labels.noLink}</option>{journeys.map((journey) => <option key={journey.id} value={journey.id}>{journey.title}</option>)}</select></label>{form.linked_journey_id && <p className="routine-hint">{labels.privacyHint}</p>}<label>{labels.privacyQ}<select value={form.privacy} onChange={(e) => update('privacy', e.target.value)}><option value="private">{labels.private}</option><option value="milestones">{labels.milestones}</option><option value="profile">{labels.profile}</option></select></label></div>}{step === 4 && <div className="routine-review"><p className="routine-review-lead">{labels.review}</p><div><span>{labels.title}</span><strong>{form.name}</strong></div><div><span>{labels.ideal}</span><strong>{form.ideal_text}</strong></div>{form.minimum_text && <div><span>{labels.minimum}</span><strong>{form.minimum_text}</strong></div>}<div><span>{labels.frequencyQ}</span><strong>{form.schedule_type === 'daily' ? labels.everyDay : form.schedule_type === 'weekdays' ? labels.weekdays : fill(labels.weeklyTarget, { n: form.weekly_target })}</strong></div>{form.linked_journey_id && <div><span>{labels.linkQ}</span><strong>{journeyTitle(form.linked_journey_id)}</strong></div>}</div>}<div className="routine-dialog-actions">{step > 0 && <button className="ghost-btn" onClick={() => setStep((value) => value - 1)}>{labels.back}</button>}{step < 4 ? <button className="cta" onClick={next}>{labels.next}</button> : <button className="cta" disabled={busy} onClick={createRoutine}>{busy ? '…' : labels.start}</button>}</div></section></div>}
  </div>);
}

function RoutineCard({ routine, logs, labels, journeyTitle, busy, pauseId, setPauseId, onLog, onPause, onResume, onArchive }) {
  const today = localDate();
  const todayLog = logs.find((log) => log.routine_id === routine.id && log.log_date === today);
  const metric = metricsFor(logs, routine.id);
  const paused = routine.status === 'paused';
  return <article className={`routine-card${paused ? ' is-paused' : ''}`}><div className="routine-card-head"><div><span className="routine-dot" aria-hidden="true">{todayLog?.state === 'ideal' ? '✓' : todayLog?.state === 'minimum' ? '·' : '○'}</span><h3>{routine.name}</h3><p>{scheduleLabel(routine, { everyDay: labels.everyDay, weekdays: labels.weekdays, weeklyTarget: labels.weeklyTarget })}</p></div><span className="routine-status">{paused ? labels.pausedStatus : labels.activeStatus}</span></div><div className="routine-versions"><div><small>{labels.ideal}</small><strong>{routine.ideal_text}</strong></div>{routine.minimum_text && <div><small>{labels.minimum}</small><strong>{routine.minimum_text}</strong></div>}</div>{routine.linked_journey_id && <p className="routine-link">↗ {journeyTitle}</p>}<div className="routine-card-actions">{paused ? <button className="cta" disabled={busy} onClick={() => onResume(routine)}>{labels.resume}</button> : <><button className="routine-action ideal" disabled={busy || !!todayLog} onClick={() => onLog(routine, 'ideal')}>✓ {labels.actionIdeal}</button>{routine.minimum_text && <button className="routine-action minimum" disabled={busy || !!todayLog} onClick={() => onLog(routine, 'minimum')}>○ {labels.actionMinimum}</button>}<button className="routine-action quiet" disabled={busy || !!todayLog} onClick={() => onLog(routine, 'not_today')}>· {labels.actionNotToday}</button></>}<button className="routine-options" onClick={() => setPauseId(pauseId === routine.id ? null : routine.id)} aria-label={labels.options}>•••</button></div>{pauseId === routine.id && <div className="routine-pause-menu"><p>{labels.pause}</p><button onClick={() => onPause(routine, tomorrow(1))}>Até amanhã</button><button onClick={() => onPause(routine, tomorrow(3))}>3 dias</button><button onClick={() => onPause(routine, tomorrow(7))}>7 dias</button><button onClick={() => onArchive(routine)}>{labels.archive}</button></div>}<footer>{metric.presence} {labels.presence} · {metric.minimum} {labels.minimumCount}</footer></article>;
}

function Rhythm({ routines, logs, labels, journeyTitle, ...actions }) { return <section className="routine-rhythm"><div className="routine-section-head"><div><p className="eyebrow">{labels.rhythm}</p><h2>{labels.weekTitle}</h2></div><button className="routine-add" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>+ {labels.title.slice(0, -1)}</button></div><div className="routine-stats"><div><strong>{weeklyPresence(logs)}</strong><span>{labels.presence}</span></div><div><strong>{metricsFor(logs).minimum}</strong><span>{labels.minimumCount}</span></div><div><strong>{metricsFor(logs).pauses}</strong><span>{labels.pauses}</span></div><div><strong>{metricsFor(logs).returns}</strong><span>{labels.returns}</span></div></div><p className="routine-review-copy">{fill(labels.weekPresence, { n: weeklyPresence(logs) })} {labels.weekMinimum}</p><div className="routine-list">{routines.map((routine) => <RoutineCard key={routine.id} routine={routine} logs={logs} labels={labels} journeyTitle={journeyTitle(routine.linked_journey_id)} {...actions} />)}</div>{!routines.length && <div className="routine-empty"><h3>{labels.emptyTitle}</h3><p>{labels.emptySub}</p></div>}</section>; }
