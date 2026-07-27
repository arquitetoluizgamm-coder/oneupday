import { seloDe } from '../lib/registro';

// ============================================================
// O SELO DE UM DIA SEM RELATO
//
// Quando a pessoa aperta Fiz / Tentei / Parei e não escreve
// nada, o dia existe mas não tem voz. Antes o app inventava uma
// frase para preencher esse silêncio. Agora ele mostra o
// silêncio pelo que ele é: uma marca.
//
// A forma importa. Isto NÃO pode parecer uma frase — se
// parecer, volta a ser o app fingindo ser a pessoa. Por isso é
// uma palavra só, em caixa alta, espaçada, dentro de uma
// moldura fina. Ninguém lê isso como relato.
//
// E é um sinal honesto de outra coisa: um dia que a pessoa
// marcou mas não contou. Ver isso no próprio perfil é o convite
// mais natural que existe para voltar e escrever.
// ============================================================
export default function SeloDoDia({ kind, labels = {} }) {
  const chave = seloDe(kind);
  const rotulo = labels[chave] || '';
  if (!rotulo) return null;
  return (
    <p className={`selo-dia selo-${chave}`}>
      <span>{rotulo}</span>
    </p>
  );
}
