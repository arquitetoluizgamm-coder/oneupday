import { redirect, notFound } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import AppTop from '../../components/AppTop';
import BottomNav from '../../components/BottomNav';
import { isRoutineFeatureEnabled } from '../../lib/routines/flags';
import { routineLabels } from '../../lib/routines/labels';
import RoutinesClient from './RoutinesClient';
import './routines.css';

export const dynamic = 'force-dynamic';

export default async function Rotinas() {
  if (!isRoutineFeatureEnabled()) notFound();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const labels = routineLabels(getLocale());
  const t = getDict(getLocale());
  const [{ data: routines, error }, { data: logs }, { data: journeys }] = await Promise.all([
    supabase.from('routines').select('*').eq('owner_id', user.id).neq('status', 'archived').order('created_at', { ascending: true }),
    supabase.from('routine_logs').select('*').eq('owner_id', user.id).order('log_date', { ascending: false }).limit(500),
    supabase.from('journeys').select('id, title').eq('owner_id', user.id).order('created_at', { ascending: false }),
  ]);
  const ready = !error;
  return (<><AppTop backLabel={t.back} /><main className="wrap routine-page"><RoutinesClient initialRoutines={ready ? (routines || []) : []} initialLogs={ready ? (logs || []) : []} journeys={journeys || []} labels={labels} migrationMissing={!ready} /></main><BottomNav active="create" t={t} /></>);
}
