const DEFAULT_AUTH_NEXT = '/home';
const AUTH_ORIGIN = 'https://oneupday.local';

export function safeAuthNext(value, fallback = DEFAULT_AUTH_NEXT) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== 'string' || !candidate.startsWith('/') || candidate.startsWith('//')) return fallback;
  try {
    const parsed = new URL(candidate, AUTH_ORIGIN);
    if (parsed.origin !== AUTH_ORIGIN) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
