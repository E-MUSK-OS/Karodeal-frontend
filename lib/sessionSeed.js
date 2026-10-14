/**
 * Helper to get or create a stable session seed for the user.
 * Ensures consistent browsing order within the user's session,
 * while ensuring different users see distinct mixes.
 */
export function getSessionSeed() {
  if (typeof window === 'undefined') {
    return '';
  }
  try {
    let seed = sessionStorage.getItem('karodeal_feed_seed');
    if (!seed) {
      seed = 'kd_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('karodeal_feed_seed', seed);
    }
    return seed;
  } catch (e) {
    return '';
  }
}
