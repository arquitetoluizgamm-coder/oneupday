'use client';
import { useState } from 'react';

export default function FeedShare({ slug, title, label, copiedLabel }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${window.location.origin}/${slug}`;
    if (navigator.share) {
      try { await navigator.share({ title: title || 'One Up Day', url }); return; } catch { }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { }
  }
  return (
    <button type="button" className="feed-share" onClick={share}>
      <span aria-hidden="true">↗</span>{copied ? copiedLabel : label}
    </button>
  );
}
