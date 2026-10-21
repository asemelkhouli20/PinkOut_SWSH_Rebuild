/* Decorative hero media. Motion preferences, visibility and explicit playback share one owner. */
(() => {
  'use strict';
  const api = window.PinkOut;
  const hero = document.querySelector('.has-hero-video');
  const video = hero?.querySelector('.hero-background-video');
  const button = hero?.querySelector('.hero-video-toggle');
  if (!api || !video || !button) return;
  let inView = true, pageActive = true, requested = null, attached = false, pending = false, frame = 0, attempt = 0, blocked = false;
  video.muted = true; video.defaultMuted = true;
  const mobileFrame = matchMedia('(max-width:800px)');
  const desktopPoster = video.poster;
  function updatePoster() { video.poster = mobileFrame.matches ? video.dataset.mobilePoster || desktopPoster : desktopPoster; }
  mobileFrame.addEventListener('change', () => {
    updatePoster();
    if (!attached) return;
    ++attempt; pending = false; blocked = false;
    video.pause(); video.classList.remove('is-ready'); video.load(); sync();
  });
  updatePoster();
  const connection = navigator.connection;
  function wantsPlayback() {
    const permitted = requested === true || (requested !== false && !api.motionPaused && !connection?.saveData);
    return pageActive && inView && !document.hidden && hero.dataset.covered !== 'true' && permitted;
  }
  function label() {
    const playing = !video.paused && !video.ended;
    const ar = document.documentElement.lang === 'ar';
    const text = playing ? (ar ? 'إيقاف الفيديو' : 'Pause video') : (ar ? 'تشغيل الفيديو' : 'Play video');
    button.querySelector('[data-video-label]').textContent = text;
    button.querySelector('.video-control-icon').textContent = playing ? 'Ⅱ' : '▷';
    button.setAttribute('aria-label', text);
  }
  function sync() {
    frame = 0;
    if (!wantsPlayback()) { ++attempt; pending = false; video.pause(); label(); return; }
    if (pending || !video.paused || (blocked && requested !== true)) { label(); return; }
    if (!attached) {
      video.querySelectorAll('source[data-src]').forEach(source => source.src = source.dataset.src);
      video.load(); attached = true;
    }
    pending = true; const ticket = ++attempt;
    try {
      Promise.resolve(video.play()).then(() => {
        if (ticket !== attempt) return;
        if (!wantsPlayback()) video.pause();
        label();
      }, error => { if (ticket === attempt) { blocked = error?.name === 'NotAllowedError' || error?.name === 'SecurityError'; label(); } }).finally(() => { if (ticket === attempt) pending = false; });
    } catch (_) { pending = false; label(); }
  }
  button.addEventListener('click', () => { requested = video.paused || video.ended; blocked = false; sync(); });
  video.addEventListener('playing', () => { video.classList.add('is-ready'); label(); });
  video.addEventListener('pause', label);
  video.addEventListener('error', () => { video.classList.remove('is-ready'); label(); });
  document.addEventListener('pinkout:language', label);
  document.addEventListener('pinkout:hero-scene', sync);
  document.addEventListener('pinkout:motion', () => { requested = null; sync(); });
  document.addEventListener('visibilitychange', sync);
  connection?.addEventListener?.('change', sync);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); });
    observer.observe(hero);
  }
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(sync); }, { passive: true });
  window.addEventListener('pagehide', () => { pageActive = false; ++attempt; pending = false; cancelAnimationFrame(frame); frame = 0; video.pause(); });
  window.addEventListener('pageshow', () => { pageActive = true; blocked = false; const rect = hero.getBoundingClientRect(); inView = rect.bottom > 0 && rect.top < innerHeight; sync(); requestAnimationFrame(() => { const current = hero.getBoundingClientRect(); inView = current.bottom > 0 && current.top < innerHeight; sync(); }); });
  label(); sync();
})();
