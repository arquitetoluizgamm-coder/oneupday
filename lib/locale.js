import { cookies, headers } from 'next/headers';
import { pickLocale } from './i18n';

// Detecção de idioma no servidor: cookie 'locale' vence; senão Accept-Language
export function getLocale() {
  const cookieLocale = cookies().get('locale')?.value;
  const accept = headers().get('accept-language') || '';
  return pickLocale(cookieLocale, accept);
}
