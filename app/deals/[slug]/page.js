import OfferDetailsClient from '@/components/deals/OfferDetailsClient';
import { calculateCashback } from '@/lib/cashbackCalculator';
import { notFound } from 'next/navigation';

async function fetchDealBySlug(slug) {
  try {
    if (!slug) return null;
    const slugParts = slug.split('-');
    const dealId = slugParts.pop(); // The last part is the ID

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
    const res = await fetch(`${apiUrl}/products`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const allProducts = await res.json();
    return allProducts.find((p) => String(p.id) === String(dealId)) || null;
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

  const storeName = deal.storeRel?.name || 'Top Stores';
  const withReviewCashback = deal.cashbackWithReview ?? deal.cashback ?? calculateCashback(deal.salePrice).withReview;
  const title = `${deal.title} - Get ₹${withReviewCashback} Cashback | KaroDeal`;
  const description = `Buy ${deal.title} online at ₹${deal.salePrice} (Upto ${deal.discount}% OFF). Claim up to ₹${withReviewCashback} real cashback from ${storeName} on KaroDeal.`;
  const url = `https://karodeal.in/deals/${slug}`;
  const imageUrl = deal.image || 'https://karodeal.in/icon-512.png';

  return {
    title,
    description,
    keywords: [
      deal.title,
      `${storeName} Deals`,
      'Cashback Offers',
      'Discount Coupons',
      'India Online Shopping',
      'KaroDeal Offers',
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
          alt: deal.title,
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
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
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

  const slugParts = slug.split('-');
  const dealId = slugParts.pop();

  const storeName = deal.storeRel?.name || 'Partner Store';
  const withReviewCashback = deal.cashbackWithReview ?? deal.cashback ?? calculateCashback(deal.salePrice).withReview;
  const canonicalUrl = `https://karodeal.in/deals/${slug}`;

  // Schema.org Product Structured Data
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.title,
    image: deal.image ? [deal.image] : ['https://karodeal.in/icon-512.png'],
    description: `Buy ${deal.title} with ₹${withReviewCashback} cashback on KaroDeal. Store: ${storeName}.`,
    offers: {
      '@type': 'Offer',
      price: deal.salePrice || 0,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: canonicalUrl,
      seller: {
        '@type': 'Organization',
        name: storeName,
      },
    },
  };

  // Schema.org BreadcrumbList Structured Data
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
      {
        '@type': 'ListItem',
        position: 3,
        name: deal.title,
        item: canonicalUrl,
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
      <OfferDetailsClient initialDeal={deal} dealId={dealId} params={params} />
    </>
  );
}
