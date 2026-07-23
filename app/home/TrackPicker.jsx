'use client';
import { useState, useRef } from 'react';

export default function TrackPicker({ selected, onSelect, labels }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  async function search(query) {
    setLoading(true);
    try {
      const r = await fetch(`/api/tracks?q=${encodeURIComponent(query || '')}`);
      const j = await r.json();
      setConfigured(j.configured !== false);
      setTracks(j.tracks || []);
    } catch { setTracks([]); }
    setLoading(false); setLoaded(true);
  }
  function toggleOpen() { setOpen(o => { const n = !o; if (n && !loaded) search(''); return n; }); }
  function preview(tk) {
    if (!audioRef.current) return;
    if (playing === tk.id) { audioRef.current.pause(); setPlaying(null); return; }
    audioRef.current.src = tk.audio_url; audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {}); setPlaying(tk.id);
  }
  function choose(tk) {
    onSelect({ title: tk.title, artist: tk.artist, audio_url: tk.audio_url });
    setOpen(false); if (audioRef.current) audioRef.current.pause(); setPlaying(null);
  }

  if (selected) {
    return (
      <div className="track-chip">
        <span>♪ {selected.title}{selected.artist ? ' · ' + selected.artist : ''}</span>
        <button type="button" onClick={() => onSelect(null)} aria-label={labels.remove}>✕</button>
      </div>
    );
  }
  return (
    <div className="track-picker">
      <button type="button" className="kind music" onClick={toggleOpen}>{labels.add}</button>
      {open && (
        <div className="track-panel">
          <div className="track-panel-head"><b>{labels.title}</b><button type="button" onClick={() => setOpen(false)}>✕</button></div>
          <form className="track-search" onSubmit={e => { e.preventDefault(); search(q); }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={labels.searchPh} />
            <button type="submit">{loading ? '…' : '🔍'}</button>
          </form>
          {!configured && <p className="track-empty">{labels.keyNeeded}</p>}
          {configured && loaded && tracks.length === 0 && !loading && <p className="track-empty">{labels.empty}</p>}
          <div className="track-list">
            {tracks.map(tk => (
              <div className="track-row" key={tk.id}>
                <button type="button" className="track-play" onClick={() => preview(tk)}>{playing === tk.id ? '❚❚' : '▶'}</button>
                <div className="track-meta"><b>{tk.title}</b><small>{tk.artist}</small></div>
                <button type="button" className="track-use" onClick={() => choose(tk)}>{labels.use}</button>
              </div>
            ))}
          </div>
          <audio ref={audioRef} onEnded={() => setPlaying(null)} />
          <p className="track-credit">Jamendo · Creative Commons</p>
        </div>
      )}
    </div>
  );
}
