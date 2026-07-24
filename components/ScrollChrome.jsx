'use client';
import { useEffect } from 'react';

export default function ScrollChrome() {
  useEffect(() => {
    const html = document.documentElement;
    let lastY = window.scrollY, timer;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 6 && y > 80) html.classList.add('chrome-hide');
      else if (y < lastY - 6 || y <= 80) html.classList.remove('chrome-hide');
      lastY = y;
      html.classList.add('chrome-scrolling');
      clearTimeout(timer);
      timer = setTimeout(() => html.classList.remove('chrome-scrolling'), 180);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); html.classList.remove('chrome-hide', 'chrome-scrolling'); };
  }, []);
  return null;
}
