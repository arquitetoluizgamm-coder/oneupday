'use client';
import { useEffect, useState } from 'react';

const KEY = 'oud_future_capsules_v1';
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const id = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export default function FuturoClient({ labels }) {
  const [items, setItems] = useState([]);
  const [kind, setKind] = useState('letter');
  const [date, setDate] = useState(addDays(30));
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [answers, setAnswers] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);
  const [reply, setReply] = useState({});

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {} }, []);
  function persist(list) { setItems(list); try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} }
  function create() {
    const text = kind === 'guided' ? answers.filter(Boolean).map((v, i) => `${labels.futureQuestions[i]}\n${v}`).join('\n\n') : body.trim();
    if (!text || !date) return;
    persist([{ id: id(), kind, title: title.trim() || labels.futureDefaultTitle, body: text, unlock: date, created: new Date().toISOString(), opened: false, response: '' }, ...items]);
    setTitle(''); setBody(''); setAnswers(['', '', '']); setSaved(true);
  }
  function answer(item) {
    const value = (reply[item.id] || '').trim();
    const list = items.map((x) => x.id === item.id ? { ...x, opened: true, response: value } : x);
    persist(list); setReply((r) => ({ ...r, [item.id]: '' }));
  }
  const today = new Date().toISOString().slice(0, 10);
  return <div className="future-shell">
    <header className="future-intro"><div className="future-up"><img src="/upi.svg" className="upi-char bob" alt="Upi" /><div className="upi-bubble upi-open"><b className="upi-name">Upi</b><p>{labels.futureGreeting}</p></div></div><p className="eyebrow">{labels.futureEyebrow}</p><h1>{labels.futureTitle}</h1><p>{labels.futureSub}</p></header>
    <section className="future-create">
      <div className="future-kind"><button className={kind === 'letter' ? 'on' : ''} onClick={() => setKind('letter')} type="button">{labels.futureLetter}</button><button className={kind === 'guided' ? 'on' : ''} onClick={() => setKind('guided')} type="button">{labels.futureGuided}</button></div>
      <label>{labels.futureWhen}<input type="date" min={addDays(1)} value={date} onChange={(e) => setDate(e.target.value)} /></label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={labels.futureTitlePh} maxLength={80} />
      {kind === 'letter' ? <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={labels.futureLetterPh} rows={7} /> : <div className="future-questions">{labels.futureQuestions.map((q, i) => <label key={q}>{q}<textarea value={answers[i]} onChange={(e) => setAnswers((a) => a.map((v, n) => n === i ? e.target.value : v))} rows={3} /></label>)}</div>}
      <button type="button" className="cta future-save" onClick={create} disabled={!(kind === 'letter' ? body.trim() : answers.some(Boolean))}>{labels.futureSeal}</button>{saved && <span className="future-saved">{labels.futureSealed}</span>}
    </section>
    {items.length > 0 && <section className="future-list"><h2>{labels.futureHistory}</h2>{items.map((item) => { const ready = item.unlock <= today; return <article className={`future-card${ready ? ' ready' : ''}`} key={item.id}><div className="future-card-head"><b>{item.title}</b><time>{ready ? labels.futureReady : `${labels.futureOpens} ${new Date(`${item.unlock}T12:00:00`).toLocaleDateString()}`}</time></div>{ready ? <><p className="future-body">{item.body}</p>{item.response ? <p className="future-response"><b>{labels.futureReply}</b>{item.response}</p> : <div className="future-reply"><textarea value={reply[item.id] || ''} onChange={(e) => setReply((r) => ({ ...r, [item.id]: e.target.value }))} placeholder={labels.futureReplyPh} rows={3} /><button type="button" className="ghost-btn" onClick={() => answer(item)} disabled={!(reply[item.id] || '').trim()}>{labels.futureReplySave}</button></div>}</> : <p className="future-locked">{labels.futureLocked}</p>}</article>; })}</section>}
    <p className="future-private">{labels.futurePrivate}</p>
  </div>;
}
