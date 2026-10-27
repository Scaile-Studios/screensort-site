// Sample captures for the hero banner demo. Shared by the build-time partials
// (the no-JS first frame) and the client demo (src/demo.js).

export const FOLDERS = [
  { id: 'receipts', name: 'Receipts & Invoices', color: 'coral' },
  { id: 'code', name: 'Code & Terminal', color: 'blue' },
  { id: 'ui', name: 'UI & Design', color: 'gold' },
  { id: 'chats', name: 'Chats & Docs', color: 'green' },
  { id: 'web', name: 'Web', color: 'violet' },
  { id: 'other', name: 'Other', color: 'slate' },
];

export const folderById = (id) => FOLDERS.find((f) => f.id === id) || FOLDERS[FOLDERS.length - 1];

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Small vector "screenshots", drawn on a 160x100 canvas so they stay crisp
// both as the banner thumbnail and in the Quick Look preview.
const art = (body) => `<svg viewBox="0 0 160 100" aria-hidden="true" focusable="false">${body}</svg>`;
const SANS = 'font-family="-apple-system,Helvetica,Arial"';

const ART = {
  invoice: art(`<rect width="160" height="100" fill="#fff"/>
<text x="12" y="20" font-size="11" font-weight="700" fill="#635bff" ${SANS}>stripe</text>
<text x="148" y="19" font-size="5" fill="#8a8f98" text-anchor="end" ${SANS}>Invoice SC-2026-Q3</text>
<text x="12" y="36" font-size="7.5" font-weight="700" fill="#1a1f36" ${SANS}>Q3 2026 Platform Fees</text>
<g fill="#e6e8ee"><rect x="12" y="46" width="136" height=".8"/><rect x="12" y="60" width="136" height=".8"/><rect x="12" y="74" width="136" height=".8"/></g>
<g fill="#525f7f" font-size="5" ${SANS}><text x="12" y="55">Payments processing</text><text x="148" y="55" text-anchor="end">$1,284.20</text><text x="12" y="69">Billing usage</text><text x="148" y="69" text-anchor="end">$312.48</text></g>
<text x="12" y="86" font-size="6" font-weight="700" fill="#1a1f36" ${SANS}>Total due</text>
<text x="148" y="86" font-size="6.5" font-weight="700" fill="#635bff" text-anchor="end" ${SANS}>$1,596.68</text>`),
  trace: art(`<rect width="160" height="100" fill="#0f1420"/>
<rect width="160" height="12" fill="#1a2030"/><circle cx="8" cy="6" r="2" fill="#ff5f57"/><circle cx="15" cy="6" r="2" fill="#febc2e"/><circle cx="22" cy="6" r="2" fill="#28c840"/>
<g font-size="5" font-family="Menlo,ui-monospace,monospace">
<text x="8" y="23" fill="#ff7b72">Thread 3: deadlock detected</text>
<text x="8" y="32" fill="#8b949e">0 SyncStore.flush() async</text>
<text x="8" y="41" fill="#79c0ff">1 actor CacheActor.write(_:)</text>
<text x="8" y="50" fill="#79c0ff">2 await store.flush()</text>
<text x="8" y="59" fill="#d2a8ff">3 Task.init(priority:)</text>
<text x="8" y="68" fill="#8b949e">4 swift_task_switch</text>
<text x="8" y="80" fill="#f59e0b">warning: actor reentrancy</text>
<text x="8" y="89" fill="#3fb950">$ swift test --filter Sync</text></g>`),
  spec: art(`<rect width="160" height="100" fill="#f4f1ea"/>
<rect x="40" y="14" width="80" height="72" rx="8" fill="#fff" stroke="#e5ded0"/>
<rect x="50" y="24" width="60" height="26" rx="4" fill="#fde7c2"/>
<rect x="50" y="56" width="44" height="4" rx="2" fill="#2b2b2b"/>
<rect x="50" y="64" width="56" height="3" rx="1.5" fill="#b7b2a8"/>
<rect x="50" y="74" width="60" height="7" rx="3.5" fill="#f59e0b"/>
<g stroke="#ff5a52" stroke-width=".7"><path d="M40 92h80M40 89v6M120 89v6"/><path d="M128 14v72M125 14h6M125 86h6"/></g>
<g fill="#ff5a52" font-size="5" ${SANS}><text x="80" y="99" text-anchor="middle">320</text><text x="134" y="52">24</text></g>
<g stroke="#3b82f6" stroke-width=".6" stroke-dasharray="1.5 1.5"><path d="M40 24h10M40 56h10"/></g>`),
  chat: art(`<rect width="160" height="100" fill="#fff"/>
<rect width="38" height="100" fill="#3f0e40"/>
<g fill="#cdb8ce" font-size="4.5" ${SANS}><text x="5" y="14" fill="#fff" font-weight="700">Channels</text><text x="5" y="26"># general</text><text x="5" y="44"># design</text></g>
<rect x="2" y="29" width="34" height="8" rx="2" fill="#1164a3"/><text x="5" y="35" fill="#fff" font-size="4.5" ${SANS}># projects</text>
<rect x="46" y="14" width="9" height="9" rx="2" fill="#f59e0b"/><text x="50.5" y="20.5" font-size="4" fill="#fff" text-anchor="middle" font-weight="700" ${SANS}>JA</text>
<text x="59" y="18" font-size="4.5" font-weight="700" fill="#1d1c1d" ${SANS}>John Adams</text>
<g fill="#d8d8d8"><rect x="59" y="22" width="80" height="2.6" rx="1.3"/><rect x="59" y="27" width="64" height="2.6" rx="1.3"/></g>
<rect x="46" y="38" width="104" height="44" rx="4" fill="#f8f8f8" stroke="#e2e2e2"/>
<text x="52" y="47" font-size="5" font-weight="700" fill="#1d1c1d" ${SANS}>Project notes</text>
<g fill="#22c55e"><circle cx="54" cy="55" r="1.6"/><circle cx="54" cy="63" r="1.6"/><circle cx="54" cy="71" r="1.6"/></g>
<g fill="#c4c4c4"><rect x="59" y="54" width="70" height="2.4" rx="1.2"/><rect x="59" y="62" width="58" height="2.4" rx="1.2"/><rect x="59" y="70" width="76" height="2.4" rx="1.2"/></g>`),
};

export const SAMPLES = [
  { id: 'invoice', label: 'Stripe invoice', original: 'Screenshot 2026-10-27 at 2.14.09 PM.png', slug: 'stripe-q3-invoice', folder: 'receipts', art: ART.invoice },
  { id: 'trace', label: 'Crash trace', original: 'Screenshot 2026-10-27 at 3.41.22 PM.png', slug: 'swift-actor-deadlock-trace', folder: 'code', art: ART.trace },
  { id: 'spec', label: 'Design spec', original: 'Screenshot 2026-10-27 at 4.05.18 PM.png', slug: 'onboarding-card-spacing-spec', folder: 'ui', art: ART.spec },
  { id: 'chat', label: 'Chat notes', original: 'Screenshot 2026-10-27 at 5.19.44 PM.png', slug: 'john-adams-project-notes', folder: 'chats', art: ART.chat },
];

// Menu bar clock time for a sample, e.g. "2:14 PM".
export const sampleTime = (s) => {
  const [, h, m, ap] = s.original.match(/at (\d+)\.(\d+)\.\d+ (AM|PM)/);
  return `${h}:${m} ${ap}`;
};
