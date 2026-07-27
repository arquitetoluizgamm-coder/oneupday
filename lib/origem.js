// ============================================================
// DE ONDE A PESSOA VEIO
//
// Um link publicado num grupo leva um marcador no fim:
//     oneupday.app/?fb=recomecar-e-possivel
//
// Isso não muda nada para quem clica. Serve para responder, depois,
// a única pergunta que decide onde vale voltar a postar: qual grupo
// trouxe gente que FICOU.
//
// Por que guardar no navegador em vez de ler na hora do cadastro:
// quase ninguém se cadastra na primeira visita. A pessoa chega pelo
// link, lê, fecha, volta dois dias depois pelo Google e só então
// cria a conta. Sem guardar, essa pessoa apareceria como "veio do
// nada" — e o grupo que realmente a trouxe não receberia o crédito.
//
// 30 dias de validade. Depois disso a atribuição vira ficção: quem
// se cadastra um mês depois já não veio daquele post.
// ============================================================

const CHAVE = 'oud_origem';
const VALIDADE = 30 * 24 * 3600 * 1000;

// Só letras, números, hífen e ponto, até 40 caracteres. O valor vem
// da URL, ou seja, de fora — e vai para o banco. Sanear na entrada é
// mais barato que confiar em quem escreveu o link.
function limpar(v) {
  return String(v || '').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40);
}

export function guardarOrigem() {
  if (typeof window === 'undefined') return;
  try {
    const p = new URLSearchParams(window.location.search);
    const bruto = p.get('fb') || p.get('origem') || p.get('utm_source');
    const valor = limpar(bruto);
    if (!valor) return;
    // A primeira origem ganha. Se a pessoa voltar por outro link,
    // quem a apresentou ao app foi o primeiro — não o último.
    const atual = lerOrigem();
    if (atual) return;
    localStorage.setItem(CHAVE, JSON.stringify({ v: valor, t: Date.now() }));
  } catch { }
}

export function lerOrigem() {
  if (typeof window === 'undefined') return null;
  try {
    const cru = localStorage.getItem(CHAVE);
    if (!cru) return null;
    const { v, t } = JSON.parse(cru);
    if (!v || !t || Date.now() - t > VALIDADE) { localStorage.removeItem(CHAVE); return null; }
    return v;
  } catch { return null; }
}
