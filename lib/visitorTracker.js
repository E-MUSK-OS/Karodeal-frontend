/**
 * Karodeal Anonymous Visitor Tracking Utility
 * Privacy-compliant, non-fingerprinting, multi-tab safe duration and engagement tracker.
 */

// Generate a secure UUID v4 with fallbacks
export function generateUUID() {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch (e) {
        // Fallback if randomUUID fails in insecure context
      }
    }
    if (typeof crypto.getRandomValues === 'function') {
      try {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      } catch (e) {}
    }
  }
  // Math.random high-entropy fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const VISITOR_ID_KEY = 'karodeal_visitor_id';
const SESSION_ID_KEY = 'karodeal_session_id';
const SESSION_TIME_KEY = 'karodeal_session_last_active';
const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes session timeout

let inMemoryVisitorId = null;
let inMemorySessionId = null;
let inMemorySessionTime = Date.now();

/**
 * Get or create anonymous visitor ID (persists across visits)
 */
export function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return generateUUID();

  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId || visitorId.length < 8) {
      visitorId = generateUUID();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  } catch (e) {
    // If storage restricted / private mode without local storage
    if (!inMemoryVisitorId) {
      inMemoryVisitorId = generateUUID();
    }
    return inMemoryVisitorId;
  }
}

/**
 * Get or create visit session ID (resets after 30 minutes of inactivity)
 */
export function getOrCreateSessionId() {
  if (typeof window === 'undefined') return generateUUID();

  const now = Date.now();
  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    const lastActiveStr = localStorage.getItem(SESSION_TIME_KEY);
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

    const isExpired = !lastActive || now - lastActive > SESSION_EXPIRY_MS;

    if (!sessionId || isExpired) {
      sessionId = generateUUID();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    localStorage.setItem(SESSION_TIME_KEY, now.toString());
    return sessionId;
  } catch (e) {
    if (!inMemorySessionId || now - inMemorySessionTime > SESSION_EXPIRY_MS) {
      inMemorySessionId = generateUUID();
    }
    inMemorySessionTime = now;
    return inMemorySessionId;
  }
}

/**
 * Update session active timestamp
 */
export function touchSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_TIME_KEY, Date.now().toString());
  } catch (e) {
    inMemorySessionTime = Date.now();
  }
}

/**
 * Safe beacon or fetch dispatcher for analytics
 */
export function sendAnalyticsEvent(endpoint, data, isExit = false) {
  if (typeof window === 'undefined') return;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
  const url = `${apiUrl}/analytics/${endpoint}`;
  const payloadStr = JSON.stringify(data);

  if (isExit && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payloadStr], { type: 'text/plain;charset=UTF-8' });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    } catch (e) {
      // Fallback to fetch if sendBeacon fails
    }
  }

  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadStr,
      keepalive: isExit,
      cache: 'no-store'
    }).catch(() => {
      // Fail silently to avoid breaking visitor experience
    });
  } catch (e) {
    // Fail silently
  }
}
