'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { comCapa } from '../lib/media';

export default function MediaGallery({ items, showVis, visLabels, own, deleteLabel, deleteConfirm }) {
  const [list, setList] = useState(items || []);
  const [open, setOpen] = useState(-1);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open < 0) return;
    function onKey(e) { if (e.key === 'Escape') setOpen(-1); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  if (!list.length) return null;
  const V = visLabels || {};

  async function remove(m) {
    if (busy) return;
    if (!window.confirm(deleteConfirm || 'Excluir?')) return;
    setBusy(true);
    try { const sb = createClient(); await sb.from('media').delete().eq('id', m.id); } catch { }
    setBusy(false);
    setOpen(-1);
    setList((prev) => prev.filter((x) => x.id !== m.id));
  }

  // ============================================================
  // A CITAÇÃO É UMA IMAGEM FEITA DE TEXTO
  //
  // Para quem enxerga, a frase está desenhada ali. Para quem usa
  // leitor de tela, uma citação com alt vazio é uma imagem muda —
  // e ela é 100% texto. A legenda guardada é exatamente o que está
  // escrito no desenho, então ela é o alt certo.
  //
  // Foto comum continua sem alt aqui de propósito: a tabela media
  // não tem coluna de descrição (só updates tem, desde o patch 79),
  // e a legenda de uma foto é legenda, não descrição da imagem.
  // ============================================================
  const altDe = (m) => (m.kind === 'quote' ? (m.caption || '') : '');

  return (
    <>
      <div className="album-grid">
        {list.map((m, i) => (
          <button type="button" className="album-item" key={m.id} onClick={() => setOpen(i)}>
            {m.kind === 'video' ? <video src={comCapa(m.url)} muted playsInline preload="metadata" /> : <img src={m.url} alt={altDe(m)} />}
            {m.kind === 'video' && <span className="album-play">▶</span>}
            {showVis && <span className={`album-vis vis-${m.visibility}`}>{V[m.visibility] || ''}</span>}
          </button>
        ))}
      </div>
      {open >= 0 && list[open] && (
        <div className="lightbox" onClick={() => setOpen(-1)}>
          <button className="lb-close" onClick={() => setOpen(-1)} aria-label="Fechar">✕</button>
          {own && <button className="lb-del" onClick={(e) => { e.stopPropagation(); remove(list[open]); }} disabled={busy} aria-label={deleteLabel}>🗑 {deleteLabel}</button>}
          <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
            {list[open].kind === 'video'
              ? <video src={comCapa(list[open].url)} controls autoPlay playsInline />
              : <img src={list[open].url} alt={altDe(list[open])} />}
          </div>
          {list.length > 1 && (
            <>
              <button className="lb-nav prev" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + list.length) % list.length); }} aria-label="Anterior">‹</button>
              <button className="lb-nav next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % list.length); }} aria-label="Próxima">›</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
