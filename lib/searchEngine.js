import MiniSearch from 'minisearch';
import { cleanProductTitle } from '@/lib/titleSanitizer';

/**
 * Creates and indexes all active products using MiniSearch.
 * Provides full-text indexing, field-specific boosting, prefix matching, and typo-tolerance.
 */
export function createSearchIndex(products = []) {
  if (!products || products.length === 0) return null;

  const ms = new MiniSearch({
    fields: ['title', 'storeName', 'categoryName'],
    storeFields: [
      'id',
      'title',
      'slug',
      'image',
      'salePrice',
      'originalPrice',
      'discount',
      'cashback',
      'cashbackWithoutReview',
      'cashbackWithReview',
      'storeRel',
      'categoryRel',
      'storeName',
      'categoryName',
      'rawProduct',
    ],
    searchOptions: {
      boost: { storeName: 4, categoryName: 2, title: 1 },
      fuzzy: (term) => (term.length >= 3 ? 0.25 : false),
      prefix: true,
      combineWith: 'AND',
    },
  });

  const docs = products.map((p) => ({
    id: p.id,
    title: cleanProductTitle(p.title || ''),
    storeName: p.storeRel?.name || '',
    categoryName: p.categoryRel?.name || '',
    slug: p.slug,
    image: p.image,
    salePrice: p.salePrice,
    originalPrice: p.originalPrice,
    discount: p.discount,
    cashback: p.cashback,
    cashbackWithoutReview: p.cashbackWithoutReview,
    cashbackWithReview: p.cashbackWithReview,
    storeRel: p.storeRel,
    categoryRel: p.categoryRel,
    rawProduct: p,
  }));

  ms.addAll(docs);
  return { ms, products };
}

/**
 * Executes an intelligent search:
 * 1. Checks for exact Store intent (e.g. "myntra" -> returns ONLY Myntra items)
 * 2. Checks for exact Category intent
 * 3. Uses MiniSearch full-text with auto-correct typo-tolerance and prefix matching
 * 4. Fallback direct substring match
 */
export function performSearch(indexObj, query) {
  if (!indexObj || !query || !query.trim()) return [];
  const { ms, products } = indexObj;
  const trimmed = query.trim();
  const qLower = trimmed.toLowerCase();

  // 1. Strict Store Intent: If query matches a store name or slug (e.g., "myntra", "amazon", "flipkart")
  const storeMatches = products.filter(
    (p) =>
      p.storeRel?.name?.toLowerCase() === qLower ||
      p.storeRel?.slug?.toLowerCase() === qLower
  );
  if (storeMatches.length > 0) {
    return storeMatches;
  }

  // 2. Strict Category Intent: If query matches a category name or slug
  const categoryMatches = products.filter(
    (p) =>
      p.categoryRel?.name?.toLowerCase() === qLower ||
      p.categoryRel?.slug?.toLowerCase() === qLower
  );
  if (categoryMatches.length > 0) {
    return categoryMatches;
  }

  // 3. MiniSearch full-text search with typo-tolerance
  try {
    const results = ms.search(trimmed);
    if (results.length > 0) {
      return results.map((item) => item.rawProduct || item);
    }
  } catch (err) {
    console.warn('MiniSearch error, using fallback:', err);
  }

  // 4. Fallback: Direct substring search across title, store, or category
  return products.filter((p) => {
    const title = p.title?.toLowerCase() || '';
    const cat = p.categoryRel?.name?.toLowerCase() || '';
    const store = p.storeRel?.name?.toLowerCase() || '';
    return title.includes(qLower) || cat.includes(qLower) || store.includes(qLower);
  });
}
