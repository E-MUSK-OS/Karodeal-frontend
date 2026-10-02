'use client';
import Link from 'next/link';
import Button from '@/components/common/Button';
import Slider from '@/components/common/Slider';

function TopCategoryCard({ category }) {
  if (!category) return null;

  let imageUrl = category.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop';
  if (imageUrl && imageUrl.startsWith('/')) {
    imageUrl = `http://localhost:5000${imageUrl}`;
  }

  return (
    <Link
      href={category.href || `/categories/${category.id}`}
      title={category.name}
      className="group relative flex flex-col items-center text-center cursor-pointer select-none w-full transition-all duration-300"
    >
      {/* Circle Image Container with delicate border and soft shadow */}
      <div className="relative flex items-center justify-center">
        <div className="w-[72px] h-[72px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px] lg:w-[130px] lg:h-[130px] rounded-full bg-slate-50 border border-slate-100 group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.1)] group-active:shadow-[0_10px_25px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 group-active:-translate-y-1 flex items-center justify-center overflow-hidden transition-all duration-300 ease-out shrink-0">
          <img
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 group-active:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>
      </div>

      {/* Title */}
      <span className="text-sm lg:text-[15px] xl:text-base mt-3  font-semibold text-neutral-800 group-hover:text-black transition-colors line-clamp-2 leading-tight max-w-[100px] sm:max-w-[120px]">
        {category.name}
      </span>
    </Link>
  );
}

export default function TopCategories({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="mb-6 md:mb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end md:mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-black uppercase tracking-tighter">Shop by Category</h2>
        </div>
        <div className="hidden sm:block">
          <Button href="/categories" variant="outline">
            Explore All Categories
            <span className="group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </div>

      {/* Responsive Categories Track */}
      <Slider
        autoPlay={true}
        autoPlayInterval={3000}
        slidesPerView={3}
        breakpoints={{
          0: { slidesPerView: 3, spaceBetween: 10 },
          480: { slidesPerView: 4, spaceBetween: 15 },
          640: { slidesPerView: 5, spaceBetween: 15 },
          768: { slidesPerView: 6, spaceBetween: 20 },
          1024: { slidesPerView: 7, spaceBetween: 20 },
          1280: { slidesPerView: 9, spaceBetween: 30 }
        }}
        slideClassName="!h-auto"
      >
        {categories.map(category => (
          <div
            key={category.id}
            className="flex justify-center w-full"
          >
            <TopCategoryCard category={category} />
          </div>
        ))}
      </Slider>
    </section>
  );
}
