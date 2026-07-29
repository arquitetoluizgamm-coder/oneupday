'use client';
import { useEffect } from 'react';

// ============================================================
// O TOPO DECIDE PELA DIREÇÃO DA ROLAGEM
//
//   descendo ............ some
//   subindo ............. aparece
//   perto do topo ....... sempre visível
//
// É o padrão do Instagram, e a razão dele é boa: a direção
// carrega intenção. Descer é consumir. Subir é procurar saída —
// voltar ao começo, achar o sino, criar alguma coisa. O topo
// aparece quando a pessoa quer navegar, e não toda vez que ela
// encosta na tela.
//
// Antes ele decidia por MOVIMENTO: aparecia ao rolar, sumia ao
// parar. O efeito colateral era ficar por cima da foto justo
// enquanto se descia o feed — que é a origem do halo, depois dos
// discos brancos, depois da marca sumindo sobre foto clara.
//
// ------------------------------------------------------------
// AS QUATRO CLASSES, E O QUE CADA UMA QUER DIZER
//
//   chrome-top ....... "estou no começo da página"
//   chrome-mostra .... "o topo deve aparecer"        (nova)
//   chrome-scrolling . "está rolando agora"          (inalterada)
//   chrome-parado .... "a rolagem parou no meio"     (inalterada)
//
// `chrome-mostra` nasceu em vez de eu torcer o sentido de
// `chrome-scrolling` para caber. Quem abrir este arquivo daqui a
// três meses não vai encontrar uma classe chamada "rolando"
// querendo dizer "subindo". Nome errado é dívida.
//
// As duas de baixo continuam intactas porque **o rodapé depende
// delas** — a pílula encolhe ao rolar e some ao parar, que foi o
// que você pediu. Mexer no topo não podia mexer nisso.
//
// ------------------------------------------------------------
// A REDE DE SEGURANÇA DO PATCH 166 CONTINUA VALENDO
//
// O topo some por PRESENÇA de classe, nunca por ausência. Essas
// classes só existem onde este componente roda — e ele roda só
// em /home. Nas outras 17 páginas o cabeçalho carrega o botão
// VOLTAR e não pode sumir nunca. Foi o pior erro desta sequência
// e ele não volta.
// ============================================================

const TOPO = 40;        // até aqui ainda é "o começo da página"

// Quanto a pessoa precisa mover na MESMA direção para o topo
// reagir. Sem isso, qualquer tremida do dedo — ou o repique de
// uma rolagem por inércia — faz o topo piscar.
//
// 8px é pouco o bastante para parecer instantâneo e o bastante
// para não disparar sozinho.
const LIMIAR = 8;

// Quanto o rodapé espera antes de se recolher. Não mudou.
const ESPERA = 1800;

export default function ScrollChrome() {
  useEffect(() => {
    const html = document.documentElement;
    let timer;
    let ultimoY = window.scrollY;
    let acumulado = 0;   // distância percorrida na direção atual

    const perto = () => window.scrollY <= TOPO;

    const marcarTopo = () => {
      if (perto()) {
        html.classList.add('chrome-top');
        html.classList.remove('chrome-parado');
      } else {
        html.classList.remove('chrome-top');
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - ultimoY;
      ultimoY = y;

      marcarTopo();

      // ---- o rodapé: exatamente como era ----
      html.classList.add('chrome-scrolling');
      html.classList.remove('chrome-parado');
      clearTimeout(timer);
      timer = setTimeout(() => {
        html.classList.remove('chrome-scrolling');
        if (window.scrollY > TOPO) html.classList.add('chrome-parado');
      }, ESPERA);

      // ---- o topo: daqui para baixo é o comportamento novo ----

      // No começo da página o topo fica, e a conta zera: assim,
      // ao descer a partir do topo, os 8px são contados do zero.
      if (perto()) { acumulado = 0; return; }

      // Efeito elástico das pontas (iOS e Android exageram no fim
      // e no começo da lista). Ali o `delta` é ruído de física, não
      // gesto — e sem esta guarda o topo pisca ao bater no fim.
      const fim = html.scrollHeight - window.innerHeight;
      if (y < 0 || y > fim) return;

      // Trocou de direção? A conta recomeça. Sem isto, descer 200px
      // e depois subir 5 já mostraria o topo, porque o saldo ainda
      // estaria positivo.
      if ((delta > 0) !== (acumulado > 0)) acumulado = 0;
      acumulado += delta;

      if (acumulado > LIMIAR) {          // desceu o bastante
        html.classList.remove('chrome-mostra');
        acumulado = 0;
      } else if (acumulado < -LIMIAR) {  // subiu o bastante
        html.classList.add('chrome-mostra');
        acumulado = 0;
      }
    };

    // Estado inicial: VISÍVEL.
    //
    // Se a pessoa voltar para o feed com a rolagem restaurada no
    // meio da página, ela chega sem ter rolado nada — e nascer
    // escondido deixaria o + e o sino inalcançáveis até ela pensar
    // em subir. Nascer visível erra para o lado seguro; o primeiro
    // gesto para baixo já corrige.
    html.classList.add('chrome-mostra');
    marcarTopo();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', marcarTopo);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', marcarTopo);
      html.classList.remove('chrome-hide', 'chrome-scrolling', 'chrome-top', 'chrome-parado', 'chrome-mostra');
    };
  }, []);
  return null;
}
