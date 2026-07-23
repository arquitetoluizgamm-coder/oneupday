export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/perfil', '/metricas', '/notifications', '/new', '/created', '/api/'] }],
    sitemap: 'https://oneupday.app/sitemap.xml',
  };
}
