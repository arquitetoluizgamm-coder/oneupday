import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import ArvoreDaVida from './ArvoreDaVida';

export const dynamic = 'force-dynamic';

export default async function ArvorePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const t = getDict(getLocale());
  const { data: journeys } = await supabase
    .from('journeys')
    .select('id, total_days')
    .eq('owner_id', user.id);

  const journeyList = journeys || [];
  const journeyIds = journeyList.map((j) => j.id);
  let updates = [];

  if (journeyIds.length) {
    const { data } = await supabase
      .from('updates')
      .select('journey_id, day_number, kind')
      .in('journey_id', journeyIds);
    updates = data || [];
  }

  const presenceKeys = new Set(updates.map((u) => `${u.journey_id}:${u.day_number}`));
  const maxDayByJourney = {};
  updates.forEach((u) => {
    maxDayByJourney[u.journey_id] = Math.max(maxDayByJourney[u.journey_id] || 0, u.day_number || 0);
  });

  const completedJourneys = journeyList.filter(
    (j) => (maxDayByJourney[j.id] || 0) >= (j.total_days || 1)
  ).length;

  let completedChallenges = 0;
  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, from_id, to_id, days, status')
    .eq('status', 'active')
    .or(`from_id.eq.${user.id},to_id.eq.${user.id}`);

  const challengeList = challenges || [];
  if (challengeList.length) {
    const { data: checks } = await supabase
      .from('challenge_checks')
      .select('challenge_id, user_id, day_key')
      .in('challenge_id', challengeList.map((c) => c.id));

    const countByPerson = {};
    (checks || []).forEach((check) => {
      const key = `${check.challenge_id}:${check.user_id}`;
      if (!countByPerson[key]) countByPerson[key] = new Set();
      countByPerson[key].add(check.day_key);
    });
    completedChallenges = challengeList.filter((challenge) => {
      const from = countByPerson[`${challenge.id}:${challenge.from_id}`]?.size || 0;
      const to = countByPerson[`${challenge.id}:${challenge.to_id}`]?.size || 0;
      return from >= challenge.days && to >= challenge.days;
    }).length;
  }

  const metrics = {
    presence: presenceKeys.size,
    wins: updates.filter((u) => u.kind === 'win').length,
    reflections: updates.filter((u) => u.kind === 'learned').length,
    completedJourneys,
    completedChallenges,
  };

  return (
    <>
      <AppTop backLabel={t.back} />
      <main className="wrap tree-page">
        <ArvoreDaVida initialMetrics={metrics} labels={t} />
      </main>
      <BottomNav active="profile" t={t} />
    </>
  );
}
