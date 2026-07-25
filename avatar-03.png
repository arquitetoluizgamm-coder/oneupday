'use client';
import { useRouter } from 'next/navigation';

export default function LangSwitcher({ locale }) {
  const router = useRouter();
  function set(l) {
    document.cookie = `locale=${l}; path=/; max-age=31536000`;
    router.refresh();
  }
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button className={locale === 'pt' ? 'on' : ''} onClick={() => set('pt')}>PT</button>
      <span>/</span>
      <button className={locale === 'en' ? 'on' : ''} onClick={() => set('en')}>EN</button>
    </div>
  );
}
