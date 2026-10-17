/**
 * Clean product titles by stripping unwanted scraper modal text,
 * dialog window prefixes, and excess whitespace.
 * e.g., "This is a modal window. Roadster The Lifestyle..." -> "Roadster The Lifestyle..."
 */
export function cleanProductTitle(rawTitle) {
  if (!rawTitle) return '';
  return String(rawTitle)
    .replace(/^This is a modal window\.\s*/i, '')
    .replace(/^Beginning of dialog window\.\s*/i, '')
    .replace(/^Escape will cancel and close the window\.\s*/i, '')
    .trim();
}
