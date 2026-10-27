// Build-time HTML partials. vite.config.js expands <!-- @partial name --> and
// {{KEY}} placeholders in every page, so the shipped HTML is complete without JS.

import { SITE } from './site.config.js';
import { SAMPLES, FOLDERS, folderById, esc, sampleTime } from './samples.js';

const svg = (viewBox, body, cls = '') =>
  `<svg${cls ? ` class="${cls}"` : ''} viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;

export const ICONS = {
  apple: svg('0 0 14 17', '<path d="M11.6 9c0-2 1.7-3 1.8-3a3.9 3.9 0 00-3-1.7c-1.3-.1-2.5.8-3.2.8s-1.7-.7-2.8-.7A4.1 4.1 0 001 6.6c-1.5 2.6-.4 6.4 1 8.5.7 1 1.5 2.1 2.6 2.1s1.4-.7 2.7-.7 1.6.7 2.7.7 1.8-1 2.5-2a8 8 0 001.1-2.3A3.6 3.6 0 0111.6 9zM9.5 2.9A3.6 3.6 0 0010.3.3a3.7 3.7 0 00-2.4 1.2 3.4 3.4 0 00-.9 2.5 3 3 0 002.5-1.1z" fill="currentColor"/>'),
  // The ScreenSort menu bar glyph: capture corners around a crosshair (template style).
  glyph: svg('0 0 16 16', '<path d="M1.5 5V2.8c0-.7.6-1.3 1.3-1.3H5M11 1.5h2.2c.7 0 1.3.6 1.3 1.3V5M14.5 11v2.2c0 .7-.6 1.3-1.3 1.3H11M5 14.5H2.8c-.7 0-1.3-.6-1.3-1.3V11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="8" r="2.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 3.6v2.2M8 10.2v2.2M3.6 8h2.2M10.2 8h2.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'),
  folder: svg('0 0 16 16', '<path d="M1.5 4.2c0-.7.6-1.2 1.2-1.2h3.4l1.5 1.6h5.7c.7 0 1.2.5 1.2 1.2v6.5c0 .7-.5 1.2-1.2 1.2H2.7c-.6 0-1.2-.5-1.2-1.2z" fill="currentColor"/>'),
  look: svg('0 0 16 16', '<circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.4 10.4L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'),
  undo: svg('0 0 16 16', '<path d="M5.5 3L2.5 6l3 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 6h6.5a4 4 0 010 8H7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'),
  chevron: svg('0 0 10 10', '<path d="M2.5 4l2.5 2.5L7.5 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  check: svg('0 0 16 16', '<path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  download: svg('0 0 16 16', '<path d="M8 2v8.5M4.5 7.5L8 11l3.5-3.5M2.5 13.5h11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
  wifi: svg('0 0 16 16', '<path d="M8 13.5l2-2a2.8 2.8 0 00-4 0zM3.8 9.3l1.4 1.4a4 4 0 015.6 0l1.4-1.4a6 6 0 00-8.4 0zM1 6.5l1.4 1.4a8 8 0 0111.2 0L15 6.5a10 10 0 00-14 0z" fill="currentColor"/>'),
  battery: svg('0 0 26 12', '<rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor"/><rect x="23.5" y="4" width="1.5" height="4" rx=".7" fill="currentColor" opacity=".5"/>'),
  close: svg('0 0 16 16', '<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
  left: svg('0 0 16 16', '<path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  right: svg('0 0 16 16', '<path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
  zoom: svg('0 0 16 16', '<path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5L9 7M2.5 13.5L7 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  capture: svg('0 0 16 16', '<path d="M1.5 5V1.5H5M11 1.5h3.5V5M14.5 11v3.5H11M5 14.5H1.5V11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8" r="2.5" fill="currentColor"/>'),
  drag: svg('0 0 16 16', '<path d="M8 1.5v13M1.5 8h13M8 1.5L6 3.5M8 1.5l2 2M8 14.5l-2-2M8 14.5l2-2M1.5 8l2-2M1.5 8l2 2M14.5 8l-2-2M14.5 8l-2 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  pause: svg('0 0 16 16', '<rect x="4" y="3" width="2.6" height="10" rx="1" fill="currentColor"/><rect x="9.4" y="3" width="2.6" height="10" rx="1" fill="currentColor"/>'),
  mail: svg('0 0 16 16', '<rect x="1.5" y="3.5" width="13" height="9" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 4.5l6 4.5 6-4.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>'),
  hash: svg('0 0 16 16', '<path d="M6 2L4.8 14M11.2 2L10 14M2.5 5.5h11.5M2 10.5h11.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'),
  bubble: svg('0 0 16 16', '<path d="M8 2.2c3.6 0 6.5 2.3 6.5 5.2S11.6 12.6 8 12.6c-.7 0-1.4-.1-2-.3L2.5 13.8l1-2.8C2.3 10 1.5 8.8 1.5 7.4 1.5 4.5 4.4 2.2 8 2.2z" fill="currentColor"/>'),
  finder: svg('0 0 16 16', '<rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.5v13" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="6" r=".9" fill="currentColor"/><circle cx="11" cy="6" r=".9" fill="currentColor"/><path d="M4.5 10.5c2 1.3 5 1.3 7 0" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>'),
  lock: svg('0 0 16 16', '<rect x="3" y="7" width="10" height="7.5" rx="1.6" fill="currentColor"/><path d="M5 7V5a3 3 0 016 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/>'),
  mail2: svg('0 0 20 20', '<rect x="2" y="4" width="16" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 5.5l7 5.5 7-5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'),
};

const navLinks = (home) => {
  const p = home ? '' : '/';
  return `<a href="${p}#demo">Demo</a><a href="${p}#features">Features</a><a href="${p}#privacy">Privacy</a><a href="/support/">Support</a>`;
};

function nav(home) {
  return `<a class="skip" href="#main">Skip to content</a>
