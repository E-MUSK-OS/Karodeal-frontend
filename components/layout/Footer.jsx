'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Mail, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Store,
  Headphones
} from 'lucide-react';

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: '100% Verified Deals',
    desc: 'Manually verified coupons & price drops tested daily',
  },
  {
    icon: Coins,
    title: 'Guaranteed Cashback',
    desc: 'Real withdrawable money directly to your UPI & Bank',
  },
  {
    icon: Zap,
    title: 'Instant Loot Alerts',
    desc: 'Never miss price drops with direct WhatsApp alerts',
  },
  {
    icon: Store,
    title: 'Open Merchant Network',
    desc: 'Free deal & product listings for all online sellers',
  },
];

export default function Footer() {
  const pathname = usePathname();

  // Hide footer inside admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full bg-[#0a0a0c] text-white border-t border-neutral-800/80 mt-16 sm:mt-24 relative overflow-hidden">
      
      {/* Subtle Ambient Brand Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#f96b02]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Top Value-Prop / Trust Guarantee Strip */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/40 py-6 sm:py-8">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={pillar.title} 
                  className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700/80 text-[#f96b02] flex items-center justify-center shrink-0 shadow-2xs">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs sm:text-sm uppercase tracking-tight">
                      {pillar.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-medium leading-relaxed mt-0.5">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Multi-Column Links & Newsletter Grid */}
      <div className="page-container py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Column 1: Brand & Mission (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 rounded-2xl bg-white shadow-sm hover:scale-102 transition-transform duration-200"
            >
              <img 
                src="/images/logo.png" 
                alt="KaroDeal Official Platform" 
                className="h-9 sm:h-10 w-auto object-contain" 
              />
            </Link>

            <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed">
              Discover. Save. Shop Smart. India&apos;s definitive deals aggregation and real cashback network with 100% verified discounts across 100+ stores.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-neutral-300">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Verified</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
                <Coins className="w-3.5 h-3.5 text-[#f96b02]" />
                <span>Real Cashback</span>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-neutral-400 font-semibold flex items-center gap-2">
              <span>🇮🇳 Made with pride for Smart Shoppers in India</span>
            </div>
          </div>

          {/* Column 2: Discover Deals (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
              Discover Deals
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/deals" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  All Drops & Deals
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Partner Stores
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Deal Categories
                </Link>
              </li>
              <li>
                <Link href="/profile/missing-cashback" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Claim Missing Cashback
                </Link>
              </li>
              <li>
                <Link href="/profile/payments" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  UPI & Bank Payouts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Online Sellers (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
              Online Merchants
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/contact?topic=seller" className="text-neutral-300 hover:text-[#f96b02] transition-colors flex items-center gap-1.5 font-bold">
                  <span>List Your Store</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[#f96b02] text-white">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <a href="#seller-hub" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Seller Hub & Benefits
                </a>
              </li>
              <li>
                <a href="#seller-hub" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Supported Marketplaces
                </a>
              </li>
              <li>
                <a href="mailto:support@karodeal.in?subject=Merchant%20Partnership%20Inquiry" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Merchant Support Desk
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/918141258282?text=Hello%20KaroDeal%2C%20I%20am%20an%20e-commerce%20seller%20and%20want%20to%20list%20my%20products." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-neutral-400 hover:text-emerald-400 transition-colors block"
                >
                  Direct Merchant WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Legal (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  About KaroDeal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/profile/help" className="text-neutral-400 hover:text-[#f96b02] transition-colors block">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Dedicated Customer Support & Direct Connect (3 cols on lg) */}
          <div className="lg:col-span-3">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f96b02]/15 text-[#f96b02] text-[10px] font-black uppercase tracking-wider">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Support Desk</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Fast Reply</span>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-xs sm:text-sm uppercase tracking-tight">
                  Need Help or Have Deals?
                </h4>
                <p className="text-[11px] text-neutral-400 font-medium leading-relaxed mt-1">
                  Connect with our team for missing cashback, brand partnerships, or seller inquiries.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {/* Instagram Support Button */}
                <a
                  href="https://www.instagram.com/karodeal_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-950/60 via-pink-950/60 to-rose-950/60 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 border border-pink-900/60 hover:border-pink-500 text-pink-200 hover:text-white text-xs font-bold transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2 shrink-0" viewBox="0 0 24 24">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>Instagram @karodeal_</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-pink-900/80 group-hover:bg-white/20 text-pink-200 group-hover:text-white">Insta</span>
                </a>

                {/* Email Support Button */}
                <a
                  href="mailto:support@karodeal.in?subject=KaroDeal%20Support%20Request"
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#f96b02] shrink-0" />
                    <span>support@karodeal.in</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Desk</span>
                </a>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800/60 font-medium">
                <span>Mon – Sat: 10 AM – 7 PM</span>
                <span>Response &lt; 2 hrs</span>
              </div>
            </div>
          </div>

        </div>
        {/* Bottom Sub-Footer Bar */}
        <div className="mt-12 pt-8 pb-4 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-300">
              &copy; {new Date().getFullYear()} KARODEAL TECHNOLOGIES. ALL RIGHTS RESERVED.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs sm:text-sm font-medium text-neutral-300">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-neutral-600">•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-neutral-600">•</span>
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <span className="text-neutral-600">•</span>
            <Link href="/contact" className="hover:text-white transition-colors">Support Desk</Link>
          </div>

          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-neutral-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <span>Realtime Deals Engine Active</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
