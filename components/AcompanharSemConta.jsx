'use client';
import { useEffect, useState } from 'react';

// ============================================================
// ACOMPANHAR SEM CRIAR CONTA
//
// O menor atrito possível entre "li a história de alguém" e
// "quero saber como termina": um toque, sem formulário.
//
// Por que isto importa mais que um botão de cadastro: pedir
// conta a quem acabou de chegar é pedir compromisso antes de
// existir motivo. Aqui a pessoa só diz "me avisa" — e a conta
// nasce depois, quando ela quiser responder ou começar a
// própria jornada.
//
// ---- REGRAS QUE ESTE COMPONENTE RESPEITA ----
// · não aparece para quem já tem conta (essa pessoa segue de
//   verdade, com feed e tudo)
// · não aparece se o navegador não suporta push
// · a permissão é pedida SÓ no clique, nunca ao carregar a
//   página. Pedir permissão sem ação é o comportamento que fez
//   o mundo desligar notificação de site.
// · se a pessoa já recusou antes, some em silêncio — nada de
//   insistir
// ============================================================
export default function AcompanharSemConta({ slug, t }) {
  const [estado, setEstado] = useState('carregando'); // carregando|pode|seguindo|indisponivel|erro
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window;
    if (!ok) return setEstado('indisponivel');
    if (Notification.permission === 'denied') return setEstado('indisponivel');

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((s) => {
        if (!s) return setEstado('pode');
        // já inscrito no navegador não quer dizer inscrito NESTA jornada
        const marcadas = JSON.parse(localStorage.getItem('oud-acompanha') || '[]');
        setEstado(marcadas.includes(slug) ? 'seguindo' : 'pode');
      })
      .catch(() => setEstado('pode'));
  }, [slug]);

  function marcar(add) {
    try {
      const l = new Set(JSON.parse(localStorage.getItem('oud-acompanha') || '[]'));
      add ? l.add(slug) : l.delete(slug);
      localStorage.setItem('oud-acompanha', JSON.stringify([...l]));
    } catch { }
  }

  async function seguir() {
    if (ocupado) return;
    setOcupado(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setEstado('indisponivel'); setOcupado(false); return; }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: chave(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
        });
      }
      const r = await fetch('/api/jornada/seguir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sub: sub.toJSON() }),
      });
      if (!r.ok) throw new Error('falhou');
      marcar(true);
      setEstado('seguindo');
    } catch {
      setEstado('erro');
    }
    setOcupado(false);
  }

  async function parar() {
    if (ocupado) return;
    setOcupado(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/jornada/seguir', {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, endpoint: sub.endpoint }),
        });
      }
      marcar(false);
      setEstado('pode');
    } catch { }
    setOcupado(false);
  }

  if (estado === 'carregando' || estado === 'indisponivel') return null;

  if (estado === 'seguindo') {
    return (
      <div className="asc asc-on">
        <div>
          <b>{t.ascSeguindoT}</b>
          <p>{t.ascSeguindoP}</p>
        </div>
        <button type="button" onClick={parar} disabled={ocupado}>{t.ascParar}</button>
      </div>
    );
  }

  return (
    <div className="asc">
      <div>
        <b>{t.ascTitulo}</b>
        <p>{estado === 'erro' ? t.ascErro : t.ascSub}</p>
      </div>
      <button type="button" className="asc-btn" onClick={seguir} disabled={ocupado}>
        {ocupado ? t.ascIndo : t.ascCta}
      </button>
    </div>
  );
}

// base64url -> Uint8Array, como o padrão de push exige
function chave(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const bruto = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...bruto].map((c) => c.charCodeAt(0)));
}
