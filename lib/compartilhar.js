// ============================================================
// ENTREGAR A IMAGEM — compartilhar onde dá, baixar onde não dá
//
// Os dois cartões só BAIXAVAM: geravam o PNG no canvas e
// disparavam um <a download>. O rótulo dizia "Baixar card", e
// era verdade — mas a pessoa quase nunca quer o arquivo: ela
// quer mandar para os Stories, para o WhatsApp, para alguém.
//
// O compartilhamento nativo faz isso em um toque. Só que ele
// NÃO existe em desktop na maioria dos navegadores. Então:
// compartilha onde existe, baixa onde não existe, e o rótulo
// continua "Compartilhar" porque é isso que a pessoa está
// fazendo — o download é o caminho, não o objetivo.
//
// Duas armadilhas conhecidas, as duas tratadas aqui:
//
//   1. `navigator.share` existir NÃO garante que ele aceite
//      arquivo. Por isso o teste é `canShare({ files })`, com o
//      arquivo de verdade na mão.
//
//   2. Fechar o menu de compartilhamento lança AbortError. Isso
//      não é falha: é a pessoa mudando de ideia. Baixar por cima
//      seria ignorar o que ela acabou de decidir.
// ============================================================
export async function entregarImagem(blob, nomeArquivo, titulo) {
  if (!blob) return 'erro';

  try {
    const arquivo = new File([blob], nomeArquivo, { type: blob.type || 'image/png' });
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.share
        && navigator.canShare({ files: [arquivo] })) {
      await navigator.share({ files: [arquivo], title: titulo || '' });
      return 'compartilhado';
    }
  } catch (e) {
    if (e && (e.name === 'AbortError' || e.name === 'NotAllowedError')) return 'cancelado';
    // Qualquer outra falha do compartilhamento cai no download abaixo:
    // é melhor a pessoa terminar com o arquivo do que sem nada.
  }

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
