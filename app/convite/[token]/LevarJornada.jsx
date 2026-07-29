'use client';

// ============================================================
// LEVAR A FRASE ATRAVÉS DO LOGIN
//
// O botão quer chegar em `/new?tema=voltar a correr`. Só que /new
// exige conta: quem clica sem estar logado é mandado para o login,
// e o `?tema=` morre no caminho — junto com a promessa de que a
// jornada estaria esperando.
//
// Por isso a frase é guardada no navegador ANTES de sair daqui, e
// o wizard aprendeu a procurar por ela lá (ver NewJourneyForm).
// Assim ela sobrevive ao login, ao cadastro por e-mail, à
// confirmação por link e à volta para o app.
//
// O `?tema=` continua na URL porque, para quem já está logado, o
// caminho é direto e não precisa passar pelo armário.
// ============================================================
export default function LevarJornada({ tema, rotulo }) {
  function ir() {
    try { localStorage.setItem('oud-tema-guardado', String(tema || '').slice(0, 280)); } catch {}
    window.location.href = `/new?tema=${encodeURIComponent(String(tema || '').slice(0, 80))}`;
  }
  return (
    <button type="button" className="cta grow cv-cta" onClick={ir}>
      {rotulo}
    </button>
  );
}
