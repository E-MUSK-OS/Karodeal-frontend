"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Button from "../common/Button";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <section className="bg-black p-8 sm:p-12 md:p-16 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 sm:mb-6">
          Never Miss a Deal
        </h2>
        <p className="text-sm lg:text-[15px] xl:text-base text-neutral-400  mb-12 font-medium tracking-wide">
          Curated offers delivered straight to your inbox. No spam, just
          savings.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center justify-center p-8 border border-neutral-800 bg-neutral-900 animate-fade-in">
            <CheckCircle2
              className="w-12 h-12 text-white mb-4"
              strokeWidth={1}
            />
            <p className="text-xl font-bold text-white uppercase tracking-widest">
              Subscribed
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:gap-0 max-w-lg mx-auto"
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
              className="bg-white text-black px-8 py-3 sm:py-4 font-bold uppercase tracking-widest text-sm border border-white hover:bg-white cursor-pointer"
            >
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
