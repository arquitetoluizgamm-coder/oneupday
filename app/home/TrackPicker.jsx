'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function TrackPicker({ selected, onSelect, labels }) {
  const [open, setOpen] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  async function loadTracks() {
    if (loaded) return;
    const supabase = createClient();
    const { data } = await supabase.from('tracks').select('*').order('title');
    setTracks(data || []); setLoaded(true);
  }
  function toggleOpen() { setOpen(o => { const n = !o; if (n) loadTracks(); return n; }); }
  function preview(tk) {
    if (!audioRef.current) return;
    if (playing === tk.id) { audioRef.current.pause(); setPlaying(null); return; }
    audioRef.current.src = tk.audio_url; audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {}); setPlaying(tk.id);
  }
  function choose(tk) { onSelect(tk); setOpen(false); if (audioRef.current) audioRef.current.pause(); setPlaying(null); }
  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

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
          {loaded && tracks.length === 0 && <p className="track-empty">{labels.empty}</p>}
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
        </div>
      )}
    </div>
  );
}
