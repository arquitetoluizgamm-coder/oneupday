'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function ReportButton({ updateId, label, doneLabel }) {
  const [done, setDone] = useState(false);
  async function report() {
    if (done) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }
    await supabase.from('reports').insert({ reporter_id: user.id, update_id: updateId, reason: 'user_report' });
    setDone(true);
  }
  return <button className="report-btn" onClick={report} disabled={done}>{done ? doneLabel : label}</button>;
}
