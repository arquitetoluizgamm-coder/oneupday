import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import AppTop from '../../components/AppTop';
import './camera.css';

export const dynamic = 'force-dynamic';

export default async function CameraPage() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) redirect('/login');

  const cameraUrl = String(process.env.CAMERA_REMOTE_URL || '').trim().replace(/\/$/, '');

  return (
    <>
      <AppTop />
      <main className="camera-page">
        <div className="camera-kicker">ACESSO PRIVADO</div>
        <h1>Minha câmera</h1>
        <p className="camera-lead">Acompanhe sua câmera remotamente pelo painel seguro.</p>

        {!cameraUrl ? (
          <section className="camera-setup" aria-labelledby="camera-setup-title">
            <div className="camera-mark" aria-hidden="true">◉</div>
            <h2 id="camera-setup-title">Painel ainda não conectado</h2>
            <p>Configure <code>CAMERA_REMOTE_URL</code> no ambiente do One Up Day com o endereço privado do seu <code>camera-ip-app</code>.</p>
            <p className="camera-note">Use Tailscale, WireGuard ou outro acesso VPN. Não abra a porta 8088 diretamente na internet.</p>
          </section>
        ) : (
          <section className="camera-card" aria-labelledby="camera-panel-title">
            <div className="camera-card-head">
              <div>
                <span className="camera-status"><i aria-hidden="true" /> Conexão privada</span>
                <h2 id="camera-panel-title">Painel da câmera</h2>
              </div>
              <a className="camera-open" href={cameraUrl} target="_blank" rel="noreferrer">Abrir em nova aba</a>
            </div>
            <div className="camera-frame-wrap">
              <iframe className="camera-frame" src={cameraUrl} title="Painel remoto da câmera" allow="autoplay; fullscreen" />
            </div>
            <p className="camera-note">O vídeo permanece no seu servidor local. Esta página apenas abre o painel remoto.</p>
          </section>
        )}
      </main>
    </>
  );
}
