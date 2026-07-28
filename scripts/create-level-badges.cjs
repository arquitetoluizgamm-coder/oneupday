/* Gera os selos compactos usados ao lado do nome no feed. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..', 'public', 'brand', 'levels', 'badges');
const logo = path.join(__dirname, '..', 'public', 'brand', 'play-store', 'one-logo-crop.svg');
const levels = [
  ['comeco', 'Começo', '#B8C9A7', '#526449'],
  ['passo', 'Passo', '#95B19A', '#466C63'],
  ['ritmo', 'Ritmo', '#73958C', '#315D68'],
  ['presenca', 'Presença', '#5C7D86', '#244C5B'],
  ['inspira', 'Inspira', '#C47152', '#8E4938'],
  ['legado', 'Legado', '#17213A', '#E0A84F'],
];

fs.mkdirSync(root, { recursive: true });
for (const [slug, name, accent, ink] of levels) {
  const svgPath = path.join(root, `one-${slug}.svg`);
  const pngPath = path.join(root, `one-${slug}.png`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="72" viewBox="0 0 360 72">
  <rect x="1" y="1" width="358" height="70" rx="35" fill="#FFFFFF" stroke="${accent}" stroke-width="2"/>
  <path d="M170 17v38" stroke="${accent}" stroke-width="2" opacity=".4"/>
  <text x="198" y="45" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#17213A">${name}</text>
</svg>`;
  fs.writeFileSync(svgPath, svg, 'utf8');
  execFileSync('magick', [svgPath, pngPath]);
  const composited = `${pngPath}.tmp.png`;
  execFileSync('magick', [pngPath, '(', '-background', 'none', logo, '-resize', '120x34', ')', '-gravity', 'northwest', '-geometry', '+28+19', '-composite', composited]);
  fs.renameSync(composited, pngPath);
}
console.log('Badges compactos criados em public/brand/levels/badges.');
