'use client';
import { useState, useMemo } from 'react';

function quando(iso) {
  if (!iso) return '—';
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  const m = Math.floor(dias / 30);
  return m === 1 ? 'há 1 mês' : `há ${m} meses`;
}

export default function PessoasClient({ itens }) {
  const [lista, setLista] = useState(itens || []);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [aberto, setAberto] = useState(null);   // id em que o painel de ação está aberto
  const [conf, setConf] = useState('');
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState('');
  const [recado, setRecado] = useState('');

  const vistos = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return lista.filter(p => {
      if (filtro === 'suspensos' && !p.suspenso) return false;
      if (filtro === 'ativos' && p.suspenso) return false;
      if (filtro === 'sem_jornada' && p.jornadas > 0) return false;
      if (filtro === 'denunciados' && !p.denuncias) return false;
      if (!q) return true;
      return [p.nome, p.handle, p.email, p.origem].join(' ').toLowerCase().includes(q);
    });
  }, [lista, busca, filtro]);

  async function agir(p, acao) {
    setOcupado(p.id); setRecado('');
    const r = await fetch('/api/admin/pessoa', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao, id: p.id, motivo, confirmacao: conf }),
    });
    const d = await r.json().catch(() => ({}));
    setOcupado('');
    if (!r.ok) {
      setRecado(d.error === 'confirmacao'
        ? `Para excluir, digite exatamente ${d.esperado}`
        : d.error === 'voce mesmo' ? 'Você não pode excluir a própria conta por aqui.'
        : 'Não deu certo. Tente de novo.');
      return;
    }
    if (acao === 'excluir') setLista(l => l.filter(x => x.id !== p.id));
    else setLista(l => l.map(x => x.id === p.id ? { ...x, suspenso: acao === 'suspender', motivo } : x));
    setAberto(null); setConf(''); setMotivo('');
  }

  return (
    <div className="adm">
      <div className="adm-barra">
        <input className="adm-busca" placeholder="Buscar por nome, @, e-mail ou origem"
          value={busca} onChange={e => setBusca(e.target.value)} />
        <select className="adm-sel" value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos ({lista.length})</option>
          <option value="ativos">Ativos</option>
          <option value="suspensos">Suspensos</option>
          <option value="sem_jornada">Sem jornada</option>
          <option value="denunciados">Com denúncia</option>
        </select>
      </div>
      {recado && <p className="adm-recado">{recado}</p>}

      {vistos.length === 0 && <p className="fila-vazia">Ninguém aqui com esse filtro.</p>}

      {vistos.map(p => (
        <article key={p.id} className={'adm-pessoa' + (p.suspenso ? ' susp' : '')}>
          <div className="adm-linha">
            <div className="adm-quem">
              <strong>{p.nome || 'sem nome'}</strong>
              <span className="adm-arroba">{p.handle}</span>
              {p.suspenso && <span className="adm-selo">suspenso</span>}
              {p.denuncias > 0 && <span className="adm-selo den">{p.denuncias} denúncia{p.denuncias > 1 ? 's' : ''}</span>}
            </div>
            <button type="button" className="adm-mais" onClick={() => { setAberto(aberto === p.id ? null : p.id); setConf(''); setMotivo(''); setRecado(''); }}>
              {aberto === p.id ? 'fechar' : 'gerenciar'}
            </button>
          </div>

          <div className="adm-dados">
            <span>{p.email || 'sem e-mail'}</span>
            <span>entrou {quando(p.entrou)}</span>
            <span>{p.jornadas} jornada{p.jornadas === 1 ? '' : 's'}</span>
            <span>{p.dias} dia{p.dias === 1 ? '' : 's'} publicado{p.dias === 1 ? '' : 's'}</span>
            <span>último {p.ultimo ? quando(new Date(p.ultimo).toISOString()) : 'nunca postou'}</span>
            {p.origem && <span className="adm-origem">veio de {p.origem}</span>}
          </div>

          {p.suspenso && p.motivo && <p className="adm-motivo">Motivo: {p.motivo}</p>}

          {aberto === p.id && (
            <div className="adm-acoes">
              <label className="adm-campo">
                <span>Motivo (fica registrado)</span>
                <input value={motivo} onChange={e => setMotivo(e.target.value)}
                  placeholder="ex.: comentários agressivos em três jornadas" />
              </label>

              {p.suspenso ? (
                <button type="button" className="fila-btn fila-btn-ok" disabled={!!ocupado}
                  onClick={() => agir(p, 'reativar')}>Reativar conta</button>
              ) : (
                <button type="button" className="fila-btn" disabled={!!ocupado}
                  onClick={() => agir(p, 'suspender')}>Suspender</button>
              )}

              <div className="adm-perigo">
                <p>
                  <strong>Excluir apaga tudo</strong> — login, perfil, jornadas, dias, fotos e
                  comentários. Não tem como desfazer. Para quase todo caso, suspender resolve e
                  deixa a porta aberta.
                </p>
                <label className="adm-campo">
                  <span>Digite <b>{p.handle}</b> para liberar</span>
                  <input value={conf} onChange={e => setConf(e.target.value)} placeholder={p.handle} />
                </label>
                <button type="button" className="fila-btn adm-excluir"
                  disabled={!!ocupado || conf.trim().toLowerCase() !== (p.handle || '').toLowerCase()}
                  onClick={() => agir(p, 'excluir')}>Excluir definitivamente</button>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
