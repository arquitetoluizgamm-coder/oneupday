'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

export default function HugButton({ toId, updateId, name, labels, demo }) {
  const L = labels || {};
  const [hugged, setHugged] = useState(false);
  const [toast, setToast] = useState('');
  async function hug() {
    if (hugged) return;
    setHugged(true);
    setToast((L.toast || '').replace('{name}', name || ''));
    setTimeout(() => setToast(''), 2600);
    if (demo || !toId) return;
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      await sb.from('hugs').insert({ from_id: user.id, to_id: toId, update_id: updateId });
    } catch {}
  }
  return (
    <button type="button" className={`hug-btn${hugged ? ' on' : ''}`} onClick={hug} aria-label={L.hug} title={L.hug}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill={hugged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="7" r="3" />
        <path d="M4.5 20c0-2.6 1.8-4.4 4-4.9L12 18l3.5-2.9c2.2.5 4 2.3 4 4.9" />
      </svg>
      {toast && <span className="hug-toast">{toast}</span>}
    </button>
  );
}
