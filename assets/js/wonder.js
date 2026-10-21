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

  let context, loops = [], revealed = new WeakSet(), ready = false;
  function build() {
    if (!ready) return;
    context?.revert(); context = null; loops = [];
    ribbons.forEach(fillRibbon);
    updateProgress();
    titles.forEach(splitWords);
    if (calm()) { ST?.refresh(); return; }
    const rtl = root.dir === 'rtl';
    context = gsap.context(() => {
      // Portal: a polka-dot world blooms open as the hero hands over to "About".
      gsap.fromTo('.about-portal', { '--portal': '6%' }, { '--portal': innerWidth <= 800 ? '80%' : '62%', ease: 'none',
        scrollTrigger: { trigger: '.about', start: 'top 95%', end: 'top 15%', scrub: .8 } });

      titles.forEach(title => {
        const words = title.querySelectorAll('.word-in');
        if (revealed.has(title)) return;
        gsap.fromTo(words, { yPercent: 70, rotation: rtl ? -5 : 5, autoAlpha: 0 }, {
          yPercent: 0, rotation: 0, autoAlpha: 1, duration: .85, stagger: .07, ease: 'back.out(1.7)', clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: title, start: 'top 88%', once: true, onEnter: () => revealed.add(title) }
        });
      });

      // Stickers pop in, then drift at their own speed while scrolling.
      document.querySelectorAll('.sticker').forEach((sticker, i) => {
        const host = sticker.closest('section') || sticker.parentElement;
        const speed = (.5 + (i * .37) % 1.1) * (innerWidth <= 800 ? 24 : 46);
        gsap.fromTo(sticker, { y: speed }, { y: -speed, ease: 'none',
          scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        gsap.fromTo(sticker.querySelector('img'), { scale: 0, rotation: i % 2 ? 40 : -40 }, {
          scale: 1, rotation: 0, duration: .9, delay: (i % 4) * .08, ease: 'back.out(2.2)',
          scrollTrigger: { trigger: sticker, start: 'top 95%', once: true } });
      });

      // About cards land like stickers on paper.
      gsap.fromTo('.about-point', { y: 70, scale: .9, rotation: i => [-5, 4, -3][i % 3], autoAlpha: 0 }, {
        y: 0, scale: 1, rotation: 0, autoAlpha: 1, duration: .9, stagger: .12, ease: 'back.out(1.6)', clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: '.about-points', start: 'top 88%', once: true } });

      // Catalog rows slide in from the reading side.
      ST.batch('.world-row', { start: 'top 92%', once: true, onEnter: batch => gsap.fromTo(batch,
        { x: rtl ? 48 : -48, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .7, stagger: .08, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }) });

      // The polaroid straightens as it arrives.
      gsap.fromTo('.polaroid', { rotation: -11, y: 80 }, { rotation: -3, y: 0, ease: 'none',
        scrollTrigger: { trigger: '.event-photo', start: 'top bottom', end: 'center 55%', scrub: 1 } });

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