<nav class="nav" aria-label="Main"><div class="wrap nav-in">
  <a class="brand" href="/" aria-label="ScreenSort home"><img src="/img/screensort-icon-128.png" width="30" height="30" alt="">ScreenSort</a>
  <div class="nav-links">${navLinks(home)}<a class="nav-cta" href="${SITE.DOWNLOAD_URL}">${ICONS.download}Download</a></div>
</div></nav>`;
}

const footer = () => `<footer class="footer"><div class="wrap footer-in">
  <div class="footer-brand">
    <a class="brand" href="/" aria-label="ScreenSort home"><img src="/img/screensort-icon-128.png" width="34" height="34" alt="" loading="lazy">ScreenSort</a>
    <p>Screenshots, named and sorted automatically. 100% on-device.</p>
    <p class="footer-fine">&copy; ${SITE.YEAR} ${SITE.LEGAL_ENTITY}. Mac, macOS, Apple Intelligence and Mac App Store are trademarks of Apple Inc.</p>
  </div>
  <nav class="footer-links" aria-label="Product">
    <h2>Product</h2><a href="/#features">Features</a><a href="/#gallery">Screenshots</a><a href="${SITE.DOWNLOAD_URL}">Download</a><a href="/#mac-app-store">Mac App Store</a>
  </nav>
  <nav class="footer-links" aria-label="Help and legal">
    <h2>Help</h2><a href="/support/">Support</a><a href="/privacy/">Privacy Policy</a><a href="/terms/">Terms of Use</a><a href="mailto:${SITE.APP_SUPPORT_EMAIL}">${SITE.APP_SUPPORT_EMAIL}</a><a href="mailto:${SITE.SUPPORT_EMAIL}">${SITE.SUPPORT_EMAIL}</a>
  </nav>
</div></footer>`;

const head = () => `<meta name="theme-color" content="#0B0D13">
  <meta name="color-scheme" content="dark">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

// ---- Hero demo -------------------------------------------------------------

const folderMenu = (current) => `<ul class="menu" role="menu" data-folder-menu hidden aria-label="Move to folder">${FOLDERS.map((f) =>
  `<li role="none"><button type="button" role="menuitemradio" aria-checked="${f.id === current}" data-folder="${f.id}" data-color="${f.color}"><span class="dot"></span>${esc(f.name)}${ICONS.check}</button></li>`).join('')}</ul>`;

function banner() {
  const s = SAMPLES[0];
  const f = folderById(s.folder);
  return `<div class="banner" data-banner aria-label="ScreenSort notification">
  <button type="button" class="bn-thumb" data-thumb aria-label="Drag ${s.slug}.png into an app below, or press Enter to try it">${s.art}</button>
  <div class="bn-text">
    <p class="bn-old" data-old>${esc(s.original)}</p>
    <div class="bn-name-row">
      <button type="button" class="bn-name" data-name title="Click to rename"><span data-slug>${s.slug}</span><span class="ext">.png</span></button>
      <input class="bn-input" data-input type="text" spellcheck="false" autocomplete="off" aria-label="New filename. Return saves, Escape cancels" hidden>
    </div>
    <div class="bn-meta">
      <div class="bn-folder">
        <button type="button" class="badge" data-folder-btn data-color="${f.color}" aria-haspopup="menu" aria-expanded="false">${ICONS.folder}<span data-folder-name>${esc(f.name)}</span>${ICONS.chevron}</button>
        ${folderMenu(f.id)}
      </div>
      <span class="paused" data-paused hidden>${ICONS.pause}<span data-paused-text>Auto-dismiss paused while dragging</span></span>
    </div>
  </div>
  <div class="bn-actions">
    <button type="button" class="bn-btn" data-ql aria-haspopup="dialog">${ICONS.look}<span>Quick Look</span></button>
    <button type="button" class="bn-btn pri" data-undo aria-pressed="false">${ICONS.undo}<span data-undo-label>Undo</span></button>
  </div>
  <div class="bn-progress" aria-hidden="true"><span data-progress></span></div>
</div>`;
}

