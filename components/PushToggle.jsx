'use client';
import { useEffect, useState } from 'react';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Liga/desliga as notificações no aparelho
function currentLocale() {
  const m = document.cookie.match(/(?:^|;\s*)oud_locale=([^;]+)/);
  const v = m ? decodeURIComponent(m[1]) : '';
  return ['pt', 'en', 'es'].includes(v) ? v : 'pt';
}

export default function PushToggle({ vapidKey, labels }) {
  const L = labels || {};
  const [state, setState] = useState('loading'); // loading | off | on | unsupported | denied
  const [busy, setBusy] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !vapidKey) {
        if (alive) setState('unsupported');
        return;
      }
      if (Notification.permission === 'denied') { if (alive) setState('denied'); return; }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (alive) setState(sub ? 'on' : 'off');
      } catch { if (alive) setState('off'); }
    })();
    return () => { alive = false; };
  }, [vapidKey]);

  async function enable() {
    if (busy) return;
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setState(perm === 'denied' ? 'denied' : 'off'); setBusy(false); return; }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(vapidKey),
        });
      }
      const json = sub.toJSON();
      const r = await fetch('/api/push/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, locale: currentLocale() }),
      });
      setState(r.ok ? 'on' : 'off');
    } catch { setState('off'); }
    setBusy(false);
  }

  async function disable() {
    if (busy) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setState('off');
    } catch {}
    setBusy(false);
  }

  async function sendTest() {
    if (busy) return;
    setBusy(true); setTestMsg('');
    const r = await fetch('/api/push/test', { method: 'POST' }).catch(() => null);
    setTestMsg(r && r.ok ? (L.testSent || '') : (L.testFail || ''));
    setBusy(false);
    setTimeout(() => setTestMsg(''), 6000);
  }

  if (state === 'loading' || state === 'unsupported') return null;

  return (
    <div className="push-row">
      <div className="push-info">
        <b>{L.title}</b>
        <p>{testMsg || (state === 'denied' ? L.denied : state === 'on' ? L.onSub : L.offSub)}</p>
      </div>
      {state !== 'denied' && (
        state === 'on'
          ? (
            <div className="push-acts">
              <button type="button" className="ghost-btn" onClick={sendTest} disabled={busy}>{L.test}</button>
              <button type="button" className="ghost-btn" onClick={disable} disabled={busy}>{L.turnOff}</button>
            </div>
          )
          : <button type="button" className="cta" onClick={enable} disabled={busy}>{busy ? L.wait : L.turnOn}</button>
      )}
    </div>
  );
}
