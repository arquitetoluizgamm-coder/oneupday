'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FUNDOS, fundosPara, corpoPara } from '../../lib/fundos';

// ============================================================
// CITAÇÃO
//
// A pessoa escreve uma frase, o app escolhe os fundos que aguentam
// aquele tamanho e ela toca no que gostar. A imagem sai em
// 1080x1350 desenhada no navegador — sem servidor, sem espera.
//
// A caixa de texto vem de cada fundo, não do template: cada arte
// põe a área limpa num lugar diferente.
// ============================================================

const LARG = 1080, ALT = 1350, MAX = 280;
const FONTE = "'Fraunces', Georgia, 'Times New Roman', serif";

// quebra o texto em linhas que cabem na largura, medindo de verdade
function quebrar(ctx, texto, larg) {
  const linhas = [];
  for (const paragrafo of texto.split('\n')) {
    if (!paragrafo.trim()) { linhas.push(''); continue; }
    let atual = '';
    for (const palavra of paragrafo.split(/\s+/)) {
      const teste = atual ? atual + ' ' + palavra : palavra;
      if (ctx.measureText(teste).width <= larg || !atual) atual = teste;
      else { linhas.push(atual); atual = palavra; }
    }
    if (atual) linhas.push(atual);
  }
  return linhas;
}

// A aspa é decorativa, não pontuação: fica maior que o texto e mais
// apagada, para marcar "isto é uma frase" sem disputar a leitura.
const ASPA_ESCALA = 3.2;   // em relação ao corpo do texto
const ASPA_ALTURA = 0.56;  // altura visual da aspa dentro do seu em
const ASPA_OPACIDADE = 0.26;

function desenhar(ctx, img, fundo, texto, autor) {
  ctx.clearRect(0, 0, LARG, ALT);
  ctx.drawImage(img, 0, 0, LARG, ALT);

  const c = fundo.caixa;
  let corpo = corpoPara(fundo, texto);
  let linhas, altura, entre, aspa, aspaAlt, respiro, bloco;

  // encolhe até caber. O limite por caracteres é só uma estimativa: quem
  // decide é a medida real das palavras — e a aspa também ocupa altura.
  for (;;) {
    ctx.font = `500 ${corpo}px ${FONTE}`;
    linhas = quebrar(ctx, texto, c.w);
    entre = corpo >= 66 ? 1.20 : corpo >= 52 ? 1.25 : 1.30;
    altura = linhas.length * corpo * entre;
    aspa = Math.round(corpo * ASPA_ESCALA);
    aspaAlt = aspa * ASPA_ALTURA;
    respiro = Math.round(corpo * 0.30);
    bloco = aspaAlt + respiro + altura;
    if (bloco <= c.h || corpo <= 26) break;
    corpo -= 2;
  }

  const meio = c.x + c.w / 2;
  let y = c.y + (c.h - bloco) / 2;

  ctx.fillStyle = fundo.corTexto;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // aspa de abertura, centralizada acima do texto
  ctx.save();
  ctx.globalAlpha = ASPA_OPACIDADE;
  ctx.font = `700 ${aspa}px ${FONTE}`;
  ctx.fillText('“', meio, y - aspa * 0.14);
  ctx.restore();

  y += aspaAlt + respiro;
  ctx.font = `500 ${corpo}px ${FONTE}`;
  for (const ln of linhas) {
    ctx.fillText(ln, meio, y);
    y += corpo * entre;
  }

  if (autor && autor.trim()) {
    ctx.font = `700 26px 'Montserrat', system-ui, sans-serif`;
    ctx.globalAlpha = 0.7;
    ctx.fillText(autor.trim(), meio, Math.min(y + 22, c.y + c.h + 30));
    ctx.globalAlpha = 1;
  }
}

export default function CitacaoForm({ t, autorPadrao }) {
  const [texto, setTexto] = useState('');
  const [autor, setAutor] = useState(autorPadrao || '');
  const [escolhido, setEscolhido] = useState(FUNDOS[0].arquivo);
  const [pronto, setPronto] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const canvas = useRef(null);
  const imgs = useRef({});

  const elegiveis = useMemo(() => fundosPara(texto), [texto]);
  const fundo = elegiveis.find((f) => f.arquivo === escolhido) || elegiveis[0];

  // se o texto cresceu e o fundo escolhido não aguenta mais, troca sozinho
  useEffect(() => {
    if (!elegiveis.some((f) => f.arquivo === escolhido)) setEscolhido(elegiveis[0].arquivo);
  }, [elegiveis, escolhido]);

  // carrega as artes uma vez e redesenha a cada mudança
  useEffect(() => {
    let vivo = true;
    async function pintar() {
      const cv = canvas.current;
      if (!cv || !fundo) return;
      const ctx = cv.getContext('2d');
      let img = imgs.current[fundo.arquivo];
      if (!img) {
        img = new Image();
        img.src = `/fundos/${fundo.arquivo}`;
        await img.decode().catch(() => {});
        imgs.current[fundo.arquivo] = img;
      }
      try { await document.fonts.ready; } catch {}
      if (!vivo) return;
      desenhar(ctx, img, fundo, texto.trim() || t.citPh, autor);
      setPronto(true);
    }
    pintar();
    return () => { vivo = false; };
  }, [fundo, texto, autor]); // eslint-disable-line react-hooks/exhaustive-deps

  async function baixar() {
    const cv = canvas.current;
    if (!cv || baixando) return;
    setBaixando(true);
    const blob = await new Promise((r) => cv.toBlob(r, 'image/png', 0.95));
    setBaixando(false);
    if (!blob) return;

    const arquivo = new File([blob], 'oneupday.png', { type: 'image/png' });
    // no celular, compartilhar direto vale mais que baixar e procurar depois
    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      try { await navigator.share({ files: [arquivo] }); return; } catch {}
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'oneupday.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  return (
    <div className="cit">
      <div className="cit-area">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value.slice(0, MAX))}
          rows={4}
          maxLength={MAX}
          placeholder={t.citPh}
          autoFocus
        />
        <span className="cit-count">{texto.length}/{MAX}</span>
      </div>

      <div className="cit-preview">
        <canvas ref={canvas} width={LARG} height={ALT} aria-label={t.citPreview} />
        {!pronto && <span className="cit-load" />}
      </div>

      <div className="cit-field">
        <span className="cit-label">{t.citBg} <em>{elegiveis.length}</em></span>
        <div className="cit-thumbs">
          {FUNDOS.map((f) => {
            const cabe = elegiveis.some((e) => e.arquivo === f.arquivo);
            return (
              <button
                key={f.arquivo}
                type="button"
                className={`cit-thumb${fundo && f.arquivo === fundo.arquivo ? ' on' : ''}${cabe ? '' : ' off'}`}
                onClick={() => cabe && setEscolhido(f.arquivo)}
                disabled={!cabe}
                title={cabe ? '' : t.citTooLong}
                style={{ backgroundImage: `url(/fundos/${f.arquivo})` }}
                aria-label={f.template}
              />
            );
          })}
        </div>
        {elegiveis.length < FUNDOS.length && <p className="cit-hint">{t.citHint}</p>}
      </div>

      <label className="cit-field cit-autor">
        <span className="cit-label">{t.citAuthor}</span>
        <input value={autor} onChange={(e) => setAutor(e.target.value.slice(0, 30))} maxLength={30} placeholder={t.citAuthorPh} />
      </label>

      <button type="button" className="cta grow cit-go" onClick={baixar} disabled={!texto.trim() || baixando}>
        {baixando ? t.citSaving : t.citSave}
      </button>
    </div>
  );
}
