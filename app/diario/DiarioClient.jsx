'use client';
import { useEffect, useMemo, useState } from 'react';

const KEY = 'oud_private_diary_v1';
const UP_KEY = 'oud_private_diary_up';

export default function DiarioClient({ labels }) {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [text, setText] = useState('');
  const [upOn, setUpOn] = useState(true);
  const [upText, setUpText] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const current = useMemo(() => entries.find((e) => e.date === date), [entries, date]);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || '[]');
      setEntries(Array.isArray(list) ? list : []);
      setUpOn(localStorage.getItem(UP_KEY) !== '0');
    } catch {}
  }, []);
  useEffect(() => { setText(current?.text || ''); setUpText(current?.up || ''); setSaved(false); }, [current?.id, date]);

  function save() {
    const value = text.trim();
    if (!value) return;
    const next = { id: current?.id || crypto.randomUUID(), date, text: value, up: current?.up || '', updatedAt: Date.now() };
    const list = [next, ...entries.filter((e) => e.date !== date)].sort((a, b) => b.date.localeCompare(a.date));
    setEntries(list); setSaved(true);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  }
  function toggleUp() { const next = !upOn; setUpOn(next); try { localStorage.setItem(UP_KEY, next ? '1' : '0'); } catch {} }
  async function askUpFor(entry) {
    if (!upOn || !entry?.text?.trim() || busy) return;
    setBusy(true); setUpText('');
    try {
      const r = await fetch('/api/diary-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: entry.text.trim() }) });
      const data = await r.json();
      if (r.ok && data.text) {
        setUpText(data.text);
        const list = entries.map((e) => e.id === entry.id ? { ...e, up: data.text } : e);
        setEntries(list); try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
      } else setUpText(labels.diaryUpUnavailable);
    } catch { setUpText(labels.diaryUpUnavailable); }
    setBusy(false);
  }
  function askUp() { if (current) askUpFor(current); }
  return (
    <div className="diary-shell">
      <header className="diary-intro">
        <div className="diary-intro-top"><div><p className="eyebrow">{labels.diaryEyebrow}</p><h1>{labels.diaryTitle}</h1><p>{labels.diarySub}</p></div><img className="diary-upi bob" src="/upi.svg" alt="Upi" /></div>
      </header>
      <section className="diary-card">
        <label className="diary-date">{labels.diaryDate}<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <textarea value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} placeholder={labels.diaryPh} rows={8} />
        <div className="diary-actions"><button className="cta" type="button" onClick={save} disabled={!text.trim()}>{labels.diarySave}</button><span aria-live="polite">{saved ? labels.diarySaved : ''}</span></div>
      </section>
      <section className={`diary-up${upOn ? ' on' : ''}`}>
        <div><b>{labels.diaryUpTitle}</b><p>{labels.diaryUpSub}</p></div>
        <button type="button" className="ghost-btn" onClick={toggleUp}>{upOn ? labels.diaryUpOn : labels.diaryUpOff}</button>
      </section>
      {entries.length > 0 && <section className="diary-history"><h2>{labels.diaryHistory}</h2>{entries.map((e) => <div className={`diary-entry-wrap${e.date === date ? ' on' : ''}`} key={e.id}><button type="button" className="diary-entry" onClick={() => setDate(e.date)}><time>{new Date(`${e.date}T12:00:00`).toLocaleDateString()}</time><span>{e.text}</span></button>{upOn && <button type="button" className="diary-entry-up" onClick={() => askUpFor(e)} disabled={busy}>{busy ? labels.diaryUpThinking : labels.diaryAsk}</button>}{e.up && <p className="diary-entry-comment">{e.up}</p>}</div>)}</section>}
      <p className="diary-private-note">{labels.diaryPrivate}</p>
    </div>
  );
}
