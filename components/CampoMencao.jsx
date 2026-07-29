'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { semArroba } from '../lib/mencoes';

// ============================================================
// CAMPO COM @ — o autocompletar das menções
//
// Envolve um <textarea> que já existe, sem trocar o que ele é: quem
// chama continua dono do valor e do onChange. Este componente só
// escuta, mostra a lista e devolve o texto com o handle inserido.
//
// Serve nos três lugares de uma vez (registro do dia, comentário,
// descrição da jornada) porque é sempre o mesmo gesto. Três cópias
// disso seriam três comportamentos diferentes no primeiro ajuste.
//
// ------------------------------------------------------------
// O QUE DECIDE SE A LISTA ABRE
//
// Só o trecho entre o último "@" e o cursor, e apenas quando:
//
//   · o @ está no começo do texto ou depois de um espaço — senão
//     "joao@gmail.com" abriria a lista no meio de um email;
//   · não há espaço entre o @ e o cursor — quem já escreveu
//     "@ana foi comigo" não quer a lista de volta ao editar o fim
//     da frase;
//   · tem pelo menos 1 letra depois do @.
//
// ------------------------------------------------------------
// TECLADO
//
// Seta para cima/baixo anda na lista, Enter e Tab escolhem, Esc
// fecha. Sem isso o campo fica intocável para quem não usa mouse —
// e num textarea o Enter tem outro dono, então ele só é capturado
// enquanto a lista está aberta.
// ============================================================

const ESPERA = 220;   // ms depois da última tecla antes de consultar

export default function CampoMencao({
  valor, onChange, textareaRef, className = '', children, onKeyDown, ...resto
}) {
  const meuRef = useRef(null);
  const ref = textareaRef || meuRef;
  const [lista, setLista] = useState([]);
  const [ativo, setAtivo] = useState(0);
  const [buscando, setBuscando] = useState(false);
  const termo = useRef(null);      // { inicio, texto }
  const timer = useRef(null);

  function fechar() {
    setLista([]); setAtivo(0); termo.current = null;
    clearTimeout(timer.current);
  }

  function lerTermo(el) {
    const pos = el.selectionStart ?? 0;
    const antes = String(valor || '').slice(0, pos);
    const at = antes.lastIndexOf('@');
    if (at < 0) return null;
    // o que vem antes do @ tem que ser começo de texto ou espaço
    const anterior = at === 0 ? '' : antes[at - 1];
    if (anterior && !/\s/.test(anterior)) return null;
    const escrito = antes.slice(at + 1);
    if (!escrito.length || /\s/.test(escrito)) return null;
    if (escrito.length > 20) return null;
    return { inicio: at, texto: escrito };
  }

  function aoDigitar(e) {
    onChange(e);
    const t = lerTermo(e.target);
    termo.current = t;
    clearTimeout(timer.current);
    if (!t) { setLista([]); return; }
    setBuscando(true);
    timer.current = setTimeout(async () => {
      const busca = semArroba(t.texto);
      try {
        const sb = createClient();
        const { data, error } = await sb.from('profiles')
          .select('id, name, handle, avatar_url, avatar_color')
          .or(`handle.ilike.%${busca}%,name.ilike.%${busca}%`)
          .limit(6);
        // erro não é lista vazia: uma consulta que falhou não
        // significa "não existe ninguém com esse nome"
        setLista(error ? [] : (data || []));
      } catch { setLista([]); }
      setAtivo(0); setBuscando(false);
    }, ESPERA);
  }

  function escolher(p) {
    const t = termo.current;
    const el = ref.current;
    if (!t || !el) return;
    const h = semArroba(p.handle);
    const s = String(valor || '');
    const pos = el.selectionStart ?? s.length;
    const novo = s.slice(0, t.inicio) + '@' + h + ' ' + s.slice(pos);
    const cursor = t.inicio + h.length + 2;
    // devolve no mesmo formato de um evento, para o onChange de quem
    // chama continuar funcionando sem saber que existe menção
    onChange({ target: { value: novo } });
    fechar();
    requestAnimationFrame(() => {
      try { el.focus(); el.setSelectionRange(cursor, cursor); } catch {}
    });
  }

  // A lista tem prioridade sobre o teclado de quem chama, mas SÓ
  // enquanto está aberta. Depois, a tecla segue o caminho normal.
  //
  // Isto aqui é o detalhe que decide se o campo funciona: no
  // compositor o Enter publica o registro. Se a lista de @ estivesse
  // aberta e o Enter publicasse, escolher uma pessoa mandaria o texto
  // no meio da frase. E se eu simplesmente sobrescrevesse o onKeyDown
  // de quem chama — que é o que acontece ao espalhar `...resto` antes
  // — o Enter de publicar deixaria de existir para sempre.
  function aoTeclar(e) {
    if (lista.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setAtivo((i) => (i + 1) % lista.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo((i) => (i - 1 + lista.length) % lista.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); escolher(lista[ativo]); return; }
      if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
    }
    if (typeof onKeyDown === 'function') onKeyDown(e);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="campo-mencao">
      <textarea
        {...resto}
        ref={ref}
        className={className}
        value={valor}
        onChange={aoDigitar}
        onKeyDown={aoTeclar}
        onBlur={() => setTimeout(fechar, 160)}   // dá tempo do clique acontecer
      />
      {children}
      {(lista.length > 0 || buscando) && termo.current && (
        <ul className="mencao-lista" role="listbox">
          {buscando && !lista.length && <li className="ml-vazio" aria-hidden="true">…</li>}
          {lista.map((p, i) => (
            <li key={p.id}>
              <button type="button" role="option" aria-selected={i === ativo}
                className={`ml-item${i === ativo ? ' on' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); escolher(p); }}
                onMouseEnter={() => setAtivo(i)}>
                <span className="ml-ava" style={{ background: p.avatar_color || 'var(--muted)' }}>
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt="" />
                    : (p.name || '?').trim().charAt(0).toUpperCase()}
                </span>
                <span className="ml-nome">{p.name}</span>
                <span className="ml-handle">@{semArroba(p.handle)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
