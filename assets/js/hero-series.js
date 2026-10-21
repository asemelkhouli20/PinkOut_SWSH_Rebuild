/* Title-only enhancement. Does not control hero media, layout or scroll timelines. */
(() => {
  'use strict';
  const title = document.getElementById('hero-title');
  if (!title || title.dataset.outSeriesReady) return;
  title.dataset.outSeriesReady = 'true';

  const words = [
    ['STEP', '#c60046'], ['HANG', '#6c43aa'], ['TRY', '#167350'],
    ['WORK', '#b34816'], ['CHILL', '#236d9d'], ['BRANCH', '#657322'],
    ['STAND', '#a42b76']
  ];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const style = document.createElement('style');
  style.textContent = `
    #hero-title .out-series-line{display:flex;justify-content:center;align-items:baseline;gap:.22em;direction:ltr;font-family:Arial,sans-serif;font-weight:900;font-size:inherit;line-height:1.17;letter-spacing:-.04em;white-space:nowrap}
    #hero-title .out-series-word{display:inline-block;color:#c60046}
  `;
  document.head.append(style);

  // Preserve the two original heading lines as the entrance animation's targets.
  // All changing content is nested inside the first target.
  const first = title.querySelector('[data-copy="heroFirst"]');
  const second = title.querySelector('[data-copy="heroSecond"]');
  if (!first || !second) { style.remove(); delete title.dataset.outSeriesReady; return; }
  first.removeAttribute('data-copy');
  second.removeAttribute('data-copy');
  first.classList.add('out-series-line');
  first.dir = 'ltr';
  first.setAttribute('aria-hidden', 'true');
  const pink = document.createElement('span'); pink.textContent = 'PINK';
  const middle = document.createElement('span'); middle.className = 'out-series-word'; middle.textContent = words[0][0];
  const out = document.createElement('span'); out.textContent = 'OUT';
  first.replaceChildren(pink, middle, out);
  second.textContent = '';
  second.setAttribute('aria-hidden', 'true');
  title.setAttribute('aria-label', 'Pink Out — Step Out, Hang Out, Try Out, Work Out, Chill Out, Branch Out, Stand Out');

  let index = 0, timer, animation, inView = true, pageActive = true;
  const hero = title.closest('.has-hero-video');
  function permitted() {
    return pageActive && inView && !document.hidden && !reduced.matches &&
      !window.PinkOut?.motionPaused && !navigator.connection?.saveData && hero?.dataset.covered !== 'true';
  }
  function sync() {
    clearTimeout(timer);
    if (!permitted()) { animation?.cancel(); return; }
    timer = setTimeout(advance, 1200);
  }
  function advance() {
    if (!permitted()) return;
    index = (index + 1) % words.length;
    middle.textContent = words[index][0];
    middle.style.color = words[index][1];
    animation?.cancel();
    animation = middle.animate?.([
      { opacity: 0, transform: 'translateY(.3em)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 180, easing: 'ease-out' });
    sync();
  }
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
