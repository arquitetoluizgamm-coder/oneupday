import styles from './ProfessionalBadge.module.css';

export default function ProfessionalBadge({ title = '', compact = false }) {
  const profession = String(title || '').trim();
  const accessible = profession
    ? `${profession}. Profissional verificado pelo ONE.`
    : 'Profissional verificado pelo ONE.';

  return (
    <span className={`${styles.badge}${compact ? ` ${styles.compact}` : ''}`} aria-label={accessible} title="Atuação profissional analisada pelo ONE">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 1.7 12 3l2.4-.1.7 2.2 2 1.3-.7 2.3.7 2.3-2 1.3-.7 2.2-2.4-.1-2 1.3-2-1.3-2.4.1-.7-2.2-2-1.3.7-2.3-.7-2.3 2-1.3.7-2.2 2.4.1z" />
        <path d="m6.8 10 2 2 4.4-4.5" />
      </svg>
      <span className={styles.label}>{profession ? `${profession} · verificado` : 'Profissional verificado'}</span>
    </span>
  );
}
