'use client';
import { useState, useRef, useEffect } from 'react';

// ============================================================
// O CAMPO QUE NÃO PARECE FORMULÁRIO
//
// A página inteira foi construída para chegar aqui, e a ordem dos
// dois campos é a decisão mais importante dela.
//
// PRIMEIRO a jornada. Escrever "voltar a correr" não custa nada,
// é sobre a pessoa, e no instante em que ela escreve deixa de ser
// visitante — passa a se imaginar usando o app.
//
// SÓ DEPOIS o e-mail. Pedir contato antes é cobrar pedágio antes
// da estrada: é a fricção máxima no momento de menor vínculo.
// Quando o campo do e-mail aparece, o compromisso já foi feito, e
// ele lê como "onde te encontro" em vez de "cadastre-se".
//
// ------------------------------------------------------------
// A CONFIRMAÇÃO NÃO É UM "OBRIGADO"
//
// É o momento de maior risco da página: a pessoa acabou de expor
// uma coisa dela. Um "entraremos em contato" é carta de recusa com
// boas maneiras — e para quem já se sente pouco, confirma tudo.
//
// Então a tela devolve a frase dela, com a cara do app, dizendo
// que está guardada e que **não** está publicada. A diferença
// entre guardada e publicada precisa ser visível: se a tela imitar
// o feed sem dizer isso, a pessoa vai tocar esperando resposta, e
// maquete quebrada é pior que um obrigado honesto.
// ============================================================

const MAX = 280;

export default function FormConvite({ t, locale }) {
  const [jornada, setJornada] = useState('');
  const [email, setEmail] = useState('');
  const [etapa, setEtapa] = useState('jornada');   // jornada · email · pronto
  const [voltou, setVoltou] = useState(false);     // chegou de novo, não acabou de enviar
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const campoEmail = useRef(null);
  const campoJornada = useRef(null);

  const jornadaOk = jornada.trim().length >= 3;

  useEffect(() => {
    if (etapa === 'email') campoEmail.current?.focus();
  }, [etapa]);

  // Se ela já guardou uma jornada neste navegador, a página não
  // finge que nunca a viu. Essa pessoa é especialmente sensível a
  // ser esquecida — foi o motivo de ela ter parado de postar em
  // outros lugares. Custa três linhas e fecha um buraco real.
  useEffect(() => {
    try {
      const guardada = localStorage.getItem('oud-jornada-guardada');
      if (guardada) { setJornada(guardada); setEtapa('pronto'); setVoltou(true); }
    } catch {}
  }, []);

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    setErro('');
    setEnviando(true);
    try {
      const r = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jornada: jornada.trim(), email: email.trim(), locale }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        setErro(d.error === 'email' ? t.cvErroEmail : t.cvErroGeral);
        setEnviando(false);
        return;
      }
      // A frase fica no navegador para que:
      //   1) a tela de confirmação possa mostrá-la sem consultar
      //      nada — o cofre não deixa ler de volta, e nem deveria;
      //   2) se ela voltar semanas depois, a página a reconheça.
      try { localStorage.setItem('oud-jornada-guardada', jornada.trim()); } catch {}
      setEtapa('pronto');
    } catch {
      setErro(t.cvErroGeral);
      setEnviando(false);
    }
  }

  // ---------------- a confirmação ----------------
  if (etapa === 'pronto') {
    return (
      <div className="cv-pronto">
        <p className="cv-selo">{t.cvGuardadaSelo}</p>

        {/* o cartão tem a cara do app — e diz, na própria peça, que
            não está no ar. É o que impede a maquete de virar mentira. */}
        <div className="cv-card">
          <span className="cv-card-topo">{t.cvCardTopo}</span>
          <p className="cv-card-texto">{jornada}</p>
          <span className="cv-card-pe">{t.cvCardPe}</span>
        </div>

        <h2 className="cv-pronto-titulo">{voltou ? t.cvVoltouTitulo : t.cvProntoTitulo}</h2>

        {/* Quem acabou de enviar recebe as quatro linhas inteiras.
            Quem VOLTOU dias depois já leu tudo aquilo — repetir
            "obrigado por confiar" soa como gravação. */}
        {!voltou && <p className="cv-pronto-p">{t.cvProntoP1}</p>}
        <p className="cv-pronto-p cv-pronto-forte">{t.cvProntoP2}</p>
        <p className="cv-pronto-p">{t.cvProntoP3}</p>
        <p className="cv-pronto-so">{t.cvProntoSo}</p>

        {/* O beco sem saída que eu tinha criado: reconhecer a pessoa
            na volta é bom, mas ela ficava presa nesta tela sem jeito
            de mudar o que escreveu.

            E mudar de verdade não dá: uma segunda inscrição com o
            mesmo e-mail bate no índice único e não sobrescreve — a
            alternativa seria abrir uma policy de UPDATE no cofre, e
            isso deixaria alguém sobrescrever a jornada de outra
            pessoa mirando o e-mail dela às cegas.

            Então a saída é a honesta, e é a mesma do resto da
            página: do outro lado tem gente. */}
        {voltou && <p className="cv-voltou-nota">{t.cvVoltouNota}</p>}
      </div>
    );
  }

  // ---------------- o formulário ----------------
  // ============================================================
  // O CAMPO VIROU UM LUGAR, NÃO UMA LINHA DO FORMULÁRIO
  //
  // Tudo o que a pessoa faz aqui — ler a pergunta, escrever,
  // guardar — passou a viver dentro de um bloco só, com fundo e
  // borda próprios. Antes esses elementos flutuavam soltos no meio
  // de quatro parágrafos, com o mesmo espaçamento entre tudo: o
  // espaço em branco não agrupava nada.
  //
  // E o Upi entra ao lado da pergunta. Ele é o personagem que
  // acompanha a pessoa DENTRO do app — pôr ele aqui é a diferença
  // entre "preencha este formulário" e "este lugar é o mesmo lugar
  // que você vai usar amanhã".
  // ============================================================
  return (
    <form className="cv-form" onSubmit={enviar} noValidate>
      <div className="cv-pergunta-linha">
        <img className="cv-upi" src="/upi.svg" alt="" aria-hidden="true" />
        <label className="cv-pergunta" htmlFor="cv-jornada">{t.cvPergunta}</label>
      </div>

      <textarea
        id="cv-jornada"
        ref={campoJornada}
        className="cv-campo"
        value={jornada}
        onChange={(ev) => setJornada(ev.target.value.slice(0, MAX))}
        placeholder={t.cvPlaceholder}
        rows={3}
        maxLength={MAX}
        autoComplete="off"
      />

      {/* a regra do cofre dita à pessoa, não só cumprida por dentro.
          Regra que ela não sabe que existe não gera confiança nenhuma. */}
      <p className="cv-sigilo">{t.cvSigilo}</p>

      {etapa === 'jornada' ? (
        <button type="button" className="cta grow cv-cta"
          disabled={!jornadaOk}
          onClick={() => setEtapa('email')}>
          {t.cvBotao}
        </button>
      ) : (
        <div className="cv-email-bloco">
          <label className="cv-email-label" htmlFor="cv-email">{t.cvOndeEncontro}</label>
          <input
            id="cv-email"
            ref={campoEmail}
            className="cv-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder={t.cvEmailPh}
          />
          <button type="submit" className="cta grow cv-cta" disabled={enviando}>
            {enviando ? t.cvEnviando : t.cvBotao}
          </button>
        </div>
      )}

      {erro && <p className="cv-erro" role="alert">{erro}</p>}
    </form>
  );
}
