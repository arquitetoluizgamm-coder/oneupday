const RISK = [
  'nao aguento mais', 'não aguento mais', 'quero morrer', 'não quero mais viver', 'nao quero mais viver',
  'me matar', 'tirar minha vida', 'acabar com tudo', 'quero sumir', 'quero desaparecer', 'me machucar',
  'sem saida', 'sem saída', 'desistir de tudo', 'nao vale a pena viver', 'não vale a pena viver',
  'i want to die', 'kill myself', 'end it all', 'hurt myself', 'cant go on', "can't go on", 'no reason to live',
];
export function looksRisky(text) {
  const x = (text || '').toLowerCase();
  return RISK.some(w => x.includes(w));
}
