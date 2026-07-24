'use client';
import { useState } from 'react';

export default function Comments({ updateId, mediaId, labels }) {
  const L = labels || {};
  const qs = mediaId ? `mediaId=${encodeURIComponent(mediaId)}` : `updateId=${encodeURIComponent(updateId)}`;
  const targetBody = mediaId ? { mediaId } : { updateId };
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  async function load() {
    const response = await fetch(`/api/comments?${qs}`);
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
    const response = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...targetBody, text, parentId: replyTo?.id || null }) });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { window.location.href = '/login'; return; }
    if (response.status === 422) setMessage(L.unsafe);
    else if (!response.ok) setMessage(L.error);
    else { setText(''); setReplyTo(null); await load(); }
    setBusy(false);
  }
  return (
    <div className="comments">
      <button type="button" className="comment-toggle" onClick={toggle}><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-5.7A8.4 8.4 0 1 1 21 11.5z"/></svg><span className="action-label">{L.comment}</span></button>
      {open && <div className="comment-panel">
        {items.length === 0 ? <p className="comment-empty">{L.empty}</p> : (() => {
          const roots = items.filter(c => !c.parent_id);
          const shownRoots = expanded ? roots : roots.slice(0, 2);
          const renderComment = (c, nested = false) => <div className={`comment-item${nested ? ' comment-item-reply' : ''}`} key={c.id}>
            <div className="comment-item-head"><b>{c.author?.name || L.someone}</b><button type="button" className="comment-reply" onClick={() => setReplyTo(c)}>{L.reply}</button></div>
            <p>{c.body}</p>
          </div>;
          return <>
            {shownRoots.map(c => <div className="comment-thread" key={c.id}>
              {renderComment(c)}
              <div className="comment-replies">{items.filter(child => child.parent_id === c.id).map(child => renderComment(child, true))}</div>
            </div>)}
            {roots.length > 2 && <button type="button" className="comment-more" onClick={() => setExpanded(value => !value)}>{expanded ? L.less : L.more}</button>}
          </>;
        })()}
        {replyTo && <div className="comment-replying">{(L.replying || '{name}').replace('{name}', replyTo.author?.name || L.someone || '')} <button type="button" onClick={() => setReplyTo(null)}>{L.cancel}</button></div>}
        <form className="comment-form" onSubmit={submit}>
          <input value={text} onChange={e => setText(e.target.value)} maxLength={500} placeholder={L.placeholder} />
          <button type="submit" disabled={busy || !text.trim()}>{busy ? L.sending : L.send}</button>
        </form>
        {message && <p className="comment-message">{message}</p>}
      </div>}
    </div>
  );
}
