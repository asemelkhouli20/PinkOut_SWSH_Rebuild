/* PinkOut "new world" scroll layer: portal bloom, stickers, ribbons, word reveals, polaroid and sparkles.
   Decorative only. Paused motion, reduced motion and data saving leave everything in its settled state. */
(() => {
  'use strict';
  const api = window.PinkOut, gsap = window.gsap, ST = window.ScrollTrigger;
  if (!api || !document.querySelector('.about')) return;
  if (gsap && ST) gsap.registerPlugin(ST);
  const root = document.documentElement;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const lighter = () => navigator.connection?.saveData;
  const calm = () => api.motionPaused || lighter() || !gsap || !ST;

  // Scroll progress ribbon.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress'; progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<i></i><b>♥</b>';
  document.body.append(progress);
  let progressFrame = 0;
  function updateProgress() {
    progressFrame = 0;
    const max = root.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : '0');
  }
  addEventListener('scroll', () => { if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress); }, { passive: true });
  addEventListener('resize', updateProgress);

  // Sparkles drift up through the pink event card and the closing card.
  const sparkleGlyphs = ['✦', '♡', '✿', '✧', '♥'];
  const sparkleColours = ['#df004c', '#ff8fc0', '#b58aff', '#ffcf40', '#ffffff'];
  document.querySelectorAll('.product-scene, .closing').forEach(host => {
    const layer = document.createElement('div');
    layer.className = 'sparkles'; layer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('i');
      s.textContent = sparkleGlyphs[i % sparkleGlyphs.length];
      s.style.left = `${(i * 37 + 7) % 100}%`;
      s.style.setProperty('--z', `${12 + (i * 7) % 14}px`);
      s.style.setProperty('--c', sparkleColours[i % sparkleColours.length]);
      s.style.setProperty('--t', `${8 + (i * 5) % 7}s`);
      s.style.setProperty('--w', `${-(i * 1.3).toFixed(1)}s`);
      layer.append(s);
    }
    host.prepend(layer);
  });

  // Whole words rise into place. Arabic words are never split into letters.
  const titles = Array.from(document.querySelectorAll('.reveal-title'));
  function splitWords(title) {
    if (title.querySelector('.word')) return;
    const text = title.textContent;
    title.textContent = '';
    text.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { title.append(part); return; }
      const word = document.createElement('span'); word.className = 'word';
      const inner = document.createElement('span'); inner.className = 'word-in'; inner.textContent = part;
      word.append(inner); title.append(word);
    });
  }

  // Ribbons loop seamlessly: the run holds an even number of identical sets.
  const ribbons = Array.from(document.querySelectorAll('.ribbon'));
  ribbons.forEach(ribbon => { const run = ribbon.querySelector('.ribbon-run'); run.dataset.set = run.children.length; });
  function fillRibbon(ribbon) {
    const run = ribbon.querySelector('.ribbon-run');
    const setSize = Number(run.dataset.set);
    while (run.children.length > setSize) run.lastElementChild.remove();
    const setWidth = run.scrollWidth || 1;
    const copies = Math.max(1, Math.ceil(ribbon.offsetWidth / setWidth));
    const base = Array.from(run.children);
    for (let c = 1; c < copies * 2; c++) base.forEach(node => run.append(node.cloneNode(true)));
  }

  // Tapping a sticker makes it wiggle and release a few hearts.
  document.querySelectorAll('.sticker').forEach(sticker => sticker.addEventListener('pointerdown', event => {
    sticker.classList.remove('is-wiggle'); void sticker.offsetWidth; sticker.classList.add('is-wiggle');
    setTimeout(() => sticker.classList.remove('is-wiggle'), 720);
    if (api.motionPaused || !document.body.animate) return;
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('span');
      heart.className = 'sticker-heart'; heart.textContent = i % 2 ? '♡' : '♥'; heart.setAttribute('aria-hidden', 'true');
      heart.style.left = `${event.clientX}px`; heart.style.top = `${event.clientY}px`;
      document.body.append(heart);
      const angle = -Math.PI / 2 + (i - 2) * .45;
      const animation = heart.animate([
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * 54 - 9}px,${Math.sin(angle) * 54 - 9}px) scale(1.1)`, opacity: 0 }
      ], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' });
      animation.onfinish = animation.oncancel = () => heart.remove();
    }
  }));

  // Mood stage: every world brings its own colour, sticker and description.
  // experience.js picks the world from the scroll position; this follows its aria-pressed choice.
  const stage = document.querySelector('.mood-stage');
  if (stage) {
    const stageStickers = ['painting-palette', 'boba-tea', 'roller-skate', 'perfume', 'shopping-tote', 'headphones', 'instant-camera'];
    const choiceButtons = Array.from(stage.querySelectorAll('[data-stage-world]'));
    const part = selector => stage.querySelector(selector);
    const sticker = part('.ms-sticker img'), count = part('.ms-count b'), mark = part('.ms-watermark');
    const detail = part('.ms-detail'), arch = part('.ms-arch');
    let current = 0, preloaded = false;
    function showWorld(index, animateIn) {
      const story = document.getElementById(`world-${index + 1}`);
      if (!story) return;
      const brand = story.querySelector('.world-copy > p').textContent;
      stage.dataset.world = String(index + 1);
      count.textContent = String(index + 1).padStart(2, '0');
      mark.textContent = brand; part('.ms-name').textContent = brand;
      part('.ms-heading').textContent = story.querySelector('h3').textContent;
      part('.ms-text').textContent = story.querySelector('.world-story-description').textContent;
      sticker.src = `assets/images/stickers/${stageStickers[index]}.webp`;
      if (!animateIn || api.motionPaused || !sticker.animate) return;
      const ease = 'cubic-bezier(.2,.8,.2,1)';
      sticker.animate([{ transform: 'translateY(14px) scale(.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, easing: ease });
      arch.animate([{ transform: 'scale(.97)', opacity: .7 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: ease });
      detail.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
      mark.animate([{ opacity: 0, transform: 'translateY(25%)' }, { opacity: .5, transform: 'none' }], { duration: 520, easing: 'ease-out' });
    }
    const follow = new MutationObserver(() => {
      const index = choiceButtons.findIndex(button => button.getAttribute('aria-pressed') === 'true');
      if (index < 0 || index === current) return;
      current = index; showWorld(index, true);
    });
    choiceButtons.forEach(button => follow.observe(button, { attributes: true, attributeFilter: ['aria-pressed'] }));
    // Fetch the other six stickers once the stage is close, so each swap is instant.
    if ('IntersectionObserver' in window) {
      const near = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting || preloaded) return;
        preloaded = true; near.disconnect();
        stageStickers.forEach(name => { const image = new Image(); image.src = `assets/images/stickers/${name}.webp`; });
      }, { rootMargin: '800px 0px' });
      near.observe(stage);
    }
    document.addEventListener('pinkout:language', () => showWorld(current, false));
    showWorld(0, false);
  }

  let context, loops = [], revealed = new WeakSet(), ready = false;
  function build() {
    if (!ready) return;
    context?.revert(); context = null; loops = [];
    ribbons.forEach(fillRibbon);
    updateProgress();
    titles.forEach(splitWords);
    if (calm()) {
      document.querySelector('.visit-track')?.style.setProperty('--visit', '1');
      document.querySelectorAll('.visit-step').forEach(step => step.classList.add('is-on'));
      ST?.refresh(); return;
    }
    const rtl = root.dir === 'rtl';
    context = gsap.context(() => {
      // Portal: a polka-dot world blooms open as the hero hands over to "About".
      gsap.fromTo('.about-portal', { '--portal': '6%' }, { '--portal': innerWidth <= 800 ? '80%' : '62%', ease: 'none',
        scrollTrigger: { trigger: '.about', start: 'top 95%', end: 'top 15%', scrub: .8 } });

      titles.forEach(title => {
        const words = title.querySelectorAll('.word-in');
        if (revealed.has(title)) return;
        gsap.fromTo(words, { yPercent: 55, autoAlpha: 0 }, {
          yPercent: 0, autoAlpha: 1, duration: .9, stagger: .06, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: title, start: 'top 88%', once: true, onEnter: () => revealed.add(title) }
        });
      });

      // Stickers settle in softly, then drift at their own speed while scrolling.
      document.querySelectorAll('.sticker').forEach((sticker, i) => {
        const host = sticker.closest('section,footer') || sticker.parentElement;
        const speed = (.5 + (i * .37) % 1.1) * (innerWidth <= 800 ? 24 : 46);
        gsap.fromTo(sticker, { y: speed }, { y: -speed, ease: 'none',
          scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        gsap.fromTo(sticker.querySelector('img'), { scale: .6, autoAlpha: 0 }, {
          scale: 1, autoAlpha: 1, duration: 1, delay: (i % 4) * .08, ease: 'power3.out', clearProps: 'opacity,visibility',
          scrollTrigger: { trigger: sticker, start: 'top 95%', once: true } });
      });

      // About cards rise in sequence.
      gsap.fromTo('.about-point', { y: 56, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: .9, stagger: .12, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: '.about-points', start: 'top 88%', once: true } });

      // Catalog rows slide in from the reading side.
      ST.batch('.world-row', { start: 'top 92%', once: true, onEnter: batch => gsap.fromTo(batch,
        { x: rtl ? 48 : -48, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .7, stagger: .08, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }) });

      // The polaroid straightens as it arrives.
      gsap.fromTo('.polaroid', { rotation: -9, y: 70 }, { rotation: -3, y: 0, ease: 'none',
        scrollTrigger: { trigger: '.event-photo', start: 'top bottom', end: 'center 55%', scrub: 1 } });

      // Visit journey: the path draws with the scroll and each stop lights up as it is reached.
      const track = document.querySelector('.visit-track');
      if (track) {
        const steps = Array.from(track.querySelectorAll('.visit-step'));
        ST.create({ trigger: track, start: 'top 72%', end: 'bottom 62%', scrub: .6,
          onUpdate: self => {
            track.style.setProperty('--visit', self.progress.toFixed(4));
            steps.forEach((step, i) => step.classList.toggle('is-on', self.progress >= i / (steps.length - 1) - .02));
          } });
        gsap.fromTo(steps, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: track, start: 'top 85%', once: true } });
      }

      // Themed days: the room rises in as you arrive, and its motifs drift at different depths while scrolling.
      const room = document.querySelector('.theme-room');
      if (room) {
        gsap.fromTo(room, { y: 60, scale: .97 }, { y: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: room, start: 'top bottom', end: 'top 45%', scrub: .8 } });
        // Parallax moves the inner icon, so it never fights the CSS pop-in scale on the .motif wrapper.
        gsap.utils.toArray(room.querySelectorAll('.scene-motifs')).forEach(layer => {
          gsap.fromTo(layer.querySelectorAll('.motif svg'), { y: i => 40 + (i % 3) * 30 }, { y: i => -(40 + (i % 3) * 30), ease: 'none',
            scrollTrigger: { trigger: room, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
      }

      // App phone and its stickers drift at different depths as the card passes.
      if (document.querySelector('.app-card')) {
        const opts = { ease: 'none', scrollTrigger: { trigger: '.app-card', start: 'top bottom', end: 'bottom top', scrub: 1 } };
        gsap.fromTo('.app-phone', { y: 70 }, { y: -40, ...opts });
        gsap.fromTo('.app-sticker-1', { y: 120 }, { y: -90, ...opts });
        gsap.fromTo('.app-sticker-2', { y: -30 }, { y: 70, ...opts });
      }

      // Partner chips arrive one after another.
      gsap.fromTo('.partners-chips li', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .06, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: '.partners-chips', start: 'top 90%', once: true } });

      // Footer: the giant wordmark gathers together as you reach the end of the page.
      const mark = document.querySelector('.po-wordmark');
      if (mark) gsap.fromTo(mark, { '--wm-track': '.3em', opacity: .06 }, { '--wm-track': '-.05em', opacity: .17, ease: 'none',
        scrollTrigger: { trigger: mark, start: 'top bottom', end: 'bottom bottom', scrub: .6 } });

      // Ribbons run on their own and answer the scroll: faster with speed, reversing with direction.
      ribbons.forEach((ribbon, i) => {
        const loop = gsap.to(ribbon.querySelector('.ribbon-run'), { xPercent: -50, duration: 38 + i * 6, ease: 'none', repeat: -1,
          onReverseComplete() { this.totalTime(this.rawTime() + this.duration() * 100); } });
        loop.totalTime(loop.duration() * 100);
        loop.timeScale(i ? -1 : 1); loops.push({ loop, sign: i ? -1 : 1 });
      });
      ST.create({ trigger: '.ribbon-band', start: 'top bottom', end: 'bottom top',
        onToggle: self => loops.forEach(({ loop }) => loop.paused(!self.isActive)),
        onUpdate: self => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
          loops.forEach(({ loop, sign }) => {
            gsap.to(loop, { timeScale: sign * self.direction * boost, duration: .2, overwrite: true });
            gsap.to(loop, { timeScale: sign * self.direction, duration: 1, delay: .25 });
          });
        } });

      // Desktop: stickers lean gently toward the pointer.
      if (fine.matches) {
        const movers = Array.from(document.querySelectorAll('.sticker-bob')).map((bob, i) => ({
          x: gsap.quickTo(bob.parentElement, 'x', { duration: 1.2, ease: 'power3.out' }), depth: 6 + (i % 4) * 5 }));
        const onMove = event => {
          const dx = event.clientX / innerWidth - .5, dy = event.clientY / innerHeight - .5;
          movers.forEach(m => m.x(dx * m.depth * (dy > 0 ? 1.2 : 1)));
        };
        addEventListener('pointermove', onMove, { passive: true });
        return () => removeEventListener('pointermove', onMove);
      }
    });
    ST.refresh();
    const ribbonView = ST.getAll().find(trigger => trigger.vars.trigger === '.ribbon-band');
    loops.forEach(({ loop }) => loop.paused(!ribbonView?.isActive));
  }

  let resizeTimer, lastWidth = innerWidth;
  addEventListener('resize', () => {
    if (Math.abs(innerWidth - lastWidth) < 40) return;
    lastWidth = innerWidth; clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 220);
  });
  document.addEventListener('pinkout:language', () => {
    // New copy replaced the split titles; anything already revealed stays visible.
    titles.forEach(splitWords);
    requestAnimationFrame(build);
  });
  document.addEventListener('pinkout:motion', build);
  addEventListener('pagehide', () => loops.forEach(({ loop }) => loop.pause()));
  Promise.resolve(document.fonts?.ready).then(() => { ready = true; build(); });
})();
