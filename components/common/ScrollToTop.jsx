'use client';

import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Button from '@/components/common/Button';

export default function ScrollToTop() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button variant="none" size="none"
      onClick={scrollToTop}
      className="fixed bottom-18 right-6 p-2.5 bg-black text-white rounded-full border-1 border-white shadow-lg hover:bg-[#f96b02] hover:-translate-y-1 transition-all duration-300 z-50 flex items-center justify-center"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
}
