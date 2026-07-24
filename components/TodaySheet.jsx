'use client';
import { useState } from 'react';

export default function TodaySheet({ ariaLabel, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="icon-btn" aria-label={ariaLabel} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="sheet" role="dialog" aria-label={title} onClick={e => e.stopPropagation()}>
            <div className="sheet-head">
              <b>{title}</b>
              <button type="button" className="sheet-close" aria-label="✕" onClick={() => setOpen(false)}>✕</button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
