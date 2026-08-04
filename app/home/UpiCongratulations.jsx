'use client';
import { useEffect, useState } from 'react';

export default function UpiCongratulations({ journey }) {
  const [message, setMessage] = useState('Você terminou uma etapa importante. A Upi viu o caminho que você percorreu.');
  useEffect(() => {
    let ativo = true;
    const run = async () => {
      try {
        const r = await fetch('/api/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'congratulate', journeyId: journey.id }) });
        const data = await r.json();
        if (ativo && data.text) setMessage(data.text);
      } catch {}
    };
    const timer = 'requestIdleCallback' in window ? window.requestIdleCallback(run, { timeout: 1800 }) : window.setTimeout(run, 900);
    return () => { ativo = false; if (typeof timer === 'number') window.clearTimeout(timer); };
  }, [journey.id]);
  return <p className="home-welcome-upi-congrats"><b>Upi</b> {message}</p>;
}
