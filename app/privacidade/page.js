import { getLocale } from '../../lib/locale';
import Logo from '../../components/Logo';

export const dynamic = 'force-dynamic';

const TXT = {
  pt: {
    title: 'Política de Privacidade',
    updated: 'Última atualização: julho de 2026',
    sections: [
      ['O que é o One Up Day', 'O One Up Day é uma rede social de jornadas pessoais. Este documento explica, em linguagem simples, quais dados coletamos, por que coletamos e o que fazemos com eles.'],
      ['Dados que coletamos', 'Conta: quando você entra com o Google, recebemos seu nome, e-mail e foto de perfil. Conteúdo: o que você publica no app — jornadas, textos, fotos, vídeos, comentários, desafios e reações. Uso: eventos básicos e anônimos de navegação (por exemplo, "visitou o feed") para entender o que funciona no produto.'],
      ['Para que usamos', 'Para fazer o app funcionar: mostrar seu perfil, suas jornadas e permitir que outras pessoas apoiem você. Não vendemos seus dados. Não usamos seus dados para publicidade. Não há anúncios no One Up Day.'],
      ['Onde ficam os dados', 'Seus dados são armazenados com segurança na Supabase (banco de dados e arquivos) e o app é hospedado na Vercel. O acesso é protegido por regras de segurança em nível de banco (RLS).'],
      ['Serviços de terceiros', 'Google (login), Supabase (armazenamento), Vercel (hospedagem). Se o recurso de apoio à escrita por IA estiver ativo, trechos do seu texto podem ser processados pela OpenAI apenas para gerar a sugestão — e você pode desativar isso no seu perfil.'],
      ['Visibilidade', 'Você controla a visibilidade de cada jornada (pública, seguidores ou privada) e de cada foto do álbum. Conteúdo público pode ser visto por qualquer pessoa com o link.'],
      ['Seus direitos', 'Você pode editar ou excluir seus posts, fotos, jornadas e desafios a qualquer momento dentro do app. Para excluir sua conta e todos os dados associados, escreva para o e-mail abaixo e faremos a remoção.'],
      ['Idade mínima', 'O One Up Day é destinado a maiores de 13 anos.'],
      ['Mudanças', 'Se esta política mudar, atualizaremos esta página e a data acima.'],
      ['Contato', 'Dúvidas ou pedidos sobre seus dados: arquitetoluizgamm@gmail.com'],
    ],
    care: 'O One Up Day apoia a sua jornada, mas não substitui cuidado profissional. Se você precisar de ajuda, procure um profissional ou um serviço de apoio da sua região.',
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: July 2026',
    sections: [
      ['What One Up Day is', 'One Up Day is a social network for personal journeys. This document explains, in plain language, what data we collect, why, and what we do with it.'],
      ['Data we collect', 'Account: when you sign in with Google we receive your name, e-mail and profile photo. Content: what you publish in the app — journeys, texts, photos, videos, comments, challenges and reactions. Usage: basic, anonymous navigation events (for example, "visited the feed") to understand what works in the product.'],
      ['How we use it', 'To make the app work: showing your profile, your journeys, and letting other people support you. We do not sell your data. We do not use your data for advertising. There are no ads in One Up Day.'],
      ['Where data lives', 'Your data is stored securely on Supabase (database and files) and the app is hosted on Vercel. Access is protected by database-level security rules (RLS).'],
      ['Third-party services', 'Google (sign-in), Supabase (storage), Vercel (hosting). If the AI writing-support feature is on, parts of your text may be processed by OpenAI only to generate the suggestion — and you can turn this off in your profile.'],
      ['Visibility', 'You control the visibility of each journey (public, followers or private) and of each album photo. Public content can be seen by anyone with the link.'],
      ['Your rights', 'You can edit or delete your posts, photos, journeys and challenges at any time inside the app. To delete your account and all associated data, write to the e-mail below and we will remove it.'],
      ['Minimum age', 'One Up Day is intended for people aged 13 and over.'],
      ['Changes', 'If this policy changes, we will update this page and the date above.'],
      ['Contact', 'Questions or requests about your data: arquitetoluizgamm@gmail.com'],
    ],
    care: 'One Up Day supports your journey but is not a substitute for professional care. If you need help, please reach out to a professional or a local support service.',
  },
};

export default function Privacidade() {
  const locale = String(getLocale() || 'pt').slice(0, 2);
  const t = TXT[locale] || TXT.pt;
  return (
    <>
      <header className="top"><Logo href="/" size={40} /></header>
      <main className="wrap legal">
        <p className="eyebrow">One Up Day</p>
        <h1>{t.title}</h1>
        <p className="legal-date">{t.updated}</p>
        {t.sections.map(([h, p]) => (
          <section key={h} className="legal-sec">
            <h2>{h}</h2>
            <p>{p}</p>
          </section>
        ))}
        <p className="legal-care">{t.care}</p>
      </main>
      <footer className="foot"><p>One <b>Up</b> Day · oneupday.app</p></footer>
    </>
  );
}
