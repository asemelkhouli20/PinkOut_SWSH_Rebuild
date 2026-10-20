/* The whole mosaic shares playback intent; each tile loads and runs only in view. */
(() => {
  'use strict';
  const api = window.PinkOut;
  const grid = document.querySelector('.cinema-grid');
  const button = grid?.querySelector('.cinema-video-toggle');
  if (!api || !grid || !button) return;
  const records = [...grid.querySelectorAll('.cinema-video')].map(video => ({ video, frame: video.parentElement, attached: false, pending: false, blocked: false, failed: false, ticket: 0, offsetSet: false }));
  const shell = grid.closest('.hero-scroll-shell');
  const hero = document.querySelector('.has-hero-video');
  const connection = navigator.connection;
  let requested = null, active = true, scrollFrame = 0;
  function wantsPlayback(record) {
    const rect = record.frame.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    const revealed = !shell?.classList.contains('cinematic-active') || hero?.dataset.covered === 'true';
    const permitted = requested === true || (requested !== false && !api.motionPaused && !connection?.saveData);
    return active && !document.hidden && visible && revealed && permitted;
  }
  function label() {
    const playing = records.some(({video}) => !video.paused && !video.ended);
    const ar = api.language === 'ar';
    const text = playing ? (ar ? 'إيقاف كل فيديوهات الجدار' : 'Pause all mosaic videos') : (ar ? 'تشغيل كل فيديوهات الجدار' : 'Play all mosaic videos');
    button.setAttribute('aria-label', text);
    button.querySelector('[data-cinema-label]').textContent = text;
    button.querySelector('.cinema-control-icon').textContent = playing ? 'Ⅱ' : '▷';
    records.forEach(record => {
      const {video,frame} = record;
      frame.dataset.playback = record.failed ? 'error' : record.pending ? 'loading' : !video.paused && !video.ended ? 'playing' : 'paused';
    });
  }
  function syncRecord(record) {
    const {video} = record;
    if (!wantsPlayback(record)) { ++record.ticket; record.pending = false; video.pause(); return; }
    if (record.failed || record.pending || !video.paused || (record.blocked && requested !== true)) return;
    if (!record.attached) { video.src = video.dataset.src; video.load(); record.attached = true; }
    record.pending = true; const attempt = ++record.ticket;
    try {
      Promise.resolve(video.play()).then(() => {
        if (attempt !== record.ticket) return;
        if (!wantsPlayback(record)) video.pause();
      }).catch(error => {
        if (attempt === record.ticket) record.blocked = error?.name === 'NotAllowedError' || error?.name === 'SecurityError';
      }).finally(() => { if (attempt === record.ticket) { record.pending = false; label(); } });
    } catch (_) { record.pending = false; }
  }
  function sync() { records.forEach(syncRecord); label(); }
  function schedule() { if (scrollFrame) return; scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; sync(); }); }
  button.addEventListener('click', () => {
    requested = !records.some(record => !record.video.paused || record.pending);
    records.forEach(record => { record.blocked = false; if (requested && record.failed) { record.failed = false; record.offsetSet = false; record.video.load(); } });
    sync();
  });
  records.forEach(record => {
    const {video} = record;
    video.muted = true; video.defaultMuted = true;
    video.addEventListener('playing', () => {
      if (!record.offsetSet) {
        record.offsetSet = true;
        const offset = Number(video.dataset.start || 0);
        if (Number.isFinite(video.duration) && offset > 0) video.currentTime = Math.min(offset, Math.max(0, video.duration - .25));
      }
      video.classList.add('is-ready'); label();
    });
    video.addEventListener('pause', label);
    video.addEventListener('error', () => { record.pending = false; record.failed = true; video.classList.remove('is-ready'); label(); });
  });
  document.addEventListener('pinkout:language', label);
  document.addEventListener('pinkout:motion', () => { requested = null; sync(); });
  document.addEventListener('pinkout:hero-scene', sync);
  document.addEventListener('visibilitychange', sync);
  connection?.addEventListener?.('change', sync);
  if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(schedule); records.forEach(record => observer.observe(record.frame)); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pagehide', () => { active = false; cancelAnimationFrame(scrollFrame); scrollFrame = 0; records.forEach(record => { ++record.ticket; record.pending = false; record.video.pause(); }); label(); });
  window.addEventListener('pageshow', () => { active = true; records.forEach(record => record.blocked = false); sync(); schedule(); });
  label(); sync();
})();
