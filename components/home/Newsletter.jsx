"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Check, ArrowRight, Mail } from "lucide-react";
import { handleAppError, showSuccessToast } from "@/lib/errorHandler";

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
        `${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/newsletter/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const userMsg = handleAppError(data.error || "Failed to subscribe", {
          context: "Newsletter Subscribe",
          title: "Subscription Failed",
          fallback: "Could not subscribe to newsletter. Please check your email."
        });
        setError(userMsg);
        return;
      }

      setSubmitted(true);
      showSuccessToast("Subscribed! You will now receive our exclusive deals directly.");
      setEmail("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      const userMsg = handleAppError(err, {
        context: "Newsletter Network",
        title: "Connection Error",
        fallback: "Unable to connect to the server. Please try again."
      });
      setError(userMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full">
      <div className="w-full bg-black text-white border border-neutral-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-sm">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f96b02]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 w-full">
          {/* Left Column: Heading, Perks & Info */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-black uppercase tracking-wider text-neutral-300 mb-3.5 sm:mb-4">
              <span className="w-2 h-2 rounded-full bg-[#f96b02] animate-pulse" />
              Never Miss A Deal
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-3">
              Deals Drop Fast. <span className="text-[#f96b02]">Get Them Faster.</span>
            </h2>

            <p className="text-neutral-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mb-6">
              Subscribe to receive handpicked price drops, verified promo codes, and flash cashback alerts from 100+ partner stores delivered directly to your inbox.
            </p>

            {/* 3 Trust Perks */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm font-semibold text-neutral-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#f96b02] stroke-[3]" />
                <span>Curated Daily Drops</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#f96b02] stroke-[3]" />
                <span>Zero Spam Policy</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#f96b02] stroke-[3]" />
                <span>100% Free Forever</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Subscription Box */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 sm:p-7 backdrop-blur-xs">
              <h3 className="font-bold text-white text-base sm:text-lg mb-1">
                Join Smart Shoppers
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                Enter your email to get today&apos;s highest cashback discounts.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black/60 border border-neutral-700 focus:border-[#f96b02] rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm font-medium focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-5 bg-[#f96b02] hover:bg-[#e05f00] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{isLoading ? "Subscribing..." : "Subscribe Now"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {submitted && !error && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Subscribed successfully! Welcome to KaroDeal.</span>
                  </div>
                )}
              </form>

              <p className="text-[11px] text-neutral-500 text-center mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
