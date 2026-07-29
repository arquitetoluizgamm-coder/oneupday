'use client';

import { useEffect, useState } from 'react';

export default function UpiDailyMemory({ labels }) {
  const [ready, setReady] = useState(false);
  const [question, setQuestion] = useState(null);
  const [today, setToday] = useState(null);
  const [answer, setAnswer] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch('/api/upi-memory', { cache: 'no-store' });
        const data = await r.json();
        if (!alive || !r.ok) return;
        setQuestion(data.question || null);
        setToday(data.today || null);
        setAnswer(data.today?.body || '');
        setOpen(!data.today);
        setReady(true);
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  async function save() {
    const text = answer.trim();
    if (!text || saving) return;
    setSaving(true);
    try {
      const r = await fetch('/api/upi-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: text }),
      });
      const data = await r.json();
      if (r.ok && data.memory) {
        setToday(data.memory);
        setOpen(false);
      }
    } catch {}
    setSaving(false);
  }

  if (!ready || !question) return null;

  return (
    <section className={`home-upi-memory${open ? ' open' : ''}`}>
      <button type="button" className="home-upi-memory-head" onClick={() => setOpen((v) => !v)}>
        <img className="bob" src="/upi.svg" alt="Upi" />
        <span>
          <b>{labels.title}</b>
          <small>{today ? labels.saved : labels.sub}</small>
        </span>
        <i aria-hidden="true">{open ? '−' : '+'}</i>
      </button>

      {open && (
        <div className="home-upi-memory-body">
          <p>{question.text}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={labels.placeholder}
            rows={3}
            maxLength={1200}
          />
          <div>
            <button type="button" className="cta" onClick={save} disabled={!answer.trim() || saving}>
              {saving ? labels.saving : today ? labels.update : labels.save}
            </button>
            <a href="/diario">{labels.diary}</a>
          </div>
        </div>
      )}
    </section>
  );
}
