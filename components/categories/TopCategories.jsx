'use client';
import Link from 'next/link';
import Button from '@/components/common/Button';
import Slider from '@/components/common/Slider';
import { ArrowUpRight, Sparkles } from 'lucide-react';

function TopCategoryCard({ category }) {
  if (!category) return null;

  let imageUrl = category.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop';
  if (imageUrl && imageUrl.startsWith('/')) {
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api').replace(/\/api\/?$/, '');
    imageUrl = `${backendBase}${imageUrl}`;
  }

  const dealCount = category._count?.products || 0;

  return (
    <Link
      href={category.href || `/categories/${category.slug || category.id}`}
      title={category.name}
      className="group relative flex flex-col justify-between w-full aspect-[3/4] rounded-[22px] sm:rounded-[26px] overflow-hidden bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 hover:border-white/60 shadow-md hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-2 transition-all duration-300 ease-out select-none cursor-pointer"
    >
      {/* 1. Lifestyle Image */}
      <img
        src={imageUrl}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
        loading="lazy"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop';
        }}
      />

      {/* 2. Cinematic Multi-Stop Dark Gradient (Keeps upper outfit bright and clear) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 via-35% to-transparent pointer-events-none transition-opacity duration-300 group-hover:from-black/90" />

      {/* 3. Glossy Holographic Light Sweep Shimmer on hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px] sm:rounded-[26px]">
        <div className="w-[200%] h-full absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
      </div>

      {/* 4. Top Micro Badges (Curated & High-Contrast Deals Tag) */}
      <div className="relative z-10 w-full p-2.5 sm:p-3 flex items-center justify-between pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider bg-black/45 backdrop-blur-md text-white/95 border border-white/20 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Curated</span>
        </span>

        {dealCount > 0 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-neutral-950 border border-white/80 shadow-xs">
            {dealCount} Deals
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-extrabold uppercase tracking-wider bg-black/35 backdrop-blur-md text-white/80 border border-white/15">
            Hot
          </span>
        )}
      </div>

      {/* 5. Bottom Info: Category Title & Interactive High-Contrast Pill */}
      <div className="relative z-10 w-full p-3 sm:p-3.5 flex flex-col items-start pointer-events-none">
        <h4 className="text-white font-black text-xs sm:text-[13px] md:text-sm tracking-tight uppercase leading-snug drop-shadow-md truncate max-w-full group-hover:text-orange-400 transition-colors">
          {category.name}
        </h4>

        {/* High-Contrast Action Pill (Transforms to solid white on hover) */}
        <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-xs group-hover:bg-white group-hover:text-neutral-950 group-hover:border-white transition-all duration-300">
          <span>Explore</span>
          <ArrowUpRight className="w-3 h-3 stroke-[2.5] text-orange-400 group-hover:text-neutral-950 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

export default function TopCategories({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="mb-10 md:mb-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60 text-[#f96b02] text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h2 className="font-black text-neutral-950 dark:text-white uppercase tracking-tighter text-2xl sm:text-3xl md:text-4xl">
            Shop by Category
          </h2>
        </div>

        <div className="hidden sm:block">
          <Button href="/categories" variant="outline" className="group">
            Explore All Categories
            <span className="group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </div>

      {/* Responsive Categories Track */}
      <Slider
        autoPlay={true}
        autoPlayInterval={3500}
        slidesPerView={2.2}
        breakpoints={{
          0: { slidesPerView: 2.2, spaceBetween: 12 },
          480: { slidesPerView: 3.2, spaceBetween: 14 },
          640: { slidesPerView: 4.2, spaceBetween: 16 },
          768: { slidesPerView: 5.2, spaceBetween: 18 },
          1024: { slidesPerView: 6.2, spaceBetween: 20 },
          1280: { slidesPerView: 7.2, spaceBetween: 20 }
        }}
        slideClassName="!h-auto"
      >
        {categories.map((category) => (
          <div key={category.id} className="w-full h-full flex p-0.5">
            <TopCategoryCard category={category} />
          </div>
        ))}
      </Slider>

      <div className="mt-6 sm:hidden text-center">
        <Button href="/categories" variant="outline" fullWidth>
          Explore All Categories &rarr;
        </Button>
      </div>
    </section>
  );
}
