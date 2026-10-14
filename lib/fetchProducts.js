export async function getProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
    const res = await fetch(`${apiUrl}/products?_t=${Date.now()}`, { cache: 'no-store', next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data = await res.json();
    const now = new Date();
    return data
      .filter(p => p.isActive !== false && (!p.expiresAt || new Date(p.expiresAt) > now))
      .map(p => ({
        ...p,
        store: p.storeRel ? p.storeRel.slug : p.storeId,
        category: p.categoryRel ? p.categoryRel.slug : p.categoryId
      }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function getStores() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
    const res = await fetch(`${apiUrl}/meta/stores`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(s => ({ ...s, id: s.slug }));
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
    const res = await fetch(`${apiUrl}/meta/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(c => ({ ...c, id: c.slug }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
