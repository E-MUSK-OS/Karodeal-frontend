import { getProducts, getCategories } from '@/lib/fetchProducts';
import DealGrid from '@/components/deals/DealGrid';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(c => c.id === slug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} Deals | Dealora`,
  };
}

export default async function CategoryDetailsPage({ params }) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(c => c.id === slug);

  if (!category) {
    notFound();
  }

  const products = await getProducts();
  const categoryProducts = products.filter(p => p.category === category.id);

  return (
    <div className="py-8 md:py-12 lg:py-20 mb-10 md:mb-20 px-4 md:px-8 lg:px-12 overflow-hidden">
      <div className="mb-6 md:mb-8">
        <Link 
          href="/categories" 
          className="inline-flex items-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Categories
        </Link>
      </div>
      
      <div className="w-full text-center mb-8 sm:mb-10 border-b border-neutral-200 pb-8 flex flex-col items-center">
        <h2 className="text-black uppercase tracking-tighter mb-2 leading-none break-words">{category.name}</h2>
        <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">{categoryProducts.length} active offers</p>
      </div>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-0 mb-8 md:mb-12 border-b border-neutral-200 pb-4">
          <h3 className="text-black uppercase tracking-tighter">Latest Drops</h3>
          <span className="text-sm lg:text-[15px] xl:text-base text-neutral-500 font-medium tracking-widest">{categoryProducts.length} deals</span>
        </div>

        <DealGrid deals={categoryProducts} cardType="storeOffer" mobileGrid={true} />
      </section>
    </div>
  );
}
