import { getSupabase } from '../lib/supabase';

export const revalidate = 60;

export default async function Home() {
  let journeys = [];
  try {
    const sb = getSupabase();
    const { data } = await sb
      .from('journeys')
      .select('slug, title')
      .eq('is_public', true)
      .limit(6);
    journeys = data || [];
  } catch (e) {
    // sem env configurado ainda — mostra a landing sem demos
  }

  return (
    <>
      <header className="top">
        <span className="wordmark">One <b>Up</b> Day</span>
        <a className="cta" href="#">Start</a>
      </header>

      <main className="hero">
        <h1>Start small.<br />Keep going.</h1>
        <p>Follow real journeys, post one honest step a day, and help people continue when it gets hard.</p>
        <a className="cta" href="#">Start a journey</a>

        {journeys.length > 0 && (
          <div className="demo">
            <b>See a real journey</b>
            <div className="demo-links">
              {journeys.map(j => (
                <a key={j.slug} href={`/${j.slug}`}>{j.title}</a>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="foot">One <b>Up</b> Day · One day. One step up.</footer>
    </>
  );
}
