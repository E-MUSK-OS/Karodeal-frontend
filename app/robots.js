export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/login/', '/signup/'],
    },
    sitemap: 'https://karodeal.in/sitemap.xml',
  }
}
