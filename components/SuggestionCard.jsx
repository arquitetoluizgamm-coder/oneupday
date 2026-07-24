'use client';
import FollowUserButton from '../app/[slug]/FollowUserButton';

export default function SuggestionCard({ people, labels }) {
  if (!people || !people.length) return null;
  return (
    <section className="suggest-card">
      <div className="sg-head">
        <b>{labels.title}</b>
        <span>{labels.sub}</span>
      </div>
      <div className="sg-list">
        {people.map((p) => (
          <div className="sg-item" key={p.ownerId}>
            <a className="sg-person" href={`/${p.handle || p.journeySlug}`}>
              <span className="sg-ava" style={{ background: p.avatar_color || 'var(--muted)' }}>
                {p.avatar_url ? <img src={p.avatar_url} alt="" /> : (p.name || '?')[0]}
              </span>
              <span className="sg-meta"><b>{p.name}</b><small>{p.journeyTitle}</small></span>
            </a>
            <FollowUserButton profileId={p.ownerId} labelFollow={labels.follow} labelFollowing={labels.following} labelBack={labels.followBack} />
          </div>
        ))}
      </div>
    </section>
  );
}
