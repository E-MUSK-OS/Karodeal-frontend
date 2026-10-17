import Link from 'next/link';
import { Home, Sparkles, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';

export const metadata = {
  title: 'Page Not Found | KaroDeal',
  description: 'The deal or page you are looking for does not exist or has expired.',
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-neutral-50 font-sans">
      <div className="max-w-md w-full text-center bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-lg">
        <div className="text-6xl font-black text-black tracking-tighter mb-2">
          404
        </div>
        <div className="w-12 h-1 bg-[#f96b02] mx-auto rounded-full mb-6"></div>

        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-2">
          Deal or Page Not Found
        </h1>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          The offer you're looking for might have expired, been removed, or the link is incorrect. Explore top active deals below!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/deals" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto px-6 py-3 bg-[#f96b02] hover:bg-[#e05f00] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Explore All Deals
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto px-6 py-3 border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
