'use client';
import { useEffect, useState } from 'react';

export default function Comments({ updateId, labels }) {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  async function load() {
    const response = await fetch(`/api/comments?updateId=${encodeURIComponent(updateId)}`);
    const data = await response.json().catch(() => ({}));
    setItems(data.comments || []);
  }
  useEffect(() => { load(); }, [updateId]);
  async function toggle() {
    const next = !open; setOpen(next); setMessage('');
    if (next) await load();
  }
  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true); setMessage('');
    const response = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updateId, text, parentId: replyTo?.id || null }) });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { window.location.href = '/login'; return; }
    if (response.status === 422) setMessage(labels.unsafe);
    else if (!response.ok) setMessage(labels.error);
    else { setText(''); setReplyTo(null); await load(); }
    setBusy(false);
  }
  return (
    <div className="comments">
      <button type="button" className="comment-toggle" onClick={toggle}>{open ? labels.close : labels.comment}</button>
      {open && <div className="comment-panel">
        {items.length === 0 ? <p className="comment-empty">{labels.empty}</p> : (() => {
          const roots = items.filter(c => !c.parent_id);
          const shownRoots = expanded ? roots : roots.slice(0, 2);
          const renderComment = (c, nested = false) => <div className={`comment-item${nested ? ' comment-item-reply' : ''}`} key={c.id}>
            <div className="comment-item-head"><b>{c.author?.name || labels.someone}</b><button type="button" className="comment-reply" onClick={() => setReplyTo(c)}>{labels.reply}</button></div>
            <p>{c.body}</p>
          </div>;
          return <>
            {shownRoots.map(c => <div className="comment-thread" key={c.id}>
              {renderComment(c)}
              <div className="comment-replies">{items.filter(child => child.parent_id === c.id).map(child => renderComment(child, true))}</div>
            </div>)}
            {roots.length > 2 && <button type="button" className="comment-more" onClick={() => setExpanded(value => !value)}>{expanded ? labels.less : labels.more}</button>}
          </>;
        })()}
        {replyTo && <div className="comment-replying">{labels.replying.replace('{name}', replyTo.author?.name || labels.someone)} <button type="button" onClick={() => setReplyTo(null)}>{labels.cancel}</button></div>}
        <form className="comment-form" onSubmit={submit}>
          <input value={text} onChange={e => setText(e.target.value)} maxLength={500} placeholder={labels.placeholder} />
          <button type="submit" disabled={busy || !text.trim()}>{busy ? labels.sending : labels.send}</button>
        </form>
        {message && <p className="comment-message">{message}</p>}
      </div>}
    </div>
  );
}
