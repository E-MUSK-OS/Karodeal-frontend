import { getProducts, getStores, getCategories } from '@/lib/fetchProducts';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export default async function sitemap() {
  const baseUrl = 'https://karodeal.in';

  // 1. Static Core Pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stores`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // 2. Dynamic Product Deals
  let productPages = [];
  try {
    const products = await getProducts();
    productPages = (products || []).map((p) => {
      const slug = slugify(p.title);
      const urlSlug = slug ? `${slug}-${p.id}` : p.id;
      return {
        url: `${baseUrl}/deals/${urlSlug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      };
    });
  } catch (err) {
    console.error('Error generating product sitemap entries:', err);
  }

  // 3. Dynamic Store Pages
  let storePages = [];
  try {
    const stores = await getStores();
    storePages = (stores || []).map((s) => ({
      url: `${baseUrl}/stores/${s.slug || s.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (err) {
    console.error('Error generating store sitemap entries:', err);
  }

  // 4. Dynamic Category Pages
  let categoryPages = [];
  try {
    const categories = await getCategories();
    categoryPages = (categories || []).map((c) => ({
      url: `${baseUrl}/categories/${c.slug || c.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (err) {
    console.error('Error generating category sitemap entries:', err);
  }

  return [...staticPages, ...productPages, ...storePages, ...categoryPages];
}
