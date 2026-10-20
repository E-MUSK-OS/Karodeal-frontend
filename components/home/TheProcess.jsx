'use client';

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const PROCESS_STEPS = [
  {
    stepNumber: '01',
    title: 'SELECT STORE',
    description: 'Discover trusted stores and brands across all your favorite shopping categories.',
  },
  {
    stepNumber: '02',
    title: 'SELECT DEAL',
    description: 'Browse trending deals and the highest cashback offers updated daily.',
  },
  {
    stepNumber: '03',
    title: 'ORDER',
    description: 'Click through our deal link and place your order directly on the store’s official website as you normally do.',
  },
  {
    stepNumber: '04',
    title: 'REVIEW',
    description: 'Submit your order details in your dashboard to track and verify your cashback swiftly.',
  },
  {
    stepNumber: '05',
    title: 'CLAIM CASH BACK',
    description: 'Receive verified cash rewards credited directly to your KaroDeal wallet for withdrawal via Bank or UPI.',
  },
];

export default function TheProcess() {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <section className="mb-8 sm:mb-12 md:mb-20 border border-black/10 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-10 relative overflow-hidden bg-neutral-50/40 dark:bg-neutral-900/30">
      {/* Header section with title and slider controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6 sm:mb-8 md:mb-10 border-b border-black/10 dark:border-neutral-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black mb-2.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#f96b02] animate-pulse" />
            Simple 5-Step Guide
          </div>
          <h2 className="font-black text-black dark:text-white uppercase tracking-tighter text-2xl sm:text-3xl md:text-4xl leading-tight">
            The Process
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-md mt-1">
            Follow these 5 effortless steps from picking your store to getting real cash in your account.
          </p>
        </div>

        {/* Slider Controls (Prev / Next Buttons) */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">

          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={isBeginning}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/20 dark:border-neutral-700 flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isBeginning
                ? 'opacity-30 cursor-not-allowed bg-transparent text-neutral-400'
                : 'hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white text-black dark:text-white bg-white dark:bg-neutral-900 shadow-xs active:scale-95'
            }`}
            aria-label="Previous step"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            disabled={isEnd}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/20 dark:border-neutral-700 flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isEnd
                ? 'opacity-30 cursor-not-allowed bg-transparent text-neutral-400'
                : 'hover:bg-[#f96b02] hover:text-white hover:border-[#f96b02] text-black dark:text-white bg-white dark:bg-neutral-900 shadow-xs active:scale-95'
            }`}
            aria-label="Next step"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Process Slider: 3 items visible on desktop screen, remaining 2 slide into view */}
      <div className="relative group/slider">
        <Swiper
          modules={[Navigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={handleSlideChange}
          slidesPerView={1}
          spaceBetween={16}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 18,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 22,
            },
          }}
          className="!py-2 overflow-hidden"
        >
          {PROCESS_STEPS.map((step, idx) => (
            <SwiperSlide key={step.stepNumber} className="!h-auto">
              <div className="h-full flex flex-col justify-between bg-white dark:bg-neutral-900 border border-black/15 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-600 rounded-2xl p-5 sm:p-6 md:p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden select-none min-h-[250px] sm:min-h-[270px]">
                {/* Subtle watermark step number */}
                <span className="absolute -bottom-3 -right-2 font-black text-7xl sm:text-8xl text-neutral-900/[0.04] dark:text-white/[0.04] group-hover:text-neutral-900/[0.08] dark:group-hover:text-white/[0.08] transition-colors pointer-events-none select-none">
                  {step.stepNumber}
                </span>

                {/* Top Section: Step Badge */}
                <div className="relative z-10 flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f96b02]" />
                    STEP {step.stepNumber}
                  </span>
                </div>

                {/* Middle Section: Title & 1-2 lines of description */}
                <div className="relative z-10 flex flex-col my-auto py-1">
                  <h3 className="font-black text-black dark:text-white uppercase tracking-tight text-lg sm:text-xl group-hover:text-[#f96b02] transition-colors leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] md:text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed mt-2.5">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Section: Progress trail hint */}
                <div className="relative z-10 mt-6 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  <span>Step {idx + 1} of 5</span>
                  {idx < PROCESS_STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => swiperRef.current?.slideNext()}
                      className="flex items-center gap-1 group-hover:text-black dark:group-hover:text-white transition-colors cursor-pointer"
                    >
                      Next Step <span className="text-xs">&rarr;</span>
                    </button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                      Ready to Earn &check;
                    </span>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

    </section>
  );
}
