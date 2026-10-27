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

  // Mac App Store listing. An absolute URL, so pages use it as is (no {{ROOT}} prefix).
  MAS_URL: 'https://apps.apple.com/us/app/screensort-auto-screenshot/id6827754596?mt=12',
  MAS_STATUS: 'macOS 15+ - Sandboxed',

  REQUIREMENTS: 'macOS 26 or later',

  // Pricing (locked 2026-10-27). The same $9.99 one-time price on screensort.app (Paddle)
  // and the Mac App Store. PRICE is the bare number for JSON-LD and the Terms.
  PRICE: '9.99',
  PRICE_LABEL: '$9.99 one-time',
  PRICE_LINE: '$9.99 one-time. 14-day free trial. Up to 3 Macs. 30-day money-back guarantee.',
  TRIAL_LABEL: '14-day free trial',
  DEVICE_LIMIT_LABEL: 'Up to 3 Macs per license',
  GUARANTEE_LABEL: '30-day money-back guarantee',

  // Paddle Billing for the direct-download license, live (set 2026-10-27). The client token
  // ('ScreenSort web') is public by design and only lets Paddle.js open checkouts. The price
  // is $9.99 USD one-time on product pro_01m5zq5dz82kh14amy4t9keq6n. If either is cleared,
  // the Buy License button shows a note pointing to the free trial and the Mac App Store
  // instead (src/buy.js).
  PADDLE_CLIENT_TOKEN: 'live_876d795c7328c72c492bdb863aa',
  PADDLE_PRICE_ID: 'pri_01m5zq684svy5drhjcj4e0a7tn',

  // Support and legal. The address never appears in the built HTML or JS: pages use the
  // email partials, which ship base64 placeholders that src/email.js decodes, and it is
  // kept in two parts so client code importing SITE (src/buy.js) never bundles it whole.
  SUPPORT_USER: 'support',
  SUPPORT_DOMAIN: 'screensort.app',
  SUPPORT_RESPONSE: 'within 2 business days',
  LEGAL_ENTITY: 'Scaile Studios LLC',
  LEGAL_EFFECTIVE: 'October 27, 2026',

  SITE_URL: 'https://screensort.app',
  YEAR: String(new Date().getFullYear()),
};
