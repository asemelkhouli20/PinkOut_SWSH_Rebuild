/* Autonomous brand typography, shared by the homepage and iframe document. */
(() => {
  'use strict';
  const title = document.getElementById('hero-title');
  const slot = title?.querySelector('.out-series-slot');
  const middle = slot?.querySelector('.out-series-word');
  if (!middle || title.dataset.outSeriesReady) return;
  title.dataset.outSeriesReady = 'true';

  const words = ['STEP', 'HANG', 'TRY', 'WORK', 'CHILL', 'BRANCH', 'STAND'];
  const icons = {
    STEP: 'M4 12h13m-5-5 5 5-5 5M4 5v14',
    HANG: 'M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm12 1h2a3 3 0 0 1 0 6h-2M7 3v2m6-2v2',
    TRY: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
    WORK: 'm14 2-9 12h6l-1 8 9-12h-6l1-8Z',
    CHILL: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-4-9v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4',
    BRANCH: 'M5 19C3 8 10 3 21 3c0 11-5 18-16 16ZM5 19 16 8',
    STAND: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z'
  };
  // Both icons and the label stay centred while the coloured space grows.
  const icon = '<svg class="out-series-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path></path></svg>';
  middle.innerHTML = `${icon}<span class="out-series-label"></span>${icon}`;
  const label = middle.querySelector('.out-series-label');
  const paths = middle.querySelectorAll('.out-series-icon path');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = title.closest('.has-hero-video');
  // Transparent illustrated tiles echo each word's icon without obscuring the glass.
  const conceptPatterns = Object.fromEntries(words.map(word => [word, `patterns/${word.toLowerCase()}.svg`]));
  let conceptPattern;
  if (hero) {
    conceptPattern = document.createElement('div');
    conceptPattern.className = 'brand-concept-pattern';
    conceptPattern.setAttribute('aria-hidden', 'true');
    conceptPattern.style.backgroundImage = `url("assets/images/${conceptPatterns.STEP}")`;
    title.closest('.brand-typography').append(conceptPattern);
  }
  // A radial icon burst belongs to the homepage panel, not the compact embed.
  const floaters = [];
  if (hero) {
    const halo = document.createElement('div');
    halo.className = 'brand-floaters';
    halo.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 20; i++) {
      const sticker = document.createElement('span');
      sticker.className = 'brand-floater';
      sticker.innerHTML = icon;
      halo.append(sticker);
      floaters.push(sticker);
    }
    title.closest('.brand-typography').append(halo);
  }
  let floatAnimations = [];
  let index = 0, gapAnimation, wordAnimation, inView = true, pageActive = true;
  let measuredWidth = 0;

  function staticMode() {
    return reduced.matches || window.PinkOut?.motionPaused || navigator.connection?.saveData;
  }
  function visible() {
    return pageActive && inView && !document.hidden && hero?.dataset.covered !== 'true';
  }
  function reset() {
    if (gapAnimation) gapAnimation.onfinish = null;
    gapAnimation?.cancel(); wordAnimation?.cancel();
    floatAnimations.forEach(animation => animation.cancel());
    floatAnimations = [];
    gapAnimation = wordAnimation = null;
    label.textContent = '';
  }
  function cycle(progress = 0) {
    if (!slot.animate || staticMode() || !visible()) return;
    label.textContent = words[index];
    paths.forEach(path => path.setAttribute('d', icons[words[index]]));
    // Measure only the inserted word; the two brand words never change.
    measuredWidth = middle.getBoundingClientRect().width;
    const width = `${measuredWidth}px`;
    const timing = { duration: 3000, fill: 'both', easing: 'linear' };
    if (conceptPattern) conceptPattern.style.backgroundImage = `url("assets/images/${conceptPatterns[words[index]]}")`;
    const panelRect = hero ? title.closest('.brand-typography').getBoundingClientRect() : null;
    const heroRect = hero?.getBoundingClientRect();
    floatAnimations = floaters.map((sticker, i) => {
      sticker.querySelector('path').setAttribute('d', icons[words[index]]);
      const angle = (i / floaters.length) * Math.PI * 2 + index * .17;
      const dx = Math.cos(angle), dy = Math.sin(angle);
      const centerX = panelRect.left + panelRect.width / 2;
      const centerY = panelRect.top + panelRect.height / 2;
      // Keep the burst inside the film, including the narrow phone viewport.
      const roomX = Math.max(0, (dx < 0 ? centerX - heroRect.left : heroRect.right - centerX) - 22);
      const roomY = Math.max(0, (dy < 0 ? centerY - heroRect.top : heroRect.bottom - centerY) - 22);
      const reachX = Math.min(panelRect.width / 2 + 150, roomX);
      const reachY = Math.min(panelRect.height / 2 + 180, roomY);
      const variation = .8 + (i % 4) * .065;
      const x = dx * reachX * variation;
      const y = dy * reachY * variation;
      const spin = (i % 2 ? 1 : -1) * (90 + i * 11);
      const start = .25 + (i % 3) * .008;
      const size = .6 + (i % 4) * .17;
      const pose = (distance, rotation, scale) => `translate(${x * distance}px, ${y * distance}px) rotate(${rotation}deg) scale(${scale})`;
      return sticker.animate([
        { opacity: 0, transform: pose(0, 0, 0), offset: 0 },
        { opacity: 0, transform: pose(0, 0, 0), offset: start, easing: 'cubic-bezier(0,.65,.3,1)' },
        { opacity: 1, transform: pose(.72, spin * .25, size), offset: start + .07, easing: 'ease-out' },
        { opacity: .95, transform: pose(.9, spin * .65, size * .85), offset: start + .17, easing: 'ease-out' },
        { opacity: 0, transform: pose(1, spin, .15), offset: start + .34 },
        { opacity: 0, transform: pose(1, spin, .15), offset: 1 }
      ], timing);
    });
    if (conceptPattern) floatAnimations.push(conceptPattern.animate([
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: .13, easing: 'ease-out' },
      { opacity: .75, offset: .35 },
      { opacity: .75, offset: .7, easing: 'ease-in' },
      { opacity: 0, offset: .92 },
      { opacity: 0, offset: 1 }
    ], timing));
    gapAnimation = slot.animate([
      { width: '0px', offset: 0 },
      { width: '0px', offset: .13, easing: 'cubic-bezier(.45,0,.2,1)' },
      { width, offset: .35 },
      { width, offset: .7, easing: 'cubic-bezier(.45,0,.2,1)' },
      { width: '0px', offset: .92 },
      { width: '0px', offset: 1 }
    ], timing);
    wordAnimation = middle.animate([
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: .2, easing: 'ease-out' },
      { opacity: 1, offset: .35 },
      { opacity: 1, offset: .7, easing: 'ease-in' },
      { opacity: 0, offset: .84 },
      { opacity: 0, offset: 1 }
    ], timing);
    gapAnimation.currentTime = wordAnimation.currentTime = progress;
    floatAnimations.forEach(animation => { animation.currentTime = progress; });
    gapAnimation.onfinish = () => {
      reset();
      index = (index + 1) % words.length;
      cycle();
    };
  }
  function sync() {
    if (staticMode()) { reset(); return; }
    if (!visible()) {
      gapAnimation?.pause(); wordAnimation?.pause();
      floatAnimations.forEach(animation => animation.pause());
      return;
    }
    if (!gapAnimation) cycle();
    else {
      gapAnimation.play(); wordAnimation.play();
      floatAnimations.forEach(animation => animation.play());
    }
  }
  // Keep the current phase when responsive typography changes size.
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    if (!gapAnimation || Math.abs(middle.getBoundingClientRect().width - measuredWidth) < .5) return;
    const progress = gapAnimation.currentTime || 0;
    reset(); cycle(progress);
  }).observe(title);

  ['visibilitychange', 'pinkout:motion', 'pinkout:hero-scene'].forEach(event => document.addEventListener(event, sync));
  reduced.addEventListener('change', sync);
  navigator.connection?.addEventListener?.('change', sync);
  window.addEventListener('pagehide', () => { pageActive = false; sync(); });
  window.addEventListener('pageshow', () => { pageActive = true; sync(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting; sync();
  }).observe(title);
  sync();
})();
