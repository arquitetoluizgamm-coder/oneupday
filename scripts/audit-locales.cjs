/*
 * Confere a cobertura dos dicionários sem depender do build do Next.
 * Uso: node scripts/audit-locales.cjs
 */
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const source = fs.readFileSync(path.join(__dirname, '..', 'lib', 'i18n.js'), 'utf8');
const ast = parser.parse(source, { sourceType: 'module' });
let english = [];
let spanish = [];

const keys = (node) => (node?.properties || [])
  .map((item) => item.key?.name ?? item.key?.value)
  .filter(Boolean);

function walk(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'VariableDeclarator' && node.id.name === 'dictionaries') {
    const en = node.init.properties.find((item) => (item.key.name ?? item.key.value) === 'en');
    if (en) english = keys(en.value);
  }
  if (node.type === 'VariableDeclarator' && node.id.name === 'SPANISH_CORE') {
    spanish = keys(node.init);
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') walk(value);
  }
}

walk(ast);
const missing = english.filter((key) => !spanish.includes(key));
console.log(`English: ${english.length}`);
console.log(`Spanish overrides: ${spanish.length}`);
console.log(`Spanish fallback keys: ${missing.length}`);
if (missing.length) {
  console.log('\nKeys still inherited from English:');
  console.log(missing.join('\n'));
} else {
  console.log('Spanish coverage complete.');
}
