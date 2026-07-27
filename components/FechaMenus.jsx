'use client';
import { useEffect } from 'react';

// ============================================================
// MENU QUE FECHA SOZINHO
//
// <details> é a forma mais barata e mais acessível de fazer um
// menu — funciona sem JavaScript, o teclado já sabe operá-lo, e o
// leitor de tela anuncia o estado sem precisar de ARIA.
//
// Mas ele tem um comportamento nativo que não serve para menu:
// NÃO fecha quando você toca fora. Toda biblioteca de componentes
// resolve isso; o elemento sozinho, não.
//
// Numa página com dez posts, isso significa dez menus podendo
// ficar abertos ao mesmo tempo — e no celular, onde não há tecla
// Esc, a única saída seria tocar de novo exatamente no ⋯ que
// você abriu.
//
// Este componente é montado uma vez na página e cuida de todos:
//   · tocar fora fecha
//   · Esc fecha
//   · abrir um fecha os outros
//
// `capture: true` porque o clique precisa ser visto antes que o
// próprio <details> processe o toque no summary — senão abrir e
// fechar entrariam em conflito no mesmo evento.
// ============================================================
export default function FechaMenus({ seletor = 'details.mais-menu' }) {
  useEffect(() => {
    const abertos = () => Array.from(document.querySelectorAll(`${seletor}[open]`));

    const aoTocar = (e) => {
      abertos().forEach((d) => { if (!d.contains(e.target)) d.open = false; });
    };

    const aoTeclar = (e) => {
      if (e.key !== 'Escape') return;
      const lista = abertos();
      if (!lista.length) return;
      lista.forEach((d) => { d.open = false; });
      // devolve o foco ao botão que abriu, senão ele se perde no topo
      lista[0].querySelector('summary')?.focus();
    };

    // abrir um fecha os demais
    const aoAlternar = (e) => {
      const alvo = e.target;
      if (!alvo.matches?.(seletor) || !alvo.open) return;
      abertos().forEach((d) => { if (d !== alvo) d.open = false; });
    };

    document.addEventListener('pointerdown', aoTocar, true);
    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('toggle', aoAlternar, true);
    return () => {
      document.removeEventListener('pointerdown', aoTocar, true);
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('toggle', aoAlternar, true);
    };
  }, [seletor]);

  return null;
}
