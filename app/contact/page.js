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
    <div className="relative min-h-[calc(100vh-80px)] bg-neutral-50 pb-20 sm:pb-32">
      
      {/* Dark Header Background with subtle grid texture */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Subtle glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 pt-16 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        
        <div className="text-center text-white mb-12 md:mb-16">
          <h1 className="uppercase tracking-tighter mb-4">
            Contact Us
          </h1>
          <p className="text-neutral-400 font-medium text-sm md:text-base tracking-wide max-w-md mx-auto">
            We're here to help you maximize your savings. Reach out anytime.
          </p>
        </div>

        {/* Floating Card */}
        <div className="bg-white rounded-3xl md:rounded-[40px] shadow-2xl shadow-black/10 p-8 sm:p-12 md:p-16 border border-neutral-100">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            
            {/* Contact Details Column */}
            <div className="md:col-span-4 flex flex-col space-y-8 md:border-r border-neutral-100 md:pr-8">
              <div>
                <h5 className="text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email
                </h5>
                <a href="mailto:support@karodeal.in" className="text-lg md:text-xl font-bold text-black hover:text-[#f96b02] transition-colors tracking-tighter block break-all">
                  support@karodeal.in
                </a>
              </div>

              <div>
                <h6 className="text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Headquarters
                </h6>
                <address className="text-lg md:text-xl font-bold text-black not-italic tracking-tighter">
                  Surat, India
                </address>
              </div>
            </div>

            {/* Form Column */}
            <div className="md:col-span-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-6 animate-fade-in">
                  <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
                  </div>
                  <h2 className="text-black uppercase tracking-tighter mb-2">Success!</h2>
                  <p className="text-neutral-500 text-sm font-medium mb-8">Your message has been sent. We'll be in touch soon.</p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">Send Another Note</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="font-bold text-neutral-900 uppercase tracking-widest pl-1">Name</label>
                      <input type="text" id="name" required className="w-full bg-neutral-100/50 border border-neutral-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black px-4 py-3 text-[13px] font-medium text-black placeholder-neutral-400 focus:outline-none transition-all" placeholder="John Doe" />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="font-bold text-neutral-900 uppercase tracking-widest pl-1">Email</label>
                      <input type="email" id="email" required className="w-full bg-neutral-100/50 border border-neutral-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black px-4 py-3 text-[13px] font-medium text-black placeholder-neutral-400 focus:outline-none transition-all" placeholder="john@example.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="font-bold text-neutral-900 uppercase tracking-widest pl-1">Message</label>
                    <textarea id="message" rows="5" required className="w-full bg-neutral-100/50 border border-neutral-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black px-4 py-3 text-[13px] font-medium text-black placeholder-neutral-400 focus:outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                  </div>

                  <div className="pt-4 flex sm:justify-end">
                    <Button type="submit" variant="primary" className="w-full sm:w-auto px-10 py-4 rounded-xl">
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
