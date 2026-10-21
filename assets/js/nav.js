/* PinkOut navigation: hover-intent mega menus on desktop, click and keyboard everywhere, a full-screen sheet on phones. */
(() => {
  'use strict';
  const header = document.querySelector('.po-header');
  if (!header) return;
  const root = document.documentElement;
  const triggers = Array.from(header.querySelectorAll('[data-nav-panel]'));
  const panelFor = trigger => document.getElementById(trigger.getAttribute('aria-controls'));
  const indicator = header.querySelector('.po-nav-indicator');
  const nav = header.querySelector('.po-nav');
  const hoverable = matchMedia('(hover: hover) and (pointer: fine)');
  const calm = () => window.PinkOut?.motionPaused || matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = null, openTimer = 0, closeTimer = 0, hideTimer = 0, openedByHover = 0;

  // A soft pill slides to whichever item is hovered or open.
  function point(target) {
    if (!indicator || !nav) return;
    if (!target) { indicator.style.opacity = '0'; return; }
    const a = target.getBoundingClientRect(), n = nav.getBoundingClientRect();
    indicator.style.setProperty('--x', `${a.left - n.left}px`);
    indicator.style.setProperty('--w', `${a.width}px`);
    indicator.style.opacity = '1';
  }

  function show(trigger, { focusFirst = false, viaHover = false } = {}) {
    clearTimeout(openTimer); clearTimeout(closeTimer); clearTimeout(hideTimer);
    if (current === trigger) { if (focusFirst) panelFor(trigger).querySelector('a')?.focus(); return; }
    if (current) hidePanel(current, true);
    current = trigger;
    const panel = panelFor(trigger);
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    header.classList.add('has-panel');
    // Next frame, so the opening transition runs from the closed state.
    requestAnimationFrame(() => { if (current === trigger) panel.classList.add('is-open'); });
    openedByHover = viaHover ? performance.now() : 0;
    point(trigger);
    if (focusFirst) requestAnimationFrame(() => panel.querySelector('a')?.focus());
  }
  function hidePanel(trigger, instant) {
    const panel = panelFor(trigger);
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    if (instant || calm()) panel.hidden = true;
    else hideTimer = setTimeout(() => { if (current !== trigger) panel.hidden = true; }, 260);
  }
  function close({ restoreFocus = false } = {}) {
    clearTimeout(openTimer); clearTimeout(closeTimer);
    if (!current) return;
    const trigger = current; current = null;
    hidePanel(trigger, false);
    header.classList.remove('has-panel');
    point(null);
    if (restoreFocus) trigger.focus();
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !hoverable.matches) return;
      clearTimeout(closeTimer); clearTimeout(openTimer);
      point(trigger);
      // Open after a short pause, or at once when moving between items while a menu is already open.
      openTimer = setTimeout(() => show(trigger, { viaHover: true }), current ? 0 : 110);
    });
    trigger.addEventListener('pointerleave', () => { clearTimeout(openTimer); if (!current) point(null); });
    trigger.addEventListener('click', () => {
      // A hover-opened menu stays open on the click that usually follows the hover.
      if (current === trigger) { if (performance.now() - openedByHover > 450) close(); return; }
      show(trigger);
    });
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); show(trigger, { focusFirst: true }); }
    });
  });
  // Leaving the header (bar + open panel) closes after a grace period that allows diagonal moves.
  header.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' || !current) return;
    closeTimer = setTimeout(() => close(), 280);
  });
  header.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  header.addEventListener('click', event => { if (event.target.closest('.po-panel a')) close(); });
  header.addEventListener('focusout', event => { if (current && !header.contains(event.relatedTarget)) close(); });
  document.addEventListener('pointerdown', event => { if (current && !header.contains(event.target)) close(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (sheetOpen()) { closeSheet(true); return; }
    if (current) close({ restoreFocus: true });
  });

  // Header gets a soft band once the page scrolls.
  let frame = 0;
  const scrolled = () => { frame = 0; header.classList.toggle('is-scrolled', scrollY > 24); };
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(scrolled); }, { passive: true });
  scrolled();

  // ---------- Phone menu sheet ----------
  const toggle = header.querySelector('.menu-toggle');
  const sheet = document.getElementById('mobile-menu');
  const sheetOpen = () => sheet && !sheet.hidden;
  let sheetTimer = 0;
  function openSheet() {
    if (!sheet) return;
    close(); clearTimeout(sheetTimer);
    sheet.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    root.classList.add('menu-open');
    // The sheet grows from the menu button, like walking through a door.
    const r = toggle.getBoundingClientRect();
    sheet.style.setProperty('--ox', `${r.left + r.width / 2}px`);
    sheet.style.setProperty('--oy', `${r.top + r.height / 2}px`);
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('is-open')));
    sheet.querySelector('.po-menu-close')?.focus();
  }
  function closeSheet(restoreFocus = false) {
    if (!sheetOpen()) return;
    sheet.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    root.classList.remove('menu-open');
    const done = () => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; };
    if (calm()) done(); else sheetTimer = setTimeout(done, 420);
    if (restoreFocus) toggle.focus();
  }
  toggle?.addEventListener('click', () => (sheetOpen() ? closeSheet(true) : openSheet()));
  sheet?.querySelector('[data-menu-close]')?.addEventListener('click', () => closeSheet(true));
  sheet?.addEventListener('click', event => {
    if (event.target === sheet) closeSheet(true);
    if (event.target.closest('a')) closeSheet(false);
  });
  // Keep keyboard focus inside the open sheet.
  sheet?.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = Array.from(sheet.querySelectorAll('a,button')).filter(el => el.offsetParent !== null);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) closeSheet(); });

  addEventListener('resize', () => { if (current) point(current); });
  document.addEventListener('pinkout:language', () => { if (current) point(current); });
  // close() only closes desktop panels; the phone sheet stays open across language switches.
  window.PinkOutNav = Object.freeze({ close: () => close(), closeAll: () => { close(); closeSheet(); } });
})();
