'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-white text-black pt-10 md:pt-24 pb-8 md:pb-12 border-t border-neutral-200 mt-10 md:mt-24 px-4 lg:px-9">
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
            <div className="flex space-x-6">
              <a href="#" className="text-sm lg:text-[15px] xl:text-base font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">Instagram</a>
              <a href="#" className="text-sm lg:text-[15px] xl:text-base font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">Facebook</a>
              <a href="#" className="text-sm lg:text-[15px] xl:text-base font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">X</a>
            </div>
          </div>

          {/* KaroDeal */}
          <div>
            <h5 className="text-black uppercase tracking-widest mb-4 md:mb-6">Company</h5>
            <ul className="space-y-3 md:space-y-4">
              <li><Link href="/about" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-black  transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-black  transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h5 className="text-black uppercase tracking-widest mb-4 md:mb-6">Discover</h5>
            <ul className="space-y-3 md:space-y-4">
              <li><Link href="/deals" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-black  transition-colors">All Deals</Link></li>
              <li><Link href="/categories" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-black  transition-colors">Categories</Link></li>
              <li><Link href="/stores" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-black  transition-colors">Stores</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-black uppercase tracking-widest mb-4 md:mb-6">Legal</h5>
            <ul className="space-y-3 md:space-y-4">
              <li><Link href="/privacy-policy" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-black  transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm lg:text-[15px] xl:text-base text-neutral-500 hover:text-black  transition-colors">Terms & Conditions</Link></li>
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
