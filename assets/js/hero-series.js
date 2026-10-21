/* Autonomous brand typography, shared by the homepage and iframe document. */
(() => {
  'use strict';
  const title = document.getElementById('hero-title');
  const slot = title?.querySelector('.out-series-slot');
  const middle = slot?.querySelector('.out-series-word');
  if (!middle || title.dataset.outSeriesReady) return;
  title.dataset.outSeriesReady = 'true';

  const words = ['STEP', 'HANG', 'TRY', 'WORK', 'CHILL', 'BRANCH', 'STAND'];
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
    middle.textContent = '';
  }
  function cycle(progress = 0) {
    if (!slot.animate || staticMode() || !visible()) return;
    middle.textContent = words[index];
    // Measure only the inserted word; the two brand words never change.
    measuredWidth = middle.getBoundingClientRect().width;
    const width = `${measuredWidth}px`;
    const timing = { duration: 4000, fill: 'both', easing: 'linear' };
    gapAnimation = slot.animate([
      { width: '0px', offset: 0 },
      { width: '0px', offset: .2, easing: 'cubic-bezier(.4,0,.2,1)' },
      { width, offset: .36 },
      { width, offset: .78, easing: 'cubic-bezier(.4,0,.2,1)' },
      { width: '0px', offset: .94 },
      { width: '0px', offset: 1 }
    ], timing);
    wordAnimation = middle.animate([
      { opacity: 0, transform: 'translateY(.2em)', offset: 0 },
      { opacity: 0, transform: 'translateY(.2em)', offset: .32 },
      { opacity: 1, transform: 'translateY(0)', offset: .44 },
      { opacity: 1, transform: 'translateY(0)', offset: .66 },
      { opacity: 0, transform: 'translateY(-.15em)', offset: .78 },
      { opacity: 0, transform: 'translateY(-.15em)', offset: 1 }
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
