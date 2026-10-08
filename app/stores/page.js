import { getStores, getProducts } from '@/lib/fetchProducts';
import StoreCard from '@/components/stores/StoreCard';

export const metadata = {
  title: 'Top Shopping Stores | KaroDeal',
};

export default async function StoresPage() {
  const stores = await getStores();
  const products = await getProducts();
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Simple & Elegant Hero Section */}
      <div className="pt-12 pb-10 sm:pt-16 sm:pb-14 mb-10 sm:mb-16 bg-white border-b border-neutral-200">
        <div className="page-container text-center">

          <h2 className="text-black uppercase tracking-tighter mb-6 leading-none">
            Top Stores
          </h2>

          <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Discover exclusive deals, massive discounts, and daily drops from India's premium shopping destinations.
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="page-container">
        <div className="flex items-center justify-between mb-10 sm:mb-14">
          <h3 className="text-black uppercase tracking-tight">All Partners <span className="text-sm lg:text-[15px] xl:text-base text-neutral-400 ml-2">({stores.length})</span></h3>
          <div className="h-px bg-neutral-200 flex-grow ml-8 hidden sm:block"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {stores.map(store => (
            <div key={store.id} className="h-full">
              <StoreCard store={store} products={products} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
