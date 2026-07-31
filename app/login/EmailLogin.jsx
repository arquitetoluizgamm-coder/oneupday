'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

// ============================================================
// ENTRAR COM E-MAIL — código de 6 dígitos
//
// Código, e não link mágico, por um motivo prático: dentro do app
// instalado um link no e-mail abre o NAVEGADOR, e a pessoa termina
// logada fora do app, com a sessão no lugar errado. Com o código
// ela nunca sai desta tela.
//
// E por um motivo de produto: num app sobre recomeço, nem todo
// mundo quer amarrar isso à conta Google pessoal. Quem não quer,
// hoje simplesmente não entra — e não avisa ninguém.
// ============================================================

const ESPERA = 45;   // segundos antes de poder pedir outro código

// O Supabase permite configurar o tamanho do código (6 a 10 dígitos), e o
// padrão nem sempre é 6. Travar em 6 aqui foi erro meu: chegou código de 8
// e o campo não deixava digitar o último. Agora a tela aceita a faixa toda,
// e nunca mais depende de uma configuração que pode mudar no painel.
const MIN_DIGITOS = 6;
const MAX_DIGITOS = 10;

export default function EmailLogin({ t }) {
  const [fase, setFase] = useState('email');   // 'email' | 'codigo'
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [faltam, setFaltam] = useState(0);
  const campoCodigo = useRef(null);
  const router = useRouter();

  // contagem para reenviar
  useEffect(() => {
    if (faltam <= 0) return;
    const id = setTimeout(() => setFaltam((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [faltam]);

  useEffect(() => {
    if (fase === 'codigo') campoCodigo.current?.focus();
  }, [fase]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  async function pedirCodigo(reenvio) {
    if (ocupado || !emailOk || (reenvio && faltam > 0)) return;
    setOcupado(true);
    setErro('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setOcupado(false);
    if (error) {
      // limite de envio é o erro mais comum, e o mais confuso sem explicação
      setErro(/rate|limit|seconds/i.test(error.message || '') ? t.mailRate : t.mailErr);
      return;
    }
    setFase('codigo');
    setFaltam(ESPERA);
  }

  async function conferir() {
    const limpo = codigo.replace(/\D/g, '');
    if (ocupado || limpo.length < MIN_DIGITOS) return;
    setOcupado(true);
    setErro('');
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: limpo,
      type: 'email',
    });
    if (error) {
      setOcupado(false);
      setErro(t.mailBadCode);
      setCodigo('');
      campoCodigo.current?.focus();
      return;
    }
    // recarga completa: o servidor precisa enxergar a sessão nova
    window.location.href = '/home';
  }

  if (fase === 'codigo') {
    return (
      <div className="elog">
        <p className="elog-sent">{(t.mailSent || '').replace('{email}', email.trim())}</p>

        <input
          ref={campoCodigo}
          className={`elog-code${codigo.length > 6 ? ' longo' : ''}`}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITOS))}
          onKeyDown={(e) => { if (e.key === 'Enter') conferir(); }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={MAX_DIGITOS}
          placeholder="••••••"
          aria-label={t.mailCode}
        />

        {erro && <p className="elog-erro" role="alert">{erro}</p>}

        <button type="button" className="cta grow elog-go"
          onClick={conferir} disabled={ocupado || codigo.length < MIN_DIGITOS}>
          {ocupado ? t.mailChecking : t.mailEnter}
        </button>

        <div className="elog-links">
          <button type="button" onClick={() => { setFase('email'); setCodigo(''); setErro(''); }}>
            {t.mailChange}
          </button>
          <button type="button" onClick={() => pedirCodigo(true)} disabled={faltam > 0 || ocupado}>
            {faltam > 0 ? (t.mailWait || '').replace('{s}', faltam) : t.mailResend}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="elog">
      <input
        className="elog-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') pedirCodigo(false); }}
        inputMode="email"
        autoComplete="email"
        placeholder={t.mailPh}
        aria-label={t.mailLabel}
      />

      {erro && <p className="elog-erro" role="alert">{erro}</p>}

      <button type="button" className="cta grow elog-go"
        onClick={() => pedirCodigo(false)} disabled={!emailOk || ocupado}>
        {ocupado ? t.mailSending : t.mailSend}
      </button>
    </div>
  );
}
