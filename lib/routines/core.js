const DAY = 86400000;

export const ROUTINE_STATES = ['ideal', 'minimum', 'not_today', 'paused'];

export function localDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function dateDiff(a, b) {
  return Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / DAY);
}

export function scheduledOn(routine, date = localDate()) {
  if (!routine || routine.status !== 'active') return false;
  if (routine.start_date && date < routine.start_date) return false;
  if (routine.pause_until && date <= routine.pause_until) return false;
  if (routine.schedule_type === 'weekdays') {
    const weekday = new Date(`${date}T12:00:00`).getDay();
    return Array.isArray(routine.weekdays) && routine.weekdays.map(Number).includes(weekday);
  }
  return true;
}

export function metricsFor(logs = [], routineId) {
  const list = logs
    .filter((log) => !routineId || log.routine_id === routineId)
    .sort((a, b) => String(a.log_date).localeCompare(String(b.log_date)));
  const presence = list.filter((log) => log.state === 'ideal' || log.state === 'minimum');
  const pauses = list.filter((log) => log.state === 'paused');
  let returns = 0;
  presence.forEach((log, index) => {
    const previous = presence[index - 1];
    const pauseBetween = pauses.some((pause) => previous && pause.log_date > previous.log_date && pause.log_date < log.log_date);
    if (pauseBetween || (previous && dateDiff(previous.log_date, log.log_date) >= 3)) returns += 1;
  });
  return {
    presence: presence.length,
    ideal: presence.filter((log) => log.state === 'ideal').length,
    minimum: presence.filter((log) => log.state === 'minimum').length,
    notToday: list.filter((log) => log.state === 'not_today').length,
    pauses: pauses.length,
    returns,
  };
}

export function weeklyPresence(logs = [], today = localDate()) {
  const start = new Date(`${today}T12:00:00`);
  start.setDate(start.getDate() - 6);
  const from = localDate(start);
  return logs.filter((log) => log.log_date >= from && log.log_date <= today && (log.state === 'ideal' || log.state === 'minimum')).length;
}

export function scheduleLabel(routine, labels) {
  if (routine.schedule_type === 'weekdays') return labels.weekdays;
  if (routine.schedule_type === 'weekly_target') return labels.weeklyTarget.replace('{n}', routine.weekly_target || 1);
  return labels.everyDay;
}
