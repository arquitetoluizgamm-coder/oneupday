import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import NewJourneyForm from './NewJourneyForm';

export const dynamic = 'force-dynamic';

export default async function NewJourney() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <>
      <header className="top">
        <a className="wordmark" href="/">One <b>Up</b> Day</a>
        <a className="ghost-btn" href="/home">Back</a>
      </header>
      <main className="wrap">
        <div className="create-head">
          <p className="eyebrow">Create</p>
          <h1>Start a journey in under a minute.</h1>
          <p className="sub">Pick something real, post the first step, come back tomorrow.</p>
        </div>
        <NewJourneyForm userId={user.id} />
      </main>
    </>
  );
}
