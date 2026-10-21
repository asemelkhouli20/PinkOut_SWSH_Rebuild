/* Small, purposeful interactions. Native scrolling and keyboard controls stay intact. */
(() => {
  'use strict';
  const api = window.PinkOut;
  const catalog = document.querySelector('.world-catalog');
  if (!api || !catalog) return;
  const words = {
    ar: { eyebrow: 'YOUR MOOD. YOUR PINKOUT.', title: 'وش جوّك اليوم؟', intro: 'اختاري إحساسك، ونرتّب لك ثلاث تجارب تستكشفينها.', moods: ['أبدع', 'أروق', 'أتحرّك', 'أكتشف'], surprise: 'اختاري لي ✿', route: 'جولتك المقترحة', explore: 'استكشفي', save: 'احفظي', saved: 'محفوظة', picks: 'اختياراتي', empty: 'اضغطي على القلب واحفظي التجارب اللي تشبهك.', note: 'للاكتشاف والإلهام · البرنامج والمواعيد تُعلن لاحقًا', open: 'افتحي الصورة', close: 'إغلاق الصور', previous: 'الصورة السابقة', next: 'الصورة التالية', gallery: 'لحظات PinkOut', caption: 'صور تعبّر عن الأجواء، وليست توثيقًا لفعاليات PinkOut.', hint: 'اكتشفي', updated: 'تغيّرت جولتك إلى', remove: 'إزالة' },
    en: { eyebrow: 'YOUR MOOD. YOUR PINKOUT.', title: 'What’s your mood?', intro: 'Pick a feeling. Find three experiences to make it yours.', moods: ['Create', 'Unwind', 'Move', 'Discover'], surprise: 'Surprise me ✿', route: 'Your suggested route', explore: 'Explore', save: 'Save', saved: 'Saved', picks: 'My picks', empty: 'Tap a heart to collect the experiences that feel like you.', note: 'Ideas to explore · Programme and dates to be announced', open: 'Open photo', close: 'Close photos', previous: 'Previous photo', next: 'Next photo', gallery: 'PinkOut moments', caption: 'Images illustrate the mood, not past PinkOut events.', hint: 'Explore', updated: 'Your route is now', remove: 'Remove' }
  };
  const w = () => words[api.language];
  const worlds = [...catalog.querySelectorAll('.world-story')];
  const routes = [[1,4,2], [2,4,7], [3,6,2], [7,5,1]];
  const source = id => worlds[id - 1];
  const worldName = id => source(id).querySelector('.world-copy > p').textContent;
  const worldImage = id => source(id).querySelector('.world-photo img');
  const isSaved = id => source(id).querySelector('[data-save-interest]').getAttribute('aria-pressed') === 'true';
  const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; };
  const button = (cls, text) => { const node = el('button', cls, text); node.type = 'button'; return node; };
  const animate = (node, frames, options) => {
    if (api.motionPaused || !node.animate) return;
    node.getAnimations().forEach(a => a.cancel());
    node.animate(frames, { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', ...options });
  };
  document.querySelector('[data-copy="communityCTA"]')?.closest('a')?.setAttribute('href', '#mood-picker');
  let mood = 0;
  const planner = el('section', 'mood-planner');
  planner.id = 'mood-picker'; planner.setAttribute('aria-labelledby', 'mood-title');
  const intro = el('div', 'mood-intro');
  const eyebrow = el('p', 'mood-eyebrow'); eyebrow.dir = 'ltr';
  const title = el('h3'); title.id = 'mood-title';
  const description = el('p', 'mood-description');
  const flower = el('span', 'mood-flower', '✿'); flower.setAttribute('aria-hidden', 'true');
  const controls = el('div', 'mood-controls'); controls.setAttribute('role', 'group');
  const chips = routes.map((_, index) => {
    const chip = button('mood-chip');
    chip.addEventListener('click', () => selectMood(index)); controls.append(chip); return chip;
  });
  const surprise = button('mood-surprise');
  surprise.addEventListener('click', () => selectMood((mood + 1 + Math.floor(Math.random() * 3)) % 4));
  intro.append(eyebrow, title, description, controls, surprise, flower);
  const route = el('div', 'mood-route');
  const routeLabel = el('p', 'mood-route-label');
  const cards = el('div', 'mood-cards');
  const note = el('p', 'mood-note');
  const status = el('p', 'sr-only'); status.setAttribute('role', 'status');
  const collection = el('details', 'mood-collection');
  const collectionSummary = el('summary');
  const collectionList = el('div', 'mood-saved-list'); collection.append(collectionSummary, collectionList);
  route.append(routeLabel, cards, note, collection, status); planner.append(intro, route); catalog.before(planner);
  const routeCards = Array.from({ length: 3 }, (_, index) => {
    const card = el('article', 'mood-card');
    const photo = button('mood-photo'); const img = el('img'); img.loading = 'lazy'; img.width = 480; img.height = 320;
    const number = el('span', 'mood-number', `0${index + 1}`); number.setAttribute('aria-hidden', 'true');
    photo.append(img, number);
    const info = el('div', 'mood-card-info'); const name = el('h4'); name.dir = 'ltr';
    const actions = el('div', 'mood-card-actions'); const link = el('a'); const save = button('mood-save');
    photo.addEventListener('click', () => openGallery(routes[mood][index] - 1, photo));
    save.addEventListener('click', () => source(routes[mood][index]).querySelector('[data-save-interest]').click());
    actions.append(link, save); info.append(name, actions); card.append(photo, info); cards.append(card);
    return { card, photo, img, name, link, save };
  });
  let refreshFrame;
  function refreshLayout() { cancelAnimationFrame(refreshFrame); refreshFrame = requestAnimationFrame(() => window.ScrollTrigger?.refresh()); }
  collection.addEventListener('toggle', refreshLayout);
  function renderCollection() {
    const saved = worlds.map((_, i) => i + 1).filter(isSaved);
    collectionSummary.textContent = `${w().picks} (${saved.length}) ♡`;
    collectionList.replaceChildren();
    if (!saved.length) collectionList.append(el('p', '', w().empty));
    saved.forEach(id => { const link = el('a', '', `${worldName(id)} ↗`); link.href = `#world-${id}`; collectionList.append(link); });
    if (collection.open) refreshLayout();
    routeCards.forEach((item, i) => {
      const id = routes[mood][i]; const saved = isSaved(id);
      item.save.textContent = saved ? '♥' : '♡'; item.save.setAttribute('aria-pressed', String(saved));
      item.save.setAttribute('aria-label', `${saved ? w().remove : w().save} ${worldName(id)}`);
    });
  }
  function renderRoute(moving = false) {
    planner.dataset.mood = String(mood);
    chips.forEach((chip, i) => { chip.textContent = w().moods[i]; chip.setAttribute('aria-pressed', String(i === mood)); });
    routeLabel.textContent = `${w().route} / ${w().moods[mood]}`;
    routeCards.forEach((item, i) => {
      const id = routes[mood][i]; const image = worldImage(id);
      item.img.src = image.getAttribute('src').replace('-900.', '-480.'); item.img.alt = image.alt;
      item.photo.setAttribute('aria-label', `${w().open}: ${worldName(id)}`);
      item.name.textContent = worldName(id); item.link.href = `#world-${id}`; item.link.textContent = `${w().explore} ↗`;
      if (moving) animate(item.card, [{ opacity: .4, translate: '0 14px', rotate: `${i - 1}deg` }, { opacity: 1, translate: '0 0', rotate: '0deg' }], { delay: i * 55 });
    });
    renderCollection();
  }
  function selectMood(index) {
    mood = index; renderRoute(true); status.textContent = `${w().updated} ${w().moods[mood]}`;
    animate(flower, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(180deg)' }], { duration: 650 });
  }

  // One native dialog keeps focus, Escape and assistive-technology behavior predictable.
  let galleryIndex = 0; let galleryOpener;
  const gallery = el('dialog', 'moment-gallery'); gallery.setAttribute('aria-labelledby', 'moment-title');
  const galleryHead = el('div', 'moment-head'); const galleryTitle = el('h2'); galleryTitle.id = 'moment-title';
  const close = button('moment-close', '×'); close.addEventListener('click', () => gallery.close());
  galleryHead.append(galleryTitle, close);
  const galleryImg = el('img', 'moment-image'); galleryImg.src = worldImage(1).getAttribute('src'); galleryImg.alt = worldImage(1).alt; galleryImg.width = 900; galleryImg.height = 600;
  const galleryFoot = el('div', 'moment-foot'); const previous = button('moment-nav', '←'); const next = button('moment-nav', '→');
  const caption = el('p', 'moment-caption'); const counter = el('p', 'moment-counter'); counter.setAttribute('aria-live', 'polite');
  galleryFoot.append(previous, counter, next); gallery.append(galleryHead, galleryImg, galleryFoot, caption); document.body.append(gallery);
  function showPhoto() {
    const image = worldImage(galleryIndex + 1);
    galleryImg.src = image.getAttribute('src'); galleryImg.alt = image.alt;
    galleryTitle.textContent = worldName(galleryIndex + 1); counter.textContent = `${galleryIndex + 1} / ${worlds.length}`;
    animate(galleryImg, [{ opacity: .45, scale: '.98' }, { opacity: 1, scale: '1' }]);
  }
  function openGallery(index, opener) {
    galleryIndex = index; galleryOpener = opener; showPhoto(); gallery.showModal(); document.body.classList.add('gallery-open');
  }
  function stepPhoto(direction) { galleryIndex = (galleryIndex + direction + worlds.length) % worlds.length; showPhoto(); }
  previous.addEventListener('click', () => stepPhoto(-1)); next.addEventListener('click', () => stepPhoto(1));
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); stepPhoto(event.key === 'ArrowRight' ? 1 : -1); }
  });
  gallery.addEventListener('click', event => { if (event.target !== gallery) return; const r = gallery.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) gallery.close(); });
  gallery.addEventListener('close', () => { document.body.classList.remove('gallery-open'); galleryOpener?.focus({ preventScroll: true }); });
  const photoButtons = [];
  worlds.forEach((world, index) => {
    const photo = world.querySelector('.world-photo'); const open = button('photo-open', '↗');
    open.addEventListener('click', () => openGallery(index, open)); photo.append(open); photoButtons.push({ open, index });
  });
  document.querySelectorAll('.story-photo').forEach((photo, index) => {
    const open = button('photo-open', '↗'); const id = [0,1,2][index];
    open.addEventListener('click', () => openGallery(id, open)); photo.append(open); photoButtons.push({ open, index: id });
  });
  function translate() {
    status.textContent = '';
    eyebrow.textContent = w().eyebrow; title.textContent = w().title; description.textContent = w().intro;
    surprise.textContent = w().surprise; note.textContent = w().note; controls.setAttribute('aria-label', w().title);
    close.setAttribute('aria-label', w().close); previous.setAttribute('aria-label', w().previous); next.setAttribute('aria-label', w().next); caption.textContent = w().caption;
    photoButtons.forEach(({open, index}) => open.setAttribute('aria-label', `${w().open}: ${worldName(index + 1)}`));
    renderRoute(); if (gallery.open) showPhoto();
  }
  document.addEventListener('pinkout:language', translate);
  document.addEventListener('pinkout:saved-change', renderCollection);

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
      <path class="cursor-motif cursor-motif-sparkle" fill="#b99aff" d="M24 2 30 16 46 24 30 30 24 46 18 30 2 24 18 18Z"/>
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
  const tiltSelector = '.result-card,.feature-tile,.mood-card';
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
        if (distance > 3 && now - lastSpark > 24) {
          for (let i = 0; i < 3; i++) emitSpark(event.clientX, event.clientY, dx, dy);
          lastSpark = now;
        }
      }
      previousPoint = { x: event.clientX, y: event.clientY };
    }
    const hint = target?.matches('.photo-open,.mood-photo') ? w().open : target?.matches('.mood-save,[data-save-interest]') ? (target.getAttribute('aria-pressed') === 'true' ? w().remove : w().save) : target?.matches('a') ? w().hint : '';
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
    if (api.motionPaused || !event.detail || event.target.closest('dialog') || !event.target.closest('.mood-chip,.mood-surprise,.mood-save,[data-save-interest],[data-stack-next]')) return;
    for (let i = 0; i < 5; i++) {
      const petal = el('span', 'click-petal', '✿'); petal.setAttribute('aria-hidden', 'true'); petal.style.left = `${event.clientX}px`; petal.style.top = `${event.clientY}px`; document.body.append(petal);
      const angle = (i / 5) * Math.PI * 2;
      const animation = petal.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 }, { transform: `translate(${Math.cos(angle) * 48}px,${Math.sin(angle) * 48 - 18}px) rotate(90deg) scale(.7)`, opacity: 0 }], { duration: 650, easing: 'ease-out' });
      animation.onfinish = animation.oncancel = () => petal.remove();
    }
  });
  function motionState() {
    document.body.classList.toggle('playful-pointer', fine.matches && !api.motionPaused); clearPointer();
    if (api.motionPaused) { planner.getAnimations({ subtree: true }).forEach(a => a.cancel()); gallery.getAnimations({ subtree: true }).forEach(a => a.cancel()); document.querySelectorAll('.click-petal').forEach(p => p.remove()); }
  }
  fine.addEventListener('change', motionState); document.addEventListener('pinkout:motion', motionState);
  translate(); motionState();
})();
