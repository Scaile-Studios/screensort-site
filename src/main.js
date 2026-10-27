import './styles/main.css';
import './email.js';
import { initDemo } from './demo.js';
import { initGallery } from './gallery.js';
import { initBuy } from './buy.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const demo = document.querySelector('[data-demo]');
const demoApi = demo && initDemo(demo, { reduced });

const gallery = document.querySelector('[data-gallery]');
const lightbox = document.querySelector('[data-lightbox]');
if (gallery && lightbox) initGallery(gallery, lightbox);

document.querySelectorAll('[data-buy]').forEach(initBuy);

// Smart folders: the optional routing toggle.
const routing = document.querySelector('[data-routing-input]');
if (routing) {
  const grid = document.querySelector('[data-folders]');
  const note = document.querySelector('[data-routing-note]');
  const sync = () => {
    grid.classList.toggle('is-off', !routing.checked);
    note.textContent = routing.checked
      ? 'On: each capture moves into the subfolder that matches its content.'
      : 'Off: captures are renamed in place and stay where macOS saved them.';
  };
  routing.addEventListener('change', sync);
  sync();
}

// Dev-only handle for inspecting the demo from devtools or scripts.
if (import.meta.env.DEV) window.__screensort = { demo: demoApi };
