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
const TOPO = 40;      // até aqui ainda é "o começo da página"

// Quanto o topo fica na tela depois que a rolagem para.
//
// Estava em 260ms — tempo suficiente para o dedo sair da tela e
// não para ele voltar e acertar um botão. Quem rola e decide
// tocar no + leva perto de um segundo entre uma coisa e outra.
//
// 1,8s dá folga para o gesto e ainda some sozinho antes de virar
// uma barra permanente por cima do feed.
const ESPERA = 1800;

export default function ScrollChrome() {
  useEffect(() => {
    const html = document.documentElement;
    let timer;

    const marcarTopo = () => {
      if (window.scrollY <= TOPO) {
        html.classList.add('chrome-top');
        html.classList.remove('chrome-parado');   // no topo, o rodapé fica
      } else {
        html.classList.remove('chrome-top');
      }
    };

    const onScroll = () => {
      marcarTopo();
      html.classList.add('chrome-scrolling');
      html.classList.remove('chrome-parado');
      clearTimeout(timer);
      timer = setTimeout(() => {
        html.classList.remove('chrome-scrolling');
        // `chrome-parado` é ADICIONADA quando a rolagem para no meio
        // da página. O rodapé se esconde por causa dela.
        //
        // A inversão é de propósito, e é a lição de dois erros meus
        // nesta sequência: se o rodapé sumisse por FALTA de classe,
        // ele sumiria em todas as páginas que não têm este
        // componente — e são 17. Some por PRESENÇA de classe, e a
        // classe só existe onde este código roda.
        if (window.scrollY > TOPO) html.classList.add('chrome-parado');
      }, ESPERA);
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
      html.classList.remove('chrome-hide', 'chrome-scrolling', 'chrome-top', 'chrome-parado');
    };
  }, []);
  return null;
}
