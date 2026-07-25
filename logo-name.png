'use client';
import { useRouter } from 'next/navigation';

export default function BackBtn({ fallback = '/home', label = 'Voltar' }) {
  const router = useRouter();
  function go() {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallback);
  }
  return (
    <button type="button" className="icon-btn" onClick={go} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
    </button>
  );
}
