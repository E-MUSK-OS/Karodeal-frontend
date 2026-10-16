'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { 
  CheckCircle2, 
  Mail, 
  MapPin, 
  Phone, 
  ArrowUpRight 
} from 'lucide-react';
import { handleAppError, showSuccessToast } from '@/lib/errorHandler';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const name = e.target.name.value;
    const email = e.target.email.value;
    const message = e.target.message.value;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        showSuccessToast('Message sent! Our support team will get back to you soon.');
      } else {
        const userMsg = handleAppError(data.error || 'Failed to send message', {
          context: 'Contact Form',
          title: 'Message Not Sent',
          fallback: 'Could not send your message. Please verify your details and try again.'
        });
        setError(userMsg);
      }
    } catch (err) {
      const userMsg = handleAppError(err, {
        context: 'Contact Form Network',
        title: 'Connection Error',
        fallback: 'Unable to connect to the server. Please try again.'
      });
      setError(userMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      
      {/* 1. Clean Minimal Header */}
      <section className="border-b border-neutral-200 bg-neutral-50/50 py-12 sm:py-16">
        <div className="page-container text-center">
          <h1 className="font-black text-black uppercase tracking-tighter leading-tight mb-3">
            Contact Us
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Have a question or need assistance? Reach out to our team directly or send us a message below.
          </p>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <section className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: 4 Direct Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="font-black text-black uppercase tracking-tight mb-2">
                Direct Channels
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-6">
                Choose your preferred way to connect with us:
              </p>
            </div>

            {/* 4 Clean Minimal Cards */}
            <div className="space-y-3">
              {/* Email */}
              <a
                href="mailto:support@karodeal.in?subject=KaroDeal%20Support%20Inquiry&body=Hello%20KaroDeal%20Team%2C%0A%0A"
                className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 hover:border-black bg-white transition-all duration-200 group shadow-2xs hover:-translate-y-0.5"
                title="Send Email"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-black group-hover:text-white text-black flex items-center justify-center transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-400 uppercase tracking-widest text-[11px]">
                      Email
                    </div>
                    <div className="font-bold text-black break-all">
                      support@karodeal.in
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/karodeal_/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 hover:border-black bg-white transition-all duration-200 group shadow-2xs hover:-translate-y-0.5"
                title="Visit Instagram"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-black group-hover:text-white text-black flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-neutral-400 uppercase tracking-widest text-[11px]">
                      Instagram
                    </div>
                    <div className="font-bold text-black">
                      @karodeal_
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </a>

            </div>

            {/* Office Location */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
              <div className="text-neutral-600 font-medium text-sm">
                Headquarters: Surat, Gujarat, India
              </div>
            </div>
          </div>

          {/* Right Column: Clean Minimal Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs">
              
              <div className="mb-6 sm:mb-8">
                <h2 className="font-black text-black uppercase tracking-tight mb-2">
                  Send a Message
                </h2>
                <p className="text-neutral-500 leading-relaxed">
                  Fill in your details below and we will get back to you shortly.
                </p>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-7 h-7 text-[#f96b02]" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-black uppercase tracking-tight mb-2">
                    Message Sent
                  </h3>
                  <p className="text-neutral-500 font-medium max-w-sm mb-6 leading-relaxed">
                    Thank you for reaching out. We have received your note and will reply soon.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline" size="md">
                    Send Another Note
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block font-bold text-neutral-800 uppercase tracking-widest text-xs">
                        Name
                      </label>
                      <input 
                        type="text" 
                        id="name" 
                        required 
                        className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black px-4 py-3 font-medium text-black placeholder-neutral-400 focus:outline-none transition-all" 
                        placeholder="Your Name" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block font-bold text-neutral-800 uppercase tracking-widest text-xs">
                        Email
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        required 
                        className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black px-4 py-3 font-medium text-black placeholder-neutral-400 focus:outline-none transition-all" 
                        placeholder="you@example.com" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="block font-bold text-neutral-800 uppercase tracking-widest text-xs">
                      Message
                    </label>
                    <textarea 
                      id="message" 
                      rows={5} 
                      required 
                      className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black px-4 py-3 font-medium text-black placeholder-neutral-400 focus:outline-none transition-all resize-none" 
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="md" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
