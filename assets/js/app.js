/* PinkOut static interface. No personal data is stored locally. */
(() => {
  'use strict';
  const config = window.PINKOUT_CONFIG;
  const copy = window.PINKOUT_COPY;
  if (!config || !copy) return;
  const root = document.documentElement;
  const read = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } };
  const remove = key => { try { localStorage.removeItem(key); return true; } catch (_) { return false; } };
  const queryLang = new URLSearchParams(location.search).get('lang');
  let language = ['ar', 'en'].includes(queryLang) ? queryLang : (read(config.languageKey) === 'en' ? 'en' : 'ar');
  let opener = null;
  let toastTimer;
  let inFlight = false;
  let controller = null;
  let reviewReady = false;
  let submissionComplete = false;
  const t = key => copy[language][key] || copy.ar[key] || key;
  const worldImages = ['creative-laugh', 'women-cafe', 'movement', 'fragrance', 'market', 'dj', 'passage'];
  const imageAlt = {
    ar: ['نساء يتشاركن أعمالهن في ورشة إبداعية', 'امرأتان تتبادلان الحديث مع القهوة', 'نساء في صف حركة داخل استوديو', 'امرأة تستكشف روائح باستخدام شرائط عطرية', 'امرأة تتصفح مجوهرات مصنوعة يدويًا في سوق', 'امرأة تقدم موسيقى على منصة', 'ممر فني من الزجاج الملون في متحف؛ صورة تعبيرية وليست موقع PinkOut'],
    en: ['Women sharing their work in a creative workshop', 'Two women enjoying coffee and conversation', 'Women taking a movement class in a studio', 'A woman discovering fragrance with scent strips', 'A woman browsing handmade jewelry at a market', 'A woman performing a DJ set', 'A coloured-glass museum installation, illustrative and not a PinkOut venue']
  };
  function getInterests() {
    try { const saved = JSON.parse(read(config.interestsKey) || '[]'); return Array.isArray(saved) ? saved.filter(n => Number.isInteger(n) && n >= 1 && n <= 7) : []; }
    catch (_) { return []; }
  }
  function toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    clearTimeout(toastTimer);
    el.textContent = message;
    el.classList.add('is-visible');
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4200);
  }
  function applyLanguage() {
    root.lang = language; root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-copy]').forEach(el => { el.textContent = t(el.dataset.copy); });
    document.querySelectorAll('[data-copy-label]').forEach(el => el.setAttribute('aria-label', t(el.dataset.copyLabel)));
    const page = document.body.dataset.page;
    const titleKey = page === 'home' ? 'Document title' : ({ event: 'pageEventTitle', privacy: 'pagePrivacyTitle', '404': 'page404Title', credits: 'pageCreditsTitle' }[page] || 'Document title');
    document.title = t(titleKey);
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('Description'));
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', t(titleKey));
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', t('Description'));
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', language === 'ar' ? 'ar_SA' : 'en_US');
    document.querySelectorAll('.language-switch').forEach(el => {
      el.textContent = language === 'ar' ? 'EN' : 'العربية';
      el.lang = language === 'ar' ? 'en' : 'ar';
      el.setAttribute('aria-label', language === 'ar' ? 'EN, switch to English' : 'العربية، التبديل إلى العربية');
    });
    document.querySelectorAll('nav').forEach(el => el.setAttribute('aria-label', language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'));
    document.querySelector('.dialog-close')?.setAttribute('aria-label', t('Close'));
    document.querySelector('.world-index')?.setAttribute('aria-label', language === 'ar' ? 'عوالم PinkOut' : 'PinkOut worlds');
    const ribbon = document.querySelector('.ribbon-track');
    if (ribbon) ribbon.querySelectorAll('span').forEach(el => el.textContent = t('Marquee'));
    // Keep language on ordinary page links; anchors retain native browser behavior.
    document.querySelectorAll('a[href]').forEach(a => {
      const raw = a.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(https?:|mailto:|tel:)/.test(raw)) return;
      try { const url = new URL(raw, location.href); url.searchParams.set('lang', language); a.href = url.pathname.split('/').pop() + url.search + url.hash; } catch (_) { /* Non-URL links remain unchanged. */ }
    });
    updateSavedLabel();
    document.querySelector('[data-remix-shape]')?.setAttribute('aria-label', t('remixShape'));
    document.querySelectorAll('[data-stack-next]').forEach(button => button.setAttribute('aria-label', t('nextMoment')));
    updateMotionLabel();
    const submit = document.querySelector('.submit-button [data-copy]');
    if (submit) submit.textContent = inFlight ? t('sending') : t(config.registrationEndpoint ? 'sendButton' : 'reviewButton');
    if (config.registrationEndpoint) {
      const notice = document.querySelector('.form-notice');
      if (notice) notice.textContent = language === 'ar' ? 'سجّلي اهتمامك لتصلك تفاصيل المشاركة عند إعلانها. هذا ليس حجزًا.' : 'Register your interest for participation details when announced. This is not a booking.';
    }
    if (reviewReady) renderReviewDetails();
    if (submissionComplete) {
      document.getElementById('review-title').textContent = t('received');
      document.querySelector('.review-notice').textContent = t('receivedNote');
    }
    if (document.getElementById('email')?.getAttribute('aria-invalid') === 'true') document.getElementById('email-error').textContent = t('emailError');
    if (document.getElementById('acknowledgment')?.getAttribute('aria-invalid') === 'true') document.getElementById('consent-error').textContent = t('consentError');
    const altByName = Object.fromEntries(worldImages.map((name, i) => [name, imageAlt[language][i]]));
    altByName.pottery = language === 'ar' ? 'امرأتان تعملان على تشكيل الطين في استوديو إبداعي' : 'Two women shaping clay together in a creative studio';
    altByName['creative-table'] = language === 'ar' ? 'امرأتان ترسمان على أوعية في ورشة إبداعية' : 'Two women painting ceramic bowls in a creative workshop';
    altByName['creative-laugh'] = language === 'ar' ? 'نساء يعرضن لوحاتهن في ورشة إبداعية' : 'Women sharing their paintings in a creative workshop';
    document.querySelectorAll('img[data-alt]').forEach(img => { img.alt = t(img.dataset.alt); });
    document.querySelectorAll('img[src$=".webp"]:not([data-alt])').forEach(img => {
      const name = img.getAttribute('src').split('/').pop().replace(/-(480|900)\.webp$|\.webp$/g, '');
      if (altByName[name]) img.alt = altByName[name];
    });
    document.dispatchEvent(new CustomEvent('pinkout:language', { detail: language }));
  }
  document.querySelectorAll('.language-switch').forEach(button => button.addEventListener('click', () => {
    language = language === 'ar' ? 'en' : 'ar';
    write(config.languageKey, language);
    const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url);
    applyLanguage();
  }));
  window.addEventListener('popstate', () => { const p = new URLSearchParams(location.search).get('lang'); if (p === 'ar' || p === 'en') { language = p; applyLanguage(); } });
  // The header menus and the phone menu sheet live in nav.js.
  // Visible world stories support optional local interest saving.
  function updateSavedLabel() {
    const selected = getInterests();
    document.querySelectorAll('[data-save-interest]').forEach(button => {
      const saved = selected.includes(Number(button.dataset.saveInterest));
      button.setAttribute('aria-pressed', String(saved));
      button.querySelector('[data-save-label]').textContent = t(saved ? 'Saved world' : 'Save world');
      button.querySelector('.save-symbol').classList.toggle('is-saved', saved);
    });
    document.dispatchEvent(new CustomEvent('pinkout:saved-change'));
  }
  document.querySelectorAll('[data-save-interest]').forEach(button => button.addEventListener('click', () => {
    const interests = getInterests(); const id = Number(button.dataset.saveInterest); const index = interests.indexOf(id);
    if (index >= 0) interests.splice(index, 1); else interests.push(id);
    const ok = write(config.interestsKey, JSON.stringify(interests));
    updateSavedLabel(); toast(t(ok ? (index < 0 ? 'interestSaved' : 'interestRemoved') : 'saveError'));
    document.dispatchEvent(new CustomEvent('pinkout:save', { detail: { button } }));
  }));
  document.querySelector('[data-clear-saved]')?.addEventListener('click', () => { remove(config.interestsKey); updateSavedLabel(); toast(t('cleared')); });
  document.querySelector('[data-remix-shape]')?.addEventListener('click', event => {
    const button = event.currentTarget; const next = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(next));
    document.dispatchEvent(new CustomEvent('pinkout:remix', { detail: { button } }));
  });
  document.querySelectorAll('[data-stack-next]').forEach(button => {
    const stack = button.closest('[data-moment-stack]');
    let gesture = null;
    let suppressClick = false;
    const trackGesture = event => {
      if (!gesture || event.pointerId !== gesture.id) return;
      if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 6) suppressClick = true;
    };
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.isPrimary === false) return;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
      suppressClick = false;
    }, { passive: true });
    stack.addEventListener('pointermove', trackGesture, { passive: true });
    button.addEventListener('pointerup', event => {
      trackGesture(event);
      if (gesture?.id === event.pointerId) gesture = null;
    }, { passive: true });
    button.addEventListener('pointercancel', () => { gesture = null; suppressClick = true; }, { passive: true });
    button.addEventListener('dragstart', event => event.preventDefault());
    button.addEventListener('click', event => {
      // Native keyboard activation has detail 0; a drag or cancelled touch must not advance the stack.
      const dragged = suppressClick && event.detail !== 0;
      suppressClick = false;
      gesture = null;
      if (dragged) { event.preventDefault(); return; }
      const planes = stack.querySelector('.stack-planes');
      planes.append(planes.firstElementChild);
      Array.from(planes.children).forEach((plane, index) => plane.setAttribute('aria-hidden', String(index !== planes.children.length - 1)));
      document.dispatchEvent(new CustomEvent('pinkout:stack', { detail: { stack, front: planes.lastElementChild } }));
    });
  });
  const dialog = document.getElementById('interest-dialog');
  const form = document.getElementById('interest-form');
  const review = document.getElementById('request-review');
  const nameInput = document.getElementById('first-name');
  const emailInput = document.getElementById('email');
  const ack = document.getElementById('acknowledgment');
  const formStatus = document.getElementById('form-status');
  function resetErrors() { document.getElementById('email-error').textContent = ''; document.getElementById('consent-error').textContent = ''; emailInput.removeAttribute('aria-invalid'); ack.removeAttribute('aria-invalid'); formStatus.textContent = ''; }
  function openInterest(button) {
    if (!dialog || typeof dialog.showModal !== 'function') { location.hash = 'interest-unavailable'; return; }
    opener = button; reviewReady = false; submissionComplete = false;
    document.getElementById('save-review').hidden = false; document.getElementById('edit-request').hidden = false;
    form.hidden = false; review.hidden = true; resetErrors();
    const interests = getInterests(); form.querySelectorAll('[name=interests]').forEach(input => input.checked = interests.includes(Number(input.value)));
    const role = form.querySelector(`[name=role][value="${button?.dataset.role || 'visitor'}"]`); if (role) role.checked = true;
    dialog.showModal(); document.body.classList.add('dialog-open'); document.getElementById('interest-title').focus();
  }
  document.querySelectorAll('[data-open-interest]').forEach(button => button.addEventListener('click', () => openInterest(button)));
  document.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); } });
  dialog?.addEventListener('close', () => {
    controller?.abort(); controller = null; inFlight = false;
    form.reset(); reviewReady = false; submissionComplete = false; document.querySelector('.review-details').replaceChildren();
    document.getElementById('review-status').textContent = ''; document.body.classList.remove('dialog-open');
    const submit = document.querySelector('.submit-button'); submit.disabled = false;
    if (opener?.isConnected) opener.focus(); opener = null; applyLanguage();
  });
  function renderReviewDetails() {
    const dl = document.querySelector('.review-details'); dl.replaceChildren();
    const chosen = Array.from(form.querySelectorAll('[name=interests]:checked')).map(input => t(`world${input.value}Label`));
    const role = form.querySelector('[name=role]:checked');
    [[t('formName'), nameInput.value.trim()], [t('formEmail'), emailInput.value.trim()], [t('formRole'), role ? t(role.nextElementSibling.dataset.copy) : ''], [t('formInterests'), chosen.join(' · ')]].forEach(([label, value], index) => {
      if (!value) return;
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = value;
      if (index === 1) dd.className = 'email-value'; dl.append(dt, dd);
    });
  }
  form?.addEventListener('submit', async event => {
    event.preventDefault(); if (inFlight) return; resetErrors();
    emailInput.value = emailInput.value.trim();
    let invalid;
    if (!emailInput.checkValidity()) { document.getElementById('email-error').textContent = t('emailError'); emailInput.setAttribute('aria-invalid', 'true'); invalid = emailInput; }
    if (!ack.checked) { document.getElementById('consent-error').textContent = t('consentError'); ack.setAttribute('aria-invalid', 'true'); invalid ||= ack; }
    if (invalid) { invalid.focus(); return; }
    if (!config.registrationEndpoint) {
      reviewReady = true; renderReviewDetails(); form.hidden = true; review.hidden = false;
      document.getElementById('review-title').focus(); return;
    }
    const payload = { firstName: nameInput.value.trim(), email: emailInput.value, interests: Array.from(form.querySelectorAll('[name=interests]:checked')).map(input => Number(input.value)), role: form.querySelector('[name=role]:checked')?.value || 'visitor', acknowledgment: true, language, source: document.body.dataset.page };
    inFlight = true; const submit = document.querySelector('.submit-button'); submit.disabled = true;
    submit.querySelector('[data-copy]').textContent = t('sending');
    controller = new AbortController(); const thisController = controller;
    const timeout = setTimeout(() => thisController.abort(), config.requestTimeoutMs);
    try {
      const endpoint = new URL(config.registrationEndpoint, location.href);
      if (endpoint.protocol !== 'https:' && endpoint.origin !== location.origin) throw new Error('Invalid endpoint');
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload), signal: thisController.signal, credentials: 'same-origin' });
      if (!response.ok) throw new Error('Request rejected');
      const data = await response.json();
      if (data.ok !== true) throw new Error('Unverified result');
      if (!dialog.open) return;
      form.hidden = true; review.hidden = false; reviewReady = false; submissionComplete = true;
      document.getElementById('review-title').textContent = t('received');
      review.querySelector('.review-notice').textContent = t('receivedNote');
      document.querySelector('.review-details').replaceChildren();
      document.getElementById('save-review').hidden = true;
      document.getElementById('edit-request').hidden = true;
      document.getElementById('review-title').focus();
    } catch (_) { if (dialog.open) formStatus.textContent = t('submitError'); }
    finally { clearTimeout(timeout); inFlight = false; controller = null; submit.disabled = false; submit.querySelector('[data-copy]').textContent = t('sendButton'); }
  });
  document.getElementById('save-review')?.addEventListener('click', () => {
    const chosen = Array.from(form.querySelectorAll('[name=interests]:checked')).map(input => Number(input.value));
    const ok = write(config.interestsKey, JSON.stringify(chosen));
    document.getElementById('review-status').textContent = t(ok ? 'savedChoices' : 'saveError'); updateSavedLabel();
  });
  document.getElementById('edit-request')?.addEventListener('click', () => { reviewReady = false; review.hidden = true; form.hidden = false; emailInput.focus(); });
  document.querySelectorAll('[data-share]').forEach(button => button.addEventListener('click', async () => {
    const url = new URL('index.html', location.href); url.searchParams.set('lang', language); url.hash = 'coming-soon';
    const data = { title: t('Document title'), text: t('Description'), url: url.href };
    if (navigator.share) { try { await navigator.share(data); return; } catch (error) { if (error.name === 'AbortError') return; } }
    if (navigator.clipboard?.writeText) { try { await navigator.clipboard.writeText(url.href); toast(t('copied')); return; } catch (_) { /* Visible copy fallback below. */ } }
    const fallback = document.querySelector('.share-fallback'); const input = document.getElementById('share-url');
    if (fallback && input) { fallback.hidden = false; input.value = url.href; input.focus(); input.select(); toast(t('copyManual')); }
  }));
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = read(config.motionKey) === 'paused';
  function updateMotionLabel() {
    const paused = userPaused || systemMotion.matches;
    document.body.classList.toggle('motion-paused', paused);
    document.querySelectorAll('.motion-toggle').forEach(button => { button.textContent = t(paused ? 'Motion resume' : 'Motion toggle'); button.setAttribute('aria-pressed', String(paused)); });
  }
  function motionState() { updateMotionLabel(); document.dispatchEvent(new CustomEvent('pinkout:motion', { detail: { paused: userPaused || systemMotion.matches } })); }
  document.querySelectorAll('.motion-toggle').forEach(button => button.addEventListener('click', () => {
    if (systemMotion.matches) { toast(language === 'ar' ? 'الحركة مخفّضة حسب إعدادات جهازك.' : 'Motion follows your device’s reduced-motion setting.'); return; }
    userPaused = !userPaused; write(config.motionKey, userPaused ? 'paused' : 'enabled'); motionState();
  }));
  systemMotion.addEventListener('change', motionState);
  window.PinkOut = Object.freeze({ t, get language() { return language; }, get motionPaused() { return userPaused || systemMotion.matches; } });
  applyLanguage();
})();
