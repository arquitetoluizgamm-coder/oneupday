import { createClient } from '../lib/supabase/server';
import BackBtn from './BackBtn';

// Topo padrão de todas as páginas internas (logadas).
// Mesmo visual da home: [voltar] [marca -> /home] [avatar -> /perfil]
export default async function AppTop({ backHref = '/home', backLabel = 'Voltar' }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('name, avatar_url, avatar_color').eq('id', user.id).maybeSingle();
    profile = data;
  }
  return (
    <header className="top top-3">
      <div className="top-left"><BackBtn fallback={backHref} label={backLabel} /></div>
      <a className="top-brand" href="/home" aria-label="One Up Day">
        <img src="/logo-name.png" alt="One Up Day" />
      </a>
      <div className="top-right">
        {profile && (
          <a className="header-ava" href="/perfil" aria-label={profile.name || ''} style={{ background: profile.avatar_color || 'var(--orange)' }}>
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : (profile.name || '?')[0]}
          </a>
        )}
      </div>
    </header>
  );
}
