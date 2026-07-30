'use client';

import { useEffect } from 'react';

// Mantém a tira de dias sincronizada quando a pessoa navega arrastando os
// próprios capítulos, sem depender das setas ou do teclado.
export default function JourneyScrollSync() {
  useEffect(() => {
    const rail = document.querySelector('.journey-public .timeline');
    if (!rail || typeof IntersectionObserver === 'undefined') return undefined;

    const cards = Array.from(rail.querySelectorAll('[id^="journey-day-"]'));
    if (!cards.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const day = Number(visible.target.id.replace('journey-day-', ''));
      if (!Number.isFinite(day)) return;
      window.dispatchEvent(new CustomEvent('oneupday:journey-day', { detail: { day } }));
    }, { root: rail, threshold: [0.55, 0.75] });

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return null;
}
