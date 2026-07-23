'use client';
import { useState } from 'react';

function wrap(ctx, text, x, y, maxW, lh, maxLines = 2) {
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

export default function Dia1Card({ journey, owner, theme, label, downloading, texts }) {
  const [busy, setBusy] = useState(false);
  async function make() {
    setBusy(true);
    const W = 1080, H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#090c2a'; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(W * .9, H * .08, 0, W * .9, H * .08, 640);
    g.addColorStop(0, 'rgba(240,47,135,.30)'); g.addColorStop(1, 'rgba(240,47,135,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(W * .05, H * .95, 0, W * .05, H * .95, 720);
    g.addColorStop(0, 'rgba(255,211,61,.20)'); g.addColorStop(1, 'rgba(255,211,61,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(90, 0, W - 90, 0);
    grad.addColorStop(0, '#f02f87'); grad.addColorStop(.52, '#ff7a45'); grad.addColorStop(1, '#ffd33d');

    ctx.textBaseline = 'alphabetic';
    // brand
    ctx.font = '800 46px Inter, sans-serif';
    ctx.fillStyle = '#fff'; ctx.fillText('One ', 90, 150);
    const oW = ctx.measureText('One ').width;
    ctx.fillStyle = grad; ctx.fillText('Up ', 90 + oW, 150);
    const uW = ctx.measureText('Up ').width;
    ctx.fillStyle = '#fff'; ctx.fillText('Day', 90 + oW + uW, 150);

    // eyebrow
    ctx.font = '800 44px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.66)';
    ctx.fillText(texts.eyebrow, 90, 470);

    // giant Dia 1
    ctx.font = '900 250px Inter, sans-serif'; ctx.fillStyle = grad;
    ctx.fillText(texts.big, 84, 720);

    // theme
    ctx.font = '800 82px Inter, sans-serif'; ctx.fillStyle = '#fff';
    wrap(ctx, theme, 90, 860, W - 180, 92, 2);

    // invite
    ctx.font = '700 52px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText(texts.invite, 90, H - 250);

    // by + link
    ctx.font = '600 38px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.6)';
    if (owner?.name) ctx.fillText(`${texts.by} ${owner.name}`, 90, H - 170);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fillText(`oneupday.app/${journey.slug}`, 90, H - 110);

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `meu-dia-1-${journey.slug}.png`; a.click();
      URL.revokeObjectURL(url); setBusy(false);
    }, 'image/png');
  }
  return (
    <button className="dia1-card-btn" onClick={make} disabled={busy}>
      {busy ? downloading : label}
    </button>
  );
}
