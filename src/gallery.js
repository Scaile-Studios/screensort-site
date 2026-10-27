// The 5-slide screenshot gallery: ARIA tabs, prev/next, arrow keys, swipe,
// and a click-to-zoom lightbox that loads the full 2880px Retina slide.

export function initGallery(root, lightbox) {
  const tabs = [...root.querySelectorAll('[data-g-tab]')];
  const panels = [...root.querySelectorAll('[data-g-panel]')];
  const count = root.querySelector('[data-g-count]');
  const lbImg = lightbox.querySelector('[data-lb-img]');
  const lbCap = lightbox.querySelector('[data-lb-cap]');
  const n = panels.length;
  let index = 0;
  let inView = false;

  const imgOf = (i) => panels[i].querySelector('img');

  function select(i, { focusTab = false } = {}) {
    index = (i + n) % n;
    tabs.forEach((t, j) => {
      const on = j === index;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p, j) => p.classList.toggle('is-active', j === index));
    count.textContent = `${index + 1} / ${n}`;
    if (focusTab) tabs[index].focus();
    // Warm the next slide so arrowing through feels instant.
    const next = imgOf((index + 1) % n);
    if (next.loading === 'lazy') next.loading = 'eager';
    if (lightbox.open) showLightbox();
  }

  function showLightbox() {
    const img = imgOf(index);
    lbImg.src = img.srcset.split(',').pop().trim().split(' ')[0];
    lbImg.alt = img.alt;
    lbCap.textContent = `${index + 1} / ${n} · ${panels[index].querySelector('figcaption').textContent}`;
  }

  function openLightbox(i) {
    select(i);
    showLightbox();
    if (lightbox.showModal) lightbox.showModal();
    else lightbox.setAttribute('open', '');
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  root.querySelector('[data-g-prev]').addEventListener('click', () => select(index - 1));
  root.querySelector('[data-g-next]').addEventListener('click', () => select(index + 1));
  root.querySelectorAll('[data-g-zoom]').forEach((b) => b.addEventListener('click', () => openLightbox(Number(b.dataset.gZoom))));

  root.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
    const map = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: n - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    select(map[e.key], { focusTab: true });
  });

  // Arrow keys also work while the gallery is on screen and nothing else has focus.
  new IntersectionObserver(([entry]) => { inView = entry.intersectionRatio > 0.5; }, { threshold: [0, 0.5, 1] }).observe(root);
  document.addEventListener('keydown', (e) => {
    if (lightbox.open || document.querySelector('dialog[open]')) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const a = document.activeElement;
    const free = !a || a === document.body || (root.contains(a) && !a.closest('[role="tablist"]'));
    if (!free || !inView) return;
    e.preventDefault();
    select(index + (e.key === 'ArrowRight' ? 1 : -1));
  });

  // Swipe on touch screens.
  let x0 = null;
  const stage = root.querySelector('.g-stage');
  stage.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
  stage.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) select(index + (dx < 0 ? 1 : -1));
  });

  lightbox.querySelector('[data-lb-close]').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('[data-lb-prev]').addEventListener('click', () => select(index - 1));
  lightbox.querySelector('[data-lb-next]').addEventListener('click', () => select(index + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); select(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); select(index - 1); }
  });

  root.classList.add('is-live');
  return { select };
}
