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

export default function FeedShare({ slug, title, label, copiedLabel }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${window.location.origin}/${slug}`;
    const isTouch = (navigator.maxTouchPoints || 0) > 0
      || (typeof window.matchMedia === 'function' && window.matchMedia('(pointer:coarse)').matches);
    // Compartilhamento nativo só no celular; no desktop é instável, então copiamos o link.
    if (isTouch && navigator.share) {
      try { await navigator.share({ title: title || 'One Up Day', url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const ok = await copyText(url);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1800); }
    else { window.prompt(copiedLabel, url); }
  }
  return (
    <button type="button" className="feed-share" onClick={share}>
      <span aria-hidden="true">↗</span>{copied ? copiedLabel : label}
    </button>
  );
}
