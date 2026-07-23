'use client';
import { useState } from 'react';

function wrap(ctx, text, x, y, maxW, lh, maxLines = 3) {
  const words = String(text).split(' ');
  let line = '', lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      if (lines === maxLines - 1) { ctx.fillText(line.trim() + '…', x, y); return y; }
      ctx.fillText(line.trim(), x, y); line = words[i] + ' '; y += lh; lines++;
    } else line = test;
  }
  ctx.fillText(line.trim(), x, y); return y;
}

function loadImg(src) {
  return new Promise(res => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

export default function ShareButton({ journey, owner, stats, latest, label, downloading, card }) {
  const [busy, setBusy] = useState(false);

  async function make() {
    setBusy(true);
    const W = 1080, H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#090c2a'; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(W * .9, H * .08, 0, W * .9, H * .08, 620);
    g.addColorStop(0, 'rgba(240,47,135,.28)'); g.addColorStop(1, 'rgba(240,47,135,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(W * .06, H * .95, 0, W * .06, H * .95, 700);
    g.addColorStop(0, 'rgba(255,211,61,.20)'); g.addColorStop(1, 'rgba(255,211,61,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(90, 0, W - 90, 0);
    grad.addColorStop(0, '#f02f87'); grad.addColorStop(.52, '#ff7a45'); grad.addColorStop(1, '#ffd33d');

    // optional photo band
    let topY = 150;
    if (latest && latest.photo_url) {
      const img = await loadImg(latest.photo_url);
      if (img) {
        const bandH = 420, bandY = 190;
        ctx.save();
        ctx.beginPath(); ctx.roundRect(90, bandY, W - 180, bandH, 28); ctx.clip();
        const r = Math.max((W - 180) / img.width, bandH / img.height);
        const iw = img.width * r, ih = img.height * r;
        ctx.drawImage(img, 90 + ((W - 180) - iw) / 2, bandY + (bandH - ih) / 2, iw, ih);
        ctx.restore();
        topY = bandY + bandH + 70;
      }
    }

    ctx.textBaseline = 'alphabetic';
    ctx.font = '800 52px Inter, sans-serif';
    ctx.fillStyle = '#fff'; ctx.fillText('One ', 90, topY);
    const oW = ctx.measureText('One ').width;
    ctx.fillStyle = grad; ctx.fillText('Up ', 90 + oW, topY);
    const uW = ctx.measureText('Up ').width;
    ctx.fillStyle = '#fff'; ctx.fillText('Day', 90 + oW + uW, topY);

    let y = topY + 70;
    if (latest && latest.kind === 'setback') {
      ctx.font = '700 32px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.fillText(card.setback, 90, y); y += 40;
    }

    ctx.font = '900 170px Inter, sans-serif'; ctx.fillStyle = grad;
    ctx.fillText(`${card.day} ${stats.current_day || 0}`, 90, y + 150);
    ctx.font = '700 56px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText(`${card.of} ${journey.total_days}`, 100, y + 220);

    ctx.font = '800 68px Inter, sans-serif'; ctx.fillStyle = '#fff';
    y = wrap(ctx, journey.title, 90, y + 320, W - 180, 82, 2);

    if (latest && latest.text) {
      ctx.font = '400 40px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.72)';
      y = wrap(ctx, `"${latest.text}"`, 90, y + 90, W - 180, 56, 2);
    }

    const barY = H - 250, barW = W - 180, pct = Math.min(1, (stats.current_day || 0) / journey.total_days);
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.roundRect(90, barY, barW, 24, 12); ctx.fill();
    ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(90, barY, Math.max(28, barW * pct), 24, 12); ctx.fill();

    ctx.font = '700 40px Inter, sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText(card.streak.replace('{n}', stats.streak || 0), 90, barY + 95);
    ctx.font = '600 38px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.6)';
    const link = `oneupday.app/${journey.slug}`;
    ctx.fillText(link, W - 90 - ctx.measureText(link).width, barY + 95);

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `one-up-day-${journey.slug}.png`; a.click();
      URL.revokeObjectURL(url); setBusy(false);
    }, 'image/png');
  }

  return (
    <button className="share-button" onClick={make} disabled={busy}>
      {busy ? downloading : label}
    </button>
  );
}
