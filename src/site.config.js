// Single place for values that may change between releases. Everything here is
// substituted into the HTML at build time ({{KEY}} placeholders) and is also
// importable from client code.

export const SITE = {
  // The current versioned DMG in public/download/, relative to the site root (pages prefix
  // it with {{ROOT}}). Every Download link points here directly; public/_redirects and
  // vercel.json send the stable /download/ScreenSort.dmg to the same file.
  DOWNLOAD_URL: 'download/ScreenSort-1.0.dmg',
  VERSION: '1.0',
  DOWNLOAD_BADGE: 'v1.0 - macOS 26+ - Apple Silicon &amp; Intel',

  // Mac App Store listing. Until the listing is live, the button scrolls to the
  // #mac-app-store section on the home page (prefix with {{ROOT}}). Replace with the apps.apple.com URL at launch.
  MAS_URL: '#mac-app-store',
  MAS_STATUS: 'Coming soon',

  REQUIREMENTS: 'macOS 26 or later',

  // Support and legal. The address never appears in the built HTML: pages use the
  // email partials, which ship base64 placeholders that src/email.js decodes.
  SUPPORT_EMAIL: 'support@screensort.app',
  SUPPORT_RESPONSE: 'within 2 business days',
  LEGAL_ENTITY: 'Scaile Studios LLC',
  LEGAL_EFFECTIVE: 'October 27, 2026',

  SITE_URL: 'https://screensort.app',
  YEAR: String(new Date().getFullYear()),
};
