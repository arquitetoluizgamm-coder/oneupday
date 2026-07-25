'use client';
import { useState, useCallback } from 'react';
import { createClient } from '../lib/supabase/client';
import EditUpdate from './EditUpdate';

// Linha do tempo da jornada, editável direto no perfil.
export default function JourneyDays({ journeyId, labels, editLabels }) {
  const L = labels || {};
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sb = createClient();
      const { data } = await sb.from('updates')
        .select('id, day_number, kind, text, photo_url')
        .eq('journey_id', journeyId)
        .order('day_number', { ascending: false })
        .order('id', { ascending: false });
      setDays(data || []);
    } catch { setDays([]); }
    setLoading(false);
  }, [journeyId]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) load();
  }

  const clean = (tx) => (tx === '📷' || tx === '🎥') ? '' : (tx || '');

  return (
    <div className="jdays">
      <button type="button" className={`jdays-toggle${open ? ' on' : ''}`} onClick={toggle}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt"><path d="M2 12h20" opacity=".35"/><circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="11" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="2.2" fill="currentColor" stroke="none"/></svg>
        {open ? L.hide : L.show}
      </button>
      {open && (
        <div className="jdays-list">
          {loading && <p className="jdays-note">{L.loading}</p>}
          {!loading && days && days.length === 0 && <p className="jdays-note">{L.empty}</p>}
          {!loading && days && days.map((u) => (
            <div className="jdays-row" key={u.id}>
              <span className="jdays-day">{(L.dayFmt || 'Dia {d}').replace('{d}', u.day_number)}</span>
              {u.photo_url && <span className="jdays-thumb" style={{ backgroundImage: `url(${u.photo_url})` }} />}
              <span className="jdays-text">{clean(u.text) || (u.photo_url ? '📷' : '—')}</span>
              <EditUpdate update={{ id: u.id, text: u.text, photo_url: u.photo_url, day: u.day_number }} labels={editLabels} onChanged={load} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
