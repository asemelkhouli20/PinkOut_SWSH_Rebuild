/* Small, purposeful interactions. Native scrolling and keyboard controls stay intact. */
(() => {
  'use strict';
  const api = window.PinkOut;
  const board = document.querySelector('.world-board');
  if (!api || !board) return;
  const words = {
    ar: { label: 'وش جوّك اليوم؟', all: 'الكل', moods: ['أبدع', 'أروق', 'أتحرّك', 'أكتشف'], picks: 'اختياراتي', hint: 'اختاري أي وجهة وتنفتح لك.', route: 'جولتك المقترحة', empty: 'اضغطي ♡ على أي وجهة وتنحفظ هنا.', saved: 'وجهاتك المحفوظة', open: 'افتحي', save: 'احفظي', remove: 'إزالة', hint2: 'اكتشفي', then: ' ← ', comma: '، ' },
    en: { label: 'What’s your mood?', all: 'All', moods: ['Create', 'Unwind', 'Move', 'Discover'], picks: 'My picks', hint: 'Pick any destination to open it.', route: 'Your suggested route', empty: 'Tap ♡ on any destination to keep it here.', saved: 'Your saved destinations', open: 'Open', save: 'Save', remove: 'Remove', hint2: 'Explore', then: ' → ', comma: ', ' }
  };
  const w = () => words[api.language];
  const panels = [...board.querySelectorAll('.wb-panel')];
  const routes = [[1,4,2], [2,4,7], [3,6,2], [7,5,1]];
  const moodStickers = ['painting-palette', 'boba-tea', 'roller-skate', 'instant-camera'];
  const worldName = i => panels[i].querySelector('.wb-name').textContent;
  const isSaved = i => panels[i].querySelector('[data-save-interest]').getAttribute('aria-pressed') === 'true';
  const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; };
  const button = (cls, text) => { const node = el('button', cls, text); node.type = 'button'; return node; };
  const animate = (node, frames, options) => {
    if (api.motionPaused || !node.animate) return;
    node.getAnimations().forEach(a => a.cancel());
    node.animate(frames, { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', ...options });
  };
  const desktop = matchMedia('(min-width: 901px)');

  // World board: mood chips light up a route, and the chosen destination opens in place.
  const bar = el('div', 'wb-bar'); bar.id = 'mood-picker';
  const label = el('p', 'wb-label'); label.id = 'wb-label';
  const group = el('div', 'wb-moods'); group.setAttribute('role', 'group'); group.setAttribute('aria-labelledby', 'wb-label');
  const note = el('p', 'wb-note'); note.setAttribute('aria-live', 'polite');
  const filters = ['all', 0, 1, 2, 3, 'saved'];
  const chips = filters.map(filter => {
    const chip = button('wb-chip'); const text = el('span', 'wb-chip-label'); let art, count;
    if (typeof filter === 'number') {
      art = el('span', 'wb-chip-art'); art.setAttribute('aria-hidden', 'true');
      const icon = el('img'); icon.src = `assets/images/stickers/${moodStickers[filter]}.webp`; icon.alt = ''; icon.width = icon.height = 280; icon.decoding = 'async';
      art.append(icon); chip.append(art);
    }
    chip.append(text);
    if (filter === 'saved') { chip.classList.add('wb-chip-saved'); count = el('b', 'wb-chip-count'); chip.append(count); }
    chip.addEventListener('click', () => setFilter(filter));
    group.append(chip);
    return { chip, text, art, count, filter };
  });
  bar.append(label, group, note); board.prepend(bar);
  board.classList.add('wb-live');

  let filter = 'all', active = -1;
  const picked = () => filter === 'all' ? null : filter === 'saved' ? panels.map((_, i) => i).filter(isSaved) : routes[filter].map(id => id - 1);
  function activate(index) {
    if (index === active) return;
    active = index;
    panels.forEach((panel, i) => {
      const open = i === index;
      panel.classList.toggle('is-active', open);
      panel.querySelector('.wb-open').setAttribute('aria-expanded', String(open));
      panel.querySelector('.wb-body').inert = !open;
    });
  }
  function renderNote() {
    const list = picked();
    if (!list) note.textContent = w().hint;
    else if (!list.length) note.textContent = w().empty;
    else note.replaceChildren(el('span', '', `${filter === 'saved' ? w().saved : w().route}: `), el('b', '', list.map(worldName).join(filter === 'saved' ? w().comma : w().then)));
  }
  function renderFilter() {
    const list = picked();
    chips.forEach(({ chip, filter: f }) => chip.setAttribute('aria-pressed', String(f === filter)));
    panels.forEach((panel, i) => {
      const stop = list ? list.indexOf(i) : -1;
      panel.classList.toggle('is-match', !!list && stop >= 0);
      panel.classList.toggle('is-dim', !!list && list.length > 0 && stop < 0);
    });
    renderNote();
  }
  function setFilter(next) {
    filter = next; renderFilter();
    const list = picked();
    if (list?.length) show(list[0]);
    const chip = chips.find(c => c.filter === next);
    animate(chip.art || chip.chip, [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px) scale(1.08)', offset: .45 }, { transform: 'none' }], { duration: 520 });
  }
  function renderSaved() {
    const total = panels.filter((_, i) => isSaved(i)).length;
    chips.at(-1).count.textContent = `♥ ${total}`;
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-saved', isSaved(i));
      panel.querySelector('.save-symbol').textContent = isSaved(i) ? '♥' : '♡';
    });
    if (filter === 'saved') renderFilter();
  }
  function translate() {
    label.textContent = w().label;
    chips.forEach(({ text, filter: f }) => { text.textContent = f === 'all' ? w().all : f === 'saved' ? w().picks : w().moods[f]; });
    renderNote();
  }

  // Phones pin the stacked panels below the header, and each stretch of scrolling opens the next destination.
  // Taps, keys, chips and #world links scroll to that stretch, so the scroll position stays the single source of truth.
  const panelBox = board.querySelector('.wb-panels');
  const shell = el('div', 'wb-scroll-shell');
  panelBox.before(shell); shell.append(panelBox);
  const pinTop = 72;
  let travel = 0;
  function layoutPanels() {
    board.classList.toggle('wb-pinned', !desktop.matches);
    // The pinned box is sized in svh, so its height (and the travel) stays put while a phone's address bar slides.
    const nextTravel = desktop.matches ? 0 : Math.max(200, Math.round(panelBox.offsetHeight * .45)) * (panels.length - 1);
    shell.style.setProperty('--wb-top', `${pinTop}px`);
    shell.style.height = nextTravel ? `${panelBox.offsetHeight + nextTravel}px` : '';
    if (nextTravel !== travel) { travel = nextTravel; window.ScrollTrigger?.refresh(); }
    followScroll();
  }
  // The scroll position itself drives how open each panel is (--open, 0–1), so the motion follows the finger.
  // Each destination holds fully open around the middle of its stretch and hands over to the next in between.
  const calm = () => api.motionPaused || matchMedia('(prefers-reduced-motion: reduce)').matches;
  function followScroll() {
    if (!travel) return;
    const progress = Math.max(0, Math.min(1, (pinTop - shell.getBoundingClientRect().top) / travel));
    const at = Math.max(0, Math.min(panels.length - 1, progress * panels.length - .5));
    const base = Math.min(panels.length - 2, Math.floor(at)), f = at - base;
    const u = Math.max(0, Math.min(1, (f - .25) / .5));
    const handover = calm() ? (f >= .5 ? 1 : 0) : u * u * (3 - 2 * u);
    panels.forEach((panel, i) => panel.style.setProperty('--open', i === base ? 1 - handover : i === base + 1 ? handover : 0));
    activate(handover >= .5 ? base + 1 : base);
  }
  function show(index) {
    if (!travel) { activate(index); return; }
    const target = scrollY + shell.getBoundingClientRect().top - pinTop + travel * (index + .5) / panels.length;
    window.scrollTo({ top: target, behavior: api.motionPaused ? 'instant' : 'smooth' });
  }
  let scrollFrame = 0;
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; followScroll(); }); }, { passive: true });
  addEventListener('resize', layoutPanels);
  desktop.addEventListener('change', layoutPanels);
  layoutPanels();

  let hoverTimer;
  panels.forEach((panel, i) => {
    const opener = panel.querySelector('.wb-open');
    opener.addEventListener('click', () => show(i));
    opener.addEventListener('focus', () => { if (desktop.matches) activate(i); });
    opener.addEventListener('keydown', event => {
      // Arrow keys follow the reading direction: in Arabic the next destination sits to the left.
      const rtl = document.documentElement.dir === 'rtl';
      const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 1, ArrowUp: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      const next = (i + step + panels.length) % panels.length;
      panels[next].querySelector('.wb-open').focus(); show(next);
    });
    // Desktop: resting on a panel opens it; a short delay ignores a pointer just passing through.
    panel.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !desktop.matches) return;
      clearTimeout(hoverTimer); hoverTimer = setTimeout(() => activate(i), 90);
    });
    panel.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
  });

  // Links to #world-N open that destination, even when the hash is already in the address bar.
  function openFromHash(hash) {
    const match = /^#world-([1-7])$/.exec(hash || '');
    if (!match) return;
    if (filter !== 'all') { filter = 'all'; renderFilter(); }
    show(Number(match[1]) - 1);
  }
  addEventListener('hashchange', () => openFromHash(location.hash));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href*="#world-"]');
    if (link && link.pathname === location.pathname) openFromHash(link.hash);
  });

  // The first destination opens as the board arrives, so the expanding motion explains itself.
  function intro() { if (active < 0) activate(0); }
  if (/^#world-[1-7]$/.test(location.hash)) openFromHash(location.hash);
  else if (api.motionPaused || !('IntersectionObserver' in window)) intro();
  else {
    const watch = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      watch.disconnect(); setTimeout(intro, 650);
    }, { rootMargin: '0px 0px -35% 0px' });
    watch.observe(board.querySelector('.wb-panels'));
  }
  document.addEventListener('pinkout:language', translate);
  document.addEventListener('pinkout:saved-change', renderSaved);
  translate(); renderFilter(); renderSaved();

  // A looping illustrated cursor; CSS pauses the loop whenever the cursor is hidden.
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const cursor = el('span', 'cursor-hint'); cursor.setAttribute('aria-hidden', 'true'); document.body.append(cursor);
  const cursorFlower = el('span', 'animated-cursor');
  cursorFlower.setAttribute('aria-hidden', 'true');
  const flowerIcon = el('span', 'animated-cursor-flower');
  flowerIcon.innerHTML = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <g class="cursor-emblem" stroke="#fff5f8" stroke-width="1.3" stroke-linejoin="round">
      <g class="cursor-motif cursor-motif-flower" fill="#f43d83">
        <ellipse cx="24" cy="12" rx="7" ry="10"/><ellipse cx="24" cy="36" rx="7" ry="10"/>
        <ellipse cx="12" cy="24" rx="10" ry="7"/><ellipse cx="36" cy="24" rx="10" ry="7"/>
        <ellipse cx="24" cy="12" rx="7" ry="10" transform="rotate(45 24 24)"/>
        <ellipse cx="24" cy="36" rx="7" ry="10" transform="rotate(45 24 24)"/>
        <ellipse cx="12" cy="24" rx="10" ry="7" transform="rotate(45 24 24)"/>
        <ellipse cx="36" cy="24" rx="10" ry="7" transform="rotate(45 24 24)"/>
      </g>
      <g class="cursor-motif cursor-motif-moon">
        <circle cx="24" cy="24" r="21" fill="#f2edff"/>
        <g fill="#c9bfdf" stroke="none" opacity=".65">
          <circle cx="15" cy="12" r="3.5"/><circle cx="35" cy="18" r="2.5"/>
          <circle cx="12" cy="29" r="2"/><circle cx="30" cy="37" r="3"/>
          <circle cx="20" cy="39" r="1.5"/>
        </g>
      </g>
      <path class="cursor-motif cursor-motif-sun" fill="#ffbf51" d="m24 2 5 8 9-2 1 10 7 6-7 6-1 10-9-2-5 8-5-8-9 2-1-10-7-6 7-6 1-10 9 2Z"/>
    </g>
    <circle cx="24" cy="24" r="9" fill="#fff0a8" stroke="#fff5f8" stroke-width="1.3"/>
    <g fill="#7d163f"><circle cx="21" cy="23" r="1.1"/><circle cx="27" cy="23" r="1.1"/></g>
    <path d="M21 27q3 3 6 0" stroke="#7d163f" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
  cursorFlower.append(flowerIcon); document.body.append(cursorFlower);
  const sparks = new Set();
  let previousPoint, lastSpark = 0;
  function clearSparks() {
    sparks.forEach(animation => animation.cancel());
    sparks.clear();
  }
  function emitSpark(x, y, dx, dy) {
    if (sparks.size >= 36 || !cursorFlower.animate) return;
    const spark = el('span', 'cursor-spark'); spark.setAttribute('aria-hidden', 'true');
    spark.style.left = `${x}px`; spark.style.top = `${y}px`;
    spark.style.background = ['#df004c', '#ffcf40', '#b58aff', '#54d7b0'][Math.floor(Math.random() * 4)];
    const size = 5 + Math.random() * 8;
    spark.style.width = spark.style.height = `${size}px`;
    document.body.append(spark);
    const angle = Math.random() * Math.PI * 2, reach = 12 + Math.random() * 30;
    const endX = Math.cos(angle) * reach - dx * .3;
    const endY = Math.sin(angle) * reach - dy * .3 + 20;
    const animation = spark.animate([
      { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 },
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: .12 },
      { transform: `translate(${endX}px,${endY}px) rotate(140deg) scale(0)`, opacity: 0 }
    ], { duration: 450 + Math.random() * 250, easing: 'ease-out' });
    sparks.add(animation);
    animation.onfinish = animation.oncancel = () => { spark.remove(); sparks.delete(animation); };
  }
  let tiltTarget; let cursorFrame = 0; let lastPointer;
  const interactive = 'a,button,summary';
  const tiltSelector = '.result-card,.feature-tile';
  function resetTilt() { if (tiltTarget) { tiltTarget.style.removeProperty('--play-tilt'); tiltTarget.classList.remove('play-tilting'); tiltTarget = null; } }
  function clearPointer() {
    cursor.classList.remove('is-visible'); cursorFlower.classList.remove('is-visible');
    document.body.classList.remove('spark-cursor-active');
    previousPoint = null; lastPointer = null; clearSparks();
    resetTilt(); cancelAnimationFrame(cursorFrame); cursorFrame = 0;
  }
  function updatePointer() {
    cursorFrame = 0; const event = lastPointer; if (!event || api.motionPaused || !fine.matches) return;
    cursor.style.left = `${Math.min(event.clientX + 20, innerWidth - 100)}px`; cursor.style.top = `${Math.min(event.clientY + 20, innerHeight - 40)}px`;
    const target = event.target.closest(interactive); const inDialog = event.target.closest('dialog');
    const nativeCursor = inDialog || event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
    cursorFlower.classList.toggle('is-visible', !nativeCursor);
    document.body.classList.toggle('spark-cursor-active', !nativeCursor);
    if (nativeCursor) { previousPoint = null; clearSparks(); }
    else {
      cursorFlower.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      if (previousPoint) {
        const dx = event.clientX - previousPoint.x, dy = event.clientY - previousPoint.y;
        const distance = Math.hypot(dx, dy);
        const now = performance.now();
        if (distance > 8 && now - lastSpark > 70) {
          emitSpark(event.clientX, event.clientY, dx, dy);
          lastSpark = now;
        }
      }
      previousPoint = { x: event.clientX, y: event.clientY };
    }
    const hint = target?.matches('.wb-open') && !target.closest('.is-active') ? w().open : target?.matches('[data-save-interest]') ? (target.getAttribute('aria-pressed') === 'true' ? w().remove : w().save) : target?.matches('a') ? w().hint2 : '';
    cursor.classList.toggle('is-visible', !!hint && !inDialog); cursor.textContent = hint;
    const card = event.target.closest(tiltSelector);
    if (card !== tiltTarget) resetTilt();
    if (card) { tiltTarget = card; const r = card.getBoundingClientRect(); card.style.setProperty('--play-tilt', `${((event.clientX - r.left) / r.width - .5) * 3}deg`); card.classList.add('play-tilting'); }
  }
  document.addEventListener('pointermove', event => { if (event.pointerType !== 'mouse' || api.motionPaused || !fine.matches) { clearPointer(); return; } lastPointer = event; if (!cursorFrame) cursorFrame = requestAnimationFrame(updatePointer); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', clearPointer);
  document.addEventListener('keydown', clearPointer); window.addEventListener('blur', clearPointer);
  window.addEventListener('scroll', clearPointer, { passive: true });
  document.addEventListener('visibilitychange', clearPointer);
  window.addEventListener('pagehide', clearPointer);
  document.addEventListener('click', event => {
    if (api.motionPaused || !event.detail || event.target.closest('dialog') || !event.target.closest('.wb-chip,[data-save-interest],[data-stack-next]')) return;
    for (let i = 0; i < 5; i++) {
      const petal = el('span', 'click-petal', '✿'); petal.setAttribute('aria-hidden', 'true'); petal.style.left = `${event.clientX}px`; petal.style.top = `${event.clientY}px`; document.body.append(petal);
      const angle = (i / 5) * Math.PI * 2;
      const animation = petal.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 }, { transform: `translate(${Math.cos(angle) * 48}px,${Math.sin(angle) * 48 - 18}px) rotate(90deg) scale(.7)`, opacity: 0 }], { duration: 650, easing: 'ease-out' });
      animation.onfinish = animation.oncancel = () => petal.remove();
    }
  });
  function motionState() {
    document.body.classList.toggle('playful-pointer', fine.matches && !api.motionPaused); clearPointer();
    if (api.motionPaused) { board.getAnimations({ subtree: true }).forEach(a => a.cancel()); document.querySelectorAll('.click-petal').forEach(p => p.remove()); intro(); }
  }
  fine.addEventListener('change', motionState); document.addEventListener('pinkout:motion', motionState);
  motionState();
})();
