'use client';
import { useState } from 'react';

export default function LanguagePicker({ current = 'pt' }) {
  const [value, setValue] = useState(current);
  async function syncPushLocale(next) {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      const json = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, locale: next }),
      });
    } catch {}
  }
  async function change(e) {
    const next = e.target.value;
    setValue(next);
    document.cookie = `oud_locale=${next}; path=/; max-age=31536000; samesite=lax`;
    await syncPushLocale(next);
    window.location.reload();
  }
  return (
    <label className="lang-picker">
      <span aria-hidden="true">◎</span>
      <select value={value} onChange={change} aria-label="Idioma">
        <option value="pt">PT</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </label>
  );
}
