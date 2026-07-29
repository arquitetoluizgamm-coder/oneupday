'use client';
import { useEffect } from 'react';

// ============================================================
// O TOPO QUE SÓ APARECE ENQUANTO SE ROLA
//
// Antes: o topo sumia ao descer e voltava ao subir — o padrão de
// quase todo app. Agora ele aparece **durante** a rolagem e sai
// quando a rolagem para, para o feed ficar inteiro na tela.
//
// ------------------------------------------------------------
// A CLASSE `chrome-top` E POR QUE ELA PRECISOU EXISTIR
//
// Se o topo some sempre que a rolagem para, ele some também numa
// tela que não rola — e aí o botão de criar fica inalcançável,
// para sempre, sem nenhum aviso.
//
// `chrome-top` marca "estou no começo da página". Enquanto ela
// está lá, o topo fica visível parado ou não. As três situações:
//
//   no começo da página ..... visível
//   rolando ................. visível
//   parado no meio .......... escondido
//
// Assim quem quiser o topo sobe até em cima — um gesto que a
// pessoa já faz sem pensar — e quem quiser ler o feed inteiro
// simplesmente para de rolar.
// ============================================================
const TOPO = 40;   // até aqui ainda é "o começo da página"

export default function ScrollChrome() {
  useEffect(() => {
    const html = document.documentElement;
    let timer;

    const marcarTopo = () => {
      if (window.scrollY <= TOPO) html.classList.add('chrome-top');
      else html.classList.remove('chrome-top');
    };

    const onScroll = () => {
      marcarTopo();
      html.classList.add('chrome-scrolling');
      clearTimeout(timer);
      timer = setTimeout(() => html.classList.remove('chrome-scrolling'), 260);
    };

    // no primeiro quadro a página pode nem ter rolado ainda:
    // sem esta chamada, o topo nasceria escondido
    marcarTopo();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', marcarTopo);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', marcarTopo);
      html.classList.remove('chrome-hide', 'chrome-scrolling', 'chrome-top');
    };
  }, []);
  return null;
}
