export function anonId() {
  try {
    let id = localStorage.getItem('oud_anon');
    if (!id) { id = 'a_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('oud_anon', id); }
    return id;
  } catch { return null; }
}
export function track(type, meta) {
  try {
    const payload = JSON.stringify({ type, meta: meta || null, anonId: anonId() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
    }
  } catch { }
}
