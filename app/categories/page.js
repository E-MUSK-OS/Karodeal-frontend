import { getCategories, getProducts } from '@/lib/fetchProducts';
import CategoryCard from '@/components/categories/CategoryCard';

export const metadata = {
  title: 'All Categories | Dealora',
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const products = await getProducts();
  return (
    <div className="px-4 sm:px-8 lg:px-16 py-12 md:py-24 mb-12 md:mb-20">

      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <h2 className="text-black uppercase tracking-tighter mb-2 sm:mb-3">Categories</h2>
        <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500 font-medium tracking-widest">Browse by section</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-10 pt-8 sm:pt-12 border-t border-neutral-200">
        {categories.map(category => (
          <div key={category.id} className="border-neutral-200">
            <CategoryCard category={category} products={products} />
          </div>
        ))}
      </div>

    </div>
  );
}
