'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  Mail, 
  Globe2, 
  Check, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Zap,
  ShoppingBag,
  ExternalLink,
  Building2,
  ChevronDown
} from 'lucide-react';
import { handleAppError, showSuccessToast } from '@/lib/errorHandler';

// Strictly E-Commerce Platforms & Online Channels Only (No offline/local)
const ECOMMERCE_PLATFORMS = [
  { name: 'Amazon India', category: 'Marketplace' },
  { name: 'Flipkart', category: 'Marketplace' },
  { name: 'Meesho', category: 'Social Commerce' },
  { name: 'Shopify Store', category: 'D2C Platform' },
  { name: 'Myntra', category: 'Fashion Commerce' },
  { name: 'Ajio', category: 'Fashion Commerce' },
  { name: 'Nykaa', category: 'Beauty Commerce' },
  { name: 'WooCommerce', category: 'D2C Platform' },
  { name: 'Tata CLiQ', category: 'Marketplace' },
  { name: 'Custom D2C Website', category: 'Brand Store' },
];

const PLATFORM_OPTIONS = [
  'Amazon',
  'Flipkart',
  'Meesho',
  'Shopify D2C',
  'Myntra / Ajio',
  'WooCommerce / Custom Website',
  'Other E-Commerce Marketplace',
];

const MERCHANT_BENEFITS = [
  {
    icon: Globe2,
    badge: 'Universal Integration',
    title: 'Any E-Commerce Platform',
    desc: 'Whether your catalog is on Amazon, Flipkart, Meesho, Shopify, or your own online storefront, we feature your deals seamlessly.',
  },
  {
    icon: Zap,
    badge: 'Zero Setup Barrier',
    title: 'No Complex APIs Required',
    desc: 'No technical integration needed. Simply share your online product or store links and our catalog team handles the listing.',
  },
  {
    icon: TrendingUp,
    badge: 'Direct Traffic',
    title: 'Referral to Your Checkout',
    desc: 'Shoppers discover your offers on KaroDeal and click directly through to purchase on your official product page or store.',
  },
  {
    icon: ShieldCheck,
    badge: 'Digital Commerce',
    title: 'Open to All Online Sellers',
    desc: 'Independent D2C brands, marketplace power-sellers, and digital merchants across all shopping categories are welcomed.',
  },
];

