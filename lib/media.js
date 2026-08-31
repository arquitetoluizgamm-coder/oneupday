// ============================================================
// CAPA DO VÍDEO
//
// Sem atributo `poster`, o navegador pinta um retângulo preto até
// alguém dar play. No feed isso é péssimo: um vídeo parece um buraco.
//
// Pedir o instante 0.1s no próprio endereço (fragmento de mídia, o
// #t= do padrão W3C) faz o navegador buscar e desenhar esse quadro
// como capa, sem precisar gerar miniatura nem tocar no upload.
// Funciona porque o Supabase Storage responde a range request.
//
// 0.1s e não 0: em muitos arquivos o quadro zero ainda é preto,
// resquício do fade de abertura da câmera.
// ============================================================
export function comCapa(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('#')) return url;      // já tem fragmento: não mexe
  if (url.startsWith('blob:')) return url; // pré-visualização local: não precisa
  return url + '#t=0.1';
}

// Lê apenas os metadados do arquivo local. O blob temporário nunca sai
// do navegador e é descartado assim que a duração fica disponível.
export function duracaoDoVideo(file) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    const finish = (duration) => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      resolve(Number.isFinite(duration) ? duration : 0);
    };
    video.preload = 'metadata';
    video.onloadedmetadata = () => finish(video.duration);
    video.onerror = () => finish(0);
    video.src = objectUrl;
  });
}
