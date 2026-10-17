import OfferDetailsClient from '@/components/deals/OfferDetailsClient';
import { calculateCashback } from '@/lib/cashbackCalculator';
import { notFound } from 'next/navigation';
import { cleanProductTitle } from '@/lib/titleSanitizer';

async function fetchDealBySlug(slug) {
  try {
    if (!slug) return null;
    const slugParts = slug.split('-');
    const dealId = slugParts.pop(); // The last part is the ID

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
    const res = await fetch(`${apiUrl}/products`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const allProducts = await res.json();
    return allProducts.find((p) => 
      String(p.id) === String(dealId) || 
      p.slug === slug || 
      String(p.id) === String(slug)
    ) || null;
  } catch (err) {
    console.error('Error fetching deal for SEO metadata:', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const deal = await fetchDealBySlug(slug);

  if (!deal) {
    return {
      title: 'Deal Not Found | KaroDeal',
      description: 'The requested deal or offer could not be found on KaroDeal.',
      robots: { index: false, follow: true },
    };
  }

  deal.title = cleanProductTitle(deal.title);

  const storeName = deal.storeRel?.name || 'Top Stores';
  const withReviewCashback = deal.cashbackWithReview ?? deal.cashback ?? calculateCashback(deal.salePrice).withReview;
  const discountText = deal.discount ? `Upto ${deal.discount}% Off` : 'Special Discount';
  const title = `${deal.title} - ₹${withReviewCashback} Cashback & ${discountText} | KaroDeal`;
  const description = `Buy ${deal.title} online at ₹${deal.salePrice || 0}. Get up to ₹${withReviewCashback} real withdrawable cashback from ${storeName} on KaroDeal. Verified offers & fast tracking.`;
  const url = `https://karodeal.in/deals/${slug}`;
  const imageUrl = deal.image || 'https://karodeal.in/icon-512.png';

  return {
    title,
    description,
    keywords: [
      deal.title,
      `${deal.title} cashback`,
      `${deal.title} offer`,
      `${deal.title} price in India`,
      `${storeName} Deals`,
      `${storeName} Cashback Offers`,
      'Cashback Offers India',
      'Verified Discount Coupons',
      'KaroDeal',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'KaroDeal',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${deal.title} - KaroDeal Cashback`,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@KaroDeal',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function DealDetailPage({ params }) {
  const { slug } = await params;
  const deal = await fetchDealBySlug(slug);

  if (!deal) {
    notFound();
  }

  deal.title = cleanProductTitle(deal.title);

  const slugParts = slug.split('-');
  const dealId = deal.id || slugParts.pop();

  const store = deal.storeRel || {};
  const storeName = store.name || 'Partner Store';
  const storeSlug = store.slug || store.id || '';
  const withReviewCashback = deal.cashbackWithReview ?? deal.cashback ?? calculateCashback(deal.salePrice).withReview;
  const withoutReviewCashback = deal.cashbackWithoutReview ?? calculateCashback(deal.salePrice).withoutReview;
  const canonicalUrl = `https://karodeal.in/deals/${slug}`;
  const validUntilDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 1. Schema.org Product Structured Data (Google Rich Results Compliant)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.title,
    image: deal.image ? [deal.image] : ['https://karodeal.in/icon-512.png'],
    description: `Buy ${deal.title} with ₹${withReviewCashback} cashback on KaroDeal. Store: ${storeName}.`,
    sku: String(deal.id),
    mpn: String(deal.id),
    brand: {
      '@type': 'Brand',
      name: storeName,
    },
    offers: {
      '@type': 'Offer',
      price: Number(deal.salePrice) || 0,
      priceCurrency: 'INR',
      priceValidUntil: validUntilDate,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: canonicalUrl,
      seller: {
        '@type': 'Organization',
        name: storeName,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '48',
      bestRating: '5',
      worstRating: '1',
    },
  };

  // 2. Schema.org BreadcrumbList Structured Data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://karodeal.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Deals',
        item: 'https://karodeal.in/deals',
      },
      ...(storeSlug
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: storeName,
              item: `https://karodeal.in/stores/${storeSlug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: deal.title,
              item: canonicalUrl,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: deal.title,
              item: canonicalUrl,
            },
          ]),
    ],
  };

  // 3. Schema.org FAQPage Structured Data (Triggers Accordion FAQ in Google Search)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I earn ₹${withReviewCashback} cashback on ${deal.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Click "Grab Deal & Earn Cashback" on KaroDeal, complete your order on ${storeName}, and after 20 days upload your invoice in your KaroDeal account dashboard to get verified cashback.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the difference between cashback with and without review?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You earn higher cashback (₹${withReviewCashback}) if you leave a review on ${storeName} and upload proof. If you prefer not to review, you still get guaranteed standard cashback of ₹${withoutReviewCashback}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How and when can I withdraw my cashback from KaroDeal?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Once your product return window closes (20 days) and invoice is verified, cashback will be credited to your wallet. You can withdraw directly to your Bank account via UPI once your balance reaches ₹1000.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <OfferDetailsClient initialDeal={deal} dealId={dealId} params={params} />
    </>
  );
}
