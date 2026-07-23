import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';

export default function NotFound() {
  const t = getDict(getLocale());
  return (
    <main className="hero">
      <h1>{t.nfTitle}</h1>
      <p>{t.nfSub}</p>
      <a className="cta" href="/">{t.nfCta}</a>
    </main>
  );
}
