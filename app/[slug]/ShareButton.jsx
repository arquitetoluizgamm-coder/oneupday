'use client';
import { useState } from 'react';
import { track } from '../../lib/track';
import { copiarTexto, entregarImagem } from '../../lib/compartilhar';

// ============================================================
// O CARD DA JORNADA — medir antes de desenhar
//
// Ele estava se sobrepondo, e a causa não era um número errado:
// era o método. Cada elemento tinha uma posição fixa herdada do
// anterior, e o rodapé tinha posição fixa a partir do fim. Quando
// o meio crescia — foto no topo, título de duas linhas, citação —
// o texto simplesmente passava por cima da barra.
//
// Medido no caso real que você mandou:
//
//   título 2ª linha .. 1152      barra ........ 1100
//   citação 2ª linha . 1298      rodapé ....... 1195
//
// Agora existe um LIMITE: nada de conteúdo passa de onde o rodapé
// começa. E o layout é calculado ANTES de desenhar — se não
// couber, o card não invade: ele corta o que é opcional, nesta
// ordem, e cada corte é uma escolha sobre o que importa menos.
//
// A busca é por combinação, não por escada fixa: para cada altura
// de faixa de foto (420, 340, 280, 220, 0) tenta a citação inteira,
// depois cortada, depois nenhuma — e para na primeira que couber.
//
// A ordem diz o que importa mais: a FOTO primeiro, porque é ela que
// faz alguém parar de rolar; a citação depois. Uma escada fixa que
// eu tinha escrito antes descartava a citação quando uma faixa menor
// resolveria — e isso é jogar fora a voz da pessoa por preguiça de
// procurar.
//
// O que a conta revela, e vale saber: com foto E título de duas
// linhas, NÃO cabe citação. O orçamento vertical é esse. O card
// então mostra foto + Dia N + título, que continua sendo um bom
// card — não um card quebrado.
// ============================================================
const W = 1080, H = 1350;
const MARGEM = 90;
const BARRA_Y = H - 250;        // onde o rodapé começa
const LIMITE = BARRA_Y - 60;    // nada de conteúdo pode passar daqui

function linhas(ctx, texto, maxW, maxLinhas) {
  const palavras = String(texto || '').trim().split(/\s+/);
  const out = [];
  let linha = '';
  for (const p of palavras) {
    const teste = linha ? linha + ' ' + p : p;
    if (ctx.measureText(teste).width > maxW && linha) {
      out.push(linha);
      if (out.length === maxLinhas) { out[maxLinhas - 1] += '…'; return out; }
      linha = p;
    } else linha = teste;
  }
  if (linha) out.push(linha);
  return out.slice(0, maxLinhas);
}

