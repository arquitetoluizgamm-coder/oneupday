import './globals.css';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';

export async function generateMetadata() {
  const t = getDict(getLocale());
  return {
    title: `One Up Day — ${t.tagline}`,
    description: t.heroSub,
    metadataBase: new URL('https://oneupday.app'),
    manifest: '/site.webmanifest',
    icons: {
      icon: [{ url: '/favicon-32.png', sizes: '32x32' }, { url: '/favicon-16.png', sizes: '16x16' }],
      apple: '/apple-touch-icon.png',
    },
    themeColor: '#090c2a',
    openGraph: { title: 'One Up Day', description: t.heroSub, type: 'website' },
  };
}

export default function RootLayout({ children }) {
  const locale = getLocale();
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
