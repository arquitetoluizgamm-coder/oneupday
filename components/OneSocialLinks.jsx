import styles from './OneSocialLinks.module.css';

const CHANNELS = [
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@oneupday',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.2 7.1a2.8 2.8 0 0 0-2-2C17.5 4.6 12 4.6 12 4.6s-5.5 0-7.2.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.3 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.7.5 7.2.5 7.2.5s5.5 0 7.2-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.9 29 29 0 0 0-.5-4.9Z" />
        <path className={styles.cutout} d="m10 15.2 5-3.2-5-3.2Z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/oneupday/',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
        <circle className={styles.outline} cx="12" cy="12" r="4.1" />
        <circle className={styles.dot} cx="17.4" cy="6.8" r="1" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@oneupday',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.3 3.2v11.2a4.2 4.2 0 1 1-3.6-4.1v3a1.5 1.5 0 1 0 .8 1.4V3.2h2.8Zm0 0c.3 2.3 1.7 3.7 4 4.1v2.8a7.8 7.8 0 0 1-4-1.5V3.2Z" />
      </svg>
    ),
  },
];

const COPY = {
  pt: { eyebrow: 'ONE NAS REDES', title: 'Siga o @oneupday', sub: 'Música, histórias e pequenos passos.' },
  es: { eyebrow: 'ONE EN LAS REDES', title: 'Sigue a @oneupday', sub: 'Música, historias y pequeños pasos.' },
  en: { eyebrow: 'ONE ON SOCIAL', title: 'Follow @oneupday', sub: 'Music, stories and small steps.' },
};

export default function OneSocialLinks({ locale = 'pt' }) {
  const copy = COPY[locale] || COPY.pt;
  return (
    <aside className={styles.card} aria-labelledby="one-social-title">
      <div className={styles.copy}>
        <span>{copy.eyebrow}</span>
        <strong id="one-social-title">{copy.title}</strong>
        <small>{copy.sub}</small>
      </div>
      <nav className={styles.links} aria-label={copy.title}>
        {CHANNELS.map((channel) => (
          <a
            key={channel.name}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${channel.name}: ${copy.title}`}
            title={channel.name}
          >
            {channel.icon}
            <span>{channel.name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
