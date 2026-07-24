export const MOODS = {
  down:      '#5b8def',
  anxious:   '#8b7bd8',
  angry:     '#c8734a',
  tired:     '#7d8794',
  motivated: '#3fae7a',
  happy:     '#e8b43a',
  grateful:  '#e0669a',
};
export const MOOD_ORDER = ['down', 'anxious', 'angry', 'tired', 'motivated', 'happy', 'grateful'];
export function moodGlow(hex) {
  if (!hex) return undefined;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `0 0 0 2px #fff, 0 0 0 4px rgba(${r},${g},${b},.6), 0 0 15px rgba(${r},${g},${b},.55)`;
}
