export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/login/',
          '/signup/',
          '/search',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot-Favicons',
        allow: '/',
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/icon*.png', '/apple-icon.png', '/favicon.ico'],
      },
    ],
    sitemap: 'https://karodeal.in/sitemap.xml',
    host: 'https://karodeal.in',
  };
}