const DOCK = [
  ['Slack', 'hash', 'violet'], ['Mail', 'mail', 'blue'], ['Messages', 'bubble', 'green'], ['Finder', 'finder', 'slate'],
];

function demo() {
  const s = SAMPLES[0];
  const chips = SAMPLES.map((x, i) => {
    const f = folderById(x.folder);
    return `<button type="button" class="chip" role="radio" aria-checked="${i === 0}" data-sample="${x.id}" data-color="${f.color}"><span class="dot"></span>${esc(x.label)}</button>`;
  }).join('');
  const dock = DOCK.map(([name, icon, color]) =>
    `<div class="dz" data-drop="${name}" data-color="${color}"><span class="dz-icon">${ICONS[icon]}</span><span class="dz-name">${name}</span><span class="dz-file" data-dz-file></span></div>`).join('');
  return `<div class="desk" data-desk>
  <div class="mbar">
    <div class="mbar-left" aria-hidden="true"><span class="mbar-apple">${ICONS.apple}</span><b>Finder</b><span>File</span><span>Edit</span><span class="mb-hide-s">View</span><span class="mb-hide-s">Go</span><span class="mb-hide-s">Window</span><span class="mb-hide-s">Help</span></div>
    <div class="mbar-right">
      <button type="button" class="mb-icon" data-mb-icon aria-expanded="false" aria-controls="recent-renames" aria-label="ScreenSort menu: Recent Renames">${ICONS.glyph}</button>
      <span class="mb-sys" aria-hidden="true">${ICONS.wifi}<span class="mb-hide-s">100%</span>${ICONS.battery}<span class="mb-clock"><span class="mb-hide-s">Tue Oct 27&nbsp;</span><span data-clock>${sampleTime(s)}</span></span></span>
    </div>
  </div>
  <div class="recent" id="recent-renames" data-recent hidden>
    <div class="recent-head"><img src="/img/screensort-icon-128.png" width="18" height="18" alt=""><b>Recent Renames</b><span class="recent-count" data-recent-count></span></div>
    <ol class="recent-list" data-recent-list><li class="recent-empty">Captures you take in this demo show up here.</li></ol>
    <div class="recent-foot"><span>Launch at Login</span><span class="switch on" aria-hidden="true"></span></div>
  </div>
  <div class="banner-slot" data-slot>${banner()}</div>
  <div class="stage" data-stage aria-hidden="true">
    <div class="stage-win"><div class="stage-bar"><i></i><i></i><i></i></div><div class="stage-art" data-stage-art>${s.art}</div><div class="marquee" data-marquee></div></div>
    <div class="flash" data-flash></div>
  </div>
  <div class="dock" data-dock aria-label="Drop targets">${dock}</div>
  <div class="ghost" data-ghost aria-hidden="true" hidden><span class="ghost-thumb" data-ghost-art></span><span class="ghost-name" data-ghost-name></span></div>
  <p class="sr-only" data-live aria-live="polite"></p>
</div>
<div class="demo-controls">
  <div class="chips" role="radiogroup" aria-label="Sample capture">${chips}</div>
  <div class="demo-btns">
    <button type="button" class="btn sm pri" data-capture>${ICONS.capture}Simulate Capture <kbd>Cmd-Shift-4</kbd></button>
    <button type="button" class="btn sm ghost-btn" data-test-drag="Slack">${ICONS.drag}Test Drag to Slack</button>
    <button type="button" class="btn sm ghost-btn" data-test-drag="Mail">${ICONS.drag}Test Drag to Mail</button>
  </div>
</div>
<dialog class="quicklook" data-quicklook aria-labelledby="ql-title">
  <div class="ql-bar"><button type="button" class="ql-close" data-ql-close aria-label="Close Quick Look">${ICONS.close}</button><span id="ql-title" data-ql-title>${s.slug}.png</span><span class="ql-folder" data-ql-folder></span></div>
  <div class="ql-art" data-ql-art></div>
</dialog>`;
}

// ---- Gallery ---------------------------------------------------------------

