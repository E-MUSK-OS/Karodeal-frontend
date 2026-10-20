import Button from '@/components/common/Button';
import { 
  ShieldCheck, 
  Banknote, 
  TrendingUp, 
  ShoppingBag, 
  Target, 
  Zap, 
  Users, 
  Gift, 
  CheckCircle2, 
  Heart 
} from 'lucide-react';

export const metadata = {
  title: 'About Us | KaroDeal',
  description: 'Learn about KaroDeal, our mission to redefine smart shopping, and how we bring verified cashback and discounts to Indian shoppers.',
  alternates: {
    canonical: 'https://karodeal.in/about',
  },
  openGraph: {
    title: 'About Us | KaroDeal',
    description: 'Learn about KaroDeal, our mission to redefine smart shopping, and how we bring verified cashback and discounts to Indian shoppers.',
    url: 'https://karodeal.in/about',
    siteName: 'KaroDeal',
    images: [{ url: 'https://karodeal.in/icon-512.png', width: 512, height: 512, alt: 'About KaroDeal' }],
  },
};

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-neutral-950">
      
      {/* 1. Clean Minimal Hero */}
      <section className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 py-16 sm:py-20 md:py-24">
        <div className="page-container text-center max-w-4xl mx-auto">
          <h1 className="font-black text-black dark:text-white uppercase tracking-tighter leading-tight mb-4 sm:mb-6">
            Redefining Smart Shopping
          </h1>

          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
            KaroDeal is India&apos;s most rewarding cashback and deal discovery platform. We exist for one simple reason: to make sure you never pay full price on the internet again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button href="/signup" variant="primary" size="md">
              Create Free Account
            </Button>
            <Button href="/deals" variant="outline" size="md">
              Explore Deals
            </Button>
          </div>
        </div>
      </section>

      {/* 2. The Problem & Our Story */}
      <section className="py-16 sm:py-20 md:py-24 page-container border-b border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          <div className="lg:col-span-7 space-y-8">
            {/* The Problem */}
            <div>
              <div className="font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-xs mb-2">
                The Problem
              </div>
              <h2 className="font-black text-black dark:text-white uppercase tracking-tight mb-4 leading-tight">
                Online shopping has become confusing.
              </h2>
              <div className="text-neutral-600 dark:text-neutral-300 space-y-4 leading-relaxed font-medium">
                <p>
                  Today, the internet is flooded with fake discounts, expired coupon codes, and manipulative sale events. You spend hours hunting for a valid promo code, only to find out at checkout that it doesn&apos;t work.
                </p>
                <p>
                  We realized that traditional deal websites and coupon aggregators are broken. They prioritize pushing you to buy things you don&apos;t need, just so they can make a quick commission, leaving you with no real value.
                </p>
              </div>
            </div>

            {/* The Solution */}
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <div className="font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-xs mb-2">
                The Solution
              </div>
              <h2 className="font-black text-black dark:text-white uppercase tracking-tight mb-4 leading-tight">
                Enter KaroDeal.
              </h2>
              <div className="text-neutral-600 dark:text-neutral-300 space-y-4 leading-relaxed font-medium">
                <p>
                  KaroDeal was born out of frustration with this broken system. We wanted to build a platform that actually puts the consumer first. Instead of keeping the referral commissions we earn from retail giants like Amazon and Flipkart, we decided to give it back to you.
                </p>
                <p>
                  By joining KaroDeal, you become part of a transparent ecosystem where your everyday shopping is directly converted into real, withdrawable cash.
                </p>
              </div>
            </div>
          </div>

          {/* Clean Sticky Feature Card */}
          <div className="lg:col-span-5 bg-neutral-900 text-white p-7 sm:p-9 rounded-3xl border border-neutral-800 shadow-sm relative overflow-hidden group lg:sticky lg:top-24">
            <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
              <ShoppingBag className="w-48 h-48 text-white" />
            </div>

            <div className="relative z-10">
              <h3 className="font-black text-white uppercase tracking-tight mb-4 leading-tight">
                More than just coupons
              </h3>

              <p className="text-neutral-400 leading-relaxed mb-6">
                We go beyond static discount codes. Our platform tracks your journey and rewards you with hard cash that you can transfer directly to your bank.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-[#f96b02] shrink-0" />
                  <span className="font-bold text-white text-xs uppercase tracking-wide">
                    100% Manually Verified Offers
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-[#f96b02] shrink-0" />
                  <span className="font-bold text-white text-xs uppercase tracking-wide">
                    Highest Industry Cashback Rates
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-[#f96b02] shrink-0" />
                  <span className="font-bold text-white text-xs uppercase tracking-wide">
                    Seamless UPI &amp; Bank Transfers
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. How it works (The Cashback Model) */}
      <section className="bg-black text-white py-12 sm:py-16 md:py-20 border-b border-neutral-900">
        <div className="page-container">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="font-black uppercase tracking-tight leading-tight mb-3">
              How The Magic Happens
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              It&apos;s a simple, transparent win-win ecosystem designed entirely for your financial benefit. No hidden catches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto items-stretch">
            {/* Step 1 */}
            <div className="flex flex-col bg-neutral-900 border border-neutral-800 p-5 sm:p-6 md:p-6 rounded-2xl sm:rounded-3xl text-center hover:border-neutral-700 transition-colors shadow-2xs">
              <div className="w-12 h-12 bg-white text-black rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-black uppercase tracking-tight text-white !text-base sm:!text-lg md:!text-xl leading-snug mb-2.5 break-words">
                1. You Shop
              </h3>
              <p className="text-neutral-400 leading-relaxed text-xs sm:text-sm font-normal">
                You click on our exclusive deal links and shop on your favorite partner websites just like you normally would.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col bg-neutral-900 border border-neutral-800 p-5 sm:p-6 md:p-6 rounded-2xl sm:rounded-3xl text-center hover:border-neutral-700 transition-colors shadow-2xs">
              <div className="w-12 h-12 bg-white text-black rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="font-black uppercase tracking-tight text-white !text-base sm:!text-lg md:!text-xl leading-snug mb-2.5 break-words">
                2. We Track &amp; Verify
              </h3>
              <p className="text-neutral-400 leading-relaxed text-xs sm:text-sm font-normal">
                Partner stores confirm your order details and validate the eligible cashback for your purchase.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col bg-neutral-900 border border-neutral-800 p-5 sm:p-6 md:p-6 rounded-2xl sm:rounded-3xl text-center hover:border-neutral-700 transition-colors shadow-2xs">
              <div className="w-12 h-12 bg-white text-black rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-black uppercase tracking-tight text-white !text-base sm:!text-lg md:!text-xl leading-snug mb-2.5 break-words">
                3. You Get Paid
              </h3>
              <p className="text-neutral-400 leading-relaxed text-xs sm:text-sm font-normal">
                We don&apos;t keep it all. We share the majority of that commission with you as real, withdrawable cashback straight to your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Values */}
      <section className="py-10 sm:py-14 md:py-16 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="page-container text-center">
          <h2 className="font-black text-black dark:text-white uppercase tracking-tight mb-6 sm:mb-8 md:mb-10">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto items-stretch">
            <div className="flex flex-col bg-neutral-50/60 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-6 hover:border-black dark:hover:border-neutral-700 transition-all duration-200 text-center shadow-2xs hover:shadow-xs">
              <div className="w-11 h-11 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3.5 sm:mb-4 mx-auto shadow-2xs shrink-0">
                <Heart className="w-5 h-5 text-black dark:text-white" />
              </div>
              <h3 className="font-black uppercase tracking-tight text-black dark:text-white !text-base sm:!text-lg md:!text-xl leading-snug mb-2 sm:mb-2.5 break-words">
                User Obsession
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs sm:text-sm font-normal">
                Everything we build is designed to make your life easier and your wallet heavier. If a deal doesn&apos;t benefit you, it doesn&apos;t go on our site.
              </p>
            </div>

            <div className="flex flex-col bg-neutral-50/60 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-6 hover:border-black dark:hover:border-neutral-700 transition-all duration-200 text-center shadow-2xs hover:shadow-xs">
              <div className="w-11 h-11 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3.5 sm:mb-4 mx-auto shadow-2xs shrink-0">
                <ShieldCheck className="w-5 h-5 text-black dark:text-white" />
              </div>
              <h3 className="font-black uppercase tracking-tight text-black dark:text-white !text-base sm:!text-lg md:!text-xl leading-snug mb-2 sm:mb-2.5 break-words">
                Absolute Transparency
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs sm:text-sm font-normal">
                No hidden fees, no impossible conditions, and no delayed payouts without reason. We maintain complete transparency in how your cashback is tracked and paid.
              </p>
            </div>

            <div className="flex flex-col bg-neutral-50/60 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-6 hover:border-black dark:hover:border-neutral-700 transition-all duration-200 text-center shadow-2xs hover:shadow-xs">
              <div className="w-11 h-11 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3.5 sm:mb-4 mx-auto shadow-2xs shrink-0">
                <Zap className="w-5 h-5 text-black dark:text-white" />
              </div>
              <h3 className="font-black uppercase tracking-tight text-black dark:text-white !text-base sm:!text-lg md:!text-xl leading-snug mb-2 sm:mb-2.5 break-words">
                Relentless Innovation
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs sm:text-sm font-normal">
                We are constantly improving our tech stack and partnering with more brands to ensure you have the fastest, most reliable cashback experience in India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Our Promise */}
      <section className="bg-neutral-50/70 dark:bg-neutral-900/50 py-16 sm:py-20 border-b border-neutral-200 dark:border-neutral-800">
        <div className="page-container text-center max-w-4xl mx-auto">
          <h2 className="font-black text-black dark:text-white uppercase tracking-tight mb-6">
            Our Promise to You
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
            We know that earning trust takes time. Our promise is to always prioritize your savings over our profits. 
            We will never sell your data, we will never spam your inbox with useless offers, and our admin team will always 
            work tirelessly to ensure your claims are reviewed and approved as quickly as humanly possible.
          </p>
        </div>
      </section>

      {/* 6. Why Choose Us Grid */}
      <section className="py-16 sm:py-20 md:py-24 page-container border-b border-neutral-200 dark:border-neutral-800">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-black text-black dark:text-white uppercase tracking-tight mb-3">
            Why KaroDeal Stands Out
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            We didn&apos;t just build a platform, we built a community for savvy shoppers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-black dark:hover:border-neutral-700 transition-all duration-200 bg-white dark:bg-neutral-900 shadow-2xs hover:-translate-y-0.5">
            <ShieldCheck className="w-8 h-8 text-black dark:text-white mb-4" />
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-2">
              100% Genuine
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
              Every deal is manually curated, verified, and tested by our expert team before it ever reaches you.
            </p>
          </div>

          <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-black dark:hover:border-neutral-700 transition-all duration-200 bg-white dark:bg-neutral-900 shadow-2xs hover:-translate-y-0.5">
            <Zap className="w-8 h-8 text-black dark:text-white mb-4" />
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-2">
              Fast Approvals
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
              No waiting for months. Once your return window closes, our team reviews and approves claims within 24 to 48 hours.
            </p>
          </div>

          <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-black dark:hover:border-neutral-700 transition-all duration-200 bg-white dark:bg-neutral-900 shadow-2xs hover:-translate-y-0.5">
            <TrendingUp className="w-8 h-8 text-black dark:text-white mb-4" />
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-2">
              Max Returns
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
              We negotiate aggressive commission slabs directly with brands so you enjoy industry-leading cashback rates.
            </p>
          </div>

          <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-black dark:hover:border-neutral-700 transition-all duration-200 bg-white dark:bg-neutral-900 shadow-2xs hover:-translate-y-0.5">
            <Users className="w-8 h-8 text-black dark:text-white mb-4" />
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-2">
              Community
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
              Dedicated support, transparent dispute resolution, and a friendly ecosystem built entirely for Indian shoppers.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Mission Statement */}
      <section className="bg-black py-16 sm:py-20 text-white border-b border-neutral-900">
        <div className="page-container text-center max-w-4xl mx-auto">
          <div className="font-bold text-neutral-400 uppercase tracking-widest text-xs mb-6">
            Our Mission
          </div>
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight leading-snug mb-8 text-white">
            &ldquo;To empower every Indian shopper to make informed purchasing decisions and maximize their savings without compromise.&rdquo;
          </blockquote>
          <div className="w-20 h-1 bg-[#f96b02] mx-auto rounded-full" />
        </div>
      </section>

    </div>
  );
}
