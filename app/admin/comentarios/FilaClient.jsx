'use client';
import { useState } from 'react';

export default function FilaClient({ itens, semIA = false }) {
  const [lista, setLista] = useState(itens || []);
  const [ocupado, setOcupado] = useState('');
  const [recado, setRecado] = useState('');

  async function decidir(id, acao) {
    setOcupado(id);
    const r = await fetch('/api/comments/revisar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao, id }),
    });
    setOcupado('');
    if (!r.ok) { setRecado('Não deu certo. Tente de novo.'); return; }
    setLista(l => l.filter(c => c.id !== id));
  }

  async function reprocessar() {
    setOcupado('tudo'); setRecado('');
    const r = await fetch('/api/comments/revisar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'reprocessar' }),
    });
    const d = await r.json().catch(() => ({}));
    setOcupado('');
    if (!r.ok) { setRecado('Não deu certo. Tente de novo.'); return; }
    if (d.semChave) { setRecado('Sem OPENAI_API_KEY não há o que reprocessar — nada foi liberado.'); return; }
    setRecado(`${d.publicados || 0} publicados · ${d.bloqueados || 0} bloqueados · ${d.pendentes || 0} continuam pendentes.`);
    if ((d.publicados || 0) + (d.bloqueados || 0) > 0) setTimeout(() => window.location.reload(), 900);
  }

  return (
    <div className="fila">
      <div className="fila-topo">
        <button type="button" className="fila-btn fila-btn-ia" onClick={reprocessar} disabled={!!ocupado || semIA}
          title={semIA ? 'Sem OPENAI_API_KEY não há IA para consultar' : undefined}>
          {ocupado === 'tudo' ? 'Reprocessando…' : 'Reprocessar com a IA'}
        </button>
        {recado && <span className="fila-recado">{recado}</span>}
      </div>

      {lista.length === 0 ? (
        <p className="fila-vazia">Nada esperando revisão. É assim que deve ficar na maior parte do tempo.</p>
      ) : lista.map(c => (
        <article key={c.id} className="fila-item">
          <header className="fila-cab">
            <strong>{c.autor || 'alguém'}</strong>
            <span className="fila-quando">{c.espera}</span>
          </header>
          <p className="fila-corpo">{c.body}</p>
          <div className="fila-acoes">
            <button type="button" className="fila-btn fila-btn-ok" disabled={!!ocupado} onClick={() => decidir(c.id, 'publicar')}>Publicar</button>
            <button type="button" className="fila-btn fila-btn-no" disabled={!!ocupado} onClick={() => decidir(c.id, 'recusar')}>Recusar</button>
          </div>
        </article>
      ))}
    </div>
  );
}
