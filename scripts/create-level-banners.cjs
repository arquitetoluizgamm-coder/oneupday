/* Gera as seis faixas oficiais dos niveis ONE. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..', 'public', 'brand', 'levels');
const logo = path.join(__dirname, '..', 'public', 'brand', 'play-store', 'one-logo-crop.svg');
const levels = [
  ['01', 'Começo', '#B8C9A7', '#526449'],
  ['02', 'Passo', '#95B19A', '#466C63'],
  ['03', 'Ritmo', '#73958C', '#315D68'],
  ['04', 'Presença', '#5C7D86', '#244C5B'],
  ['05', 'Inspira', '#C47152', '#8E4938'],
  ['06', 'Legado', '#17213A', '#E0A84F'],
];

fs.mkdirSync(root, { recursive: true });
for (const [number, name, accent, text] of levels) {
  const dark = name === 'Legado';
  const bg = dark ? '#17213A' : '#F7F7F4';
  const ink = dark ? '#FFFFFF' : '#17213A';
  const file = `one-${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="420" viewBox="0 0 1600 420">
  <rect width="1600" height="420" rx="32" fill="${bg}"/>
  <rect width="24" height="420" rx="12" fill="${accent}"/>
  <circle cx="1450" cy="70" r="220" fill="${accent}" opacity=".12"/>
  <circle cx="1510" cy="330" r="160" fill="${accent}" opacity=".08"/>
  <image href="${logo}" x="80" y="118" width="260" height="74" preserveAspectRatio="xMinYMid meet"/>
  <path d="M410 92v236" stroke="${accent}" stroke-width="2" opacity=".45"/>
  <text x="470" y="132" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="5" fill="${text}">NÍVEL ${number}</text>
  <text x="470" y="240" font-family="Arial,sans-serif" font-size="82" font-weight="700" fill="${ink}">ONE ${name}</text>
  <text x="470" y="292" font-family="Arial,sans-serif" font-size="26" fill="${dark ? '#E9ECE7' : '#596273'}">Um passo de cada vez.</text>
  <rect x="470" y="330" width="420" height="8" rx="4" fill="${accent}" opacity=".55"/>
</svg>`;
  const svgPath = path.join(root, file);
  const pngPath = svgPath.replace(/\.svg$/, '.png');
  fs.writeFileSync(svgPath, svg, 'utf8');
    execFileSync('magick', [svgPath, pngPath]);
    const composited = `${pngPath}.tmp.png`;
    execFileSync('magick', [pngPath, '(', '-background', 'none', logo, '-resize', '260x74', ')', '-gravity', 'northwest', '-geometry', '+80+118', '-composite', composited]);
    fs.renameSync(composited, pngPath);
}
console.log('Faixas ONE criadas em public/brand/levels.');
