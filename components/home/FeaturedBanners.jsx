import React from 'react';
import Link from 'next/link';

export default function FeaturedBanners({ banners }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={`/stores/${banner.store}`}
          className={`relative ${banner.color || 'bg-neutral-900'} p-6 md:p-8 rounded-2xl md:rounded-[32px] overflow-hidden flex flex-col justify-between h-[380px] md:h-[420px] group shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/10`}
        >
          {/* Subtle noise/texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 group-hover:scale-110 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div>
              <span className={`inline-block ${banner.badgeColor || 'bg-white text-black'} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm border border-white/20`}>
                {banner.store}
              </span>
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-[1.1] drop-shadow-md">
                {banner.headline}
              </h3>
              <p className="text-sm lg:text-[15px] xl:text-base font-bold text-white/80 mb-6 uppercase tracking-wider">
                {banner.subheadline}
              </p>
            </div>

            <div className="mt-auto">
              <span
                className="inline-flex items-center gap-2 justify-center px-6 py-3.5 bg-white/95 text-black rounded-full text-sm font-black uppercase tracking-widest hover:bg-white hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-95 group/btn"
              >
                {banner.ctaText}
                <span className="opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300">&rarr;</span>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
