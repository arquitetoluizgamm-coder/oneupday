import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import Logo from '../../components/Logo';

export async function generateMetadata() {
  const t = getDict(getLocale());
  return { title: `One Up Day — ${t.rulesTitle}` };
}

export default function Regras() {
  const t = getDict(getLocale());
  const rules = [
    [t.rule1T, t.rule1D], [t.rule2T, t.rule2D], [t.rule3T, t.rule3D],
    [t.rule4T, t.rule4D], [t.rule5T, t.rule5D],
  ];
  return (
    <>
      <header className="top land-top"><Logo href="/" size={40} /></header>
      <main className="wrap rules">
        <div className="create-head"><h1>{t.rulesTitle}</h1></div>
        <p className="rules-intro">{t.rulesIntro}</p>
        <ol className="rules-list">
          {rules.map(([tt, dd], i) => (
            <li key={i}><b>{tt}</b><p>{dd}</p></li>
          ))}
        </ol>
        <section className="rules-block">
          <b>{t.rulesNoT}</b>
          <p>{t.rulesNoD}</p>
        </section>
        <section className="rules-block">
          <b>{t.rulesModT}</b>
          <p>{t.rulesModD}</p>
        </section>
        <p className="rules-creed">{t.rulesCreed}</p>
      </main>
      <footer className="foot"><p>One <b>Up</b> Day · {t.tagline}</p><p className="foot-care">{t.notTherapy}</p></footer>
    </>
  );
}
