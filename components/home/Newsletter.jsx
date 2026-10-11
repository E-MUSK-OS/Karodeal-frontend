"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Check, ArrowRight } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/newsletter/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to subscribe");
        return;
      }

      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 md:mb-24">
      {/* 1. SIMPLE, CLEAN & COMPACT MOBILE VIEW (< md) */}
      <div className="block md:hidden">
        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Header */}
          <div className="flex items-center mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f96b02]" />
              Never Miss A Deal
            </span>
          </div>

          <h3 className="text-lg font-black text-black uppercase tracking-tight leading-snug">
            Deals Drop Fast. <span className="text-[#f96b02]">Get Them Faster.</span>
          </h3>
          <p className="text-xs text-neutral-600 font-medium mt-1 leading-normal">
            Handpicked price drops, promo codes, and cashback alerts in your inbox.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-3.5 py-2.5 bg-neutral-50 border-2 border-black rounded-xl text-black placeholder-neutral-400 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#f96b02] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-black hover:bg-[#f96b02] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs active:translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? "Submitting..." : "Subscribe Now"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Status Feedback */}
            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {submitted && !error && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Subscribed successfully! Welcome to KaroDeal.</span>
              </div>
            )}
          </form>

          {/* Simple Trust Points */}
          <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-around text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-black stroke-[3]" /> Daily Drops
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-black stroke-[3]" /> Zero Spam
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-black stroke-[3]" /> Free Forever
            </span>
          </div>
        </div>
      </div>

      {/* 2. TABLET & DESKTOP VIEW (>= md): Editorial 2-Column Neo-Brutalist Layout */}
      <div className="hidden md:flex bg-neutral-100/80 border-2 border-black rounded-3xl py-12 lg:py-20 px-8 lg:px-14 min-h-[440px] lg:min-h-[500px] items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Subtle background graphic badge */}
        <div className="absolute -bottom-8 -right-8 text-neutral-200/50 font-black text-8xl sm:text-9xl uppercase tracking-tighter pointer-events-none select-none">
          DEALS
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 w-full">
          {/* Left Column: Heading, Subtitle & Perks */}
          <div className="md:col-span-7">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[11px] font-black uppercase tracking-wider rounded-full mb-4 sm:mb-5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f96b02]" />
              Never Miss A Deal
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black uppercase tracking-tighter leading-[1.08] mb-4 sm:mb-5">
              Deals Drop Fast. <br className="hidden sm:inline" />
              <span className="text-[#f96b02]">Get Them Faster.</span>
            </h2>

            <p className="text-neutral-600 text-sm sm:text-base font-medium max-w-lg leading-relaxed mb-8">
              Subscribe to get handpicked price drops, verified promo codes, and flash cashback alerts from 100+ partner stores delivered directly to your inbox.
            </p>

            {/* Checklist Perks */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs sm:text-sm font-bold text-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>Curated Daily Drops</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>Zero Spam Policy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>100% Free Forever</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Contrast Subscription Box */}
          <div className="md:col-span-5">
            <div className="bg-white border-2 border-black rounded-2xl p-7 sm:p-9 lg:p-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black text-black uppercase tracking-tight text-lg sm:text-xl mb-1.5">
                Join Smart Shoppers
              </h3>
              <p className="text-xs sm:text-[13px] text-neutral-500 font-medium mb-6">
                Enter your email to receive today’s top verified discounts.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-4 bg-neutral-50 border-2 border-black rounded-xl text-black placeholder-neutral-400 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#f96b02] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-black hover:bg-[#f96b02] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-xs active:translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 group"
                >
                  <span>{isLoading ? "Submitting..." : "Subscribe Now"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Status Feedback */}
              {error && (
                <div className="mt-3.5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {submitted && !error && (
                <div className="mt-3.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Subscribed successfully! Welcome to KaroDeal.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
