// The hero banner demo: a simulated ScreenSort capture under a macOS menu bar.
// The first frame is rendered at build time (src/partials.js); this adds the
// capture animation, filename morph, inline rename, folder menu, drag and drop,
// Quick Look, Undo, the auto-dismiss timer and the Recent Renames menu.

import { SAMPLES, FOLDERS, folderById, sampleTime } from './samples.js';

const DISMISS_MS = 5000;
const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-';
const MAX_RECENT = 10;

// Lowercase, hyphen separated, safe for a filename. Mirrors the app's slug rules.
export const slugify = (s) => s.toLowerCase()
  .replace(/\.png$/, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60);

export function initDemo(root, { reduced = false } = {}) {
  const $ = (sel) => root.querySelector(sel);
  const desk = $('[data-desk]');
  const banner = $('[data-banner]');
  const el = {
    thumb: $('[data-thumb]'), old: $('[data-old]'), name: $('[data-name]'), slug: $('[data-slug]'),
    input: $('[data-input]'), folderBtn: $('[data-folder-btn]'), folderName: $('[data-folder-name]'),
    menu: $('[data-folder-menu]'), paused: $('[data-paused]'), ql: $('[data-ql]'), undo: $('[data-undo]'),
    undoLabel: $('[data-undo-label]'), progress: $('[data-progress]'), clock: $('[data-clock]'),
    stageArt: $('[data-stage-art]'), marquee: $('[data-marquee]'), flash: $('[data-flash]'),
    ghost: $('[data-ghost]'), ghostArt: $('[data-ghost-art]'), ghostName: $('[data-ghost-name]'),
    live: $('[data-live]'), mbIcon: $('[data-mb-icon]'), recent: $('[data-recent]'),
    recentList: $('[data-recent-list]'), recentCount: $('[data-recent-count]'),
    qlDialog: $('[data-quicklook]'), qlTitle: $('[data-ql-title]'), qlArt: $('[data-ql-art]'), qlFolder: $('[data-ql-folder]'),
  };
  const chips = [...root.querySelectorAll('[data-sample]')];
  const zones = [...root.querySelectorAll('[data-drop]')];

  // position: fixed must be relative to the viewport, and the desk's
  // backdrop-filter would otherwise become its containing block.
  document.body.append(el.ghost);

  let seq = 0;
  let current = null;
  let recent = [];
  let autoplay = !reduced;
  let autoTimer = 0;
  let morphToken = 0;
  const pauses = new Set();
  const timer = { elapsed: 0, last: 0, raf: 0, running: false };

  const say = (msg) => { el.live.textContent = msg; };
  const fileName = (c) => `${c.undone ? c.sample.original.replace(/\.png$/, '') : c.slug}.png`;

  // ---- Filename morph ------------------------------------------------------

  function morph(to, { duration = 520 } = {}) {
    const token = ++morphToken;
    if (reduced) { el.slug.textContent = to; return; }
    const from = el.slug.textContent;
    const start = performance.now();
    const len = Math.max(from.length, to.length);
    const frame = (now) => {
      if (token !== morphToken) return;
      const t = Math.min(1, (now - start) / duration);
      const settled = Math.floor(t * to.length);
      let out = to.slice(0, settled);
      const tail = Math.round((1 - t) * (len - settled));
      for (let i = 0; i < tail; i++) out += SLUG_CHARS[(Math.random() * SLUG_CHARS.length) | 0];
      el.slug.textContent = t >= 1 ? to : out;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // ---- Auto-dismiss timer --------------------------------------------------

  function syncPauses() {
    const dragging = pauses.has('dragging');
    el.paused.hidden = !dragging;
    banner.classList.toggle('is-paused', pauses.size > 0);
  }

  function pause(reason) { pauses.add(reason); syncPauses(); }
  function resume(reason) { pauses.delete(reason); syncPauses(); }

  function tick(now) {
    if (!timer.running) return;
    const dt = now - timer.last;
    timer.last = now;
    if (pauses.size === 0) timer.elapsed += dt;
    const p = Math.min(1, timer.elapsed / DISMISS_MS);
    el.progress.style.transform = `scaleX(${1 - p})`;
    if (p >= 1) { timer.running = false; dismiss(); return; }
    timer.raf = requestAnimationFrame(tick);
  }

  function startTimer() {
    cancelAnimationFrame(timer.raf);
    timer.elapsed = 0;
    timer.last = performance.now();
    timer.running = true;
    el.progress.style.transform = 'scaleX(1)';
    timer.raf = requestAnimationFrame(tick);
  }

  function stopTimer() {
    timer.running = false;
    cancelAnimationFrame(timer.raf);
  }

  // ---- Banner state --------------------------------------------------------

  function renderFolder() {
    const f = folderById(current.undone ? 'other' : current.folder);
    el.folderBtn.dataset.color = current.undone ? 'slate' : f.color;
    el.folderName.textContent = current.undone ? 'Screenshots' : f.name;
    el.folderBtn.disabled = current.undone;
    el.menu.querySelectorAll('[data-folder]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.folder === current.folder)));
  }

  function renderBanner() {
    el.thumb.innerHTML = current.sample.art;
    el.thumb.setAttribute('aria-label', `${fileName(current)}: drag into an app below, or click for Quick Look`);
    el.old.textContent = current.undone ? 'Restored original name and location' : current.sample.original;
    el.undoLabel.textContent = current.undone ? 'Redo' : 'Undo';
    el.undo.setAttribute('aria-pressed', String(current.undone));
    banner.classList.toggle('is-undone', current.undone);
    el.name.disabled = current.undone;
    renderFolder();
  }

  function setChip(id) {
    chips.forEach((c) => {
      const on = c.dataset.sample === id;
      c.setAttribute('aria-checked', String(on));
      c.tabIndex = on ? 0 : -1;
    });
  }

  function uniqueSlug(slug, selfId) {
    const taken = new Set(recent.filter((r) => r.id !== selfId).map((r) => r.slug));
    if (current && current.id !== selfId) taken.add(current.slug);
    if (!taken.has(slug)) return slug;
    let n = 2;
    while (taken.has(`${slug}-${n}`)) n++;
    return `${slug}-${n}`;
  }

  function capture(sample, { animate = !reduced } = {}) {
    clearTimeout(autoTimer);
    closeMenu();
    if (!el.input.hidden) cancelEdit();
    if (current && !current.dismissed) archive(current);
    stopTimer();
    pauses.delete('dragging');
    syncPauses();

    current = { id: ++seq, sample, slug: '', folder: sample.folder, undone: false, dismissed: false };
    current.slug = uniqueSlug(sample.slug, current.id);
    setChip(sample.id);
    el.clock.textContent = sampleTime(sample);
    el.stageArt.innerHTML = sample.art;

    banner.classList.remove('is-out');
    if (!animate) {
      el.slug.textContent = current.slug;
      renderBanner();
      say(`Renamed to ${current.slug}.png and filed in ${folderById(current.folder).name}.`);
      startTimer();
      return;
    }

    // Shutter: marquee selection, flash, banner drops in reading the old name,
    // then the name morphs to the slug.
    desk.classList.remove('is-capturing');
    void desk.offsetWidth;
    desk.classList.add('is-capturing');
    banner.classList.add('is-reading', 'is-entering');
    el.old.textContent = 'Reading on-device with Vision OCR';
    el.slug.textContent = sample.original.replace(/\.png$/, '');
    el.thumb.innerHTML = sample.art;
    el.progress.style.transform = 'scaleX(1)';
    current.undone = false;
    renderFolder();
    el.undoLabel.textContent = 'Undo';

    const me = current;
    setTimeout(() => banner.classList.remove('is-entering'), 380);
    setTimeout(() => {
      if (current !== me) return;
      banner.classList.remove('is-reading');
      renderBanner();
      morph(me.slug);
      say(`Renamed to ${me.slug}.png and filed in ${folderById(me.folder).name}.`);
      startTimer();
    }, 900);
  }

  function nextSample() {
    const i = current ? SAMPLES.indexOf(current.sample) : -1;
    return SAMPLES[(i + 1) % SAMPLES.length];
  }

  function dismiss() {
    closeMenu();
    banner.classList.add('is-out');
    archive(current);
    el.mbIcon.classList.remove('is-pulse');
    void el.mbIcon.offsetWidth;
    el.mbIcon.classList.add('is-pulse');
    if (autoplay) autoTimer = setTimeout(() => capture(nextSample()), 1400);
    else say('Banner dismissed. The capture is in Recent Renames in the menu bar.');
  }

  // Brings the last banner back (used when a test drag starts after it dismissed).
  function revive() {
    clearTimeout(autoTimer);
    current.dismissed = false;
    recent = recent.filter((r) => r.id !== current.id);
    renderRecent();
    banner.classList.remove('is-out');
    renderBanner();
    startTimer();
  }

  // ---- Recent Renames ------------------------------------------------------

  function archive(c) {
    if (!c || c.dismissed) return;
    c.dismissed = true;
    recent = [c, ...recent.filter((r) => r.id !== c.id)].slice(0, MAX_RECENT);
    renderRecent();
  }

  function renderRecent() {
    el.recentCount.textContent = recent.length ? `${recent.length} of ${MAX_RECENT}` : '';
    if (!recent.length) {
      el.recentList.innerHTML = '<li class="recent-empty">Captures you take in this demo show up here.</li>';
      return;
    }
    el.recentList.replaceChildren(...recent.map((r) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'recent-row';
      b.dataset.color = r.undone ? 'slate' : folderById(r.folder).color;
      b.innerHTML = `<span class="rt">${r.sample.art}</span><span class="rn"></span><span class="rf"></span>`;
      b.querySelector('.rn').textContent = fileName(r);
      b.querySelector('.rf').textContent = r.undone ? 'Screenshots' : folderById(r.folder).name;
      b.addEventListener('click', () => openQuickLook(r));
      li.append(b);
      return li;
    }));
  }

  function toggleRecent(open = el.recent.hidden) {
    el.recent.hidden = !open;
    el.mbIcon.setAttribute('aria-expanded', String(open));
    el.mbIcon.classList.toggle('is-open', open);
  }

  // ---- Inline rename -------------------------------------------------------

  function startEdit() {
    if (!current || current.undone) return;
    stopAuto();
    pause('editing');
    el.input.value = current.slug;
    el.name.hidden = true;
    el.input.hidden = false;
    el.input.focus();
    el.input.select();
  }

  function endEdit() {
    el.input.hidden = true;
    el.name.hidden = false;
    resume('editing');
  }

  function commitEdit() {
    const slug = slugify(el.input.value);
    endEdit();
    el.name.focus();
    if (!slug || slug === current.slug) return;
    current.slug = uniqueSlug(slug, current.id);
    el.slug.textContent = current.slug;
    renderBanner();
    say(`Renamed to ${current.slug}.png.`);
  }

  function cancelEdit() {
    endEdit();
    say('Rename cancelled.');
  }

  // ---- Folder menu ---------------------------------------------------------

  const menuItems = () => [...el.menu.querySelectorAll('[data-folder]')];

  function openMenu() {
    stopAuto();
    pause('menu');
    el.menu.hidden = false;
    el.folderBtn.setAttribute('aria-expanded', 'true');
    (menuItems().find((b) => b.dataset.folder === current.folder) || menuItems()[0]).focus();
  }

  function closeMenu(refocus = false) {
    if (el.menu.hidden) return;
    el.menu.hidden = true;
    el.folderBtn.setAttribute('aria-expanded', 'false');
    resume('menu');
    if (refocus) el.folderBtn.focus();
  }

  function chooseFolder(id) {
    current.folder = id;
    renderFolder();
    closeMenu(true);
    banner.classList.remove('is-moved');
    void banner.offsetWidth;
    banner.classList.add('is-moved');
    say(`Moved to ${folderById(id).name}.`);
  }

  // ---- Undo ----------------------------------------------------------------

  function toggleUndo() {
    if (!current) return;
    stopAuto();
    current.undone = !current.undone;
    renderBanner();
    morph(current.undone ? current.sample.original.replace(/\.png$/, '') : current.slug, { duration: 380 });
    startTimer();
    say(current.undone
      ? `Undone. Restored ${current.sample.original} to its original location.`
      : `Redone. Renamed to ${current.slug}.png in ${folderById(current.folder).name}.`);
  }

  // ---- Quick Look ----------------------------------------------------------

  function openQuickLook(c = current) {
    if (!c) return;
    stopAuto();
    toggleRecent(false);
    el.qlTitle.textContent = fileName(c);
    el.qlFolder.textContent = c.undone ? 'Screenshots' : folderById(c.folder).name;
    el.qlFolder.dataset.color = c.undone ? 'slate' : folderById(c.folder).color;
    el.qlArt.innerHTML = c.sample.art;
    pause('quicklook');
    if (el.qlDialog.showModal) el.qlDialog.showModal();
    else el.qlDialog.setAttribute('open', '');
  }

  el.qlDialog.addEventListener('close', () => resume('quicklook'));
  el.qlDialog.addEventListener('click', (e) => { if (e.target === el.qlDialog) el.qlDialog.close(); });
  root.querySelector('[data-ql-close]').addEventListener('click', () => el.qlDialog.close());

  // ---- Drag and drop -------------------------------------------------------

  function showGhost(x, y) {
    el.ghostArt.innerHTML = current.sample.art;
    el.ghostName.textContent = fileName(current);
    el.ghost.hidden = false;
    moveGhost(x, y);
  }

  function moveGhost(x, y) {
    el.ghost.style.transform = `translate(${x}px, ${y}px)`;
  }

  function zoneAt(x, y) {
    const hit = document.elementFromPoint(x, y);
    return hit && hit.closest('[data-drop]');
  }

  function hover(zone) {
    zones.forEach((z) => z.classList.toggle('is-over', z === zone));
  }

  function drop(zone) {
    hover(null);
    el.ghost.hidden = true;
    resume('dragging');
    if (!zone) { say('Drag cancelled.'); return; }
    const name = fileName(current);
    const chip = zone.querySelector('[data-dz-file]');
    chip.textContent = name;
    zone.classList.remove('got-file');
    void zone.offsetWidth;
    zone.classList.add('got-file');
    clearTimeout(zone._t);
    zone._t = setTimeout(() => zone.classList.remove('got-file'), 2600);
    say(`Dropped ${name} into ${zone.dataset.drop}.`);
  }

  let drag = null;

  el.thumb.addEventListener('pointerdown', (e) => {
    if (!current || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, active: false };
    el.thumb.setPointerCapture(e.pointerId);
  });

  el.thumb.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
      drag.active = true;
      stopAuto();
      pause('dragging');
      showGhost(e.clientX, e.clientY);
    }
    moveGhost(e.clientX, e.clientY);
    hover(zoneAt(e.clientX, e.clientY));
  });

  const endDrag = (e, cancelled) => {
    if (!drag || e.pointerId !== drag.id) return;
    const wasActive = drag.active;
    drag = null;
    if (!wasActive) return;
    e.preventDefault();
    drop(cancelled ? null : zoneAt(e.clientX, e.clientY));
    el.thumb.dataset.justDragged = '1';
    setTimeout(() => delete el.thumb.dataset.justDragged, 0);
  };
  el.thumb.addEventListener('pointerup', (e) => endDrag(e, false));
  el.thumb.addEventListener('pointercancel', (e) => endDrag(e, true));
  el.thumb.addEventListener('dragstart', (e) => e.preventDefault());
  el.thumb.addEventListener('click', () => { if (!el.thumb.dataset.justDragged) openQuickLook(); });

  // Scripted drag for the "Test Drag" buttons and keyboard users.
  function testDrag(target) {
    stopAuto();
    if (banner.classList.contains('is-out')) revive();
    const zone = zones.find((z) => z.dataset.drop === target);
    const a = el.thumb.getBoundingClientRect();
    const b = zone.getBoundingClientRect();
    const from = [a.left + a.width / 2, a.top + a.height / 2];
    const to = [b.left + b.width / 2, b.top + b.height / 2];
    pause('dragging');
    showGhost(...from);
    if (reduced || !el.ghost.animate) {
      moveGhost(...to);
      hover(zone);
      setTimeout(() => drop(zone), 700);
      return;
    }
    const mid = [(from[0] + to[0]) / 2 + 40, Math.min(from[1], to[1]) + (to[1] - from[1]) * 0.25];
    const anim = el.ghost.animate([
      { transform: `translate(${from[0]}px, ${from[1]}px) scale(1)` },
      { transform: `translate(${mid[0]}px, ${mid[1]}px) scale(1.06)`, offset: 0.45 },
      { transform: `translate(${to[0]}px, ${to[1]}px) scale(1)` },
    ], { duration: 1500, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
    setTimeout(() => hover(zone), 1100);
    anim.onfinish = () => {
      moveGhost(...to);
      anim.cancel();
      setTimeout(() => drop(zone), 350);
    };
  }

  // ---- Wiring --------------------------------------------------------------

  function stopAuto() {
    autoplay = false;
    clearTimeout(autoTimer);
  }

  el.name.addEventListener('click', startEdit);
  el.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancelEdit(); el.name.focus(); }
  });
  el.input.addEventListener('blur', () => { if (!el.input.hidden) commitEdit(); });

  el.folderBtn.addEventListener('click', () => (el.menu.hidden ? openMenu() : closeMenu()));
  el.menu.addEventListener('click', (e) => {
    const b = e.target.closest('[data-folder]');
    if (b) chooseFolder(b.dataset.folder);
  });
  el.menu.addEventListener('keydown', (e) => {
    const items = menuItems();
    const i = items.indexOf(document.activeElement);
    const go = (n) => { e.preventDefault(); items[(n + items.length) % items.length].focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
    else if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') e.preventDefault(); closeMenu(e.key === 'Escape'); }
  });

  el.undo.addEventListener('click', toggleUndo);
  el.ql.addEventListener('click', () => openQuickLook());
  el.mbIcon.addEventListener('click', () => { stopAuto(); toggleRecent(); });

  document.addEventListener('pointerdown', (e) => {
    if (!el.menu.hidden && !e.target.closest('.bn-folder')) closeMenu();
    if (!el.recent.hidden && !e.target.closest('[data-recent], [data-mb-icon]')) toggleRecent(false);
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.recent.hidden) { toggleRecent(false); el.mbIcon.focus(); }
    // Space opens Quick Look, as in Finder, when the banner (not a text field) has focus.
    if (e.key === ' ' && banner.contains(e.target) && e.target !== el.input && e.target.closest('[data-thumb]')) {
      e.preventDefault();
      openQuickLook();
    }
  });

  banner.addEventListener('pointerenter', () => pause('hover'));
  banner.addEventListener('pointerleave', () => resume('hover'));
  // Keyboard focus pauses the countdown (so it can be read and used); a mouse click does not.
  banner.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) pause('focus'); });
  banner.addEventListener('focusout', (e) => { if (!banner.contains(e.relatedTarget)) resume('focus'); });

  chips.forEach((c, i) => {
    c.addEventListener('click', () => { stopAuto(); capture(SAMPLES.find((s) => s.id === c.dataset.sample)); });
    c.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const n = chips[(i + d + chips.length) % chips.length];
      n.focus();
      n.click();
    });
  });
  root.querySelector('[data-capture]').addEventListener('click', () => { stopAuto(); capture(nextSample()); });
  root.querySelectorAll('[data-test-drag]').forEach((b) => b.addEventListener('click', () => testDrag(b.dataset.testDrag)));

  // Only run the clock while the demo is on screen.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) resume('offscreen');
    else pause('offscreen');
  }).observe(desk);

  // Take over the build-time first frame.
  current = { id: ++seq, sample: SAMPLES[0], slug: SAMPLES[0].slug, folder: SAMPLES[0].folder, undone: false, dismissed: false };
  root.classList.add('is-live');
  if (reduced) {
    renderBanner();
    startTimer();
  } else {
    current = null;
    capture(SAMPLES[0]);
  }

  return { capture, testDrag, FOLDERS };
}
