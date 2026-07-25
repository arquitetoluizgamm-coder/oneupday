'use client';
import { useState, useEffect } from 'react';

// Upi com mensagem: balança de leve até a pessoa tocar; depois fica aberto.
// Só volta a balançar quando existe mensagem nova (msgKey muda por dia/contexto).
export default function UpiGreeting({ line, cat, msgKey }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem('oud-upi-opened') === msgKey) setOpen(true); } catch {}
    setReady(true);
  }, [msgKey]);

  function openMsg() {
    setOpen(true);
    try { localStorage.setItem('oud-upi-opened', msgKey); } catch {}
  }

  if (!line) return null;
  const src = cat === 'comeback' ? '/upi-recomeco.svg' : '/upi.svg';

  return (
    <div className={`upi${ready ? '' : ' upi-wait'}`} role="status">
      {open ? (
        <>
          <img className="upi-char" src={src} alt="Upi" />
          <div className="upi-bubble upi-open">
            <b className="upi-name">Upi</b>
            <p>{line}</p>
          </div>
        </>
      ) : (
        <button type="button" className="upi-closed" onClick={openMsg} aria-label="Upi">
          <img className="upi-char bob" src={src} alt="Upi" />
          <span className="upi-typing" aria-hidden="true"><i /><i /><i /></span>
        </button>
      )}
    </div>
  );
}