function escrever(ctx, arr, x, y, lh) {
  arr.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  return y + Math.max(0, arr.length - 1) * lh;
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
  const [done, setDone] = useState('');

  async function make() {
    setBusy(true);
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const maxW = W - MARGEM * 2;

    // ---- fundo ----
    ctx.fillStyle = '#090c2a'; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(W * .9, H * .08, 0, W * .9, H * .08, 620);
    g.addColorStop(0, 'rgba(240,47,135,.28)'); g.addColorStop(1, 'rgba(240,47,135,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(W * .06, H * .95, 0, W * .06, H * .95, 700);
    g.addColorStop(0, 'rgba(255,211,61,.20)'); g.addColorStop(1, 'rgba(255,211,61,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(MARGEM, 0, W - MARGEM, 0);
    grad.addColorStop(0, '#f02f87'); grad.addColorStop(.52, '#ff7a45'); grad.addColorStop(1, '#ffd33d');
    ctx.textBaseline = 'alphabetic';

    // ---- medir o texto (antes de qualquer decisão de layout) ----
    ctx.font = '800 68px Inter, sans-serif';
    // Duas linhas, não três: em 68px um título de três linhas come o
    // espaço da foto inteira, e aí o card perde o que tem de melhor.
    const lTitulo = linhas(ctx, journey.title, maxW, 2);
    ctx.font = '400 40px Inter, sans-serif';
    const textoDia = latest && latest.text ? `"${latest.text}"` : '';
    const lCitacao = textoDia ? linhas(ctx, textoDia, maxW, 2) : [];

    const temRecaida = !!(latest && latest.kind === 'setback');
    const img = latest && latest.photo_url ? await loadImg(latest.photo_url) : null;

    // ---- onde o conteúdo termina, para uma dada combinação ----
    const fim = (bandH, nCit) => {
      const topY = bandH ? 190 + bandH + 70 : 150;
      const y = topY + 70 + (temRecaida ? 40 : 0);
      let fimY = y + 320 + (lTitulo.length - 1) * 82;   // título
      if (nCit) fimY += 90 + (nCit - 1) * 56;
      return fimY;
    };

    // ---- procurar a combinação que cabe ----
    let bandH = 0, nCit = 0;
    const bandas = img ? [420, 340, 280, 220, 0] : [0];
    busca:
    for (const b of bandas) {
      for (let c = lCitacao.length; c >= 0; c--) {
        if (fim(b, c) <= LIMITE) { bandH = b; nCit = c; break busca; }
      }
    }

    // ---- desenhar ----
    if (bandH && img) {
      const bandY = 190;
      ctx.save();
      ctx.beginPath(); ctx.roundRect(MARGEM, bandY, maxW, bandH, 28); ctx.clip();
      const r = Math.max(maxW / img.width, bandH / img.height);
      const iw = img.width * r, ih = img.height * r;
      ctx.drawImage(img, MARGEM + (maxW - iw) / 2, bandY + (bandH - ih) / 2, iw, ih);
      ctx.restore();
    }
    const topY = bandH ? 190 + bandH + 70 : 150;

    ctx.font = '800 52px Inter, sans-serif';
    ctx.fillStyle = '#fff'; ctx.fillText('One ', MARGEM, topY);
    const oW = ctx.measureText('One ').width;
    ctx.fillStyle = grad; ctx.fillText('Up ', MARGEM + oW, topY);
    const uW = ctx.measureText('Up ').width;
    ctx.fillStyle = '#fff'; ctx.fillText('Day', MARGEM + oW + uW, topY);

    let y = topY + 70;
    if (temRecaida) {
      ctx.font = '700 32px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.fillText(card.setback, MARGEM, y); y += 40;
    }

    ctx.font = '900 170px Inter, sans-serif'; ctx.fillStyle = grad;
    ctx.fillText(`${card.day} ${stats.current_day || 0}`, MARGEM, y + 150);
    ctx.font = '700 56px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText(`${card.of} ${journey.total_days}`, MARGEM + 10, y + 220);

    ctx.font = '800 68px Inter, sans-serif'; ctx.fillStyle = '#fff';
    let fimTexto = escrever(ctx, lTitulo, MARGEM, y + 320, 82);

    if (nCit) {
      const corte = lCitacao.slice(0, nCit);
      // Cortou a citação no meio? Então ela precisa terminar em reticência,
      // senão parece que a pessoa parou de escrever na metade da frase.
      if (nCit < lCitacao.length) corte[nCit - 1] = corte[nCit - 1].replace(/[.,;:\s"]*$/, '') + '…"';
      ctx.font = '400 40px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.72)';
      fimTexto = escrever(ctx, corte, MARGEM, fimTexto + 90, 56);
    }

    // ---- rodapé, sempre no mesmo lugar ----
    const barW = maxW;
    const pct = Math.min(1, (stats.current_day || 0) / (journey.total_days || 1));
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath(); ctx.roundRect(MARGEM, BARRA_Y, barW, 24, 12); ctx.fill();
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(MARGEM, BARRA_Y, Math.max(28, barW * pct), 24, 12); ctx.fill();

    // ============================================================
    // O RODAPÉ TAMBÉM SE MEDE
    //
    // A sequência à esquerda e o link à direita eram escritos na MESMA
    // linha de base, cada um ancorado no seu lado, sem ninguém perguntar
    // se os dois cabiam. Com um slug longo eles se atropelavam:
    //
    //   "1 dia de presença" ... 374px
    //   o link inteiro ........ 836px
    //   disponível ............ 900px
    //
    // O link encurta para o domínio antes de brigar por espaço: ninguém
    // digita uma URL de 43 caracteres olhando uma imagem. O endereço
    // completo vai no texto do compartilhamento, onde é clicável.
    //
    // E se nem assim couber, o link desce uma linha em vez de invadir.
    // ============================================================
    const n = stats.streak || 0;
    // "1 dias de presença" é o tipo de detalhe que faz o card parecer
    // descuidado justamente na peça que a pessoa vai mostrar aos outros.
    const molde = n === 1 ? (card.streakOne || card.streak) : card.streak;
    const txtSeq = String(molde).replace('{n}', n);

    ctx.font = '700 40px Inter, sans-serif';
    const wSeq = ctx.measureText(txtSeq).width;

    ctx.font = '600 38px Inter, sans-serif';
    let link = `oneupday.app/${journey.slug}`;
    const RESPIRO = 40;
    if (wSeq + RESPIRO + ctx.measureText(link).width > maxW) link = 'oneupday.app';
    const wLink = ctx.measureText(link).width;
    const cabemJuntos = wSeq + RESPIRO + wLink <= maxW;

    ctx.font = '700 40px Inter, sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText(txtSeq, MARGEM, BARRA_Y + 95);
    ctx.font = '600 38px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.6)';
    if (cabemJuntos) ctx.fillText(link, W - MARGEM - wLink, BARRA_Y + 95);
    else ctx.fillText(link, MARGEM, BARRA_Y + 150);

    canvas.toBlob(async (blob) => {
      const r = await entregarImagem(blob, `one-up-day-${journey.slug}.png`, journey.title, {
        url: `https://oneupday.app/${journey.slug}`,
      });
      if (r === 'baixado') await copiarTexto(`https://oneupday.app/${journey.slug}`);
      // 'cancelado' também conta: a pessoa chegou até o menu de
      // compartilhar, e isso é o que o número precisa saber.
      if (r !== 'erro') track('card_generated', { kind: 'progress', slug: journey.slug, via: r });
      const message = r === 'copiado' || r === 'baixado'
        ? 'Link copiado. O card foi baixado.'
        : r === 'compartilhado' ? 'Compartilhado.' : '';
      setDone(message);
      if (message) window.setTimeout(() => setDone(''), 4000);
      setBusy(false);
    }, 'image/png');
  }

  return (
    <span className="share-action-wrap">
      <button className="share-button card-acao" onClick={make} disabled={busy}>
        {busy ? downloading : label}
      </button>
      {done && <span className="share-confirmation" role="status" aria-live="polite">{done}</span>}
    </span>
  );
}
