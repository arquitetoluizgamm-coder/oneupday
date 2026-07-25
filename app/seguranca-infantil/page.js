import { getLocale } from '../../lib/locale';
import Logo from '../../components/Logo';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'One Up Day — Padrões de Segurança Infantil / Child Safety Standards',
  description: 'Padrões do One Up Day contra o abuso e a exploração sexual infantil (CSAE).',
};

const TXT = {
  pt: {
    eyebrow: 'One Up Day',
    title: 'Padrões de Segurança Infantil',
    updated: 'Última atualização: julho de 2026',
    intro: 'O One Up Day é uma rede social onde pessoas registram jornadas pessoais e apoiam umas às outras. Levamos a segurança de crianças e adolescentes a sério. Esta página descreve nossos padrões contra o abuso e a exploração sexual infantil (CSAE) e contra material de abuso sexual infantil (CSAM), conforme a política do Google Play.',
    sections: [
      ['Tolerância zero', 'É terminantemente proibido no One Up Day qualquer conteúdo, comportamento ou contato que sexualize, explore, ameace ou coloque em risco crianças e adolescentes. Isso inclui material de abuso sexual infantil (CSAM), aliciamento (grooming), sextorsão, tráfico de menores e qualquer tentativa de contato sexual com menores de idade. Não há exceção, não há contexto que justifique, e não há aviso prévio: a conta é removida.'],
      ['Idade mínima', 'O One Up Day é destinado a pessoas com 13 anos ou mais. Contas identificadas como pertencentes a menores de 13 anos são encerradas e seus dados, excluídos.'],
      ['Como denunciar dentro do app', 'Todo conteúdo publicado no One Up Day pode ser denunciado por qualquer usuário: em cada dia registrado de uma jornada há o botão "Denunciar", e em cada perfil há a opção de bloquear a pessoa. As denúncias chegam à nossa equipe de moderação e são revisadas com prioridade quando envolvem segurança infantil. Também é possível denunciar por e-mail, a qualquer momento, no endereço indicado no fim desta página.'],
      ['O que fazemos ao receber uma denúncia', 'Denúncias envolvendo segurança infantil têm prioridade máxima. O conteúdo é removido enquanto a análise ocorre, a conta responsável é suspensa e, quando há indício de CSAM ou de crime contra criança ou adolescente, o caso é preservado e encaminhado às autoridades competentes — no Brasil, à Polícia Federal e ao SaferNet/Disque 100; nos Estados Unidos, ao NCMEC (National Center for Missing & Exploited Children); e às autoridades locais correspondentes em outras regiões.'],
      ['Prevenção', 'Comentários passam por filtro automático de conteúdo impróprio antes de serem publicados. Perfis e jornadas podem ser configurados como privados ou restritos a seguidores. Não há mensagens diretas abertas entre estranhos e não há qualquer recurso de busca por localização ou por idade, justamente para reduzir o risco de contato indevido com menores.'],
      ['Conformidade legal', 'O One Up Day cumpre as leis de proteção à criança e ao adolescente aplicáveis nas regiões em que opera, incluindo o Estatuto da Criança e do Adolescente (Lei nº 8.069/1990) e o Marco Civil da Internet (Lei nº 12.965/2014) no Brasil, e coopera com solicitações legais das autoridades competentes.'],
      ['Ponto de contato', 'Para tratar de questões relacionadas a CSAE, CSAM ou a esta política, o contato designado é: arquitetoluizgamm@gmail.com. Respondemos a denúncias de segurança infantil com prioridade.'],
    ],
    care: 'Se você tem conhecimento de uma criança em situação de risco imediato, procure as autoridades locais. No Brasil: Disque 100 (Direitos Humanos) ou denuncie em new.safernet.org.br.',
  },
  en: {
    eyebrow: 'One Up Day',
    title: 'Child Safety Standards',
    updated: 'Last updated: July 2026',
    intro: 'One Up Day is a social network where people record personal journeys and support one another. We take the safety of children and teenagers seriously. This page describes our standards against child sexual abuse and exploitation (CSAE) and against child sexual abuse material (CSAM), in line with Google Play policy.',
    sections: [
      ['Zero tolerance', 'Any content, behaviour or contact that sexualises, exploits, threatens or endangers children and teenagers is strictly prohibited on One Up Day. This includes child sexual abuse material (CSAM), grooming, sextortion, trafficking of minors, and any attempt at sexual contact with a minor. There is no exception, no justifying context and no prior warning: the account is removed.'],
      ['Minimum age', 'One Up Day is intended for people aged 13 and over. Accounts identified as belonging to someone under 13 are terminated and their data deleted.'],
      ['How to report inside the app', 'Any content published on One Up Day can be reported by any user: every recorded day of a journey has a "Report" button, and every profile can be blocked. Reports reach our moderation team and are reviewed as a priority whenever child safety is involved. Reports can also be sent by e-mail at any time, to the address at the end of this page.'],
      ['What happens when we receive a report', 'Reports involving child safety have the highest priority. The content is removed while the review takes place, the responsible account is suspended, and where there is any indication of CSAM or of a crime against a child, the case is preserved and referred to the competent authorities — in Brazil, to the Federal Police and SaferNet/Disque 100; in the United States, to NCMEC (National Center for Missing & Exploited Children); and to the corresponding local authorities in other regions.'],
      ['Prevention', 'Comments pass through an automated filter for inappropriate content before being published. Profiles and journeys can be set to private or restricted to followers. There are no open direct messages between strangers, and there is no search by location or by age, precisely to reduce the risk of improper contact with minors.'],
      ['Legal compliance', 'One Up Day complies with applicable child protection laws in the regions where it operates, including the Brazilian Child and Adolescent Statute (Law 8.069/1990) and the Brazilian Internet Civil Framework (Law 12.965/2014), and cooperates with lawful requests from competent authorities.'],
      ['Point of contact', 'For matters relating to CSAE, CSAM or this policy, the designated contact is: arquitetoluizgamm@gmail.com. We respond to child safety reports as a priority.'],
    ],
    care: 'If you are aware of a child at immediate risk, contact your local authorities. In the United States, report to NCMEC at CyberTipline.org. In Brazil: Disque 100 or new.safernet.org.br.',
  },
};

export default function SegurancaInfantil() {
  const locale = String(getLocale() || 'pt').slice(0, 2);
  const t = TXT[locale] || TXT.pt;
  const other = t === TXT.pt ? TXT.en : TXT.pt;

  const Block = ({ d }) => (
    <>
      <p className="eyebrow">{d.eyebrow}</p>
      <h1>{d.title}</h1>
      <p className="legal-date">{d.updated}</p>
      <p className="legal-intro">{d.intro}</p>
      {d.sections.map(([h, p]) => (
        <section key={h} className="legal-sec">
          <h2>{h}</h2>
          <p>{p}</p>
        </section>
      ))}
      <p className="legal-care">{d.care}</p>
    </>
  );

  return (
    <>
      <header className="top"><Logo href="/" size={40} /></header>
      <main className="wrap legal">
        <Block d={t} />
        <hr className="legal-sep" />
        <Block d={other} />
      </main>
      <footer className="foot"><p>One <b>Up</b> Day · oneupday.app</p></footer>
    </>
  );
}
