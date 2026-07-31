import './globals.css';
import './one-tokens.css';
import './one-material.css';
import { getLocale } from '../lib/locale';
import { getDict } from '../lib/i18n';
import SwRegister from '../components/SwRegister';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  // Branco, não creme. Esta cor pinta a barra de status (relógio,
  // wifi) nos contextos web/PWA. Em creme, sobre o feed branco, ela
  // aparecia como uma faixa clara destacada — parecia um vidro sujo.
  // Em branco ela FUNDE com o fundo do feed e some do olho.
  // A transparência de verdade não existe por cor: só via edge-to-edge
  // do Android 15+, que o pacote já aceita (targetSdk 36) e o CSS já
  // trata (--sa-top, viewport-fit=cover).
  themeColor: '#FFFFFF',
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
    // O canônico do projeto é o apex, sem www. Ele é o que está no
    // sitemap, no robots, nos gatilhos do banco, nas imagens de
    // compartilhamento, nos rodapés — e, o que mais pesa, é o host
    // do app Android. Mudar isso significaria republicar o pacote e
    // revalidar o assetlinks. O que precisa mudar é o redirecionamento
    // da Vercel, que hoje empurra o apex para o www: inverta lá.
    metadataBase: new URL('https://oneupday.app'),
    alternates: { canonical: '/' },
    manifest: '/site.webmanifest',
    // ============================================================
    // AS METAS DA APPLE FORAM REMOVIDAS — REVERSÃO DO PATCH 246
    //
    // O Fernando relatou: a transparência da barra FUNCIONAVA e
    // parou. A única mudança recente nesta área foi o 246, que
    // adicionou `appleWebApp` (capable + black-translucent).
    //
    // O mecanismo provável: sem essas metas, o iOS decide pelo
    // site.webmanifest — o caminho moderno. COM elas, ele cai no
    // caminho legado, que o iOS 26.1 quebrou (a faixa de vidro
    // sobre o relógio). Eu liguei uma chave que empurrou o app
    // para o lado quebrado.
    //
    // Se alguém quiser reintroduzir isso um dia: teste no aparelho
    // ANTES, removendo e readicionando o ícone da tela de início —
    // o iOS grava essas metas no momento de adicionar.
    // ============================================================
    icons: {
      icon: [{ url: '/favicon-32.png', sizes: '32x32' }, { url: '/favicon-16.png', sizes: '16x16' }],
      apple: '/apple-touch-icon.png',
    },
    // Sem uma imagem declarada, o Facebook varre a página e escolhe
    // sozinho — e escolhia `ex-ana.jpg`, o rosto do exemplo, para
    // representar o app inteiro. Cartão de link é a primeira coisa
    // que a pessoa vê; não pode ser sorteado.
    openGraph: {
      title: 'One Up Day', siteName: 'One Up Day', url: '/',
      description: t.heroSub, type: 'website', locale: 'pt_BR',
      images: [{ url: '/og-capa.png', width: 1200, height: 630, alt: 'One Up Day — você não precisa vencer tudo hoje.' }],
    },
    // summary_large_image é o cartão grande. Sem isto o WhatsApp e o
    // X mostram uma miniatura quadrada, e a frase não cabe.
    twitter: { card: 'summary_large_image', title: 'One Up Day', description: t.heroSub, images: ['/og-capa.png'] },
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
            url: 'https://oneupday.app',
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
