import { headers } from 'next/headers';
import { pickLocale } from './i18n';

// Detecção automática pelo idioma do navegador (Accept-Language)
export function getLocale() {
  const accept = headers().get('accept-language') || '';
  return pickLocale(null, accept);
}
