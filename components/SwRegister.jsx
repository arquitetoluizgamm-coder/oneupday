'use client';
import { useEffect } from 'react';

export default function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // procura versão nova toda vez que o app abre e sempre que volta ao foco
      reg.update().catch(() => {});
      const onFocus = () => reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') onFocus();
      });
      // se um worker novo assumir, recarrega uma única vez
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    }).catch(() => {});
  }, []);
  return null;
}
