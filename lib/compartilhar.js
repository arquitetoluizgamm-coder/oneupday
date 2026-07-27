// ============================================================
// ENTREGAR A IMAGEM — compartilhar no celular, baixar no computador
//
// Os cartões só BAIXAVAM. O rótulo dizia "Baixar card", e era
// verdade — mas a pessoa quase nunca quer o arquivo: ela quer
// mandar para os Stories, para o WhatsApp, para alguém.
//
// ------------------------------------------------------------
// POR QUE O COMPUTADOR NÃO TENTA COMPARTILHAR
//
// A primeira versão tentava `navigator.share` em qualquer lugar.
// No Windows o Chrome TEM a função, então o teste passava — e aí
// abria uma janela do sistema que, na maioria das máquinas, não
// tem para onde mandar. Fechá-la lança AbortError, que o código
// lia como "a pessoa desistiu" e não baixava nada.
//
// Resultado: no computador o botão simplesmente não fazia nada.
//
// Agora o compartilhamento nativo só é tentado em aparelho de
// TOQUE, onde ele de fato resolve. No computador baixa direto,
// que é o que o computador faz bem. Mesma heurística que o
// ChallengeButton já usava — agora num lugar só.
// ------------------------------------------------------------
//
// E fechar o menu de compartilhar continua sendo respeitado: se
// a pessoa desistiu no celular, nada é baixado por cima.
// ============================================================
function ehToque() {
  if (typeof navigator === 'undefined') return false;
  if ((navigator.maxTouchPoints || 0) > 0) return true;
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer:coarse)').matches;
}

export async function entregarImagem(blob, nomeArquivo, titulo, extras = {}) {
  if (!blob) return 'erro';

  if (ehToque()) {
    try {
      const arquivo = new File([blob], nomeArquivo, { type: blob.type || 'image/png' });
      // `navigator.share` existir NÃO garante que ele aceite arquivo.
      // O teste tem que ser feito com o arquivo de verdade na mão.
      if (navigator.canShare && navigator.share && navigator.canShare({ files: [arquivo] })) {
        const dados = { files: [arquivo], title: titulo || '' };
        // Link junto da imagem: numa conversa, um link clicável vale
        // mais que a foto de um link.
        if (extras.text) dados.text = extras.text;
        if (extras.url) dados.url = extras.url;
        await navigator.share(dados);
        return 'compartilhado';
      }
    } catch (e) {
      if (e && (e.name === 'AbortError' || e.name === 'NotAllowedError')) return 'cancelado';
      // Outra falha qualquer cai no download: melhor terminar com o
      // arquivo do que terminar sem nada.
    }
  }

  return baixar(blob, nomeArquivo);
}

export function baixar(blob, nomeArquivo) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    // Sem isto o blob fica na memória até a aba fechar.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'baixado';
  } catch {
    return 'erro';
  }
}

/** Copia texto. Usada quando o card é baixado no computador e o
 *  link precisa ir junto de alguma forma. */
export async function copiarTexto(texto) {
  try { await navigator.clipboard.writeText(texto); return true; } catch {}
  try {
    const ta = document.createElement('textarea');
    ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}
