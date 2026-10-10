"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Button from "../common/Button";

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

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
    <section className="bg-black p-8 sm:p-12 md:p-16 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-black text-white uppercase tracking-tighter mb-2 sm:mb-6">
          Never Miss a Deal
        </h2>
        <p className="text-sm lg:text-[15px] xl:text-base text-neutral-400  mb-12 font-medium tracking-wide">
          Curated offers delivered straight to your inbox. No spam, just
          savings.
        </p>

        <div className="relative max-w-lg mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:gap-0 w-full"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL ADDRESS"
              required
              className="text-center flex-grow px-6 py-3 sm:py-4 bg-transparent border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors uppercase tracking-widest text-xs font-bold sm:text-left rounded-none [&:-webkit-autofill]:bg-black [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_black_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
            />
            <Button variant="none" size="none"
              type="submit"
              disabled={isLoading}
              className="bg-white text-black px-8 py-3 sm:py-4 font-bold uppercase tracking-widest text-sm border border-white hover:bg-neutral-200 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Submitting..." : "Subscribe"}
            </Button>
          </form>

          {error && (
            <div className="absolute -bottom-10 left-0 right-0 flex items-center justify-center text-red-400 font-bold text-xs uppercase tracking-widest animate-popup">
              {error}
            </div>
          )}

          {submitted && !error && (
            <div className="absolute -bottom-10 left-0 right-0 flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest animate-popup">
              <CheckCircle2 className="w-4 h-4" />
              Subscribed Successfully
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
