'use client';
import { useState } from 'react';
import { track } from '../../lib/track';
import { entregarImagem, copiarTexto } from '../../lib/compartilhar';

// ============================================================
// O CARD DE CONVITE
//
// "Chamar um amigo" só copiava um link. Ao lado de dois botões
// que produzem imagem, ele parecia a mesma coisa e entregava
// outra — e um link cru no WhatsApp não conta história nenhuma.
//
// Agora ele gera um cartão. O desenho segue o do Dia 1, que é o
// que você já aprovou: fundo escuro, degradê da marca, um bloco
// grande e o link embaixo.
//
// A diferença de conteúdo é o ponto: aqui o assunto NÃO é o
// progresso de quem manda. É o convite. Por isso o que aparece
// grande é o tema da jornada — o que a outra pessoa pode começar
// — e o dia de quem convida fica em segundo plano, uma linha de
// contexto. Card de convite que fala do próprio autor é cartão
// de vitrine, não convite.
//
// E o link vai JUNTO no compartilhamento, não só desenhado: numa
// conversa, um link clicável vale mais que a foto de um link.
// No computador, onde a imagem é baixada, ele vai para a área de
// transferência — senão a pessoa fica com o arquivo e sem o
// endereço.
// ============================================================
const W = 1080, H = 1350;
const MARGEM = 90;

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

export default function ConviteCard({ journey, owner, stats, label, downloading, copiedLabel, texts }) {
  const [busy, setBusy] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function make() {
    if (busy) return;
    setBusy(true);
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const maxW = W - MARGEM * 2;

    ctx.fillStyle = '#090c2a'; ctx.fillRect(0, 0, W, H);
    let g = ctx.createRadialGradient(W * .9, H * .08, 0, W * .9, H * .08, 640);
    g.addColorStop(0, 'rgba(240,47,135,.30)'); g.addColorStop(1, 'rgba(240,47,135,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(W * .05, H * .95, 0, W * .05, H * .95, 720);
    g.addColorStop(0, 'rgba(255,211,61,.20)'); g.addColorStop(1, 'rgba(255,211,61,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(MARGEM, 0, W - MARGEM, 0);
    grad.addColorStop(0, '#f02f87'); grad.addColorStop(.52, '#ff7a45'); grad.addColorStop(1, '#ffd33d');
    ctx.textBaseline = 'alphabetic';

    // marca
    ctx.font = '800 46px Inter, sans-serif';
    ctx.fillStyle = '#fff'; ctx.fillText('One ', MARGEM, 150);
    const oW = ctx.measureText('One ').width;
    ctx.fillStyle = grad; ctx.fillText('Up ', MARGEM + oW, 150);
    const uW = ctx.measureText('Up ').width;
    ctx.fillStyle = '#fff'; ctx.fillText('Day', MARGEM + oW + uW, 150);

    // "VEM COMIGO"
    ctx.font = '800 44px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.66)';
    ctx.fillText(texts.eyebrow, MARGEM, 430);

    // o tema, grande — é o que a outra pessoa pode começar
    ctx.font = '900 104px Inter, sans-serif'; ctx.fillStyle = grad;
    const lTema = linhas(ctx, journey.title, maxW, 3);
    // O bloco cresce para baixo a partir de uma linha fixa; com 3 linhas
    // ele termina em 800, bem acima do rodapé, que começa em 1100.
    lTema.forEach((l, i) => ctx.fillText(l, MARGEM, 560 + i * 120));

    // o dia de quem convida — contexto, não vitrine
    const dia = stats?.current_day || 1;
    ctx.font = '700 46px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.fillText(
      String(texts.linha).replace('{d}', dia).replace('{t}', journey.total_days || '?'),
      MARGEM, 560 + lTema.length * 120 + 20,
    );

    // o convite, ancorado no fim
    ctx.font = '800 62px Inter, sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText(texts.cta, MARGEM, H - 250);

    ctx.font = '600 38px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.6)';
    if (owner?.name) ctx.fillText(`${texts.by} ${owner.name}`, MARGEM, H - 170);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    // O mesmo cuidado do card da jornada: um slug longo faz a URL passar
    // da margem direita. Se não couber, fica só o domínio — o endereço
    // completo vai no texto do compartilhamento, onde é clicável.
    let linkFim = `oneupday.app/${journey.slug}`;
    if (ctx.measureText(linkFim).width > maxW) linkFim = 'oneupday.app';
    ctx.fillText(linkFim, MARGEM, H - 110);

    const url = `https://oneupday.app/${journey.slug}?r=s`;
    const texto = `${String(texts.msg).replace('{theme}', journey.title)} ${url}`;

    canvas.toBlob(async (blob) => {
      const r = await entregarImagem(blob, `convite-${journey.slug}.png`, journey.title, { text: texto, url });
      // Baixou em vez de compartilhar? Então o link não foi junto.
      // Copiar é o que impede a pessoa de ficar com a imagem e sem
      // o endereço para onde ela aponta.
      if (r === 'baixado') {
        const ok = await copiarTexto(texto);
        if (ok) { setCopiado(true); setTimeout(() => setCopiado(false), 2200); }
      }
      if (r !== 'erro') track('card_generated', { kind: 'convite', slug: journey.slug, via: r });
      setBusy(false);
    }, 'image/png');
  }

  return (
    <button className="challenge-btn card-acao" onClick={make} disabled={busy}>
      {busy ? downloading : (copiado ? copiedLabel : label)}
    </button>
  );
}
