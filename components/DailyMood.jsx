'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { MOOD_ORDER, MOODS } from '../lib/moods';

export default function DailyMood({ userId, answeredToday, labels }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (answeredToday) return;
    try { if (localStorage.getItem('oud_mood_day') === today) return; } catch {}
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [answeredToday]);

  function dismiss() {
    try { localStorage.setItem('oud_mood_day', today); } catch {}
    setOpen(false);
  }
  async function pick(k) {
    if (busy) return; setBusy(true);
    try {
      const sb = createClient();
      await sb.from('profiles').update({ mood: k, mood_at: new Date().toISOString() }).eq('id', userId);
      try { localStorage.setItem('oud_mood_day', today); } catch {}
    } catch {}
    location.reload();
  }

  if (!open) return null;
  return (
    <div className="dm-backdrop" onClick={dismiss}>
      <div className="dm-card" role="dialog" aria-label={labels.title} onClick={(e) => e.stopPropagation()}>
        <b className="dm-title">{labels.title}</b>
        <p className="dm-sub">{labels.sub}</p>
        <div className="dm-grid">
          {MOOD_ORDER.map((k) => (
            <button type="button" key={k} className="dm-mood" onClick={() => pick(k)} disabled={busy}>
              <span className="dm-dot" style={{ background: MOODS[k], boxShadow: `0 0 0 3px rgba(0,0,0,0), 0 0 14px ${MOODS[k]}88` }} />
              {(labels.moods || {})[k]}
            </button>
          ))}
        </div>
        <button type="button" className="dm-skip" onClick={dismiss}>{labels.skip}</button>
      </div>
    </div>
  );
}
