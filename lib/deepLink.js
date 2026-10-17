/**
 * Deep Linking helper for E-commerce stores (Amazon, Flipkart, Myntra, etc.)
 * 
 * Behavior:
 * - On Mobile / Tablet (Android):
 *     Uses Android Intent with package name & fallback URL.
 *     If App is installed -> Directly launches the native app to the product.
 *     If App is NOT installed -> Gracefully loads the web fallback in browser.
 * - On Mobile / Tablet (iOS / iPadOS):
 *     Uses Universal Links without target="_blank" (target="_blank" blocks Universal Links in Safari).
 *     For Flipkart, uses official dl.flipkart.com/dl/ deep link.
 *     If App is installed -> iOS automatically opens the native app.
 *     If App is NOT installed -> Seamlessly opens in Safari.
 * - On Desktop / Laptop:
 *     Opens in a new browser tab normally.
 */

const STORE_CONFIG = {
  amazon: {
    name: 'Amazon',
    androidPackage: 'in.amazon.mShop.android.shopping',
    domains: ['amazon.in', 'www.amazon.in', 'amazon.com', 'www.amazon.com'],
  },
  flipkart: {
    name: 'Flipkart',
    androidPackage: 'com.flipkart.android',
    domains: ['flipkart.com', 'dl.flipkart.com', 'www.flipkart.com'],
  },
  myntra: {
    name: 'Myntra',
    androidPackage: 'com.myntra.android',
    domains: ['myntra.com', 'www.myntra.com'],
  },
  ajio: {
    name: 'Ajio',
    androidPackage: 'com.ril.ajio',
    domains: ['ajio.com', 'www.ajio.com'],
  },
  meesho: {
    name: 'Meesho',
    androidPackage: 'com.meesho.supply',
    domains: ['meesho.com', 'www.meesho.com'],
  },
  nykaa: {
    name: 'Nykaa',
    androidPackage: 'com.fsn.nykaa',
    domains: ['nykaa.com', 'www.nykaa.com'],
  },
};

/**
 * Identify store key from store identifier string or URL hostname
 */
export function identifyStore(url = '', storeIdentifier = '') {
  const s = String(storeIdentifier || '').toLowerCase();
  if (s.includes('amazon')) return 'amazon';
  if (s.includes('flipkart')) return 'flipkart';
  if (s.includes('myntra')) return 'myntra';
  if (s.includes('ajio')) return 'ajio';
  if (s.includes('meesho')) return 'meesho';
  if (s.includes('nykaa')) return 'nykaa';

  const u = String(url || '').toLowerCase();
  if (u.includes('amazon.') || u.includes('amzn.to') || u.includes('amzn.in')) return 'amazon';
  if (u.includes('flipkart.') || u.includes('fkrt.') || u.includes('fkrt.it')) return 'flipkart';
  if (u.includes('myntra.')) return 'myntra';
  if (u.includes('ajio.')) return 'ajio';
  if (u.includes('meesho.')) return 'meesho';
  if (u.includes('nykaa.')) return 'nykaa';

  return 'generic';
}

/**
 * Detect device type and OS (mobile, tablet, android, iOS)
 */
export function detectDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isMobile: false, isAndroid: false, isIOS: false };
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isAndroid = /android/i.test(ua);
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS

  const isMobileOrTablet =
    isAndroid ||
    isIOS ||
    /webOS|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua) ||
    (('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 1024);

  return {
    isMobile: isMobileOrTablet,
    isAndroid,
    isIOS,
  };
}

/**
 * Build Android Chrome Intent URL with browser fallback
 */
export function getAndroidDeepLink(url, storeKey) {
  if (!url) return '';
  const config = STORE_CONFIG[storeKey];
  if (!config || !config.androidPackage) {
    return url;
  }

  // Parse hostname to verify if the domain belongs directly to the store
  let hostname = '';
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname.toLowerCase();
  } catch (e) {
    return url;
  }

  const isDirectStoreDomain =
    config.domains && config.domains.some((d) => hostname === d || hostname.endsWith('.' + d));

  // If this is a short link (amzn.to, fkrt.it, bit.ly, etc.) or tracking URL:
  // Do NOT lock to package in Chrome Intent because Android rejects package intents for foreign domains.
  // Navigating directly allows Chrome to follow the redirect, where Android App Links intercepts the native app instantly!
  if (!isDirectStoreDomain) {
    return url;
  }

  // If it's Flipkart, dl.flipkart.com is the fastest universal deep link
  if (storeKey === 'flipkart') {
    return getIosDeepLink(url, 'flipkart');
  }

  // Clean URL: strip protocol and any hash '#' that breaks Chrome #Intent; syntax
  const urlWithoutHash = url.split('#')[0];
  const cleanUrl = urlWithoutHash.replace(/^https?:\/\//i, '');

  // Chrome on Android intent syntax:
  return `intent://${cleanUrl}#Intent;scheme=https;package=${config.androidPackage};S.browser_fallback_url=${encodeURIComponent(url)};end;`;
}

/**
 * Build iOS Universal Link URL
 */
export function getIosDeepLink(url, storeKey) {
  if (!url) return '';

  // Flipkart Universal Link optimization
  if (storeKey === 'flipkart') {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('flipkart.com') && !parsed.hostname.startsWith('dl.')) {
        let path = parsed.pathname;
        if (!path.startsWith('/dl/')) {
          path = '/dl' + (path.startsWith('/') ? path : '/' + path);
        }
        return `https://dl.flipkart.com${path}${parsed.search}${parsed.hash}`;
      }
    } catch (e) {
      // fallback to original url if parsing fails
    }
  }

  return url;
}

/**
 * Get device-specific smart URL
 */
export function getSmartStoreUrl(url, storeIdentifier = '') {
  if (!url) return '';
  const { isAndroid, isIOS, isMobile } = detectDevice();
  const storeKey = identifyStore(url, storeIdentifier);

  if (isAndroid) {
    return getAndroidDeepLink(url, storeKey);
  }
  if (isIOS) {
    return getIosDeepLink(url, storeKey);
  }
  return url;
}

/**
 * Trigger store redirect:
 * - Mobile / Tablet: Uses deep link to native app (or fallback browser)
 * - Desktop: Opens in new tab
 */
export function openStoreDeal({ url, store = '', onTrackClick = null }) {
  if (!url) return;

  // Execute click tracking callback immediately
  if (typeof onTrackClick === 'function') {
    try {
      onTrackClick();
    } catch (e) {}
  }

  const { isAndroid, isIOS, isMobile } = detectDevice();
  const storeKey = identifyStore(url, store);

  if (isAndroid) {
    const androidUrl = getAndroidDeepLink(url, storeKey);
    window.location.href = androidUrl;
    return;
  }

  if (isIOS) {
    const iosUrl = getIosDeepLink(url, storeKey);
    // Direct in-tab navigation allows iOS Universal Links to wake the installed app.
    // target="_blank" suppresses iOS Universal Links in Safari.
    window.location.href = iosUrl;
    return;
  }

  if (isMobile) {
    window.location.href = url;
    return;
  }

  // Desktop / Laptop: open in new tab
  window.open(url, '_blank', 'noopener,noreferrer');
}
