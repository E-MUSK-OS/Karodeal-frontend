import Link from 'next/link';
import Button from '../common/Button';

export default function Hero() {
  return (
    <section className="bg-white border-b border-neutral-200">
      <div className="pt-10 pb-10 sm:pt-16 sm:pb-16 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28">
        <div className="max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200/80 text-neutral-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Karo Deal (KaroDeal) Official Platform</span>
          </div>
          <h1 className="font-black text-black uppercase tracking-tighter mb-2 sm:mb-6 md:mb-8 leading-[1.1] sm:leading-[1] md:leading-[0.95]">
            The Best Deals. <br />
            <span className="text-neutral-400">Zero Clutter.</span>
          </h1>
          <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500 mb-8 sm:mb-10 md:mb-12 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl font-medium tracking-wide">
            Welcome to Karo Deal (KaroDeal) — A highly curated selection of verified discounts and guaranteed cashback across Amazon, Flipkart, Myntra, and top Indian platforms. Engineered for smart shoppers who value massive savings.
          </p>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Link href="/deals" className="w-full sm:w-auto">
              <Button fullWidth>
                Explore Deals
              </Button>
            </Link>
            <Link href="/stores" className="w-full sm:w-auto">
              <Button variant="outline" fullWidth>
                View Platforms
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
