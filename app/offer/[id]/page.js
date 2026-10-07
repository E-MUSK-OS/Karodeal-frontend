'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import Link from 'next/link';
import { CheckCircle, Star, Clock, Banknote, ArrowRight } from 'lucide-react';

export default function OfferDetailsPage({ params }) {
  const router = useRouter();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    // Unwrap params to get id in Next.js 15+ if it's a promise, otherwise just get it
    Promise.resolve(params).then(p => setId(p.id));
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
          } catch (e) {}
        }
      }

      fetch(`${apiUrl}/products/${deal.id}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }).catch(err => console.error(err));
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !deal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">{error || 'Deal not found'}</h2>
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
    <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-12 max-w-5xl mx-auto min-h-screen">
      
      {/* Product Highlight Section */}
      <div className={`${bgClass} rounded-[1.25rem] sm:rounded-[2rem] md:rounded-[2.5rem] shadow-xl overflow-hidden mb-8 sm:mb-12 flex flex-row min-h-[160px] sm:min-h-[250px] md:min-h-auto`}>
        
        {/* Left Area: Text & Action */}
        <div className="w-[55%] p-4 sm:p-8 md:p-12 flex flex-col justify-center">
          
          {/* Logo */}
          <div className="mb-2 sm:mb-4 md:mb-8">
            <div className="bg-white rounded-md sm:rounded-xl md:rounded-2xl w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center shadow-md shrink-0 p-1 sm:p-1.5 md:p-2">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          <p className="text-white/90 text-[10px] sm:text-xs md:text-lg font-bold tracking-wide mb-1 sm:mb-2 md:mb-4 line-clamp-1">
            {deal.title}
          </p>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[4rem] font-black tracking-tighter text-white mb-2 sm:mb-4 md:mb-6 leading-none">
            Upto {deal.discount}% Off
          </h1>
          
          <div className="mb-3 sm:mb-6 md:mb-10">
            <span className={`${tagClass} text-[8px] sm:text-[10px] md:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-sm sm:rounded-md uppercase tracking-wider block w-fit`}>
              Flat ₹{cashback} Cashback
            </span>
          </div>
          
          <div className="mt-auto pt-1 sm:pt-2 w-fit">
            <a 
              href={dealUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDealClick}
              className="inline-flex items-center justify-center bg-white text-black text-[9px] sm:text-xs md:text-base font-black uppercase tracking-widest px-3 sm:px-6 md:px-10 py-1.5 sm:py-2.5 md:py-4 rounded-full hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg"
            >
              <span className="hidden sm:inline">Grab Deal & Earn Cashback</span>
              <span className="sm:hidden">Grab Deal</span>
              <ArrowRight className="ml-1 sm:ml-2 md:ml-3 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </a>
            <p className="text-[8px] sm:text-[10px] md:text-xs text-white/70 mt-1 sm:mt-2 md:mt-3 font-medium text-left">
              *Redirects to store
            </p>
          </div>
        </div>

        {/* Right Area: Image */}
        <div className="w-[45%] bg-white flex items-center justify-center overflow-hidden">
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
        
        <h2 className="text-3xl md:text-4xl font-black mb-12 tracking-tight text-center text-black">How to claim your cashback?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          
          <div className="flex gap-5 md:gap-6">
            <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 bg-[#fafafa] rounded-2xl flex items-center justify-center text-black shadow-sm border border-neutral-100">
              <CheckCircle className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg md:text-xl mb-3 text-black">1. Upload Invoice</h3>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                After completing your purchase through the "Grab Deal" link, it is mandatory to upload your valid purchase invoice or order receipt in your Karodeal account dashboard. Make sure the order number and date are clearly visible for verification.
              </p>
            </div>
          </div>

          <div className="flex gap-5 md:gap-6">
            <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 bg-[#fafafa] rounded-2xl flex items-center justify-center text-black shadow-sm border border-neutral-100">
              <Star className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg md:text-xl mb-3 text-black">2. Positive Review is Mandatory</h3>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                Once you receive the product, you must leave a 5-star positive review on the store's platform (e.g. Amazon/Flipkart). Upload a screenshot of your live positive review in our dashboard. Your cashback will be rejected without this proof.
              </p>
            </div>
          </div>

          <div className="flex gap-5 md:gap-6">
            <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 bg-[#fafafa] rounded-2xl flex items-center justify-center text-black shadow-sm border border-neutral-100">
              <Clock className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg md:text-xl mb-3 text-black">3. Admin Approval (24-48 Hours)</h3>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                After you have submitted both your invoice and review proof, our admin team will manually verify your purchase. This approval or rejection process typically takes between 24 to 48 hours depending on the volume of requests.
              </p>
            </div>
          </div>

          <div className="flex gap-5 md:gap-6">
            <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 bg-[#fafafa] rounded-2xl flex items-center justify-center text-black shadow-sm border border-neutral-100">
              <Banknote className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg md:text-xl mb-3 text-black">4. Minimum Withdrawal Limit</h3>
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
