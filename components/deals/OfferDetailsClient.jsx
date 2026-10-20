'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/common/PageLoader';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Calendar, Star, ShieldCheck, Clock, Banknote, ChevronDown, HelpCircle, Share2, Sparkles, ExternalLink, ArrowUpRight } from 'lucide-react';
import Button from '@/components/common/Button';
import { calculateCashback } from '@/lib/cashbackCalculator';
import { openStoreDeal } from '@/lib/deepLink';
import CashbackRedirectModal from '@/components/deals/CashbackRedirectModal';
import ShareDealModal from '@/components/deals/ShareDealModal';
import { cleanProductTitle } from '@/lib/titleSanitizer';

export default function OfferDetailsClient({ initialDeal = null, dealId = null, params }) {
  const router = useRouter();
  const [deal, setDeal] = useState(initialDeal);
  const [loading, setLoading] = useState(!initialDeal);
  const [error, setError] = useState(null);
  const [id, setId] = useState(dealId);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
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

  // When user returns to the tab/window from the external app, auto-close the redirect modal
  useEffect(() => {
    const handleReturn = () => {
      setIsRedirectModalOpen(false);
    };

    window.addEventListener('pageshow', handleReturn);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setIsRedirectModalOpen(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pageshow', handleReturn);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

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

    // Guaranteed auto-close after 2s so the modal is never stuck open when returning
    setTimeout(() => {
      setIsRedirectModalOpen(false);
    }, 2000);
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

  let bgClass = 'bg-gradient-to-br from-neutral-800 to-neutral-950';

  if (storeIdStr === 'amazon') {
    bgClass = 'bg-gradient-to-br from-[#FF7A00] via-[#F4511E] to-[#C93800]';
  } else if (storeIdStr === 'flipkart') {
    bgClass = 'bg-gradient-to-br from-[#2874F0] via-[#1565C0] to-[#0D47A1]';
  } else if (storeIdStr === 'myntra') {
    bgClass = 'bg-gradient-to-br from-[#FF3F6C] via-[#E91E63] to-[#AD1457]';
  } else if (storeIdStr === 'ajio') {
    bgClass = 'bg-gradient-to-br from-[#374151] via-[#1F2937] to-[#111827]';
  } else if (storeIdStr === 'meesho') {
    bgClass = 'bg-gradient-to-br from-[#E91E63] via-[#D81B60] to-[#880E4F]';
  } else if (storeIdStr === 'nykaa') {
    bgClass = 'bg-gradient-to-br from-[#FC2779] via-[#E01563] to-[#99003D]';
  } else if (storeIdStr === 'tatacliq') {
    bgClass = 'bg-gradient-to-br from-[#1E1E1E] via-[#2A2A2A] to-[#121212]';
  } else if (storeIdStr === 'croma') {
    bgClass = 'bg-gradient-to-br from-[#00B5B8] via-[#008A8C] to-[#005D5E]';
  }

  const generateSlug = (text) => {
    return text
      ?.toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '') || '';
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://karodeal.in';
  const offerSlug = `${generateSlug(deal?.title || '')}-${deal?.id || id}`;
  const fullShareUrl = `${siteUrl}/deals/${offerSlug}`;

  const handleShareClick = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsShareOpen(true);
  };

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
        <div className="rounded-[22px] sm:rounded-[28px] md:rounded-[36px] shadow-2xl overflow-hidden mb-8 sm:mb-12 relative w-full max-w-4xl mx-auto bg-neutral-100 group aspect-[16/10] border border-neutral-200">
          <h1 className="sr-only">{cleanProductTitle(deal.title)} - Get ₹{withReviewCashback} Cashback on KaroDeal</h1>
          <img
            src={deal.image}
            alt={`${cleanProductTitle(deal.title)} - ${store.name || 'Store'} Cashback Deal on KaroDeal`}
            fetchPriority="high"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />

          <div className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 md:top-8 md:left-8 md:right-8 z-20 flex items-center justify-between pointer-events-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center shadow-md shrink-0 p-1.5 md:p-2 border border-white/80">
              <img
                src={store.logoUrl}
                alt={`${store.name || 'Partner Store'} Logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Share Button beside store logo on custom card */}
            <button
              type="button"
              onClick={handleShareClick}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95 border border-white/20"
              title="Share deal"
              aria-label="Share deal"
            >
              <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            </button>
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
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-102 active:scale-98 transition-all duration-200 border-none"
            >
              <span className="hidden sm:inline">Grab Deal & Earn Cashback</span>
              <span className="sm:hidden">Grab Deal & Cashback</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`${bgClass} rounded-[22px] sm:rounded-[28px] md:rounded-[36px] shadow-2xl overflow-hidden mb-8 sm:mb-12 flex flex-col sm:flex-row justify-between items-stretch max-w-4xl mx-auto border border-white/20 relative group p-4 sm:p-6 md:p-8`}
        >
          {/* Subtle Ambient Specular & Lighting Glows */}
          <div className="absolute -top-16 -left-16 w-52 h-52 bg-white/20 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />
          <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-black/35 rounded-full blur-3xl pointer-events-none" />

          {/* Left Area: Text & Action */}
          <div className="w-full sm:w-[54%] md:w-[56%] z-10 flex flex-col justify-between pr-0 sm:pr-4 md:pr-6">
            {/* Top: Logo & Share Button & Verified Pill */}
            <div className="mb-3 sm:mb-4 md:mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="bg-white rounded-xl sm:rounded-2xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center shadow-md shadow-black/10 shrink-0 p-1.5 md:p-2 border border-white/80 group-hover:scale-102 transition-transform">
                  <img
                    src={store.logoUrl}
                    alt={`${store.name || 'Partner Store'} Logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Share Button beside store logo */}
                <button
                  type="button"
                  onClick={handleShareClick}
                  className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl bg-black/15 hover:bg-white text-white hover:text-neutral-900 backdrop-blur-md flex items-center justify-center transition-all duration-200 border border-white/25 shadow-sm active:scale-95 cursor-pointer group/share"
                  title="Share deal"
                  aria-label="Share deal"
                >
                  <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover/share:scale-110" />
                </button>
              </div>

              {/* Micro Verified Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Verified Deal</span>
              </div>
            </div>

            {/* Semantic H1 & Product Title */}
            <div className="my-auto py-1 sm:py-2">
              <h1 className="text-white/90 text-xs sm:text-sm md:text-base font-bold tracking-tight mb-1.5 sm:mb-2.5 line-clamp-2 leading-snug drop-shadow-xs">
                {cleanProductTitle(deal.title)}
              </h1>

              {/* Bold Discount Typography */}
              <div className="shrink-0 mb-2 sm:mb-3 md:mb-4">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-sm flex items-baseline gap-1.5">
                  <span>Upto {deal.discount}%</span>
                  <span className="text-xs sm:text-base md:text-lg font-extrabold uppercase text-white/90">Off</span>
                </div>
              </div>

              {/* Cashback Pills */}
              <div className="mb-3 sm:mb-5 md:mb-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-neutral-900 font-black text-[11px] sm:text-xs md:text-sm shadow-sm border border-white/90">
                  <img src="/images/favicon.png" alt="logo" className="w-4 h-4 object-contain rounded shrink-0" />
                  <span>₹{withReviewCashback} With Review</span>
                </span>
                {withoutReviewCashback > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md text-white/90 font-semibold text-[11px] sm:text-xs md:text-sm border border-white/25 shadow-xs">
                    <span>₹{withoutReviewCashback} W/O Review</span>
                  </span>
                )}
              </div>
            </div>

            {/* Grab Deal CTA Button & Footnote */}
            <div className="mt-2 sm:mt-auto">
              <Button
                as="a"
                href={dealUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDealClick}
                variant="outline"
                size="none"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-102 active:scale-98 transition-all duration-200 border-none w-fit"
              >
                <span className="hidden sm:inline">Grab Deal & Earn Cashback</span>
                <span className="sm:hidden">Grab Deal & Cashback</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <p className="text-[10px] sm:text-xs text-white/75 mt-2 font-medium flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 text-white/60 shrink-0" />
                <span>*Opens {store.name ? `${store.name} app or website` : 'store'} directly</span>
              </p>
            </div>
          </div>

          {/* Right Area: Framed Product Image Showcase Housing */}
          <div className="w-full sm:w-[46%] md:w-[44%] z-10 relative mt-4 sm:mt-0 flex items-stretch">
            <div className="w-full min-h-[220px] sm:min-h-[280px] md:min-h-[340px] bg-white rounded-xl sm:rounded-2xl md:rounded-[24px] overflow-hidden shadow-xl border border-white/75 p-2 sm:p-3 relative flex items-center justify-center">
              <img
                src={deal.image}
                alt={deal.title}
                className="w-full h-full object-contain sm:object-cover rounded-lg sm:rounded-xl transition-transform duration-500 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
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

      {/* Share Deal Modal */}
      <ShareDealModal
        deal={deal}
        shareUrl={fullShareUrl}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
