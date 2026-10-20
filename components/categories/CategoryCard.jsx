import Link from 'next/link';


export default function CategoryCard({ category, products = [] }) {
    const activeDeals = products.filter(p => p.category === category.id).length;

    return (
        <Link
            href={`/categories/${category.id}`}
            prefetch={true}
            className="group relative flex flex-col bg-white dark:bg-neutral-900 rounded-2xl md:rounded-[32px] overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-2 active:scale-[0.98] transition-all duration-300 touch-manipulation select-none ease-[cubic-bezier(0.25,1,0.5,1)]"
        >
            {/* Top Image Section */}
            <div className="relative aspect-[2.8/3] w-full overflow-hidden bg-[#fafafa] dark:bg-neutral-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                <img
                    src={category.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop'}
                    alt={category.name}
                    className={`w-full h-full ${(category.image || '').startsWith('/images/') ? 'object-contain p-4 sm:p-6' : 'object-cover'} group-hover:scale-110 transition-all duration-500 ease-out`}
                />
                {/* Animated Slide-in Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-3 pointer-events-none">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        Explore Deals &rarr;
                    </span>
                </div>
            </div>

            {/* Bottom Content Section */}
            <div className="p-4 md:p-5 flex flex-col items-center justify-center text-center relative z-20 bg-white dark:bg-neutral-900">
                <h5 className="text-black dark:text-white tracking-tight mb-1 group-hover:text-[#f96b02] transition-colors duration-300">
                    {category.name}
                </h5>
                <p className="text-sm lg:text-[15px] xl:text-base text-neutral-400 dark:text-neutral-500">
                    {activeDeals} Deals
                </p>
            </div>
        </Link>
    );
}
