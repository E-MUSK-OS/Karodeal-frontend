import { getProducts, getStores } from '@/lib/fetchProducts';
import StoreDealFilter from '@/components/stores/StoreDealFilter';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const stores = await getStores();
  const store = stores.find((s) => s.id === slug || s.slug === slug);
  if (!store) {
    return {
      title: 'Store Not Found | KaroDeal',
      robots: { index: false, follow: true },
    };
  }

  const title = `${store.name} Deals, Coupons & Cashback Offers | KaroDeal`;
  const description = `Find the latest verified ${store.name} deals, promotional discounts, and earn real withdrawable cashback when you shop on ${store.name} via KaroDeal.`;
  const url = `https://karodeal.in/stores/${slug}`;
  const imageUrl = store.logoUrl || 'https://karodeal.in/icon-512.png';

  return {
    title,
    description,
    keywords: [`${store.name} Deals`, `${store.name} Cashback`, `${store.name} Offers`, `${store.name} Coupons`, 'KaroDeal'],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'KaroDeal',
      images: [{ url: imageUrl, alt: `${store.name} Logo` }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function StoreDetailsPage({ params }) {
  const { slug } = await params;
  const stores = await getStores();
  const store = stores.find((s) => s.id === slug || s.slug === slug);

  if (!store) {
    notFound();
  }

  const products = await getProducts();
  const storeProducts = products.filter((p) => p.store === store.id || p.store === store.slug);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://karodeal.in' },
      { '@type': 'ListItem', position: 2, name: 'Stores', item: 'https://karodeal.in/stores' },
      { '@type': 'ListItem', position: 3, name: store.name, item: `https://karodeal.in/stores/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="py-8 md:py-12 lg:py-20 mb-10 md:mb-20 page-container overflow-hidden">
      <div className="mb-6 md:mb-8">
        <Link 
          href="/stores" 
          className="inline-flex items-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-[#f96b02] transition-colors group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Stores
        </Link>
      </div>

      {/* Store Header */}
      <div className="w-full text-center mb-8 sm:mb-10 border-b border-neutral-200 pb-8 flex flex-col items-center">
        <h2 className="text-black uppercase tracking-tighter mb-2 leading-none break-words">{store.name}</h2>
        <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">{storeProducts.length} active offers</p>
      </div>

      <StoreDealFilter store={store} initialDeals={storeProducts} />
    </div>
    </>
  );
}
