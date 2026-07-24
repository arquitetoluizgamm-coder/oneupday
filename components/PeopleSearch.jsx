'use client';
import { useState, useRef } from 'react';
import { createClient } from '../lib/supabase/client';

export default function PeopleSearch({ labels }) {
  const L = labels || {};
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const timer = useRef(null);

  function onChange(v) {
    setQ(v);
    clearTimeout(timer.current);
    if (!v.trim()) { setResults([]); setSearched(false); return; }
    timer.current = setTimeout(async () => {
      const term = v.trim().replace(/^@/, '');
      try {
        const sb = createClient();
        const { data } = await sb.from('profiles')
          .select('id, name, handle, avatar_url, avatar_color')
          .or(`name.ilike.%${term}%,handle.ilike.%${term}%`).limit(24);
        setResults(data || []);
      } catch { setResults([]); }
      setSearched(true);
    }, 250);
  }

  return (
    <div className="people-search">
      <div className="ps-field">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m17 17 4 4" /></svg>
        <input value={q} onChange={e => onChange(e.target.value)} placeholder={L.ph} autoFocus />
      </div>
      {!searched && !q && <p className="ps-hint">{L.hint}</p>}
      {searched && results.length === 0 && <p className="ps-hint">{L.none}</p>}
      <div className="ps-list">
        {results.map(p => (
          <a key={p.id} className="ps-person" href={`/${p.handle || ''}`}>
            <span className="ps-ava" style={{ background: p.avatar_color || 'var(--muted)' }}>
              {p.avatar_url ? <img src={p.avatar_url} alt="" /> : (p.name || '?')[0]}
            </span>
            <span className="ps-meta"><b>{p.name}</b><small>{p.handle}</small></span>
          </a>
        ))}
      </div>
    </div>
  );
}
