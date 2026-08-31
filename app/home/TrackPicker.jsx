'use client';
import { useEffect, useRef, useState } from 'react';

const PHOTO_CLIP_SECONDS = 15;

function clock(value) {
  const total = Math.max(0, Math.floor(Number(value) || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function clipFor(trackDuration, videoDuration) {
  const total = Math.max(0, Number(trackDuration) || 0);
  const video = Math.max(0, Number(videoDuration) || 0);
  const requested = video > 0 ? video : PHOTO_CLIP_SECONDS;
  const duration = Math.min(total, requested);
  return { duration, full: total > 0 && duration >= total - 0.15 };
}

export default function TrackPicker({ selected, onSelect, labels, videoDuration = 0 }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('library');
  const [q, setQ] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(null);
  const previewEnd = useRef(0);
  const audioRef = useRef(null);

  async function search(query) {
    setLoading(true);
    try {
      const r = await fetch(`/api/tracks?q=${encodeURIComponent(query || '')}`);
      const j = await r.json();
      setConfigured(j.configured !== false);
      setTracks(j.tracks || []);
    } catch {
      setTracks([]);
    }
    setLoading(false);
    setLoaded(true);
  }

  function stopPreview() {
    if (audioRef.current) audioRef.current.pause();
    setPlaying(null);
  }

  function toggleOpen() {
    setOpen((wasOpen) => {
      const next = !wasOpen;
      if (next && !loaded) search('');
      if (next) setMode(selected ? 'clip' : 'library');
      if (!next) stopPreview();
      return next;
    });
  }

  function preview(track, start = 0, duration = 15) {
    if (!audioRef.current) return;
    if (playing === track.id) {
      stopPreview();
      return;
    }
    const from = Math.max(0, Number(start) || 0);
    const length = Math.max(0.1, Number(duration) || 15);
    audioRef.current.src = track.audio_url;
    audioRef.current.currentTime = from;
    previewEnd.current = Math.min(Number(track.duration || track.total_seconds) || Infinity, from + length);
    audioRef.current.play().catch(() => {});
    setPlaying(track.id);
  }

  function choose(track) {
    const clip = clipFor(track.duration, videoDuration);
    onSelect({
      id: track.id,
      title: track.title,
      artist: track.artist,
      audio_url: track.audio_url,
      total_seconds: track.duration,
      start_seconds: 0,
      duration_seconds: clip.duration,
      full: clip.full,
    });
    stopPreview();
    setMode('clip');
  }

  useEffect(() => {
    if (!selected) return;
    const clip = clipFor(selected.total_seconds, videoDuration);
    const maxStart = Math.max(0, (Number(selected.total_seconds) || 0) - clip.duration);
    const nextStart = clip.full ? 0 : Math.min(Number(selected.start_seconds) || 0, maxStart);
    if (
      Math.abs((Number(selected.duration_seconds) || 0) - clip.duration) > 0.05 ||
      Math.abs((Number(selected.start_seconds) || 0) - nextStart) > 0.05 ||
      selected.full !== clip.full
    ) {
      onSelect({ ...selected, start_seconds: nextStart, duration_seconds: clip.duration, full: clip.full });
    }
  }, [videoDuration, selected, onSelect]);

  function updateStart(value) {
    const start = Number(value) || 0;
    stopPreview();
    onSelect({ ...selected, start_seconds: start });
  }

  const panelHead = (
    <div className="track-panel-head">
      <div><b>{mode === 'clip' ? labels.clip : labels.title}</b><small>{labels.official}</small></div>
      <button type="button" onClick={() => { setOpen(false); stopPreview(); }} aria-label="Fechar">×</button>
    </div>
  );

  const audio = (
    <audio
      ref={audioRef}
      onTimeUpdate={(event) => {
        if (event.currentTarget.currentTime >= previewEnd.current - 0.04) stopPreview();
      }}
      onEnded={stopPreview}
    />
  );

  if (selected) {
    const total = Number(selected.total_seconds) || 0;
    const clipDuration = Number(selected.duration_seconds) || PHOTO_CLIP_SECONDS;
    const start = Number(selected.start_seconds) || 0;
    const maxStart = Math.max(0, total - clipDuration);
    return (
      <div className="track-picker has-selection">
        <div className="track-chip">
          <button type="button" className="track-chip-main" onClick={toggleOpen} aria-expanded={open}>
            <span>{selected.title}</span><small>{clock(start)}–{clock(start + clipDuration)}</small>
          </button>
          <button type="button" className="track-chip-remove" onClick={() => { stopPreview(); onSelect(null); setOpen(false); }} aria-label={labels.remove}>×</button>
        </div>
        {open && (
          <div className="track-panel track-clip-panel">
            {panelHead}
            <div className="track-clip-song">
              <button type="button" className="track-play" onClick={() => preview(selected, start, clipDuration)} aria-label={playing === selected.id ? 'Pausar trecho' : 'Ouvir trecho'}>{playing === selected.id ? '❚❚' : '▶'}</button>
              <div className="track-meta"><b>{selected.title}</b><small>{selected.artist}</small></div>
              <button type="button" className="track-change" onClick={() => { stopPreview(); onSelect(null); setMode('library'); }}>{labels.title}</button>
            </div>
            <div className="track-clip-summary">
              <b>{selected.full ? labels.whole : (videoDuration > 0 ? labels.videoLength : labels.seconds)}</b>
              <span>{clock(start)} – {clock(start + clipDuration)}</span>
            </div>
            {!selected.full && (
              <label className="track-range">
                <span>{labels.starts}: {clock(start)}</span>
                <input type="range" min="0" max={maxStart} step="0.1" value={Math.min(start, maxStart)} onChange={(event) => updateStart(event.target.value)} />
                <span className="track-range-scale"><i>0:00</i><i>{clock(total)}</i></span>
              </label>
            )}
            <button type="button" className="track-done" onClick={() => { stopPreview(); setOpen(false); }}>{labels.done}</button>
            {audio}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="track-picker">
      <button type="button" className="kind music" onClick={toggleOpen} aria-label={labels.add} title={labels.add} aria-expanded={open}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>
      </button>
      {open && (
        <div className="track-panel">
          {panelHead}
          <form className="track-search" onSubmit={(event) => { event.preventDefault(); search(q); }}>
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder={labels.searchPh} />
            <button type="submit" aria-label="Buscar">{loading ? '…' : '⌕'}</button>
          </form>
          {!configured && <p className="track-empty">{labels.keyNeeded}</p>}
          {configured && loaded && tracks.length === 0 && !loading && <p className="track-empty">{labels.empty}</p>}
          <div className="track-list">
            {tracks.map((track) => {
              const previewDuration = clipFor(track.duration, videoDuration).duration;
              return (
                <div className="track-row" key={track.id}>
                  <button type="button" className="track-play" onClick={() => preview(track, 0, previewDuration)} aria-label={playing === track.id ? 'Pausar' : 'Ouvir'}>{playing === track.id ? '❚❚' : '▶'}</button>
                  <div className="track-meta"><b>{track.title}</b><small>{track.artist} · {clock(track.duration)}</small></div>
                  <button type="button" className="track-use" onClick={() => choose(track)}>{labels.use}</button>
                </div>
              );
            })}
          </div>
          {audio}
        </div>
      )}
    </div>
  );
}
