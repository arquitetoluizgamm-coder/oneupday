'use client';

import { useState } from 'react';
import styles from './LandingVideo.module.css';

const VIDEO_ID = 'yAq31hcvLlM';

const COPY = {
  pt: {
    eyebrow: 'AS VOZES DO ONE',
    title: 'Conheça as vozes que acompanham cada jornada',
    text: 'Rafael e Marina transformam histórias reais de recomeço, coragem e pequenos passos em música.',
    play: 'Assistir ao vídeo',
    duration: '28 segundos',
    frame: 'Conheça Rafael e Marina, as vozes oficiais do One Up Day',
    channel: 'Conhecer a trilha do ONE no YouTube',
  },
  es: {
    eyebrow: 'LAS VOCES DE ONE',
    title: 'Conoce las voces que acompañan cada camino',
    text: 'Rafael y Marina transforman historias reales de nuevos comienzos, valentía y pequeños pasos en música.',
    play: 'Ver el video',
    duration: '28 segundos',
    frame: 'Conoce a Rafael y Marina, las voces oficiales de One Up Day',
    channel: 'Conoce la música de ONE en YouTube',
  },
  en: {
    eyebrow: 'THE VOICES OF ONE',
    title: 'Meet the voices that accompany every journey',
    text: 'Rafael and Marina turn real stories of new beginnings, courage and small steps into music.',
    play: 'Watch the video',
    duration: '28 seconds',
    frame: 'Meet Rafael and Marina, the official voices of One Up Day',
    channel: 'Discover ONE’s soundtrack on YouTube',
  },
};

export default function LandingVideo({ locale = 'pt' }) {
  const [playing, setPlaying] = useState(false);
  const copy = COPY[locale] || COPY.pt;

  return (
    <section className={styles.section} aria-labelledby="landing-video-title">
      <div className={styles.copy}>
        <span>{copy.eyebrow}</span>
        <h2 id="landing-video-title">{copy.title}</h2>
        <p>{copy.text}</p>
      </div>

      <div className={styles.frame}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
            title={copy.frame}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button className={styles.poster} type="button" onClick={() => setPlaying(true)} aria-label={`${copy.play}: ${copy.frame}`}>
            <img src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`} alt="" loading="lazy" />
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.play} aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m9 7 8 5-8 5Z" /></svg>
            </span>
            <span className={styles.label}>{copy.play}<small>{copy.duration}</small></span>
          </button>
        )}
      </div>

      <a className={styles.channel} href="https://www.youtube.com/@oneupday" target="_blank" rel="noopener noreferrer">
        {copy.channel}<span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
