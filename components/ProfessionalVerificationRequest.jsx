'use client';

import { useState } from 'react';
import styles from './ProfessionalVerificationRequest.module.css';

export default function ProfessionalVerificationRequest({ initialRequest = null }) {
  const [request, setRequest] = useState(initialRequest);
  const [form, setForm] = useState({ profession: '', credential: '', evidence_url: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (!form.credential.trim() && !form.evidence_url.trim()) {
      setFeedback('Informe um registro profissional ou um link que permita conferir sua atuação.');
      return;
    }
    setBusy(true);
    setFeedback('');
    let response;
    let data;
    try {
      response = await fetch('/api/professional-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      data = await response.json().catch(() => ({}));
    } catch {
      setBusy(false);
      setFeedback('Não foi possível conectar agora. Verifique sua internet e tente novamente.');
      return;
    }
    setBusy(false);
    if (!response.ok) {
      setFeedback(data.error === 'already_pending'
        ? 'Sua solicitação já está em análise.'
        : data.error === 'already_verified'
          ? 'Seu perfil já está verificado.'
          : data.error === 'evidence_required'
            ? 'Informe um registro profissional ou um link de conferência.'
            : 'Não foi possível enviar agora. Tente novamente.');
      return;
    }
    setRequest(data.request);
    setFeedback('Solicitação enviada para análise.');
  }

  if (request?.status === 'pending') {
    return (
      <section className={`${styles.card} ${styles.pending}`} aria-labelledby="professional-request-title">
        <span className={styles.icon} aria-hidden="true">✓</span>
        <div>
          <b id="professional-request-title">Solicitação profissional em análise</b>
          <p>Você receberá o selo somente depois da conferência pela equipe do ONE.</p>
          {feedback && <span className={styles.feedback} role="status">{feedback}</span>}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby="professional-request-title">
      <div className={styles.intro}>
        <span className={styles.icon} aria-hidden="true">◇</span>
        <div>
          <b id="professional-request-title">Você atua profissionalmente?</b>
          <p>Solicite a análise para criar Círculos profissionais e receber o selo no perfil.</p>
        </div>
      </div>

      {request?.status === 'rejected' && (
        <div className={styles.review} role="status">
          <b>Solicitação anterior não aprovada.</b>
          <p>{request.review_note || 'Revise seus dados e envie uma nova referência profissional.'}</p>
        </div>
      )}

      <details className={styles.details} open={request?.status === 'rejected'}>
        <summary>Solicitar verificação profissional</summary>
        <form className={styles.form} onSubmit={submit}>
          <label>
            Área de atuação
            <input required value={form.profession} onChange={(e) => setForm((current) => ({ ...current, profession: e.target.value }))} placeholder="Ex.: Psicologia, educação, arquitetura" />
          </label>
          <label>
            Registro profissional ou conselho
            <input value={form.credential} onChange={(e) => setForm((current) => ({ ...current, credential: e.target.value }))} placeholder="Ex.: conselho e número de registro" />
          </label>
          <span className={styles.or}>ou</span>
          <label>
            Link para conferência
            <input type="url" value={form.evidence_url} onChange={(e) => setForm((current) => ({ ...current, evidence_url: e.target.value }))} placeholder="Site profissional, conselho ou portfólio" />
          </label>
          <label>
            Conte um pouco sobre sua atuação
            <textarea rows={4} value={form.message} onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))} placeholder="Experiência, público atendido e proposta do Círculo" />
          </label>
          <p className={styles.privacy}>Esses dados serão usados somente para a análise administrativa. O registro e o link não serão exibidos no seu perfil.</p>
          {feedback && <p className={styles.error} role="alert">{feedback}</p>}
          <button type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar para análise'}</button>
        </form>
      </details>
    </section>
  );
}
