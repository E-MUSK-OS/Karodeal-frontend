'use client';

import Link from 'next/link';
import Slider from '@/components/common/Slider';

export default function StoreQuickLinks({ stores }) {
  if (!stores || stores.length === 0) return null;

  return (
    <div className="border-b border-neutral-200 pb-8 md:pb-12 mb-12 md:mb-20 w-full">
      <Slider
        autoPlay={true}
        autoPlayInterval={4000}
        slidesPerView={2}
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 12 },
          480: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 20 }
        }}
        slideClassName="!h-auto"
      >
        {stores.map((store) => (
          <div key={store.id} className="flex justify-center w-full h-full">
            <Link
              href={`/stores/${store.id}`}
              className="group block w-full h-full"
            >
              <div className="flex flex-col items-center justify-center bg-white border border-neutral-200 md:group-hover:border-black py-4 px-5 md:py-6 sm:px-5 sm:py-8 shadow-sm md:group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 md:group-hover:-translate-y-2 w-full h-full overflow-hidden rounded-2xl md:rounded-[32px]">
                {/* Logo Container */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 flex items-center justify-center mb-3 md:mb-5 shrink-0 transform-gpu will-change-transform">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="max-w-full max-h-full object-contain md:group-hover:scale-110 transition-transform duration-500 transform-gpu will-change-transform"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerText = (store.logoText || store.name || '').substring(0, 1);
                      e.target.parentElement.className = "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-neutral-100 rounded-full flex items-center justify-center font-black text-xl md:text-2xl uppercase text-black shrink-0";
                    }}
                  />
                </div>

                {/* Store Name & Icon */}
                <div className="relative flex items-center justify-center max-w-[80%]">
                  <h6 className="text-black text-center uppercase tracking-[0.2em] mr-[-0.2em] truncate">{store.name}</h6>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="hidden md:block absolute -right-5 w-3.5 h-3.5 -translate-x-4 opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
}