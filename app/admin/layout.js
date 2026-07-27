import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/server';
import { ehDono } from '../../lib/dono';
import AdminAbas from './AdminAbas';

export const dynamic = 'force-dynamic';

// O portão fica aqui, no layout, e não em cada página.
// Assim uma aba nova nasce protegida — não dá para esquecer.
export default async function AdminLayout({ children }) {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) redirect('/login');
  if (!ehDono(user)) redirect('/home');

  return (
    <div className="admin-wrap">
      <header className="admin-top">
        <Link href="/home" className="admin-voltar">← app</Link>
        <strong className="admin-marca">Administração</strong>
      </header>
      <AdminAbas />
      {children}
    </div>
  );
}
