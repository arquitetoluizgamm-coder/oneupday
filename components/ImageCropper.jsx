'use client';
import { useRef, useState, useEffect, useCallback } from 'react';

const ASPECTS = [
  ['original', null],
  ['square', 1],
  ['portrait', 4 / 5],
  ['landscape', 16 / 9],
];

export default function ImageCropper({ src, labels, onCancel, onDone }) {
  const L = labels || {};
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef(null);
  const [nat, setNat] = useState(null);
  const [aspect, setAspect] = useState('portrait');
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState({ w: 320, h: 400 });

  const arVal = ASPECTS.find((a) => a[0] === aspect)?.[1] || null;
  const cover = nat ? Math.max(frame.w / nat.w, frame.h / nat.h) : 1;
  const scale = cover * zoom;
  const dispW = nat ? nat.w * scale : frame.w;
  const dispH = nat ? nat.h * scale : frame.h;

  const clamp = useCallback((o) => {
    const minX = Math.min(0, frame.w - dispW);
    const minY = Math.min(0, frame.h - dispH);
    return { x: Math.max(minX, Math.min(0, o.x)), y: Math.max(minY, Math.min(0, o.y)) };
  }, [frame, dispW, dispH]);

  useEffect(() => {
    const cw = Math.min(360, wrapRef.current?.clientWidth || 360);
    let w = cw, h = cw;
    if (!arVal) {
      if (nat) {
        h = Math.min(cw * (nat.h / nat.w), 460);
        w = h * (nat.w / nat.h);
        if (w > cw) { w = cw; h = cw * (nat.h / nat.w); }
      }
    } else {
      h = cw / arVal;
      if (h > 460) { h = 460; w = h * arVal; }
    }
    setFrame({ w: Math.round(w), h: Math.round(h) });
    setZoom(1);
    setOff({ x: 0, y: 0 });
  }, [aspect, nat, arVal]);

  useEffect(() => { setOff((o) => clamp(o)); }, [zoom, clamp]);

  function point(e) { const t = e.touches ? e.touches[0] : e; return { x: t.clientX, y: t.clientY }; }
  function start(e) { const p = point(e); dragRef.current = { sx: p.x, sy: p.y, ox: off.x, oy: off.y }; }
  function move(e) {
    if (!dragRef.current) return;
    const p = point(e);
    setOff(clamp({ x: dragRef.current.ox + (p.x - dragRef.current.sx), y: dragRef.current.oy + (p.y - dragRef.current.sy) }));
  }
  function end() { dragRef.current = null; }

  function done() {
    if (!nat || !arVal) { onDone('original'); return; }
    const sx = -off.x / scale, sy = -off.y / scale, sw = frame.w / scale, sh = frame.h / scale;
    const outW = Math.min(1080, Math.round(sw));
    const outH = Math.round(outW * (sh / sw));
    const cv = document.createElement('canvas');
    cv.width = outW; cv.height = outH;
    const ctx = cv.getContext('2d');
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outW, outH);
    cv.toBlob((b) => onDone(b || 'original'), 'image/jpeg', 0.9);
  }

  return (
    <div className="cropper">
      <div className="crop-aspects">
        {ASPECTS.map(([k]) => (
          <button key={k} type="button" className={`chip${aspect === k ? ' on' : ''}`} onClick={() => setAspect(k)}>{L[k] || k}</button>
        ))}
      </div>
      <div className="crop-stage" ref={wrapRef}>
        <div className="crop-frame" style={{ width: frame.w, height: frame.h }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}>
          <img ref={imgRef} src={src} alt="" draggable={false}
            onLoad={(e) => setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            style={{ position: 'absolute', width: dispW, height: dispH, left: off.x, top: off.y, maxWidth: 'none' }} />
        </div>
      </div>
      {arVal && <input className="crop-zoom" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} aria-label={L.zoom || 'zoom'} />}
      <p className="crop-hint">{arVal ? (L.hint || '') : (L.hintOriginal || '')}</p>
      <div className="crop-actions">
        <button type="button" className="ghost-btn" onClick={onCancel}>{L.cancel || 'Cancelar'}</button>
        <button type="button" className="cta grow" onClick={done}>{L.use || 'Usar'}</button>
      </div>
    </div>
  );
}
