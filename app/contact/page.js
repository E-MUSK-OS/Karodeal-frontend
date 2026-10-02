'use client';
import { useState } from 'react';
import Button from '@/components/common/Button';
import { CheckCircle2, Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-12 md:pb-24">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16 border-b border-black pb-6 md:pb-8">
        <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter mb-3 md:mb-4">Contact</h2>
        <p className="text-xs lg:text-sm text-neutral-500 font-bold uppercase tracking-widest">Get in touch with our team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
        {/* Contact Info */}
        <div className="flex flex-col justify-start">
          <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-6 md:mb-10">Information</h3>

          <div className="space-y-8 md:space-y-12">
            <div className="group">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <Mail className="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors" />
                <h3 className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest">Email</h3>
              </div>
              <a href="mailto:support@karodeal.in" className="text-lg md:text-xl font-black text-black hover:underline tracking-tighter break-all transition-all">
                support@karodeal.in
              </a>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <MapPin className="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors" />
                <h3 className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest">Office</h3>
              </div>
              <address className="text-lg md:text-xl font-black text-black not-italic tracking-tighter capitalize transition-all">
                Surat, India
              </address>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="border border-black p-6 sm:p-8 md:p-10 bg-white">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8 md:py-12 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-black mb-4 md:mb-6" strokeWidth={1} />
              <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-2 md:mb-3">Message Sent</h2>
              <p className="text-neutral-500 font-bold tracking-widest uppercase text-[10px] md:text-xs mb-8 md:mb-10">We'll respond shortly.</p>
              <Button onClick={() => setSubmitted(false)} variant="outline" fullWidth>Send Another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-6 md:mb-8 border-b border-black pb-3 inline-block">
                Drop a line
              </h3>

              <div className="relative group">
                <input type="text" id="name" required className="w-full bg-transparent border-b border-neutral-300 focus:border-black px-0 py-2.5 text-sm md:text-base font-bold text-black placeholder-neutral-400 focus:outline-none transition-colors peer" placeholder="NAME" />
              </div>

              <div className="relative group">
                <input type="email" id="email" required className="w-full bg-transparent border-b border-neutral-300 focus:border-black px-0 py-2.5 text-sm md:text-base font-bold text-black placeholder-neutral-400 focus:outline-none transition-colors peer" placeholder="EMAIL" />
              </div>

              <div className="relative group">
                <textarea id="message" rows="4" required className="w-full bg-transparent border-b border-neutral-300 focus:border-black px-0 py-2.5 text-sm md:text-base font-bold text-black placeholder-neutral-400 focus:outline-none transition-colors resize-none peer" placeholder="MESSAGE"></textarea>
              </div>

              <Button type="submit" variant="primary" fullWidth className="py-3 md:py-3.5 mt-6 md:mt-8 text-xs md:text-sm">
                Submit Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