export const SLIDES = [
  ['mas-1-hero-instant-rename', 'Instant On-Device Naming', 'Every capture gets a clean, searchable filename in under a second.'],
  ['mas-2-drag-to-attach', 'Drag Straight from the Banner', 'Grab the renamed thumbnail and drop it into Slack, Mail, Linear or Cursor.'],
  ['mas-3-smart-category-folders', 'Smart Category Folders', 'Receipts, code, designs and chats land in their own folders automatically.'],
  ['mas-4-menubar-edit-undo', 'Menu Bar Control & Undo', 'Rename, move, preview or undo the last 10 captures from the menu bar.'],
  ['mas-5-on-device-private', '100% On-Device Privacy', 'Apple Intelligence and Vision OCR run locally. Nothing leaves your Mac.'],
];

function gallery() {
  const tabs = SLIDES.map(([id, title], i) =>
    `<button type="button" role="tab" id="g-tab-${i}" aria-controls="g-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-g-tab="${i}"><span class="g-num">0${i + 1}</span>${esc(title)}</button>`).join('');
  const panels = SLIDES.map(([id, title, caption], i) =>
    `<figure class="g-panel${i === 0 ? ' is-active' : ''}" role="tabpanel" id="g-panel-${i}" aria-labelledby="g-tab-${i}" data-g-panel="${i}">
      <button type="button" class="g-zoom" data-g-zoom="${i}" aria-label="Zoom: ${esc(title)}">
        <img src="/img/${id}-1440.png" srcset="/img/${id}-1440.png 1440w, /img/${id}.png 2880w" sizes="(min-width: 1180px) 1100px, 94vw" width="2880" height="1800" alt="${esc(title)}: ${esc(caption)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        <span class="g-zoom-hint">${ICONS.zoom}Click to zoom</span>
      </button>
      <figcaption><b>${esc(title)}.</b> ${esc(caption)}</figcaption>
    </figure>`).join('\n');
  return `<div class="gallery" data-gallery>
  <div class="g-tabs" role="tablist" aria-label="Product screenshots">${tabs}</div>
  <div class="g-stage">
    ${panels}
    <button type="button" class="g-nav g-prev" data-g-prev aria-label="Previous screenshot">${ICONS.left}</button>
    <button type="button" class="g-nav g-next" data-g-next aria-label="Next screenshot">${ICONS.right}</button>
  </div>
  <p class="g-hint"><span data-g-count>1 / ${SLIDES.length}</span> Use the arrow keys to browse. Click a slide to zoom.</p>
</div>
<dialog class="lightbox" data-lightbox aria-label="Screenshot viewer">
  <img data-lb-img alt="" width="2880" height="1800">
  <p class="lb-cap" data-lb-cap></p>
  <button type="button" class="lb-btn lb-close" data-lb-close aria-label="Close">${ICONS.close}</button>
  <button type="button" class="lb-btn lb-prev" data-lb-prev aria-label="Previous screenshot">${ICONS.left}</button>
  <button type="button" class="lb-btn lb-next" data-lb-next aria-label="Next screenshot">${ICONS.right}</button>
</dialog>`;
}

// ---- Smart folders grid ----------------------------------------------------

const FOLDER_EXAMPLES = {
  receipts: ['stripe-q3-invoice.png', 'aws-october-bill.png', 'delta-flight-receipt.png'],
  code: ['swift-actor-deadlock-trace.png', 'xcode-build-error-log.png', 'git-rebase-conflict.png'],
  ui: ['onboarding-card-spacing-spec.png', 'settings-dark-mode-mock.png', 'figma-icon-grid.png'],
  chats: ['john-adams-project-notes.png', 'launch-plan-doc-outline.png', 'imessage-address-thread.png'],
  web: ['apple-developer-news.png', 'hacker-news-swift-thread.png', 'flight-status-page.png'],
  other: ['wallpaper-color-sample.png', 'map-pin-dinner-spot.png', 'photo-booth-capture.png'],
};

const folders = () => `<div class="folders" data-folders>${FOLDERS.map((f) => `<article class="fcard" data-color="${f.color}">
  <div class="fcard-head"><span class="fcard-icon">${ICONS.folder}</span><h3>${esc(f.name)}</h3></div>
  <ul>${FOLDER_EXAMPLES[f.id].map((n) => `<li><code>${n}</code></li>`).join('')}</ul>
</article>`).join('')}</div>`;

export const PARTIALS = {
  head,
  'nav-home': () => nav(true),
  nav: () => nav(false),
  footer,
  demo,
  gallery,
  folders,
};

// Expands partials first (they may contain {{KEY}}), then config keys.
export function renderHtml(html) {
  return html
    .replace(/<!--\s*@partial\s+([\w-]+)\s*-->/g, (m, name) => {
      if (!PARTIALS[name]) throw new Error(`Unknown partial: ${name}`);
      return PARTIALS[name]();
    })
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => {
      if (!(key in SITE)) throw new Error(`Unknown site config key: ${key}`);
      return String(SITE[key]);
    });
}
