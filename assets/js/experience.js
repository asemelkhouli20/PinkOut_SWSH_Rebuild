/* PinkOut interactions and reversible native-sticky hero choreography. */
(() => {
  'use strict';
  const api = window.PinkOut, gsap = window.gsap, ST = window.ScrollTrigger;
  const hero = document.querySelector('.replica-hero');
  const shell = document.querySelector('.hero-scroll-shell');
  const stickyFrame = document.querySelector('.hero-sticky-frame');
  if (!api || !hero) return;
  if (gsap && ST) gsap.registerPlugin(ST);
  // Header menus belong to nav.js; layout changes ask it to close any open panel.
  const closePanels = () => window.PinkOutNav?.close();
  const track = document.querySelector('.results-track');
  const previous = document.querySelector('[data-carousel-prev]'), next = document.querySelector('[data-carousel-next]');
  // The results carousel is optional; the homepage may not include it.
  function updateCarousel() { if (!track) return; const max = Math.max(0, track.scrollWidth - track.clientWidth); previous.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max - 2; }
  function moveCarousel(direction) {
    const card = track.querySelector('.result-card'); const amount = (card?.getBoundingClientRect().width || track.clientWidth * .8) + 16;
    if (track.scrollBy) track.scrollBy({ left: direction * amount, behavior: api.motionPaused ? 'instant' : 'smooth' }); else track.scrollLeft += direction * amount;
    updateCarousel();
  }
  if (track) { previous.addEventListener('click', () => moveCarousel(-1)); next.addEventListener('click', () => moveCarousel(1)); track.addEventListener('scroll', updateCarousel, { passive: true }); }
  const stage = document.querySelector('.world-stage');
  const choices = Array.from(document.querySelectorAll('[data-stage-world]'));
  const worldImages = Array.from(document.querySelectorAll('.world-story .world-photo img'));
  const base = stage.querySelector('.stage-photo'), incoming = stage.querySelector('.stage-photo-next'), preview = stage.querySelector('.stage-preview img');
  let selected = 0, swap, previewTween, generation = 0;
  function copyImage(to, from) { for (const key of ['src', 'srcset', 'sizes']) { const value = from.getAttribute(key); if (value) to.setAttribute(key, value); else to.removeAttribute(key); } }
  async function chooseWorld(index, animate = true) {
    if (index === selected && animate) return;
    // Finish the visible crossfade before preparing another one; never expose an empty layer.
    swap?.progress(1); swap?.kill(); previewTween?.kill();
    selected = index; const ticket = ++generation;
    choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    const source = worldImages[index];
    if (animate && typeof Image.prototype.decode === 'function') {
      const image = new Image(); copyImage(image, source);
      try { await image.decode(); } catch (_) { return; }
      if (ticket !== generation) return;
    }
    copyImage(incoming, source); copyImage(preview, source);
    if (gsap && !api.motionPaused && animate) {
      gsap.set(base, { opacity: 1 }); gsap.set(incoming, { opacity: 0 });
      swap = gsap.to(incoming, { opacity: 1, duration: .4, ease: 'power2.inOut', onComplete() { if (ticket !== generation) return; copyImage(base, source); gsap.set(incoming, { opacity: 0 }); } });
      previewTween = gsap.fromTo(preview, { scale: 1.045 }, { scale: 1, duration: .7, ease: 'power3.out', overwrite: true });
    } else { copyImage(base, source); incoming.style.opacity = 0; if (gsap) gsap.set(preview, { clearProps: 'transform' }); }
  }
  choices.forEach((button, i) => {
    button.addEventListener('focus', () => chooseWorld(i));
    button.addEventListener('click', () => chooseWorld(i));
  });
  // Native sticky keeps the choices visible while page scrolling visits every world.
  const stageShell = document.createElement('div');
  stageShell.className = 'stage-scroll-shell';
  stageShell.id = 'stage-title';
  stage.before(stageShell); stageShell.append(stage);
  let stageStep = -1;
  function layoutStage() {
    const height = stage.offsetHeight;
    const top = Math.min(72, innerHeight - height);
    stageShell.style.setProperty('--stage-top', top + 'px');
    stageShell.style.setProperty('--stage-height', height + 'px');
    stageShell.style.setProperty('--stage-travel', (api.motionPaused ? 0 : Math.round(Math.max(180, innerHeight * .36) * (choices.length - 1))) + 'px');
    updateStage();
  }
  function updateStage() {
    const travel = parseFloat(stageShell.style.getPropertyValue('--stage-travel'));
    if (!travel) { stageShell.style.setProperty('--stage-progress', '0'); return; }
    const top = parseFloat(stageShell.style.getPropertyValue('--stage-top'));
    const progress = Math.max(0, Math.min(1, (top - stageShell.getBoundingClientRect().top) / travel));
    stageShell.style.setProperty('--stage-progress', progress);
    const index = Math.min(choices.length - 1, Math.floor(progress * choices.length));
    if (index !== stageStep) { stageStep = index; chooseWorld(index, !api.motionPaused); }
  }
  function language() {
    closePanels();
    if (track) { previous.setAttribute('aria-label', api.t('previous')); next.setAttribute('aria-label', api.t('next')); track.setAttribute('aria-label', api.t('allWorlds')); }
    document.querySelector('.cinema-a').textContent = api.t('cinemaFirst'); document.querySelector('.cinema-b').textContent = api.t('cinemaSecond');
    chooseWorld(selected, false);
  }
  document.addEventListener('pinkout:language', language);
  // One lifecycle owns all decorative timelines. Native content is the fallback.
  let context, scope, heroScene, ready = false, entered = false, pageSuspended = false;
  let loops = [], cleanup = [], resizeTimer, languageFrame, lastWidth = innerWidth, lastHeight = innerHeight;
  const listen = (el, type, fn, options = {}) => el?.addEventListener(type, fn, { ...options, signal: scope.signal });
  function syncLoops() { loops.forEach(loop => loop.tween.paused(!loop.visible || document.hidden || pageSuspended || api.motionPaused)); }
  function loopInView(el, tween) {
    const record = { tween, visible: true }; loops.push(record);
    if ('IntersectionObserver' in window) { record.visible = false; const observer = new IntersectionObserver(entries => { record.visible = entries[0].isIntersecting; syncLoops(); }); observer.observe(el); cleanup.push(() => observer.disconnect()); }
    syncLoops();
  }
  function coverVideo(covered) {
    const value = String(covered);
    if (hero.dataset.covered === value) return;
    hero.dataset.covered = value;
    document.dispatchEvent(new CustomEvent('pinkout:hero-scene'));
  }
  function rememberPosition() {
    if (heroScene && scrollY >= heroScene.start && scrollY <= heroScene.end) {
      return { progress: (scrollY - heroScene.start) / Math.max(1, heroScene.end - heroScene.start) };
    }
    const stageRect = stageShell.getBoundingClientRect();
    const stageTop = parseFloat(stageShell.style.getPropertyValue('--stage-top')) || 0;
    const travel = parseFloat(stageShell.style.getPropertyValue('--stage-travel')) || 0;
    if (stageRect.top <= stageTop && stageRect.bottom > innerHeight - 1) {
      return { stageProgress: travel ? Math.max(0, Math.min(1, (stageTop - stageRect.top) / travel)) : 0 };
    }
    for (const element of document.querySelectorAll('main > section,.po-footer')) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom > 100) return { element, top: rect.top };
    }
    return null;
  }
  function restorePosition(position) {
    if (!position) return;
    if ('stageProgress' in position) {
      const top = parseFloat(stageShell.style.getPropertyValue('--stage-top')) || 0;
      const travel = parseFloat(stageShell.style.getPropertyValue('--stage-travel')) || 0;
      window.scrollTo({ top: Math.max(0, scrollY + stageShell.getBoundingClientRect().top - top + position.stageProgress * travel), behavior: 'instant' });
      updateStage(); ST?.update(); return;
    }
    const top = 'progress' in position
      ? (heroScene ? heroScene.start + position.progress * (heroScene.end - heroScene.start) : shell.getBoundingClientRect().top + scrollY)
      : scrollY + position.element.getBoundingClientRect().top - position.top;
    if (Math.abs(top - scrollY) > 1) window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    ST?.update();
    if (heroScene) heroScene.animation.progress(heroScene.progress);
  }
  function destroy() {
    scope?.abort(); loops.forEach(loop => loop.tween.kill()); loops = []; cleanup.forEach(fn => fn()); cleanup = [];
    context?.revert(); context = null; heroScene = null; shell?.classList.remove('cinematic-active'); coverVideo(false);
  }
  function build() {
    if (!ready) return;
    const position = rememberPosition();
    destroy(); scope = new AbortController(); updateCarousel(); layoutStage();
    lastWidth = innerWidth; lastHeight = innerHeight;
    if (!gsap || api.motionPaused) { ST?.refresh(); restorePosition(position); return; }
    const lighter = navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory < 4);
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const rtl = document.documentElement.dir === 'rtl';
    context = gsap.context(() => {
      if (!entered) {
        entered = true;
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro.from(hero.querySelectorAll('.hero-core h1>span'), { y: 20, duration: 1, stagger: .12, clearProps: 'transform' }, .1)
          .from(hero.querySelectorAll('.brand-tagline,.hero-intro'), { y: 12, duration: .8, stagger: .15, clearProps: 'transform' }, .4);
      }
      if (fine && !lighter) {
        const previewFrame = stage.querySelector('.stage-preview');
        const px = gsap.quickTo(previewFrame, 'x', { duration: .8, ease: 'power3.out' }), py = gsap.quickTo(previewFrame, 'y', { duration: .8, ease: 'power3.out' });
        listen(stage, 'pointermove', event => { if (event.pointerType === 'touch') return; const r = stage.getBoundingClientRect(); px(((event.clientX - r.left) / r.width - .5) * Math.min(24, innerWidth * .018)); py(((event.clientY - r.top) / r.height - .5) * 30); }, { passive: true });
        listen(stage, 'pointerleave', () => { px(0); py(0); });
      }
      let cinemaReady = false;
      if (ST && !lighter && shell && innerWidth >= 1024 && innerHeight >= 720) {
        shell.classList.add('cinematic-active');
        // Content fit is measured after the sticky rules apply. Short/zoomed views stay in flow.
        cinemaReady = !stickyFrame.clientHeight || hero.scrollHeight <= stickyFrame.clientHeight + 1;
        if (!cinemaReady) shell.classList.remove('cinematic-active');
      }
      if (cinemaReady) {
        const cinema = document.querySelector('.memory-scene');
        const wall = cinema.querySelector('.cinema-grid');
        const words = cinema.querySelectorAll('.cinema-word');
        const story = gsap.timeline({ defaults: { ease: 'none' },
          onUpdate() { coverVideo(this.progress() > .24); },
          scrollTrigger: { id: 'pinkout-hero-cinema', trigger: shell, start: 'top top', end: 'bottom bottom', scrub: .55, invalidateOnRefresh: true }
        });
        heroScene = story.scrollTrigger;
        // Explicit starting values make the entire sequence reversible after refresh or Back.
        story.fromTo(hero.querySelector('.hero-core'), { autoAlpha: 1, y: 0, scale: 1 }, { autoAlpha: 0, y: -32, scale: .96, duration: .5 }, .05)
          .fromTo(hero.querySelector('.hero-footer'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 22, duration: .5 }, .05)
          .fromTo(hero.querySelector('.hero-backdrop'), { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 1.06, duration: .45 }, .55)
          .fromTo(cinema, { autoAlpha: 0 }, { autoAlpha: 1, duration: .35 }, .6)
          .fromTo(wall, { clipPath: 'inset(28% 28% round 18px)', scale: .94 }, { clipPath: 'inset(0% 0% round 0px)', scale: 1, duration: 1.5, ease: 'power2.inOut' }, .6)
          .fromTo(words, { autoAlpha: 1, x: 0 }, { autoAlpha: 0, x: i => innerWidth * (i === 0 ? (rtl ? .3 : -.3) : (rtl ? -.3 : .3)), duration: .8, ease: 'power2.inOut' }, .65)
          .to(wall, { scale: 1, duration: .5 }, 2.1);
      } else if (ST && !lighter) {
        const wall = document.querySelector('.cinema-grid');
        gsap.fromTo(wall, { y: 24 }, { y: 0, ease: 'none', scrollTrigger: { trigger: '.memory-scene', start: 'top 95%', end: 'center 60%', scrub: .7 } });
        gsap.fromTo(wall.querySelector('.cinema-main img'), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: wall, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      }
      if (ST) {
        document.querySelectorAll('.result-card,.story-panel,.news-card,.feature-tile').forEach((card, i) => {
          gsap.fromTo(card, { y: 22 }, { y: 0, duration: .65, delay: (i % 3) * .05, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: card, start: 'top 96%', once: true } });
        });
        document.querySelectorAll('.reveal-title').forEach(title => gsap.fromTo(title, { y: 24 }, { y: 0, duration: .9, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: title, start: 'top 92%', once: true } }));
        if (!lighter) {
          document.querySelectorAll('.device').forEach((phone, i) => gsap.fromTo(phone, { y: 0, scale: .96, rotation: i === 0 ? -7 : i === 2 ? 7 : 0 }, { y: 0, scale: 1, rotation: i === 0 ? -7 : i === 2 ? 7 : 0, ease: 'none', scrollTrigger: { trigger: '.device-scene', start: 'top 95%', end: 'center 45%', scrub: 1 } }));
          document.querySelectorAll('.device-tag').forEach((tag, i) => gsap.fromTo(tag, { y: 70 + i * 30 }, { y: -10, ease: 'none', scrollTrigger: { trigger: '.device-scene', start: 'top bottom', end: 'bottom top', scrub: 1 } }));
          gsap.fromTo(document.querySelector('.world-catalog'), { y: 24, scale: 1 }, { y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.world-catalog', start: 'top 95%', end: 'top 30%', scrub: .8 } });
          document.querySelectorAll('.story-photo img,.vision-image img').forEach(image => gsap.fromTo(image, { scale: 1.12, yPercent: -2 }, { scale: 1.02, yPercent: 2, ease: 'none', scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
          document.querySelectorAll('.closing-photo').forEach((photo, i) => {
            gsap.fromTo(photo, { y: i % 2 ? 100 : -100, scale: .7 }, { y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'center 65%', scrub: 1 } });
            loopInView(photo, gsap.to(photo.querySelector('.floaty'), { y: i % 2 ? 10 : -10, duration: 4 + i * .3, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
          });
          document.querySelectorAll('.photo-ball').forEach((ball, i) => loopInView(ball, gsap.to(ball, { y: i % 2 ? -28 : 15, rotation: i % 2 ? -10 : 20, duration: 3.5 + i * .25, repeat: -1, yoyo: true, ease: 'sine.inOut' })));
        }
      }
      document.querySelectorAll('.faq-item').forEach(item => listen(item, 'toggle', () => { if (item.open) context?.add(() => gsap.fromTo(item.querySelector('p'), { y: 10, autoAlpha: .3 }, { y: 0, autoAlpha: 1, duration: .35, clearProps: 'transform,opacity,visibility' })); }));
    });
    ST?.refresh(); restorePosition(position);
  }
  document.addEventListener('pinkout:stack', event => { if (api.motionPaused || !context) return; const image = event.detail.front.querySelector('img'); context.add(() => gsap.fromTo(image, { opacity: .35, scale: 1.04 }, { opacity: 1, scale: 1, duration: .5, ease: 'power3.out', overwrite: 'auto' })); });
  document.addEventListener('pinkout:save', event => { if (api.motionPaused || !context) return; context.add(() => gsap.fromTo(event.detail.button.querySelector('.save-symbol'), { scale: 1.6 }, { scale: 1, duration: .5, ease: 'back.out(2)', overwrite: 'auto' })); });
  document.addEventListener('pinkout:motion', () => { swap?.kill(); chooseWorld(selected, false); build(); });
  document.addEventListener('pinkout:language', () => { cancelAnimationFrame(languageFrame); languageFrame = requestAnimationFrame(build); });
  document.addEventListener('visibilitychange', syncLoops);
  let scrollFrame = 0;
  function reconcileHero() {
    if (!heroScene) return;
    // Same-document history restores scroll without pageshow. Read the actual position,
    // then finish the old scrub before rendering that position's frame.
    const progress = gsap.utils.clamp(0, 1, (scrollY - heroScene.start) / Math.max(1, heroScene.end - heroScene.start));
    heroScene.getTween()?.progress(1);
    heroScene.animation.progress(progress);
  }
  function scrollState() {
    scrollFrame = 0; document.body.classList.toggle('is-scrolled', scrollY > 90); updateStage();
    if (heroScene && (scrollY <= heroScene.start + 1 || scrollY >= heroScene.end)) reconcileHero();
  }
  let navigationFrame;
  function restoreHistory() {
    cancelAnimationFrame(navigationFrame);
    navigationFrame = requestAnimationFrame(() => {
      navigationFrame = requestAnimationFrame(() => { ST?.update(); reconcileHero(); scrollState(); });
    });
  }
  window.addEventListener('popstate', restoreHistory);
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollState); }, { passive: true });
  window.addEventListener('resize', () => {
    updateCarousel(); layoutStage();
    const changedTier = (innerWidth >= 1024 && innerHeight >= 720) !== (lastWidth >= 1024 && lastHeight >= 720);
    const heightThreshold = shell?.classList.contains('cinematic-active') ? 5 : 80;
    if (Math.abs(innerWidth - lastWidth) < 5 && Math.abs(innerHeight - lastHeight) < heightThreshold && !changedTier) return;
    closePanels(); clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 180);
  });
  // Intrinsic-size changes (FAQ, translated text, downloaded media) update scroll markers.
  // A full refresh briefly resets the scroll position, which cancels any smooth scroll in progress,
  // so it only runs when the page height really changed (images reserve their space and usually don't).
  let refreshFrame, refreshedHeight = 0;
  const refreshLayout = () => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => {
      updateCarousel(); layoutStage();
      const height = document.documentElement.scrollHeight;
      if (height !== refreshedHeight) { refreshedHeight = height; ST?.refresh(); }
    });
  };
  document.querySelectorAll('img').forEach(image => { if (!image.complete) image.addEventListener('load', refreshLayout, { once: true }); });
  document.querySelectorAll('.faq-item').forEach(item => item.addEventListener('toggle', refreshLayout));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => { updateCarousel(); layoutStage(); }); if (track) observer.observe(track); observer.observe(stage);
  }
  window.addEventListener('pagehide', () => { clearTimeout(resizeTimer); cancelAnimationFrame(languageFrame); cancelAnimationFrame(refreshFrame); cancelAnimationFrame(scrollFrame); cancelAnimationFrame(navigationFrame); ++generation; swap?.progress(1); swap?.kill(); previewTween?.kill(); pageSuspended = true; syncLoops(); });
  window.addEventListener('pageshow', () => { pageSuspended = false; scrollState(); if (ready && !context) build(); else { ST?.refresh(); ST?.update(); if (heroScene) { reconcileHero(); } gsap?.ticker.wake(); syncLoops(); } });
  language(); scrollState(); updateCarousel();
  function alignStageAnchor() {
    if (location.hash !== '#stage-title') return;
    window.scrollTo({ top: Math.max(0, scrollY + stageShell.getBoundingClientRect().top - 72), behavior: 'instant' });
    updateStage();
  }
  window.addEventListener('hashchange', alignStageAnchor);
  Promise.resolve(document.fonts?.ready).then(() => { ready = true; build(); alignStageAnchor(); });
})();
