'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Calendar, Star, ShieldCheck, Clock, Banknote, ChevronDown, HelpCircle } from 'lucide-react';
import { calculateCashback } from '@/lib/cashbackCalculator';
import { openStoreDeal } from '@/lib/deepLink';
import CashbackRedirectModal from '@/components/deals/CashbackRedirectModal';
import { cleanProductTitle } from '@/lib/titleSanitizer';

export default function OfferDetailsClient({ initialDeal = null, dealId = null, params }) {
  const router = useRouter();
  const [deal, setDeal] = useState(initialDeal);
  const [loading, setLoading] = useState(!initialDeal);
  const [error, setError] = useState(null);
  const [id, setId] = useState(dealId);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    if (dealId) {
      setId(dealId);
      return;
    }
    // Unwrap params to get slug in Next.js 15+ if it's a promise, otherwise just get it
    Promise.resolve(params).then((p) => {
      if (p?.slug) {
        const slugParts = p.slug.split('-');
        const parsedId = slugParts.pop(); // The last part is the ID
        setId(parsedId);
      }
    });
  }, [params, dealId]);

  useEffect(() => {
    if (deal) return;
    const fetchDeal = async () => {
      if (!id) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
        const res = await fetch(`${apiUrl}/products`);
        if (res.ok) {
          const allProducts = await res.json();
          const foundDeal = allProducts.find((p) => String(p.id) === String(id));
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
  }, [id, deal]);

  const handleDealClick = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Instantly show the activating cashback modal (0ms perceived latency)
    setIsRedirectModalOpen(true);

    const trackClick = () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';

        let token = null;
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              token = user.token;
            } catch (err) {}
          }
        }

        fetch(`${apiUrl}/products/${deal?.id}/click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          keepalive: true,
        }).catch(() => {
          // Silently catch the error. Adblockers frequently block URLs containing "/click".
        });
      } catch (error) {
        // Ignore synchronous errors
      }
    };

    // Smooth handoff: give the user 350ms to see the activation modal before native app opens
    setTimeout(() => {
      openStoreDeal({
        url: dealUrl,
        store: storeIdStr,
        onTrackClick: trackClick,
      });
    }, 350);
  };

  if (loading) return <PageLoader />;
  if (error || !deal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="font-bold text-neutral-800 mb-4">{error || 'Deal not found'}</h2>
        <Link href="/" className="text-blue-500 hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  const store = deal.storeRel || { name: 'Unknown', logoUrl: '' };
  const storeIdStr = store.slug || store.id || '';
  const dealUrl = deal.affiliateUrl || `https://www.${storeIdStr}.com`;

  const withoutReviewCashback = deal.cashbackWithoutReview ?? calculateCashback(deal.salePrice).withoutReview;
  const withReviewCashback = deal.cashbackWithReview ?? deal.cashback ?? calculateCashback(deal.salePrice).withReview;
  const cashback = withReviewCashback;

  const isCustom = Number(deal.originalPrice) === 0;

  let bgClass = 'bg-neutral-900';
  let tagClass = 'bg-blue-500';

  if (storeIdStr === 'amazon') {
    bgClass = 'bg-gradient-to-br from-[#F58529] to-[#D54400]';
    tagClass = 'bg-black/15 text-white';
  } else if (storeIdStr === 'flipkart') {
    bgClass = 'bg-gradient-to-br from-[#3E8DFF] to-[#0151C8]';
    tagClass = 'bg-black/15 text-white';
  } else if (storeIdStr === 'myntra') {
    bgClass = 'bg-gradient-to-br from-[#F04D9E] to-[#C90059]';
    tagClass = 'bg-black/15 text-white';
  } else if (storeIdStr === 'ajio') {
    bgClass = 'bg-gradient-to-br from-[#4b5563] to-[#1f2937]';
    tagClass = 'bg-black/20 text-white';
  } else if (storeIdStr === 'meesho') {
    bgClass = 'bg-gradient-to-br from-[#db2777] to-[#831843]';
    tagClass = 'bg-black/15 text-white';
  }

  return (
    <div className="page-container py-6 sm:py-10 md:py-16 min-h-screen">
      {/* Breadcrumb Navigation for SEO & Crawlers */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 max-w-3xl mx-auto">
        <ol className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs text-neutral-500 font-medium overflow-hidden whitespace-nowrap">
          <li>
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
          </li>
          <li className="text-neutral-300">/</li>
          <li>
            <Link href="/deals" className="hover:text-black transition-colors">Deals</Link>
          </li>
          {store.name && (
            <>
              <li className="text-neutral-300">/</li>
              <li>
                <Link href={`/stores/${storeIdStr}`} className="hover:text-black transition-colors">{store.name}</Link>
              </li>
            </>
          )}
          <li className="text-neutral-300">/</li>
          <li className="text-black font-semibold truncate max-w-[150px] sm:max-w-xs" aria-current="page">
            {cleanProductTitle(deal.title)}
          </li>
        </ol>
      </nav>

      {/* Product Highlight Section */}
      {isCustom ? (
        <div className="rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden mb-8 sm:mb-12 relative w-full max-w-3xl mx-auto bg-neutral-100 group aspect-[16/10]">
          <h1 className="sr-only">{cleanProductTitle(deal.title)} - Get ₹{withReviewCashback} Cashback on KaroDeal</h1>
          <img
            src={deal.image}
            alt={`${cleanProductTitle(deal.title)} - ${store.name || 'Store'} Cashback Deal on KaroDeal`}
            fetchPriority="high"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />

          <div className="absolute top-3 left-3 sm:top-6 sm:left-6 md:top-8 md:left-8 z-20 pointer-events-none">
            <div className="bg-white rounded-sm sm:rounded-xl md:rounded-2xl w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center shadow-md shrink-0 p-1 sm:p-1.5 md:p-2">
              <img
                src={store.logoUrl}
                alt={`${store.name || 'Partner Store'} Logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 z-20">
            <Button
              as="a"
              href={dealUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDealClick}
              variant="outline"
              size="none"
              className="border-none bg-white text-black text-[9px] sm:text-[11px] md:text-sm font-black uppercase tracking-widest px-3 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-3 shadow-lg flex items-center justify-center"
            >
              <span className="hidden sm:inline">Grab Deal & Earn Cashback</span>
              <span className="sm:hidden">Grab Deal</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`${bgClass} rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden mb-8 sm:mb-12 flex flex-row min-h-[160px] sm:min-h-[220px] md:min-h-[260px] max-w-3xl mx-auto`}
        >
          {/* Left Area: Text & Action */}
          <div className="w-[50%] md:w-[55%] p-3 sm:p-6 md:p-8 flex flex-col justify-center">
            {/* Logo */}
            <div className="mb-2.5 sm:mb-4 md:mb-6">
              <div className="bg-white rounded-sm sm:rounded-xl md:rounded-2xl w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center shadow-md shrink-0 p-1 sm:p-1.5 md:p-2">
                <img
                  src={store.logoUrl}
                  alt={`${store.name || 'Partner Store'} Logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Semantic H1 for Search Engines */}
            <h1 className="text-white text-[11px] sm:text-xs md:text-sm font-bold tracking-wide mb-2 sm:mb-3 md:mb-4 line-clamp-2 leading-snug">
              {cleanProductTitle(deal.title)}
            </h1>

            <div className="text-xl sm:text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 sm:mb-4 md:mb-6 leading-none">
              Upto {deal.discount}% Off
            </div>

            <div className="mb-3 sm:mb-6 md:mb-8 flex flex-wrap gap-2">
              <span className="bg-white/90 backdrop-blur-xs text-black font-extrabold rounded-lg flex items-center justify-center w-fit px-2 sm:px-3 py-1 shrink-0 gap-1.5 shadow-sm text-[10px] sm:text-xs lg:text-sm">
                <img src="/images/favicon.png" alt="logo" className="w-4 h-4 sm:w-5 sm:h-5 object-contain rounded" />
                <span>₹{withReviewCashback} With Review</span>
              </span>
              <span className="bg-black/25 backdrop-blur-xs text-white border border-white/30 font-semibold rounded-lg flex items-center justify-center w-fit px-2 sm:px-3 py-1 shrink-0 gap-1 text-[10px] sm:text-xs">
                <span>₹{withoutReviewCashback} W/O Review</span>
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
                *Opens {store.name ? `${store.name} app or website` : 'store'}
              </p>
            </div>
          </div>

          {/* Right Area: Image */}
          <div className="w-[50%] md:w-[45%] bg-white relative overflow-hidden self-stretch aspect-square md:aspect-[2.2/3]">
            <img
              src={deal.image}
              alt={deal.title}
              className="absolute inset-0 w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Rules Section */}
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 relative overflow-hidden">
        <h2 className="font-black mb-5 sm:mb-7 lg:mb-9 tracking-tight text-center text-black">
          How to claim your cashback?
        </h2>

        <div className="flex flex-col gap-8 md:gap-10">
          <div className="flex gap-5 md:gap-6">
            <div className="hidden md:flex shrink-0 w-16 h-16 bg-[#fafafa] rounded-2xl items-center justify-center text-black shadow-sm border border-neutral-100">
              <Calendar className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="font-black mb-3 text-black">1. Submit Claim After 20 Days</h4>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                You can only submit your cashback claim ticket after 20 days from the date of your purchase. This mandatory
                waiting period ensures that the product's return window has expired.
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
                After completing your purchase through the "Grab Deal" link, it is mandatory to upload your valid purchase
                invoice or order receipt in your Karodeal account dashboard. Make sure the order number and date are
                clearly visible for verification.
              </p>
            </div>
          </div>

          <div className="flex gap-5 md:gap-6">
            <div className="hidden md:flex shrink-0 w-16 h-16 bg-[#fafafa] rounded-2xl items-center justify-center text-black shadow-sm border border-neutral-100">
              <Star className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h4 className="font-black mb-3 text-black">3. Review for Higher Cashback (Optional)</h4>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-medium">
                Leave a positive review on the store's platform (e.g. Amazon/Flipkart) and upload a screenshot to earn
                higher cashback (₹{withReviewCashback}), or choose to claim without a review to earn standard cashback (₹
                {withoutReviewCashback}).
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
                You must also provide proof that the product was not returned or cancelled. This can be a screenshot of
                your order details page on the store's app showing that the return window has successfully closed.
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
                After you have submitted all your proofs, our admin team will manually verify your purchase. This approval
                or rejection process typically takes between 24 to 48 hours depending on the volume of requests.
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
                Once your cashback is approved, it will be added to your Karodeal wallet. You can withdraw your earnings
                directly to your Bank account via UPI once your total approved wallet balance reaches a minimum of{' '}
                <strong className="text-black">₹1000</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Section for Google Search & Users */}
      <section className="bg-white rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 mt-8 sm:mt-12 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2 text-neutral-400">
          <HelpCircle className="w-5 h-5 text-neutral-800" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Need Help?</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-center text-black mb-6 sm:mb-8 tracking-tight">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {[
            {
              q: `How do I earn ₹${withReviewCashback} cashback on ${cleanProductTitle(deal.title)}?`,
              a: `Click "Grab Deal & Earn Cashback" to open ${store.name || 'the store'}, complete your order in the same session, and upload your invoice in your KaroDeal dashboard after 20 days once the return window closes.`
            },
            {
              q: 'What is the difference between review vs without-review cashback?',
              a: `You can earn up to ₹${withReviewCashback} higher cashback if you post an honest review on ${store.name || 'the store'} and submit a screenshot. Alternatively, you can claim guaranteed standard cashback of ₹${withoutReviewCashback} without writing any review.`
            },
            {
              q: 'How and when can I withdraw my cashback to Bank/UPI?',
              a: `Once your invoice is verified by our admin team (24-48 hours), your cashback is credited to your KaroDeal wallet. You can withdraw directly to your Bank Account via UPI as soon as your total balance reaches ₹1000.`
            },
            {
              q: 'Can I combine this with store coupons or card discounts?',
              a: `Yes! KaroDeal cashback is extra on top of all existing store bank discounts, UPI cashback, and coupon offers.`
            }
          ].map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-neutral-200/80 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-4 sm:p-5 flex justify-between items-center gap-4 bg-white hover:bg-neutral-50 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-black' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-neutral-600 text-xs sm:text-sm leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Instant Cashback Activation & App Redirect Modal */}
      <CashbackRedirectModal
        isOpen={isRedirectModalOpen}
        onClose={() => setIsRedirectModalOpen(false)}
        store={store}
        cashbackAmount={withReviewCashback}
        dealTitle={deal?.title}
        onOpenStore={() => {
          openStoreDeal({
            url: dealUrl,
            store: storeIdStr,
          });
        }}
      />
    </div>
  );
}
