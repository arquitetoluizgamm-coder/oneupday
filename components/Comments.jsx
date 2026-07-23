'use client';
import { useEffect, useState } from 'react';

export default function Comments({ updateId, labels }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const response = await fetch(`/api/comments?updateId=${encodeURIComponent(updateId)}`);
    const data = await response.json().catch(() => ({}));
    setItems(data.comments || []);
  }
  async function toggle() {
    const next = !open; setOpen(next); setMessage('');
    if (next) await load();
  }
  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true); setMessage('');
    const response = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updateId, text }) });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { window.location.href = '/login'; return; }
    if (response.status === 422) setMessage(labels.unsafe);
    else if (!response.ok) setMessage(labels.error);
    else { setText(''); await load(); }
    setBusy(false);
  }
  useEffect(() => { if (!open) return; }, [open]);

  return (
    <div className="comments">
      <button type="button" className="comment-toggle" onClick={toggle}>{open ? labels.close : labels.comment}</button>
      {open && <div className="comment-panel">
        {items.length === 0 ? <p className="comment-empty">{labels.empty}</p> : items.map(c => <div className="comment-item" key={c.id}><b>{c.author?.name || labels.someone}</b><p>{c.body}</p></div>)}
        <form className="comment-form" onSubmit={submit}>
          <input value={text} onChange={e => setText(e.target.value)} maxLength={500} placeholder={labels.placeholder} />
          <button type="submit" disabled={busy || !text.trim()}>{busy ? labels.sending : labels.send}</button>
        </form>
        {message && <p className="comment-message">{message}</p>}
      </div>}
    </div>
  );
}
