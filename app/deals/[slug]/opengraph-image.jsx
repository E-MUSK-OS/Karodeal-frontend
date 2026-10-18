import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { cleanProductTitle } from '@/lib/titleSanitizer';
import { calculateCashback } from '@/lib/cashbackCalculator';

export const runtime = 'nodejs';
export const alt = 'KaroDeal Offer Card';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function fetchDeal(slug) {
  try {
    if (!slug) return null;
    const slugParts = slug.split('-');
    const dealId = slugParts.pop();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
    const res = await fetch(`${apiUrl}/products`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const allProducts = await res.json();
    return (
      allProducts.find(
        (p) =>
          String(p.id) === String(dealId) ||
          p.slug === slug ||
          String(p.id) === String(slug)
      ) || null
    );
  } catch (err) {
    console.error('Error fetching deal for OG image:', err);
    return null;
  }
}

export default async function Image({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const deal = await fetchDeal(slug);

  // Load favicon icon locally as base64
  let faviconBase64 = '';
  try {
    const faviconPath = path.join(process.cwd(), 'public/images/favicon.png');
    if (fs.existsSync(faviconPath)) {
      faviconBase64 = `data:image/png;base64,${fs.readFileSync(faviconPath).toString('base64')}`;
    }
  } catch {
    // fallback
  }

  if (!deal) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 800,
          }}
        >
          KaroDeal Deals & Cashback
        </div>
      ),
      { ...size }
    );
  }

  const title = cleanProductTitle(deal.title || 'Special Deal');
  const store = deal.storeRel || { name: 'Store', logoUrl: '' };
  const storeSlug = (store.slug || store.id || '').toLowerCase();

  // Dynamic Store Gradient - EXACT MATCH to StoreOfferCard.jsx
  let bgGradient = 'linear-gradient(135deg, #18181b 0%, #09090b 100%)';
  if (storeSlug === 'amazon') {
    bgGradient = 'linear-gradient(135deg, #F58529 0%, #D54400 100%)';
  } else if (storeSlug === 'flipkart') {
    bgGradient = 'linear-gradient(135deg, #3E8DFF 0%, #0151C8 100%)';
  } else if (storeSlug === 'myntra') {
    bgGradient = 'linear-gradient(135deg, #F04D9E 0%, #C90059 100%)';
  } else if (storeSlug === 'ajio') {
    bgGradient = 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)';
  } else if (storeSlug === 'meesho') {
    bgGradient = 'linear-gradient(135deg, #db2777 0%, #831843 100%)';
  }

  const cashback =
    deal.cashbackWithReview ??
    deal.cashback ??
    (deal.salePrice ? calculateCashback(deal.salePrice).withReview : 400);

  const cashbackType = storeSlug === 'flipkart' ? 'Cashback' : 'Rewards';
  const discount = deal.discount || 50;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          backgroundImage: bgGradient,
          padding: 44,
          position: 'relative',
          fontFamily: 'sans-serif',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Column: Logo + Title + Discount + Cashback + Offer Details Button */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '58%',
            height: '100%',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingRight: 24,
            boxSizing: 'border-box',
          }}
        >
          {/* Top: Store Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 90,
              height: 90,
              backgroundColor: '#ffffff',
              borderRadius: 24,
              padding: 12,
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            }}
          >
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: 20, fontWeight: 900, color: '#000000', textTransform: 'uppercase' }}>
                {store.name || 'DEAL'}
              </span>
            )}
          </div>

          {/* Middle: Title, Discount & Cashback */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '100%',
              margin: 'auto 0',
            }}
          >
            {/* Title */}
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.94)',
                fontSize: 25,
                fontWeight: 700,
                lineHeight: 1.25,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                overflow: 'hidden',
                marginBottom: 10,
              }}
            >
              {title}
            </span>

            {/* Discount Headline */}
            <span
              style={{
                color: '#ffffff',
                fontSize: 68,
                fontWeight: 900,
                letterSpacing: -2,
                lineHeight: 1,
                marginBottom: 16,
              }}
            >
              Upto {discount}% Off
            </span>

            {/* Cashback Pill Badge */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#171717',
                padding: '9px 18px',
                borderRadius: 14,
                gap: 10,
                border: '1px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {faviconBase64 ? (
                <img
                  src={faviconBase64}
                  alt="karo"
                  style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 5 }}
                />
              ) : null}
              <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: -0.4, color: '#171717' }}>
                Upto ₹{cashback} {cashbackType}
              </span>
            </div>
          </div>

          {/* Bottom: Offer Details Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '12px 28px',
              borderRadius: 9999,
              fontSize: 18,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            Offer Details
          </div>
        </div>

        {/* Right Column: Product Image (Exact 38% width with white container and contain fit) */}
        <div
          style={{
            display: 'flex',
            width: '38%',
            height: '100%',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 28,
            overflow: 'hidden',
            padding: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
          }}
        >
          {deal.image ? (
            <img
              src={deal.image}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 28,
              }}
            />
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
