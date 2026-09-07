'use client';

import { useState } from 'react';
import styles from './ProfileCircles.module.css';

export default function ProfileCircles({ initialCircles = [] }) {
  const [circles, setCircles] = useState(initialCircles);
  const [busyId, setBusyId] = useState('');
  const [feedback, setFeedback] = useState({ id: '', text: '', error: false });

  async function togglePublication(circle) {
    if (busyId) return;
    setBusyId(circle.id);
    setFeedback({ id: '', text: '', error: false });
    try {
      const response = await fetch('/api/circles/feed-publication', {
        method: circle.published ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circle_id: circle.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'request_failed');
      const published = !circle.published;
      setCircles((current) => current.map((item) => item.id === circle.id ? { ...item, published } : item));
      setFeedback({
        id: circle.id,
        text: published ? 'O convite do Círculo foi publicado no feed.' : 'O Círculo foi retirado do feed e o convite público foi encerrado.',
        error: false,
      });
    } catch {
      setFeedback({ id: circle.id, text: 'Não foi possível atualizar o feed agora. Tente novamente.', error: true });
    } finally {
      setBusyId('');
    }
  }

  if (!circles.length) return null;

  return (
    <section className={styles.section} aria-labelledby="profile-circles-title">
      <header className={styles.header}>
        <div>
          <span>Espaços que você administra</span>
          <h2 id="profile-circles-title">Meus Círculos</h2>
        </div>
        <a href="/circulos?tab=managed">Ver todos</a>
      </header>

      <div className={styles.list}>
        {circles.map((circle) => (
          <article className={styles.card} key={circle.id}>
            <a className={styles.circleLink} href={`/circulos/${circle.slug}`} aria-label={`Abrir o Círculo ${circle.name}`}>
              <div className={styles.mark} aria-hidden="true">◌</div>
              <div className={styles.copy}>
                <div className={styles.titleLine}>
                  <h3>{circle.name}</h3>
                  {circle.published && <span>no feed</span>}
                </div>
                <p>{circle.description || 'Um espaço privado dentro do ONE.'}</p>
              </div>
              <span className={styles.arrow} aria-hidden="true">›</span>
            </a>
            <div className={styles.publication}>
              <button type="button" disabled={busyId === circle.id} onClick={() => togglePublication(circle)}>
                {busyId === circle.id ? 'Salvando…' : circle.published ? 'Retirar do feed' : 'Publicar no feed'}
              </button>
              {feedback.id === circle.id && (
                <p className={feedback.error ? styles.error : styles.feedback} role={feedback.error ? 'alert' : 'status'}>{feedback.text}</p>
              )}
            </div>
          </article>
        ))}
      </div>
      <p className={styles.privacy}>Somente a apresentação e o convite aparecem no feed. O conteúdo interno continua privado.</p>
    </section>
  );
}
