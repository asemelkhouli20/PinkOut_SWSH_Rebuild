/* PinkOut themed days: the room stays on screen while the page scrolls, and each stretch of scrolling
   turns it into the next theme (colours, pattern, motifs, poster). Tickets, arrows, keys and swipes
   jump the scroll to a theme, so the scroll position is always the single source of truth. */
(() => {
  'use strict';
  const room = document.querySelector('.theme-room');
  if (!room) return;
  const tablist = room.querySelector('[role=tablist]');
  const tabs = Array.from(room.querySelectorAll('[role=tab]'));
  const scenes = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const stage = room.querySelector('.room-stage');
  const count = tabs.length;
  const steps = Array.from(room.querySelectorAll('[data-step]'));
  const calm = () => window.PinkOut?.motionPaused || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rtl = () => document.documentElement.dir === 'rtl';
  const phone = matchMedia('(max-width: 900px)');
  let current = Math.max(0, tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true'));
  let enterTimer = 0;

  // Scenes share one grid cell, so the room keeps the height of its tallest theme and never jumps.
  room.classList.add('is-live');
  scenes.forEach(scene => { scene.hidden = false; });

  // The shell supplies the scroll distance; the room sticks inside it while that distance is travelled.
  const shell = document.createElement('div');
  shell.className = 'theme-scroll-shell';
  room.before(shell); shell.append(room);
  let top = 0, travel = 0;

  function layout() {
    const height = room.offsetHeight;
    // Centre the room in the space between the header and the bottom gap (12px on phones, 16px on larger screens).
    // Short screens let the top of the room slide under the header rather than hiding the tickets.
    const spare = innerHeight - 72 - (phone.matches ? 12 : 16) - height;
    top = spare >= 0 ? 72 + Math.round(spare / 2) : Math.min(84, innerHeight - height - 12);
    const step = Math.max(240, Math.round(innerHeight * .5));
    const nextTravel = step * (count - 1);
    shell.style.setProperty('--room-top', `${top}px`);
    const changed = nextTravel !== travel;
    travel = nextTravel;
    shell.style.height = `${height + travel}px`;
    if (changed) window.ScrollTrigger?.refresh();
    update();
  }

  const progress = () => Math.max(0, Math.min(1, (top - shell.getBoundingClientRect().top) / travel));
  function update() {
    if (!travel) return;
    const p = progress();
    room.style.setProperty('--room-progress', p.toFixed(4));
    // The track's fill runs between the first and last emblem centres, so it meets the current emblem.
    room.style.setProperty('--track-progress', (Math.min(count - 1, p * count - .5) / (count - 1)).toFixed(4));
    const index = Math.min(count - 1, Math.floor(p * count));
    if (index !== current) select(index);
  }

  // Scroll so that the given theme sits in the middle of its stretch. If a layout refresh interrupts the
  // smooth scroll on the way, it is resumed once (when scrolling settles) so the jump still lands.
  let pending = null, settleTimer = 0;
  function goTo(index, { focus = false, retry = true } = {}) {
    index = Math.max(0, Math.min(count - 1, index));
    const target = scrollY + shell.getBoundingClientRect().top - top + travel * (index + .5) / count;
    pending = retry ? index : null;
    window.scrollTo({ top: target, behavior: calm() ? 'instant' : 'smooth' });
    if (focus) tabs[index].focus({ preventScroll: true });
  }
  function settle() {
    if (pending === null) return;
    const wanted = pending; pending = null;
    if (current !== wanted) goTo(wanted, { retry: false });
  }
  addEventListener('scroll', () => { clearTimeout(settleTimer); settleTimer = setTimeout(settle, 160); }, { passive: true });

  // Bring the chosen ticket into view inside the ticket row without moving the page.
  function revealTab(tab) {
    if (tablist.scrollWidth <= tablist.clientWidth) return;
    const row = tablist.getBoundingClientRect(), r = tab.getBoundingClientRect();
    tablist.scrollBy({ left: (r.left + r.width / 2) - (row.left + row.width / 2), behavior: calm() ? 'instant' : 'smooth' });
  }

  function select(index) {
    const changed = index !== current;
    current = index;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      scenes[i].classList.toggle('is-active', on);
      if (!on) scenes[i].classList.remove('is-entering');
    });
    room.dataset.theme = tabs[index].dataset.theme;
    steps.forEach(step => { step.disabled = Number(step.dataset.step) < 0 ? index === 0 : index === count - 1; });
    if (changed && !calm()) {
      const scene = scenes[index];
      scene.classList.remove('is-entering'); void scene.offsetWidth; scene.classList.add('is-entering');
      clearTimeout(enterTimer); enterTimer = setTimeout(() => scene.classList.remove('is-entering'), 1000);
    }
    if (changed) revealTab(tabs[index]);
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => goTo(i)));
  tablist.addEventListener('keydown', event => {
    const forward = rtl() ? 'ArrowLeft' : 'ArrowRight', back = rtl() ? 'ArrowRight' : 'ArrowLeft';
    const moves = { [forward]: current + 1, [back]: current - 1, Home: 0, End: count - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    goTo(moves[event.key], { focus: true });
  });
  steps.forEach(button => button.addEventListener('click', () => goTo(current + Number(button.dataset.step))));

  // A sideways swipe also moves between themes; in Arabic the next theme comes from the left.
  let start = null;
  stage.addEventListener('pointerdown', event => { if (event.isPrimary) start = { x: event.clientX, y: event.clientY, id: event.pointerId }; }, { passive: true });
  stage.addEventListener('pointerup', event => {
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y; start = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    goTo(current + ((rtl() ? dx > 0 : dx < 0) ? 1 : -1));
  }, { passive: true });
  stage.addEventListener('pointercancel', () => { start = null; });

  // Desktop: the poster leans gently toward the pointer.
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  stage.addEventListener('pointermove', event => {
    if (!fine.matches || calm() || event.pointerType !== 'mouse') return;
    const poster = scenes[current].querySelector('.scene-poster');
    const r = poster.getBoundingClientRect();
    poster.style.setProperty('--tilt', `${(rtl() ? -2.5 : 2.5) + (event.clientX - (r.left + r.width / 2)) / innerWidth * 8}deg`);
  }, { passive: true });
  stage.addEventListener('pointerleave', () => scenes.forEach(scene => scene.querySelector('.scene-poster').style.removeProperty('--tilt')));

  let frame = 0;
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); }, { passive: true });
  addEventListener('resize', layout);
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(room);
  document.addEventListener('pinkout:language', () => requestAnimationFrame(layout));
  Promise.resolve(document.fonts?.ready).then(layout);
  steps.forEach(step => { step.disabled = Number(step.dataset.step) < 0 ? current === 0 : current === count - 1; });
  layout();
})();
