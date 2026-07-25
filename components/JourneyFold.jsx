'use client';
import { useState } from 'react';

export default function JourneyFold({ openLabel, closeLabel, children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={`jfold-btn${open ? ' on' : ''}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {open ? closeLabel : openLabel}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="butt" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && <div className="jfold-body">{children}</div>}
    </>
  );
}
