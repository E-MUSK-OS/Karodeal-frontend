'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import Link from 'next/link';
import { CheckCircle, Star, Clock, Banknote, ArrowRight, Calendar, ShieldCheck } from 'lucide-react';
import Button from '@/components/common/Button';

export default function OfferDetailsPage({ params }) {
  const router = useRouter();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    // Unwrap params to get slug in Next.js 15+ if it's a promise, otherwise just get it
    Promise.resolve(params).then(p => {
      if (p.slug) {
        const slugParts = p.slug.split('-');
        const dealId = slugParts.pop(); // The last part is the ID
        setId(dealId);
      }
    });
  }, [params]);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
        const res = await fetch(`${apiUrl}/products`);
        if (res.ok) {
          const allProducts = await res.json();
          const foundDeal = allProducts.find(p => String(p.id) === String(id));
          if (foundDeal) {
            setDeal(foundDeal);
          } else {
            setError('Deal not found');
          }
        } else {
          setError('Failed to fetch deal');
        }
      } catch (err) {
        setError('Error fetching deal');
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id]);

  const handleDealClick = (e) => {
    // We let the link open in new tab normally, but track click first.
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

      let token = null;
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            token = user.token;
          } catch (e) { }
        }
      }

      fetch(`${apiUrl}/products/${deal.id}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }).catch(() => {
        // Silently catch the error. Adblockers frequently block URLs containing "/click".
        // We don't want to show a scary red error overlay to the user for a failed tracking call.
      });
    } catch (error) {
      // Ignore synchronous errors
    }
  };

  if (loading) return <PageLoader />;
  if (error || !deal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="font-bold text-neutral-800 mb-4">{error || 'Deal not found'}</h2>
        <Link href="/" className="text-blue-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  const store = deal.storeRel || { name: 'Unknown', logoUrl: '' };
  const storeIdStr = store.slug || store.id || '';
  const dealUrl = deal.affiliateUrl || `https://www.${storeIdStr}.com`;

  const getCashback = (p) => {
    if (p.cashback !== undefined && p.cashback !== '') return Number(p.cashback);
    const charCode = p.id ? p.id.charCodeAt(p.id.length - 1) : 0;
    return (charCode % 5) + 2 + (charCode % 2 === 0 ? 0.5 : 0);
  };
  const cashback = getCashback(deal);

  let bgClass = "bg-neutral-900";
  let tagClass = "bg-blue-500";

  if (storeIdStr === 'amazon') {
    bgClass = "bg-gradient-to-br from-[#F58529] to-[#D54400]";
    tagClass = "bg-black/15 text-white";
  } else if (storeIdStr === 'flipkart') {
    bgClass = "bg-gradient-to-br from-[#3E8DFF] to-[#0151C8]";
    tagClass = "bg-black/15 text-white";
  } else if (storeIdStr === 'myntra') {
    bgClass = "bg-gradient-to-br from-[#F04D9E] to-[#C90059]";
    tagClass = "bg-black/15 text-white";
  } else if (storeIdStr === 'ajio') {
    bgClass = "bg-gradient-to-br from-[#4b5563] to-[#1f2937]";
    tagClass = "bg-black/20 text-white";
  } else if (storeIdStr === 'meesho') {
    bgClass = "bg-gradient-to-br from-[#db2777] to-[#831843]";
    tagClass = "bg-black/15 text-white";
  }

  return (
    <div className="page-container py-8 sm:py-12 md:py-20 min-h-screen">

      {/* Product Highlight Section */}
      <div className={`${bgClass} rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden mb-8 sm:mb-12 flex flex-row min-h-[160px] sm:min-h-[220px] md:min-h-[260px] max-w-3xl mx-auto`}>

        {/* Left Area: Text & Action */}
        <div className="w-[50%] md:w-[55%] p-3 sm:p-6 md:p-8 flex flex-col justify-center">

          {/* Logo */}
          <div className="mb-2.5 sm:mb-4 md:mb-6">
            <div className="bg-white rounded-sm sm:rounded-xl md:rounded-2xl w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center shadow-md shrink-0 p-1 sm:p-1.5 md:p-2">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          <p className="text-white/90 text-[10px] sm:text-xs md:text-sm font-bold tracking-wide mb-2 sm:mb-3 md:mb-4 line-clamp-1">
            {deal.title}
          </p>

          <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 sm:mb-4 md:mb-6 leading-none">
            Upto {deal.discount}% Off
          </h2>

          <div className="mb-3 sm:mb-6 md:mb-8">
            <span className="bg-[rgba(255,255,255,0.7)] text-black font-bold rounded-md flex items-center justify-center w-fit px-1.5 sm:px-2 py-0.5 sm:py-1 shrink-0 gap-1 sm:gap-1.5 shadow-sm">
              <img src="/images/favicon.png" alt="logo" className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain rounded-sm sm:rounded" />
              <span className="text-[10px] sm:text-xs lg:text-sm whitespace-nowrap">Flat ₹{cashback} Cashback</span>
            </span>
          </div>

          <div className="mt-1 sm:mt-auto w-fit">
            <Button
              as="a"
              href={dealUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDealClick}
              variant="outline"
              size="none"
              className="border-none bg-white text-black text-[9px] sm:text-[11px] md:text-sm font-black uppercase tracking-widest px-3 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-3 shadow-lg"
            >
              <span className="hidden sm:inline">Grab Deal & Earn Cashback</span>
              <span className="sm:hidden">Grab Deal</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
            </Button>
            <p className="text-[8.5px] sm:text-[10px] md:text-xs text-white/70 mt-1 sm:mt-2 md:mt-3 font-medium text-left">
              *Redirects to store
            </p>
          </div>
        </div>

        {/* Right Area: Image */}
        <div className="w-[50%] md:w-[45%] bg-white flex items-center justify-center overflow-hidden">
          <img
            src={deal.image}
            alt={deal.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

      </div>

      {/* Rules Section */}
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 relative overflow-hidden">

        <h2 className="font-black mb-5 sm:mb-7 lg:mb-9 tracking-tight text-center text-black">How to claim your cashback?</h2>

        <div className="flex flex-col gap-8 md:gap-10">

          <div className="flex gap-5 md:gap-6">
            <div className="hidden md:flex shrink-0 w-16 h-16 bg-[#fafafa] rounded-2xl items-center justify-center text-black shadow-sm border border-neutral-100">
              <Calendar className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="font-black mb-3 text-black">1. Submit Claim After 20 Days</h4>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                You can only submit your cashback claim ticket after 20 days from the date of your purchase. This mandatory waiting period ensures that the product's return window has expired.
              </p>
            </div>
          </div>

          <div className="flex gap-5 md:gap-6">
            <div className="hidden md:flex shrink-0 w-16 h-16 bg-[#fafafa] rounded-2xl items-center justify-center text-black shadow-sm border border-neutral-100">
              <CheckCircle className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="font-black mb-3 text-black">2. Upload Invoice</h4>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                After completing your purchase through the "Grab Deal" link, it is mandatory to upload your valid purchase invoice or order receipt in your Karodeal account dashboard. Make sure the order number and date are clearly visible for verification.
              </p>
            </div>
          </div>

          <div className="flex gap-5 md:gap-6">
            <div className="hidden md:flex shrink-0 w-16 h-16 bg-[#fafafa] rounded-2xl items-center justify-center text-black shadow-sm border border-neutral-100">
              <Star className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="font-black mb-3 text-black">3. Positive Review is Mandatory</h4>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                Once you receive the product, you must leave a positive review on the store's platform (e.g. Amazon/Flipkart). Upload a screenshot of your live positive review in our dashboard. Your cashback will be rejected without this proof.
              </p>
            </div>
          </div>

          <div className="flex gap-5 md:gap-6">
            <div className="hidden md:flex shrink-0 w-16 h-16 bg-[#fafafa] rounded-2xl items-center justify-center text-black shadow-sm border border-neutral-100">
              <ShieldCheck className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="font-black mb-3 text-black">4. No-Return Proof</h4>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                You must also provide proof that the product was not returned or cancelled. This can be a screenshot of your order details page on the store's app showing that the return window has successfully closed.
              </p>
            </div>
          </div>

          <div className="flex gap-5 md:gap-6">
            <div className="hidden md:flex shrink-0 w-16 h-16 bg-[#fafafa] rounded-2xl items-center justify-center text-black shadow-sm border border-neutral-100">
              <Clock className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="font-black mb-3 text-black">5. Admin Approval (24-48 Hours)</h4>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                After you have submitted all your proofs, our admin team will manually verify your purchase. This approval or rejection process typically takes between 24 to 48 hours depending on the volume of requests.
              </p>
            </div>
          </div>

          <div className="flex gap-5 md:gap-6">
            <div className="hidden md:flex shrink-0 w-16 h-16 bg-[#fafafa] rounded-2xl items-center justify-center text-black shadow-sm border border-neutral-100">
              <Banknote className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="font-black mb-3 text-black">6. Minimum Withdrawal Limit</h4>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                Once your cashback is approved, it will be added to your Karodeal wallet. You can withdraw your earnings directly to your Bank account via UPI once your total approved wallet balance reaches a minimum of <strong className="text-black">₹1000</strong>.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
