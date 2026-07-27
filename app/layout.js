import './globals.css';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';
import SwRegister from '../components/SwRegister';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FAF7F2',
};

export async function generateMetadata() {
  const t = getDict(getLocale());
  return {
    title: `One Up Day — ${t.tagline}`,
    description: `One Up Day — ${t.thesis1} ${t.thesis2}`,
    // O nome do app, dito de forma que uma máquina não precise adivinhar.
    // A verificação de marca do Google compara o nome da tela de consentimento
    // com o nome da página inicial — e até aqui a página inicial só dizia o
    // nome dentro do <title>, junto com o slogan.
    applicationName: 'One Up Day',
    // www, porque o apex redireciona para ele. Canônica que redireciona é
    // canônica que alguns verificadores não seguem.
    metadataBase: new URL('https://www.oneupday.app'),
    alternates: { canonical: '/' },
    manifest: '/site.webmanifest',
    icons: {
      icon: [{ url: '/favicon-32.png', sizes: '32x32' }, { url: '/favicon-16.png', sizes: '16x16' }],
      apple: '/apple-touch-icon.png',
    },
    openGraph: { title: 'One Up Day', siteName: 'One Up Day', url: '/', description: t.heroSub, type: 'website' },
  };
}

export default function RootLayout({ children }) {
  const locale = getLocale();
  return (
    <html lang={locale}>
      <head>
        {/* Nome, site e categoria em formato legível por máquina. É o que
            verificadores automáticos leem antes de tentar adivinhar pelo
            <title>. Nada aqui é visual: é identidade declarada. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'One Up Day',
            alternateName: 'One Up Day',
            url: 'https://www.oneupday.app',
          }) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}<SwRegister /></body>
    </html>
  );
}
