import Link from 'next/link';
import Button from '@/components/common/Button';
import { ShieldCheck, Banknote, TrendingUp, ShoppingBag, Target, Zap, Users, Gift, CheckCircle2, AlertCircle, Heart, Star } from 'lucide-react';

export const metadata = {
  title: 'About Us | KaroDeal',
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-neutral-50 border-b border-neutral-200 py-24 md:py-40">
        <div className="page-container text-center">
          <h1 className="font-black text-black uppercase tracking-tighter mb-8">
            Redefining <br className="hidden md:block" /> Smart Shopping
          </h1>
          <p className="text-lg md:text-2xl text-neutral-500 font-medium max-w-3xl mx-auto leading-relaxed">
            KaroDeal is India's most rewarding cashback and deal discovery platform. We exist for one simple reason: to make sure you never pay full price on the internet again.
          </p>
        </div>
      </section>

      {/* The Problem & Our Story */}
      <section className="py-20 md:py-32 page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <div className="mb-12">
              <h2 className="font-bold text-neutral-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> The Problem</h2>
              <h3 className="font-black text-black uppercase tracking-tighter mb-6 leading-tight">Online shopping has become confusing.</h3>
              <div className="text-lg text-neutral-600 space-y-6 leading-relaxed font-medium">
                <p>
                  Today, the internet is flooded with fake discounts, expired coupon codes, and manipulative sale events. You spend hours hunting for a valid promo code, only to find out at checkout that it doesn't work.
                </p>
                <p>
                  We realized that traditional deal websites and coupon aggregators are broken. They prioritize pushing you to buy things you don't need, just so they can make a quick commission, leaving you with no real value.
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-neutral-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Star className="w-4 h-4" /> The Solution</h2>
              <h3 className="font-black text-black uppercase tracking-tighter mb-6 leading-tight">Enter KaroDeal.</h3>
              <div className="text-lg text-neutral-600 space-y-6 leading-relaxed font-medium">
                <p>
                  KaroDeal was born out of frustration with this broken system. We wanted to build a platform that actually puts the consumer first. Instead of keeping the referral commissions we earn from retail giants like Amazon and Flipkart, we decided to give it back to you.
                </p>
                <p>
                  By joining KaroDeal, you become part of a transparent ecosystem where your everyday shopping is directly converted into real, withdrawable cash.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-100 p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group sticky top-24">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
              <ShoppingBag className="w-64 h-64 text-black" />
            </div>
            <h3 className="font-black text-black uppercase mb-6 relative z-10 leading-tight">More than just coupons</h3>
            <p className="text-lg text-neutral-600 relative z-10 mb-8 font-medium">
              We go beyond static discount codes. Our platform tracks your journey and rewards you with hard cash that you can transfer directly to your bank.
            </p>
            <div className="space-y-5 relative z-10">
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" /> 
                <span className="font-bold text-neutral-800">100% Manually Verified Offers</span>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" /> 
                <span className="font-bold text-neutral-800">Highest Industry Cashback Rates</span>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-neutral-200">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" /> 
                <span className="font-bold text-neutral-800">Seamless UPI & Bank Transfers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works (The Cashback Model) */}
      <section className="bg-black text-white py-24 md:py-40">
        <div className="page-container">
          <div className="text-center mb-20">
            <h2 className="font-black uppercase tracking-tighter mb-6">How The Magic Happens</h2>
            <p className="text-xl text-neutral-400 font-medium max-w-3xl mx-auto">It's a simple, transparent win-win ecosystem designed entirely for your financial benefit. No hidden catches.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-0.5 bg-neutral-800 -z-0"></div>

            <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-3xl text-center relative z-10 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Target className="w-10 h-10" />
              </div>
              <h3 className="font-black uppercase tracking-tight mb-4">1. You Shop</h3>
              <p className="text-neutral-400 font-medium text-lg">You click on our exclusive deal links and shop on your favorite partner websites just like you normally would.</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-3xl text-center relative z-10 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Banknote className="w-10 h-10" />
              </div>
              <h3 className="font-black uppercase tracking-tight mb-4">2. We Earn</h3>
              <p className="text-neutral-400 font-medium text-lg">The partner store (e.g., Flipkart, Amazon) pays us a referral marketing commission for directing your purchase to them.</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-10 rounded-3xl text-center relative z-10 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Gift className="w-10 h-10" />
              </div>
              <h3 className="font-black uppercase tracking-tight mb-4">3. You Get Paid</h3>
              <p className="text-neutral-400 font-medium text-lg">We don't keep it all. We share the majority of that commission with you as real, withdrawable cashback straight to your wallet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 md:py-32 bg-white">
        <div className="page-container text-center">
          <h2 className="font-black text-black uppercase tracking-tighter mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-black uppercase mb-4">User Obsession</h3>
              <p className="text-neutral-600 font-medium leading-relaxed">Everything we build is designed to make your life easier and your wallet heavier. If a deal doesn't benefit you, it doesn't go on our site.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-black uppercase mb-4">Absolute Transparency</h3>
              <p className="text-neutral-600 font-medium leading-relaxed">No hidden fees, no impossible conditions, and no delayed payouts without reason. We maintain complete transparency in how your cashback is tracked and paid.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-black uppercase mb-4">Relentless Innovation</h3>
              <p className="text-neutral-600 font-medium leading-relaxed">We are constantly improving our tech stack and partnering with more brands to ensure you have the fastest, most reliable cashback experience in India.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="bg-neutral-50 py-20 md:py-32 border-y border-neutral-200">
        <div className="page-container text-center">
          <h2 className="font-black text-black uppercase tracking-tighter mb-8">Our Promise to You</h2>
          <p className="text-xl md:text-2xl text-neutral-600 font-medium leading-relaxed">
            We know that earning trust takes time. Our promise is to always prioritize your savings over our profits. 
            We will never sell your data, we will never spam your inbox with useless offers, and our admin team will always 
            work tirelessly to ensure your claims are reviewed and approved as quickly as humanly possible.
          </p>
        </div>
      </section>

      {/* Why Choose Us Grid */}
      <section className="py-24 md:py-32 page-container">
        <div className="text-center mb-16">
          <h2 className="font-black text-black uppercase tracking-tighter mb-4">Why KaroDeal Stands Out</h2>
          <p className="text-neutral-500 font-medium max-w-2xl mx-auto text-lg">We didn't just build a platform, we built a community for savvy shoppers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-8 border border-neutral-200 rounded-3xl hover:border-black transition-colors duration-300 bg-white">
            <ShieldCheck className="w-12 h-12 text-black mb-6" />
            <h4 className="font-black uppercase mb-3">100% Genuine</h4>
            <p className="text-neutral-600 text-base font-medium">Every deal is manually curated, verified, and tested by our expert team before it ever reaches you.</p>
          </div>
          <div className="p-8 border border-neutral-200 rounded-3xl hover:border-black transition-colors duration-300 bg-white">
            <Zap className="w-12 h-12 text-black mb-6" />
            <h4 className="font-black uppercase mb-3">Fast Approvals</h4>
            <p className="text-neutral-600 text-base font-medium">No waiting for months. Once your return window closes, our team reviews and approves claims within 24 to 48 hours.</p>
          </div>
          <div className="p-8 border border-neutral-200 rounded-3xl hover:border-black transition-colors duration-300 bg-white">
            <TrendingUp className="w-12 h-12 text-black mb-6" />
            <h4 className="font-black uppercase mb-3">Max Returns</h4>
            <p className="text-neutral-600 text-base font-medium">We negotiate aggressive commission slabs directly with brands so you enjoy industry-leading cashback rates.</p>
          </div>
          <div className="p-8 border border-neutral-200 rounded-3xl hover:border-black transition-colors duration-300 bg-white">
            <Users className="w-12 h-12 text-black mb-6" />
            <h4 className="font-black uppercase mb-3">Community</h4>
            <p className="text-neutral-600 text-base font-medium">Dedicated support, transparent dispute resolution, and a friendly ecosystem built entirely for Indian shoppers.</p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-black py-24 md:py-40">
        <div className="page-container text-center">
          <h2 className="font-bold text-neutral-500 uppercase tracking-[0.4em] mb-10">Our Mission</h2>
          <blockquote className="text-3xl sm:text-4xl md:text-6xl text-white font-black uppercase tracking-tighter leading-tight mb-12">
            "To empower every Indian shopper to make informed purchasing decisions and maximize their savings without compromise."
          </blockquote>
          <div className="w-32 h-1.5 bg-white mx-auto"></div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-40 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-black text-black uppercase tracking-tighter mb-8">Ready to save big?</h2>
        <p className="text-xl md:text-2xl text-neutral-600 font-medium mb-12">Join thousands of smart shoppers earning real cash on their everyday purchases.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/signup">
            <Button size="lg" variant="primary" className="w-full sm:w-auto min-w-[240px] text-xl py-5">
              Create Free Account
            </Button>
          </Link>
          <Link href="/deals">
            <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[240px] text-xl py-5">
              Explore Deals
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
