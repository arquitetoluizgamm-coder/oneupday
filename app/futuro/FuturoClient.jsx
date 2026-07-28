'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

const KEY = 'oud_future_capsules_v1';
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const id = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

function escapeXml(value) {
  return String(value || '').replace(/[<>&'\"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

function splitLines(value, max) {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  words.forEach((word) => {
    const last = lines[lines.length - 1];
    if (!last || `${last} ${word}`.length > max) lines.push(word);
    else lines[lines.length - 1] = `${last} ${word}`;
  });
  return lines;
}

function svgLines(lines, x, y, step) {
  return lines.map((line, index) =>
    `<tspan x="${x}" y="${y + index * step}">${escapeXml(line)}</tspan>`
  ).join('');
}

function cardSvg(item, labels, customTitle, customLine) {
  const title = splitLines(customTitle || item.title, 30);
  const date = escapeXml(new Date(`${item.unlock}T12:00:00`).toLocaleDateString());
  const line = splitLines(customLine || labels.futureCardLine || 'Escrevi para a pessoa que estou me tornando.', 42);
  const heading = escapeXml(labels.futureTitle || 'Eu do futuro');
  const footer = escapeXml(labels.futureCardFooter || 'Uma mensagem para depois.');
  const opens = escapeXml(String(labels.futureOpens || 'Abre em').toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eef1e8"/><stop offset="1" stop-color="#f8e2d7"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#g)"/><circle cx="910" cy="155" r="180" fill="#d47b55" opacity=".12"/><circle cx="130" cy="1210" r="230" fill="#87977b" opacity=".13"/><text x="90" y="150" fill="#87977b" font-family="Arial,sans-serif" font-size="30" letter-spacing="8">ONE UP DAY</text><text x="90" y="365" fill="#18213d" font-family="Arial,sans-serif" font-size="72" font-weight="700">${heading}</text><text fill="#c26e50" font-family="Arial,sans-serif" font-size="48" font-weight="700">${svgLines(title, 90, 455, 58)}</text><text fill="#394158" font-family="Arial,sans-serif" font-size="38">${svgLines(line, 90, 650, 47)}</text><rect x="90" y="820" width="900" height="210" rx="28" fill="#ffffff" opacity=".78"/><text x="135" y="905" fill="#87977b" font-family="Arial,sans-serif" font-size="28" letter-spacing="4">${opens}</text><text x="135" y="975" fill="#18213d" font-family="Arial,sans-serif" font-size="52" font-weight="700">${date}</text><text x="90" y="1210" fill="#697187" font-family="Arial,sans-serif" font-size="30">${footer}</text></svg>`;
}

export default function FuturoClient({ labels, userId }) {
  const [items, setItems] = useState([]);
  const [kind, setKind] = useState('letter');
  const [date, setDate] = useState(addDays(30));
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [answers, setAnswers] = useState(['', '', '']);
  const [saved, setSaved] = useState(false);
  const [reply, setReply] = useState({});
  const [shareItem, setShareItem] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardLine, setCardLine] = useState('');

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {} }, []);
  function persist(list) { setItems(list); try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} }
  function create() {
    const text = kind === 'guided' ? answers.filter(Boolean).map((v, i) => `${labels.futureQuestions[i]}\n${v}`).join('\n\n') : body.trim();
    if (!text || !date) return;
    const created = { id: id(), kind, title: title.trim() || labels.futureDefaultTitle, body: text, unlock: date, created: new Date().toISOString(), opened: false, response: '' };
    persist([created, ...items]);
    openCard(created);
    setTitle(''); setBody(''); setAnswers(['', '', '']); setSaved(true);
  }
  function openCard(item) {
    setShareItem(item);
    setCardTitle(item.title || labels.futureDefaultTitle);
    setCardLine(labels.futureCardLine || '');
    setShared(false);
    requestAnimationFrame(() => {
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      document.querySelector('.future-share-card')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  }
  async function publishCard() {
    if (!shareItem || sharing || !userId) return;
    setSharing(true);
    try {
      const svg = cardSvg(shareItem, labels, cardTitle.trim(), cardLine.trim());
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const sb = createClient();
      const path = `${userId}/capsule-${shareItem.id}-${Date.now()}.svg`;
      const upload = await sb.storage.from('photos').upload(path, blob, { upsert: false, contentType: 'image/svg+xml' });
      if (upload.error) throw upload.error;
      const url = sb.storage.from('photos').getPublicUrl(path).data.publicUrl;
      const { data: existing } = await sb.from('media').select('id')
        .eq('user_id', userId).like('url', `%/capsule-${shareItem.id}%`)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      const row = { url, kind: 'photo', visibility: 'public', caption: labels.futureCardCaption || 'Criei uma cápsula para o meu futuro.' };
      const { error } = existing?.id
        ? await sb.from('media').update(row).eq('id', existing.id)
        : await sb.from('media').insert({ user_id: userId, ...row });
      if (error) throw error;
      setShared(true);
    } catch (error) {
      console.error('future capsule share', error);
      alert(labels.error || 'Não foi possível publicar agora.');
    } finally { setSharing(false); }
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
    {shareItem && <section className="future-share-card" aria-live="polite"><div className="future-share-copy"><p className="eyebrow">{labels.futureCardEyebrow}</p><h2>{labels.futureCardTitle}</h2><p>{labels.futureCardSub}</p><div className="future-card-fields"><label>{labels.futureCardEditTitle}<input value={cardTitle} maxLength={60} onChange={(e) => setCardTitle(e.target.value)} /></label><label>{labels.futureCardEditLine}<textarea value={cardLine} maxLength={100} rows={2} onChange={(e) => setCardLine(e.target.value)} /></label></div><div className="future-card-preview" aria-label={labels.futureCardAlt}><div className="future-preview-brand">ONE UP DAY</div><strong>{labels.futureTitle}</strong><b>{cardTitle}</b><span>{cardLine}</span><small>{labels.futureOpens} {new Date(`${shareItem.unlock}T12:00:00`).toLocaleDateString()}</small></div>{shared ? <p className="future-shared">{labels.futureCardShared}</p> : <div className="future-share-actions"><button type="button" className="cta" onClick={publishCard} disabled={sharing || !cardTitle.trim() || !cardLine.trim()}>{sharing ? labels.futureCardSharing : labels.futureCardPublish}</button><button type="button" className="ghost-btn" onClick={() => setShareItem(null)}>{labels.futureCardPrivate}</button></div>}</div></section>}
    {items.length > 0 && <section className="future-list"><h2>{labels.futureHistory}</h2>{items.map((item) => { const ready = item.unlock <= today; return <article className={`future-card${ready ? ' ready' : ''}`} key={item.id}><div className="future-card-head"><b>{item.title}</b><time>{ready ? labels.futureReady : `${labels.futureOpens} ${new Date(`${item.unlock}T12:00:00`).toLocaleDateString()}`}</time></div>{ready ? <><p className="future-body">{item.body}</p>{item.response ? <p className="future-response"><b>{labels.futureReply}</b>{item.response}</p> : <div className="future-reply"><textarea value={reply[item.id] || ''} onChange={(e) => setReply((r) => ({ ...r, [item.id]: e.target.value }))} placeholder={labels.futureReplyPh} rows={3} /><button type="button" className="ghost-btn" onClick={() => answer(item)} disabled={!(reply[item.id] || '').trim()}>{labels.futureReplySave}</button></div>}</> : <p className="future-locked">{labels.futureLocked}</p>}<button type="button" className="tiny-link future-edit-card" onClick={() => openCard(item)}>{labels.futureCardEdit}</button></article>; })}</section>}
    <p className="future-private">{labels.futurePrivate}</p>
  </div>;
}