export default function SellerPartnerSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storeName: '',
    platform: 'Amazon',
    customPlatform: '',
    storeUrl: '',
    category: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const platformDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(e.target)) {
        setIsPlatformDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.storeName || !formData.storeUrl) {
      setError('Please provide your name, business email, store name, and online store URL.');
      return;
    }

    if (formData.platform === 'Other E-Commerce Marketplace' && !formData.customPlatform?.trim()) {
      setError('Please specify your other e-commerce platform name.');
      return;
    }

    setIsLoading(true);
    setError('');

    const resolvedPlatform = formData.platform === 'Other E-Commerce Marketplace' && formData.customPlatform?.trim()
      ? `${formData.customPlatform.trim()} (Other Marketplace)`
      : formData.platform;

    const formattedMessage = `[E-COMMERCE SELLER LISTING APPLICATION]
Brand / Store Name: ${formData.storeName}
E-Commerce Platform: ${resolvedPlatform}
Online Store URL: ${formData.storeUrl}
Contact Person: ${formData.name}
Work Email: ${formData.email}
Phone / WhatsApp: ${formData.phone || 'Not provided'}
Product Categories: ${formData.category || 'Not specified'}`;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formattedMessage,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        showSuccessToast('Application submitted! Our merchant team will contact you shortly.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          storeName: '',
          platform: 'Amazon',
          customPlatform: '',
          storeUrl: '',
          category: '',
        });
      } else {
        const userMsg = handleAppError(data.error || 'Failed to submit application', {
          context: 'Seller Application',
          title: 'Submission Error',
          fallback: 'Could not submit your details. Please email us directly at support@karodeal.in',
        });
        setError(userMsg);
      }
    } catch (err) {
      const userMsg = handleAppError(err, {
        context: 'Seller Application Network',
        title: 'Connection Error',
        fallback: 'Unable to connect to the server. Please try again or email support@karodeal.in',
      });
      setError(userMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-12 sm:mb-16 md:mb-24 w-full" id="seller-hub">
      {/* Container: Clean, Modern Corporate Merchant Section */}
      <div className="relative rounded-2xl sm:rounded-[36px] md:rounded-[40px] border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 sm:p-8 lg:p-14 overflow-hidden shadow-xs">
        
        {/* Subtle, soft ambient background tint */}
        <div 
          className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-[#f96b02]/5 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" 
        />
        <div 
          className="absolute -bottom-24 -left-24 w-[450px] h-[450px] bg-neutral-100 dark:bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" 
        />

        {/* 1. Header Section */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 sm:pb-10 border-b border-neutral-200/80 dark:border-neutral-800 mb-8 sm:mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-[11px] font-black uppercase tracking-wider text-black dark:text-white mb-3.5 sm:mb-4">
              <span className="w-2 h-2 rounded-full bg-[#f96b02]" />
              <span>KaroDeal Merchant Network</span>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <span className="text-neutral-600 dark:text-neutral-400 font-semibold">For Online & E-Commerce Sellers</span>
            </div>

            <h2 className="font-black text-black dark:text-white uppercase tracking-tight text-2xl sm:text-4xl lg:text-5xl leading-[1.1] mb-4">
              Selling On Any E-Commerce Store? <br />
              <span className="text-[#f96b02]">List Your Products On KaroDeal</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed max-w-2xl">
              Do you sell online via <strong className="text-black dark:text-white font-semibold">Amazon, Flipkart, Meesho, Shopify</strong>, or your own e-commerce website? KaroDeal is an open deal aggregation network where <strong className="text-black dark:text-white font-semibold">all e-commerce sellers are welcomed</strong>. Feature your online catalog to drive high-converting shopper traffic directly to your product links.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/contact?topic=seller"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black hover:bg-[#f96b02] dark:hover:bg-[#f96b02] dark:hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
            >
              <span>Contact Merchant Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 2. Four Professional Value Pillars */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10 sm:mb-14">
          {MERCHANT_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative bg-neutral-50/70 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-600 hover:bg-white dark:hover:bg-neutral-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black text-black dark:text-white border border-neutral-200/60 dark:border-neutral-700 group-hover:border-black flex items-center justify-center transition-colors duration-300 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      {benefit.badge}
                    </span>
                  </div>

                  <h3 className="font-black text-black dark:text-white text-sm sm:text-base uppercase tracking-tight mb-2 group-hover:text-[#f96b02] transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>Verified Feature</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Main Split Section: Supported Marketplaces (Left) + Merchant Application Desk (Right) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Column (7 cols): Supported Online Marketplaces + 3-Step Process */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Supported Online Channels */}
            <div className="bg-neutral-50/60 dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#f96b02]" />
                  <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                    Supported E-Commerce Marketplaces & Stores
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                  100% Free Listing
                </span>
              </div>

              <h4 className="font-black text-black dark:text-white uppercase tracking-tight text-lg sm:text-xl mb-2">
                Showcase Products From Any Online Storefront
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed mb-6">
                KaroDeal operates as a pure digital commerce deal aggregator. When you list your online products, active buyers browse verified deals on KaroDeal and click directly through to place orders on your official e-commerce website or marketplace store.
              </p>

              {/* Clean Chips for E-Commerce Platforms */}
              <div className="flex flex-wrap gap-2 pt-1">
                {ECOMMERCE_PLATFORMS.map((platform) => (
                  <div
                    key={platform.name}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all hover:scale-[1.02] shadow-2xs"
                  >
                    <span>{platform.name}</span>
                    <span className="text-[10px] text-neutral-400 font-normal uppercase">
                      ({platform.category})
                    </span>
                  </div>
                ))}
                <div className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider">
                  + Any E-Commerce Store or Online Marketplace
                </div>
              </div>
            </div>

            {/* 3 Step E-Commerce Listing Process */}
            <div className="bg-neutral-50/60 dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs">
              <h4 className="font-black text-black dark:text-white uppercase tracking-tight text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mb-4">
                How It Works For E-Commerce Sellers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <span className="inline-block text-xl font-black text-black dark:text-white font-mono">01</span>
                  <div className="font-bold text-black dark:text-white text-xs sm:text-sm uppercase tracking-tight">
                    Submit Product URL
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                    Provide your Amazon, Flipkart, Meesho, or Shopify online product links.
                  </p>
                </div>
                <div className="space-y-1.5 sm:border-l sm:border-neutral-200 dark:sm:border-neutral-800 sm:pl-4">
                  <span className="inline-block text-xl font-black text-[#f96b02] font-mono">02</span>
                  <div className="font-bold text-black dark:text-white text-xs sm:text-sm uppercase tracking-tight">
                    Catalog Verification
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                    Our catalog team reviews your product discounts and configures the deal listing.
                  </p>
                </div>
                <div className="space-y-1.5 sm:border-l sm:border-neutral-200 dark:sm:border-neutral-800 sm:pl-4">
                  <span className="inline-block text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">03</span>
                  <div className="font-bold text-black dark:text-white text-xs sm:text-sm uppercase tracking-tight">
                    Direct Store Sales
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                    Shoppers click through from KaroDeal and complete purchases directly on your checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Communication Channels: Balanced, Clean Interactive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Email Support Card */}
              <a
                href="mailto:support@karodeal.in?subject=E-Commerce%20Seller%20Partnership%20-%20List%20My%20Products%20on%20KaroDeal"
                className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-neutral-50/60 dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-600 hover:bg-white dark:hover:bg-neutral-800 transition-all duration-200 shadow-2xs hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black text-black dark:text-white flex items-center justify-center transition-colors shadow-2xs shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Merchant Support Email
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-black dark:text-white group-hover:text-[#f96b02] transition-colors">
                      support@karodeal.in
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
              </a>

              {/* Instagram Channel Card */}
              <a
                href="https://www.instagram.com/karodeal_/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-neutral-50/60 dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-600 hover:bg-white dark:hover:bg-neutral-800 transition-all duration-200 shadow-2xs hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 group-hover:bg-[#E1306C] group-hover:text-white text-black dark:text-white flex items-center justify-center transition-colors shadow-2xs shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Direct Message Channel
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-black dark:text-white group-hover:text-[#f96b02] transition-colors">
                      Instagram @karodeal_
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
              </a>
            </div>

          </div>

          {/* Right Column (5 cols): Black Sleek Merchant Application Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-black text-white border border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full relative">
              
              {/* Subtle ambient light with rounded corner clipping */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#f96b02]/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-black uppercase tracking-wider">
                    <Building2 className="w-3 h-3 text-[#f96b02]" />
                    <span>Online Merchant Portal</span>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                    Quick Listing Desk
                  </span>
                </div>

                <h3 className="font-black text-white uppercase tracking-tight text-xl sm:text-2xl mb-1.5">
                  Apply to List Your Online Store
                </h3>
                <p className="text-xs text-neutral-400 font-medium mb-6 leading-relaxed">
                  Enter your business details below. Our digital catalog team will review your links and onboard your deals within 24 hours.
                </p>

                {submitted ? (
                  <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-white text-lg uppercase tracking-tight mb-1.5">
                      Application Submitted!
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-300 max-w-xs mb-6 font-medium leading-relaxed">
                      Thank you for applying. We have received your e-commerce store details and our team will get in touch shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f96b02] hover:text-white uppercase tracking-wider underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Submit Another Store Link &rarr;
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Brand / Store Name */}
                    <div className="space-y-1">
                      <label htmlFor="ecom-store-name" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                        Brand / Online Store Name *
                      </label>
                      <input
                        id="ecom-store-name"
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        placeholder="e.g. Urban Threads (Shopify / Amazon Store)"
                        required
                        className="w-full px-4 py-2.5 bg-neutral-900/90 border border-neutral-700 focus:border-[#f96b02] focus:bg-neutral-950 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-none transition-all"
                      />
                    </div>

                    {/* Platform Selector & Categories */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 relative" ref={platformDropdownRef}>
                        <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                          Primary Platform *
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsPlatformDropdownOpen((prev) => !prev)}
                          className={`w-full px-3.5 py-2.5 bg-neutral-900 border rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all cursor-pointer text-left ${
                            isPlatformDropdownOpen
                              ? 'border-[#f96b02] ring-2 ring-[#f96b02]/25 bg-neutral-950 text-white'
                              : 'border-neutral-700 hover:border-neutral-500 text-white'
                          }`}
                        >
                          <span className="truncate">
                            {formData.platform === 'Other E-Commerce Marketplace' && formData.customPlatform?.trim()
                              ? `Other: ${formData.customPlatform.trim()}`
                              : (formData.platform || 'Select Platform')}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                              isPlatformDropdownOpen ? 'rotate-180 text-[#f96b02]' : ''
                            }`}
                          />
                        </button>

                        {isPlatformDropdownOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-neutral-900/98 backdrop-blur-xl border border-neutral-700 rounded-xl shadow-2xl py-1 max-h-56 overflow-y-auto divide-y divide-neutral-800/80 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 bg-neutral-950/40">
                              Select Online Platform
                            </div>
                            <div className="py-0.5">
                              {PLATFORM_OPTIONS.map((opt) => {
                                const isSelected = formData.platform === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({ 
                                        ...prev, 
                                        platform: opt,
                                        customPlatform: opt === 'Other E-Commerce Marketplace' ? prev.customPlatform : ''
                                      }));
                                      setIsPlatformDropdownOpen(false);
                                    }}
                                    className={`w-full px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#f96b02]/15 text-[#f96b02] font-bold'
                                        : 'text-neutral-200 hover:bg-neutral-800 hover:text-white font-medium'
                                    }`}
                                  >
                                    <span className="truncate">{opt}</span>
                                    {isSelected && <Check className="w-4 h-4 text-[#f96b02] shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="ecom-category" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                          Product Category
                        </label>
                        <input
                          id="ecom-category"
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          placeholder="e.g. Electronics, Fashion"
                          className="w-full px-3.5 py-2.5 bg-neutral-900/90 border border-neutral-700 focus:border-[#f96b02] focus:bg-neutral-950 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* If 'Other' platform is selected, dynamic input field appears */}
                    {formData.platform === 'Other E-Commerce Marketplace' && (
                      <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label htmlFor="ecom-custom-platform" className="block text-[11px] font-bold text-[#f96b02] uppercase tracking-wider flex items-center justify-between">
                          <span>Specify Your Platform / Marketplace Name *</span>
                          <span className="text-[10px] text-neutral-400 font-normal normal-case">e.g. Etsy, Nykaa, Tata CLiQ, Magento</span>
                        </label>
                        <input
                          id="ecom-custom-platform"
                          type="text"
                          name="customPlatform"
                          value={formData.customPlatform}
                          onChange={handleChange}
                          placeholder="Enter your online platform or marketplace name"
                          required
                          className="w-full px-4 py-2.5 bg-neutral-900/90 border border-neutral-700 focus:border-[#f96b02] focus:bg-neutral-950 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-none transition-all"
                        />
                      </div>
                    )}

                    {/* Online Store URL / Product Link */}
                    <div className="space-y-1">
                      <label htmlFor="ecom-url" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                        Online Store URL or Product Link *
                      </label>
                      <input
                        id="ecom-url"
                        type="url"
                        name="storeUrl"
                        value={formData.storeUrl}
                        onChange={handleChange}
                        placeholder="https://amazon.in/... or https://yourstore.com"
                        required
                        className="w-full px-4 py-2.5 bg-neutral-900/90 border border-neutral-700 focus:border-[#f96b02] focus:bg-neutral-950 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-none transition-all"
                      />
                    </div>

                    {/* Contact Person Name */}
                    <div className="space-y-1">
                      <label htmlFor="ecom-contact-name" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                        Contact Person Name *
                      </label>
                      <input
                        id="ecom-contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full px-4 py-2.5 bg-neutral-900/90 border border-neutral-700 focus:border-[#f96b02] focus:bg-neutral-950 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-none transition-all"
                      />
                    </div>

                    {/* Email & Phone Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="ecom-email" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                          Work Email Address *
                        </label>
                        <input
                          id="ecom-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="seller@domain.com"
                          required
                          className="w-full px-3.5 py-2.5 bg-neutral-900/90 border border-neutral-700 focus:border-[#f96b02] focus:bg-neutral-950 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="ecom-phone" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                          WhatsApp / Phone
                        </label>
                        <input
                          id="ecom-phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 bg-neutral-900/90 border border-neutral-700 focus:border-[#f96b02] focus:bg-neutral-950 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
                        {error}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-5 bg-[#f96b02] hover:bg-[#e05f00] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 active:scale-98 shadow-md hover:shadow-orange-500/20"
                    >
                      {isLoading ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Listing Request</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Bottom Trust Stamp */}
              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 font-medium relative z-10">
                <span className="flex items-center gap-1.5 text-neutral-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Free Listing
                </span>
                <span>⚡ 24h Merchant Onboarding Response</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
