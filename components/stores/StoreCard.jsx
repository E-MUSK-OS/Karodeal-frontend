import Link from 'next/link';


export default function StoreCard({ store, products = [] }) {
  const activeDeals = products.filter(p => p.store === store.id);
  const activeCategories = [...new Set(activeDeals.map(p => p.category))].slice(0, 3);

  return (
    <Link
      href={`/stores/${store.id}`}
      className="group relative flex flex-col bg-neutral-50 rounded-2xl md:rounded-[32px] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-neutral-200 hover:border-black overflow-hidden h-full"
    >
      {/* Subtle Color Accent Top Border */}
      <div className={`absolute top-0 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${store.color}`}></div>

      {/* Brand Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-neutral-100 flex items-center justify-center p-3 overflow-hidden group-hover:scale-105 transition-all duration-500">
          <img
            src={store.logoUrl}
            alt={store.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="bg-neutral-100 text-neutral-600 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase group-hover:bg-black group-hover:text-white transition-colors duration-300">
          {activeDeals.length} Deals
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <h4 className="text-black tracking-tight mb-4 group-hover:translate-x-1 transition-transform duration-300">
          {store.name}
        </h4>

        <div className="flex flex-wrap gap-2 mb-8 mt-auto">
          {activeCategories.map(cat => (
            <span key={cat} className="text-[10px] font-bold text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 uppercase tracking-widest group-hover:border-neutral-200 group-hover:text-black transition-colors">
              {cat.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-auto pt-6 border-t border-neutral-100 flex items-center justify-between group-hover:border-black transition-colors duration-300">
        <span className="text-xs sm:text-sm font-bold text-black uppercase tracking-widest">
          Explore Deals
        </span>
        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-black transition-colors duration-300">
          <svg className="w-5 h-5 text-black group-hover:text-white transition-all duration-300 transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
