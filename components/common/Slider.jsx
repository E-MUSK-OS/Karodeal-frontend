'use client';

import React, { useState, useId } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

export default function Slider({
  children,
  autoPlay = false,
  autoPlayInterval = 3000,
  slidesPerView = "auto",
  breakpoints = {
    0: { spaceBetween: 16 },
    768: { spaceBetween: 24 },
  },
  slideClassName = "!w-auto !h-auto"
}) {
  const [isLocked, setIsLocked] = useState(true);
  const uniqueId = useId().replace(/:/g, '');
  const prevClass = `swiper-prev-${uniqueId}`;
  const nextClass = `swiper-next-${uniqueId}`;

  return (
    <div className="relative group/slider">
      <Swiper
        modules={[Navigation, Autoplay]}
        slidesPerView={slidesPerView}
        breakpoints={breakpoints}
        navigation={{
          prevEl: `.${prevClass}`,
          nextEl: `.${nextClass}`,
        }}
        autoplay={autoPlay ? { delay: autoPlayInterval, disableOnInteraction: false } : false}
        className="!pt-5 !pb-5 px-1 sm:px-0 sm:mx-0"
        loop={false}
        onInit={(swiper) => setIsLocked(swiper.isLocked)}
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
        onResize={(swiper) => setIsLocked(swiper.isLocked)}
      >
        {React.Children.map(children, (child, index) => (
          <SwiperSlide key={index} className={`${slideClassName}`}>
            {child}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Left Navigation Button */}
      <button
        className={`${prevClass} absolute -left-1 sm:-left-2 md:-left-2 lg:-left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/90 backdrop-blur-sm rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] items-center justify-center z-20 border border-white/20 hover:scale-110 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isLocked ? 'hidden' : 'flex'}`}
        aria-label="Scroll left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Right Navigation Button */}
      <button
        className={`${nextClass} absolute -right-1 sm:-right-2 md:-right-2 lg:-right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/90 backdrop-blur-sm rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] items-center justify-center z-20 border border-white/20 hover:scale-110 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isLocked ? 'hidden' : 'flex'}`}
        aria-label="Scroll right"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
