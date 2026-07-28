'use client';
import { useEffect, useMemo, useState } from 'react';

const DIARY_KEY = 'oud_private_diary_v1';
const CAPSULE_KEY = 'oud_future_capsules_v1';

const LEAVES = [
  [264, 254, -32], [310, 220, 24], [354, 248, -15], [407, 214, 30],
  [452, 252, -28], [224, 302, 18], [278, 304, -18], [336, 286, 28],
  [394, 310, -24], [470, 304, 20], [188, 352, -28], [244, 356, 25],
  [304, 342, -12], [370, 356, 18], [432, 350, -22], [504, 352, 27],
  [212, 406, 20], [274, 398, -25], [330, 410, 16], [390, 400, -18],
  [454, 410, 25], [492, 406, -12], [248, 456, -18], [306, 446, 26],
  [366, 458, -22], [424, 448, 18], [284, 492, 20], [344, 486, -16],
  [404, 492, 24], [152, 390, 12], [530, 390, -20], [174, 320, 22],
  [520, 320, -16], [326, 188, -20], [382, 188, 20], [348, 528, 5],
];

const FRUITS = [[260, 340], [414, 328], [315, 405], [462, 392], [228, 401], [372, 452], [502, 346], [340, 276]];
const FLOWERS = [[206, 335], [472, 286], [286, 462], [432, 438], [350, 230], [518, 375]];

function safeCount(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.length : 0;
  } catch {
    return 0;
  }
}

