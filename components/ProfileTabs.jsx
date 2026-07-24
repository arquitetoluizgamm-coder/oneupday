'use client';
import { useState } from 'react';

export default function ProfileTabs({ labels, journeys, album, people }) {
  const L = labels || {};
  const [tab, setTab] = useState('journeys');
  const tabs = [['journeys', L.journeys], ['album', L.album], ['people', L.people]];
  return (
    <div className="ptabs-wrap">
      <div className="ptabs" role="tablist">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`ptab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="ptab-panel" style={{ display: tab === 'journeys' ? 'block' : 'none' }}>{journeys}</div>
      <div className="ptab-panel" style={{ display: tab === 'album' ? 'block' : 'none' }}>{album}</div>
      <div className="ptab-panel" style={{ display: tab === 'people' ? 'block' : 'none' }}>{people}</div>
    </div>
  );
}
