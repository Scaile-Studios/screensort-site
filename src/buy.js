// Paddle overlay checkout for the Buy License button ([data-buy]).
// Paddle.js is a third-party script, so it loads only when someone shows intent
// (hover, focus or click on Buy) and the load is cached, so it happens once.
// Until PADDLE_CLIENT_TOKEN and PADDLE_PRICE_ID are both set in site.config.js,
// the button shows a note pointing to the free trial and the Mac App Store.
// Without JS the button is a plain link to the pricing FAQ on the support page.

import { SITE } from './site.config.js';
import { emailLink } from './email.js';

export const PADDLE_JS = 'https://cdn.paddle.com/paddle/v2/paddle.js';

const configured = () => Boolean(SITE.PADDLE_CLIENT_TOKEN && SITE.PADDLE_PRICE_ID);

let paddleReady = null;
// The note of the button that opened the checkout. Paddle.Initialize takes one
// eventCallback for the page, so events are routed through this.
let activeNote = null;

function setNote(note, ...parts) {
  if (!note) return;
  note.textContent = '';
  note.append(...parts);
}

const link = (href, label) => Object.assign(document.createElement('a'), { href, textContent: label });
const support = () => emailLink(SITE.SUPPORT_USER, SITE.SUPPORT_DOMAIN);
const trialLink = () => link(document.querySelector('[data-trial]')?.href ?? SITE.DOWNLOAD_URL, 'Download the 14-day free trial');
const masLink = () => link(SITE.MAS_URL, 'Mac App Store');

export function showUnavailable(note) {
  setNote(note, 'Online checkout opens soon. ', trialLink(),
    ' now and buy your license when checkout is live, or get ScreenSort on the ', masLink(), ` for ${SITE.PRICE_LABEL}.`);
}

export function showFallback(note) {
  setNote(note, 'Checkout could not open. Please try again, or email ', support(),
    ' and we will sort it out. ', trialLink(), ' in the meantime, or buy on the ', masLink(), '.');
}

export function showThanks(note, email) {
  setNote(note,
    `Thanks for buying ScreenSort! Your license key is on its way by email to ${email || 'the address you entered at checkout'}. `
    + 'Paddle sends your receipt separately. Nothing after 15 minutes? Check spam, or email ', support(), '.');
}

function onPaddleEvent(event) {
  if (event?.name === 'checkout.completed') {
    showThanks(activeNote, event.data?.customer?.email);
  } else if (event?.name === 'checkout.error') {
    console.warn('Paddle checkout error:', event.error ?? event.data);
    showFallback(activeNote);
  }
}

// Loads and initializes Paddle.js once. A failed load clears the cache so the
// next click retries.
export function loadPaddle() {
  paddleReady ??= new Promise((resolve, reject) => {
    if (window.Paddle) return resolve(window.Paddle);
    const script = document.createElement('script');
    script.src = PADDLE_JS;
    script.async = true;
    script.onload = () => (window.Paddle ? resolve(window.Paddle) : reject(new Error('Paddle.js loaded without Paddle')));
    script.onerror = () => reject(new Error('Paddle.js failed to load'));
    document.head.append(script);
  }).then((Paddle) => {
    Paddle.Initialize({ token: SITE.PADDLE_CLIENT_TOKEN, eventCallback: onPaddleEvent });
    return Paddle;
  });
  paddleReady.catch(() => { paddleReady = null; });
  return paddleReady;
}

export function checkoutOptions() {
  return {
    items: [{ priceId: SITE.PADDLE_PRICE_ID, quantity: 1 }],
    settings: { displayMode: 'overlay', theme: 'dark', locale: 'en' },
  };
}

export function initBuy(button) {
  const note = button.closest('.get-card')?.querySelector('[data-buy-note]');
  if (configured()) {
    const warm = () => loadPaddle().catch(() => {});
    button.addEventListener('pointerenter', warm, { once: true });
    button.addEventListener('focus', warm, { once: true });
  }
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    activeNote = note;
    setNote(note);
    if (!configured()) return showUnavailable(note);
    try {
      const Paddle = await loadPaddle();
      Paddle.Checkout.open(checkoutOptions());
    } catch (err) {
      console.warn('Checkout unavailable:', err);
      showFallback(note);
    }
  });
}
