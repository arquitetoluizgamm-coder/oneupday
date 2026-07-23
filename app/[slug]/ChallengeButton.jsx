'use client';
import { useState } from 'react';

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

export default function ChallengeButton({ slug, theme, label, copiedLabel, message }) {
  const [copied, setCopied] = useState(false);
  async function go() {
    const url = `${window.location.origin}/${slug}`;
    const text = `${message.replace('{theme}', theme)} ${url}`;
    const isTouch = (navigator.maxTouchPoints || 0) > 0
      || (typeof window.matchMedia === 'function' && window.matchMedia('(pointer:coarse)').matches);
    if (isTouch && navigator.share) {
      try { await navigator.share({ text, url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const ok = await copyText(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1800); }
    else { window.prompt(copiedLabel, text); }
  }
  return (
    <button className="challenge-btn" onClick={go}>
      <span aria-hidden="true">🔥</span> {copied ? copiedLabel : label}
    </button>
  );
}