function TreeVisual({ metrics, labels, stage }) {
  const leafCount = Math.min(LEAVES.length, metrics.presence);
  const fruitCount = Math.min(FRUITS.length, metrics.wins);
  const flowerCount = Math.min(FLOWERS.length, metrics.completedChallenges);
  const branchCount = Math.min(7, 2 + Math.floor(metrics.presence / 7) + metrics.completedJourneys);
  const grown = metrics.presence > 0;
  const scale = [1, .68, .8, .92, 1][stage];
  const treeTransform = grown
    ? `translate(${350 * (1 - scale)} ${595 * (1 - scale)}) scale(${scale})`
    : undefined;

  return (
    <svg className={`life-tree stage-${stage}`} viewBox="0 0 700 700" role="img"
      aria-label={labels.treeVisualAlt}>
      <defs>
        <linearGradient id="treeSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f1e8" />
          <stop offset="1" stopColor="#edf1e8" />
        </linearGradient>
        <linearGradient id="treeTrunk" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8c604b" />
          <stop offset="1" stopColor="#654738" />
        </linearGradient>
        <filter id="treeShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="9" stdDeviation="10" floodColor="#283126" floodOpacity=".13" />
        </filter>
      </defs>

      <rect x="8" y="8" width="684" height="684" rx="42" fill="url(#treeSky)" />
      <circle cx="565" cy="128" r="55" fill="#e8c584" opacity=".35" />
      <path d="M80 595C190 558 500 558 620 595C520 646 178 646 80 595Z" fill="#dfe7d8" />
      <path d="M170 604C260 578 436 578 530 604" fill="none" stroke="#c8d4c0" strokeWidth="5" strokeLinecap="round" />

      <g className="tree-organism" transform={treeTransform}>
      {!grown ? (
        <g className="tree-seedling" filter="url(#treeShadow)">
          <path d="M350 585C348 548 348 522 350 494" fill="none" stroke="url(#treeTrunk)" strokeWidth="12" strokeLinecap="round" />
          <path d="M350 527C321 493 294 499 286 520C306 536 329 540 350 527Z" fill="#8e9d82" />
          <path d="M350 510C376 478 405 484 412 506C391 522 370 526 350 510Z" fill="#73866c" />
        </g>
      ) : (
        <g className="tree-grown" filter="url(#treeShadow)">
          <path d="M318 585C330 524 330 465 327 397C325 347 335 298 350 255C365 307 374 354 371 407C368 470 376 527 391 585Z" fill="url(#treeTrunk)" />
          <path d="M340 440C302 404 267 371 226 340" className={`tree-branch${branchCount >= 3 ? ' visible' : ''}`} />
          <path d="M361 411C397 374 432 338 474 303" className={`tree-branch${branchCount >= 4 ? ' visible' : ''}`} />
          <path d="M338 375C306 334 286 293 276 255" className={`tree-branch${branchCount >= 5 ? ' visible' : ''}`} />
          <path d="M365 354C393 318 413 277 420 235" className={`tree-branch${branchCount >= 6 ? ' visible' : ''}`} />
          <path d="M342 489C292 464 245 445 195 432" className={`tree-branch${branchCount >= 7 ? ' visible' : ''}`} />
          <path d="M371 480C420 454 468 436 515 421" className="tree-branch visible" />
          <path d="M350 410C348 355 349 300 350 250" className="tree-branch visible" />
        </g>
      )}

      {LEAVES.slice(0, leafCount).map(([x, y, r], i) => (
        <ellipse key={`l${i}`} className="tree-leaf" cx={x} cy={y} rx="22" ry="12"
          transform={`rotate(${r} ${x} ${y})`} fill={i % 3 === 0 ? '#71836b' : i % 3 === 1 ? '#8fa083' : '#a7b49a'} />
      ))}

      {FLOWERS.slice(0, flowerCount).map(([x, y], i) => (
        <g key={`fl${i}`} className="tree-flower" transform={`translate(${x} ${y})`}>
          <circle cx="-7" cy="0" r="7" fill="#e7b19e" /><circle cx="7" cy="0" r="7" fill="#e7b19e" />
          <circle cx="0" cy="-7" r="7" fill="#f1c8b8" /><circle cx="0" cy="7" r="7" fill="#f1c8b8" />
          <circle r="5" fill="#d6a24c" />
        </g>
      ))}

      {FRUITS.slice(0, fruitCount).map(([x, y], i) => (
        <g key={`fr${i}`} className="tree-fruit" transform={`translate(${x} ${y})`}>
          <path d="M0-11C-3-20 3-24 9-27" fill="none" stroke="#65735f" strokeWidth="3" strokeLinecap="round" />
          <circle r="12" fill={i % 2 ? '#cf7658' : '#d98a5f'} />
          <circle cx="-4" cy="-4" r="3" fill="#f2b79d" opacity=".7" />
        </g>
      ))}

      {metrics.reflections > 0 && (
        <g className="tree-bird" transform="translate(466 202)">
          <path d="M0 16C9 2 22 1 30 11C37 4 46 6 50 15C38 14 31 19 27 28C20 20 11 17 0 16Z" fill="#596d82" />
          <circle cx="34" cy="10" r="2" fill="#fff" />
        </g>
      )}
      {metrics.capsules > 0 && (
        <g className="tree-butterfly" transform="translate(183 253)">
          <ellipse cx="-9" cy="-5" rx="10" ry="15" fill="#d47b62" opacity=".8" transform="rotate(-30)" />
          <ellipse cx="9" cy="-5" rx="10" ry="15" fill="#e8a16f" opacity=".85" transform="rotate(30)" />
          <path d="M0-3V19" stroke="#55473f" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      </g>
    </svg>
  );
}

export default function ArvoreDaVida({ initialMetrics, labels }) {
  const [local, setLocal] = useState({ diary: 0, capsules: 0 });
  const [selected, setSelected] = useState('presence');

  useEffect(() => {
    setLocal({ diary: safeCount(DIARY_KEY), capsules: safeCount(CAPSULE_KEY) });
  }, []);

  const metrics = useMemo(() => ({
    ...initialMetrics,
    reflections: (initialMetrics.reflections || 0) + local.diary,
    capsules: local.capsules,
  }), [initialMetrics, local]);

  const stage = metrics.presence === 0 ? 0
    : metrics.presence < 4 ? 1
      : metrics.presence < 10 ? 2
        : metrics.presence < 30 ? 3 : 4;

  const detail = {
    presence: labels.treePresenceDetail,
    journeys: labels.treeBranchesDetail,
    wins: labels.treeWinsDetail,
    challenges: labels.treeChallengesDetail,
    reflections: labels.treeReflectionsDetail,
    capsules: labels.treeCapsulesDetail,
  }[selected];

  const cards = [
    ['presence', labels.treeLeaves, metrics.presence, 'leaf'],
    ['journeys', labels.treeBranches, metrics.completedJourneys, 'branch'],
    ['wins', labels.treeFruits, metrics.wins, 'fruit'],
    ['challenges', labels.treeFlowers, metrics.completedChallenges, 'flower'],
    ['reflections', labels.treeVisitors, metrics.reflections, 'bird'],
    ['capsules', labels.treeButterflies, metrics.capsules, 'butterfly'],
  ];

  return (
    <div className="tree-shell">
      <header className="tree-intro">
        <div className="future-up tree-up">
          <img src="/upi.svg" className="upi-char bob" alt="Upi" />
          <div className="upi-bubble upi-open"><b className="upi-name">Upi</b><p>{labels.treeUp}</p></div>
        </div>
        <p className="eyebrow">{labels.treeEyebrow}</p>
        <h1>{labels.treeTitle}</h1>
        <p>{labels.treeSub}</p>
      </header>

      <section className="tree-scene">
        <div className="tree-stage-label">
          <span>{labels.treeStageLabel}</span>
          <strong>{labels.treeStages[stage]}</strong>
          <p>{labels.treeStageMessages[stage]}</p>
        </div>
        <TreeVisual metrics={metrics} labels={labels} stage={stage} />
      </section>

      <section className="tree-growth" aria-labelledby="tree-growth-title">
        <div className="tree-growth-head">
          <p className="eyebrow">{labels.treeGrowthEyebrow}</p>
          <h2 id="tree-growth-title">{labels.treeGrowthTitle}</h2>
        </div>
        <div className="tree-metrics">
          {cards.map(([key, name, value, icon]) => (
            <button type="button" key={key} className={`tree-metric${selected === key ? ' on' : ''}`}
              onClick={() => setSelected(key)} aria-pressed={selected === key}>
              <span className={`tree-symbol ${icon}`} aria-hidden="true" />
              <b>{value}</b>
              <small>{name}</small>
            </button>
          ))}
        </div>
        <p className="tree-detail" aria-live="polite">{detail}</p>
      </section>

      <p className="tree-promise">{labels.treePromise}</p>
    </div>
  );
}
