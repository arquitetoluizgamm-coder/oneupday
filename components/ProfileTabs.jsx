'use client';
import { useState } from 'react';

// ============================================================
// ABAS DO PERFIL
//
// As abas são montadas a partir dos painéis que chegam. Passar
// `people={null}` — o caso do perfil público, que não mostra quem
// a pessoa segue — simplesmente não cria a aba. Antes a lista era
// fixa em três, e uma aba vazia abria na cara de quem clicasse.
//
// Com um painel só, a barra de abas não aparece: uma aba sozinha
// não é escolha, é enfeite.
// ============================================================
export default function ProfileTabs({ labels, journeys, album, quotes, people, actions }) {
  const L = labels || {};

  // Citações vêm depois do álbum e antes de pessoas: as três primeiras
  // são o que a pessoa FEZ; a última é quem está em volta.
  const abas = [
    ['journeys', L.journeys, journeys],
    ['album', L.album, album],
    ['quotes', L.quotes, quotes],
    ['people', L.people, people],
  ].filter(([, , painel]) => painel !== null && painel !== undefined && painel !== false);

  const [tab, setTab] = useState(abas[0] ? abas[0][0] : 'journeys');
  // se a aba guardada sumiu (o álbum ficou vazio, por exemplo), cai na primeira
  const atual = abas.some(([k]) => k === tab) ? tab : (abas[0] ? abas[0][0] : '');

  if (abas.length <= 1) {
    return (
      <div className="ptabs-wrap">
        {actions && <div className="ptabs-row"><div className="ptab-actions">{actions}</div></div>}
        <div className="ptab-panel">{abas[0] ? abas[0][2] : null}</div>
      </div>
    );
  }

  return (
    <div className="ptabs-wrap">
      <div className="ptabs-row">
        <div className="ptabs" role="tablist">
          {abas.map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={atual === k}
              className={`ptab${atual === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        {actions && <div className="ptab-actions">{actions}</div>}
      </div>
      {abas.map(([k, , painel]) => (
        <div key={k} className="ptab-panel" style={{ display: atual === k ? 'block' : 'none' }}>{painel}</div>
      ))}
    </div>
  );
}
