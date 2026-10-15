'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-white text-black pt-10 md:pt-24 pb-8 md:pb-12 border-t border-neutral-200 mt-10 md:mt-24 page-container">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-10 md:mb-20">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 md:mb-6">
              <img src="/images/logo.png" alt="KaroDeal Logo" className="h-16 w-auto object-contain scale-110 origin-left" />
            </Link>
            <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500 mb-6 md:mb-8 max-w-sm leading-relaxed">
              Discover. Save. Shop Smart. The definitive source for verified discounts and offers across the internet's best platforms.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:support@karodeal.in?subject=KaroDeal%20Support%20Inquiry&body=Hello%20KaroDeal%20Team%2C%0A%0A"
                className="w-10 h-10 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-[#f96b02] hover:border-[#f96b02] text-neutral-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
                title="Send Email"
                aria-label="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/karodeal_/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-[#E4405F] hover:border-[#E4405F] text-neutral-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* KaroDeal */}
          <div>
            <h5 className="text-black uppercase tracking-widest mb-4 md:mb-6">Company</h5>
            <ul className="space-y-3 md:space-y-4">
              <li><Link href="/about" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-[#f96b02]  transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-[#f96b02]  transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h5 className="text-black uppercase tracking-widest mb-4 md:mb-6">Discover</h5>
            <ul className="space-y-3 md:space-y-4">
              <li><Link href="/deals" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-[#f96b02]  transition-colors">All Deals</Link></li>
              <li><Link href="/categories" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-[#f96b02]  transition-colors">Categories</Link></li>
              <li><Link href="/stores" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-[#f96b02]  transition-colors">Stores</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-black uppercase tracking-widest mb-4 md:mb-6">Legal</h5>
            <ul className="space-y-3 md:space-y-4">
              <li><Link href="/privacy-policy" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-[#f96b02]  transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-[#f96b02]  transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 md:pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center  text-neutral-400 font-medium text-center md:text-left gap-4 md:gap-0">
          <p>&copy; {new Date().getFullYear()} KARODEAL. ALL RIGHTS RESERVED.</p>
          <p className="text-sm lg:text-[15px] xl:text-base uppercase tracking-widest">Built for Smart Shoppers</p>
        </div>
      </div>
    </footer>
  );
}
