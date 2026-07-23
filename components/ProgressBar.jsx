'use client';
import { useEffect, useState } from 'react';

export default function ProgressBar({ day = 0, total = 30, dayTpl = 'Day {d} of {t}', goalWord = 'Goal' }) {
  const target = Math.min(100, Math.round((100 * Math.min(day, total)) / (total || 1)));
  const [pct, setPct] = useState(0);
  const [d, setD] = useState(0);

  useEffect(() => {
    let raf;
    const dur = 3200;                       // cresce bem devagar
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);  // desacelera no fim
      setPct(Math.round(target * ease));
      setD(Math.round(day * ease));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [day, target]);

  const label = String(dayTpl).replace('{d}', d).replace('{t}', total);
  const width = pct > 0 ? Math.max(pct, 6) : 0;

  return (
    <div className="progress">
      <div className="progress-track">
        <span className="progress-goal">{goalWord}</span>
        <div className="progress-fill" style={{ width: width + '%' }} />
      </div>
      <div className="progress-meta">
        <span>{label}</span>
        <span className="progress-pct">{pct}%</span>
      </div>
    </div>
  );
}
