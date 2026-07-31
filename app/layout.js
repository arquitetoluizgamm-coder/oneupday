import './globals.css';
import './one-tokens.css';
import './one-material.css';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';
import SwRegister from '../components/SwRegister';

export const viewport = { width:'device-width', initialScale:1, maximumScale:1, userScalable:false, viewportFit:'cover', themeColor:'#FAF7F2' };

export async function generateMetadata() {
  const t = getDict(getLocale());
  return {
    title:`One Up Day — ${t.tagline}`, description:`One Up Day — ${t.thesis1} ${t.thesis2}`,
    applicationName:'One Up Day', metadataBase:new URL('https://oneupday.app'), alternates:{canonical:'/'}, manifest:'/site.webmanifest',
    icons:{icon:[{url:'/favicon-32.png',sizes:'32x32'},{url:'/favicon-16.png',sizes:'16x16'}],apple:'/apple-touch-icon.png'},
    openGraph:{title:'One Up Day',siteName:'One Up Day',url:'/',description:t.heroSub,type:'website',locale:'pt_BR',images:[{url:'/og-capa.png',width:1200,height:630,alt:'One Up Day — você não precisa vencer tudo hoje.'}]},
    twitter:{card:'summary_large_image',title:'One Up Day',description:t.heroSub,images:['/og-capa.png']},
  };
}

export default function RootLayout({ children }) {
  const locale = getLocale();
  return <html lang={locale}><head>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'One Up Day',alternateName:'One Up Day',url:'https://oneupday.app'})}} />
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@500;600;700&display=swap" rel="stylesheet" />
  </head><body>{children}<SwRegister /></body></html>;
}
