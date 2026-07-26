// ============================================================
// FUNDOS DE CITACAO
//
// Gerado a partir das imagens reais: cada fundo carrega a PROPRIA
// caixa de texto, medida na imagem dele. Caixa fixa por template
// nao funcionaria — cada arte poe a area limpa num lugar.
//
// caixa  : em pixels da arte de 1080x1350
// corpo  : tamanho da fonte por faixa de tamanho do texto
// maxChars: acima disso o fundo nao entra na escolha
// ============================================================
export const FUNDOS = [
  { arquivo: 'painel-1a.webp', template: 'painel', maxChars: 280, corTexto: '#10132D',
    caixa: { x: 90, y: 200, w: 900, h: 520 },
    corpo: { c90: 72, c180: 56, c280: 42 } },
  { arquivo: 'painel-1b.webp', template: 'painel', maxChars: 280, corTexto: '#10132D',
    caixa: { x: 90, y: 110, w: 900, h: 600 },
    corpo: { c90: 72, c180: 58, c280: 48 } },
  { arquivo: 'painel-1c.webp', template: 'painel', maxChars: 280, corTexto: '#10132D',
    caixa: { x: 90, y: 150, w: 900, h: 840 },
    corpo: { c90: 72, c180: 72, c280: 56 } },
  { arquivo: 'painel-1d.webp', template: 'painel', maxChars: 280, corTexto: '#FAF7F2',
    caixa: { x: 110, y: 430, w: 860, h: 800 },
    corpo: { c90: 72, c180: 70, c280: 54 } },
  { arquivo: 'janela-3a.webp', template: 'janela', maxChars: 280, corTexto: '#10132D',
    caixa: { x: 110, y: 300, w: 860, h: 780 },
    corpo: { c90: 72, c180: 68, c280: 52 } },
  { arquivo: 'janela-3b.webp', template: 'janela', maxChars: 280, corTexto: '#10132D',
    caixa: { x: 100, y: 300, w: 620, h: 780 },
    corpo: { c90: 72, c180: 58, c280: 44 } },
  { arquivo: 'janela-3c.webp', template: 'janela', maxChars: 280, corTexto: '#10132D',
    caixa: { x: 110, y: 300, w: 860, h: 780 },
    corpo: { c90: 72, c180: 68, c280: 52 } },
];

// escolhe os fundos que aguentam o texto; se nao houver, devolve todos
export function fundosPara(texto) {
  const n = (texto || '').trim().length;
  const ok = FUNDOS.filter((f) => n <= f.maxChars);
  return ok.length ? ok : FUNDOS;
}

// corpo da fonte conforme o tamanho do texto
export function corpoPara(fundo, texto) {
  const n = (texto || '').trim().length;
  if (n <= 90) return fundo.corpo.c90;
  if (n <= 180) return fundo.corpo.c180;
  return fundo.corpo.c280;
}
