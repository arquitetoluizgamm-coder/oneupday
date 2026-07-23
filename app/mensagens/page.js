import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getLocale } from '../../lib/locale';
import { getDict } from '../../lib/i18n';
import MessageClient from './MessageClient';

export const dynamic = 'force-dynamic';
export default async function MessagesPage() { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login'); const t = getDict(getLocale()); return <><main className="wrap"><MessageClient labels={{ eyebrow: t.messages, title: t.messages, back: t.back, search: t.messageSearch, empty: t.messageEmpty, choose: t.messageChoose, start: t.messageStart, placeholder: t.messagePlaceholder, send: t.messageSend, sending: t.messageSending, unsafe: t.commentUnsafe, error: t.messageError, connection: t.messageConnection }} /></main></>; }
