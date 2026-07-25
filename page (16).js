'use client';
import { useState } from 'react';
import { track } from '../../lib/track';

async function copyText(text) { try { await navigator.clipboard.writeText(text); return true; } catch { } try { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.focus(); ta.select(); const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok; } catch { return false; } }

export default function FeedShare({ slug, title, label, copiedLabel }) {
  const [copied, setCopied] = useState(false);
  async function share() { const url = `${window.location.origin}/${slug}?r=s`; track('card_shared', { kind: 'link', slug }); const isTouch = (navigator.maxTouchPoints || 0) > 0 || (typeof window.matchMedia === 'function' && window.matchMedia('(pointer:coarse)').matches); if (isTouch && navigator.share) { try { await navigator.share({ title: title || 'One Up Day', url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } } const ok = await copyText(url); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1800); } else window.prompt(copiedLabel, url); }
  return <button type="button" className="feed-share" onClick={share}><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg><span className="action-label">{copied ? copiedLabel : label}</span></button>;
}
