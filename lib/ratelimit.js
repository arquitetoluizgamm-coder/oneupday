// Limite simples por usuário (em memória do processo). Guarda-costas de MVP.
const buckets = new Map();
export function rateLimit(key, max = 15, windowMs = 3600000) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter(t => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now); buckets.set(key, arr);
  return true;
}
