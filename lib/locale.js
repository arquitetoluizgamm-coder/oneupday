import { headers, cookies } from 'next/headers';
import { pickLocale } from './i18n';

// ============================================================
// OS ROBÔS DE PRÉVIA NÃO TÊM IDIOMA
//
// O app escolhe o idioma pelo Accept-Language do navegador. Mas o
// robô que gera a prévia do link — Facebook, WhatsApp, LinkedIn —
// não manda esse cabeçalho. Resultado: o cartão saía em inglês,
// dentro de um grupo brasileiro, com o texto que ninguém ali leria.
//
// Para eles, português. É o mercado do produto, e é a língua de
// quem vai clicar.
//
// Googlebot fica de fora de propósito: a indexação continua
// seguindo a detecção normal, e mexer nela por causa de uma
// prévia seria trocar um problema visível por um invisível.
// ============================================================
const ROBOS_DE_PREVIA = /facebookexternalhit|facebookcatalog|Facebot|WhatsApp|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|Pinterest|redditbot|SkypeUriPreview|vkShare|Iframely|Embedly/i;

export function getLocale() {
  const h = headers();
  const ua = h.get('user-agent') || '';
  if (ROBOS_DE_PREVIA.test(ua)) return 'pt';
  const accept = h.get('accept-language') || '';
  const saved = cookies().get('oud_locale')?.value || null;
  return pickLocale(saved, accept);
}
