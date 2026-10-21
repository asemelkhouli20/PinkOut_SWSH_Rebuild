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
    const timing = { duration: 5200, fill: 'both', easing: 'linear' };
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
    gapAnimation.onfinish = () => {
      reset();
      index = (index + 1) % words.length;
      cycle();
    };
  }
  function sync() {
    if (staticMode()) { reset(); return; }
    if (!visible()) { gapAnimation?.pause(); wordAnimation?.pause(); return; }
    if (!gapAnimation) cycle();
    else { gapAnimation.play(); wordAnimation.play(); }
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
