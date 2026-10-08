import React from 'react';

export default function TheProcess() {
  return (
    <section className="mb-8 sm:mb-12 md:mb-20 border border-black p-6 sm:p-8 lg:p-12">
      <div className="text-center mb-6 sm:mb-10 md:mb-12">
        <h2 className="font-black text-black uppercase tracking-tighter">
          The Process
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8 divide-y md:divide-y-0 md:divide-x divide-black text-center">
        <div className="flex flex-col items-center pb-8 md:pb-0 md:pr-4 lg:pr-8">
          <span className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-200 mb-4 sm:mb-6">01</span>
          <h4 className="text-black uppercase tracking-widest mb-3 sm:mb-4">Discover</h4>
          <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500  font-medium max-w-xs">Curated deals updated daily.</p>
        </div>
        <div className="flex flex-col items-center py-8 md:py-0 md:page-container">
          <span className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-200 mb-4 sm:mb-6">02</span>
          <h4 className="text-black uppercase tracking-widest mb-3 sm:mb-4">Compare</h4>
          <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500  font-medium max-w-xs">Evaluate prices instantly.</p>
        </div>
        <div className="flex flex-col items-center pt-8 md:pt-0 md:pl-4 lg:pl-8">
          <span className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-200 mb-4 sm:mb-6">03</span>
          <h4 className="text-black uppercase tracking-widest mb-3 sm:mb-4">Checkout</h4>
          <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500  font-medium max-w-xs">Shop directly via the merchant.</p>
        </div>
      </div>
    </section>
  );
}
