# PinkOut — Playful experiences website

An Arabic-first static website for PinkOut’s women-only experiences community. Bright pink, cherry, white, mint and lavender colour blocks, the user-supplied background film, and a stable one-page event journey.

## Run and deploy

Serve this folder with any static HTTP server. Upload the package contents directly into the Nginx document root. No installation or build is needed. Use HTTP(S), rather than opening `index.html` as a file, for normal browser behavior.

```nginx
server {
    listen 80;
    server_name pinkoutsa.com www.pinkoutsa.com;
    root /var/www/pinkoutsa.com;
    index index.html;
    location / { try_files $uri $uri/ =404; }
    error_page 404 /404.html;
}
```

Configure HTTPS for the actual server/domain before public launch. Keep existing server-specific TLS configuration if already installed. `event.html` is a compatibility redirect into the one-page event section.

## Files

- `index.html`: complete one-page website.
- `privacy.html`, `credits.html`, `404.html`: static utility pages.
- `assets/css/fonts.css`, `assets/css/theme.css`, `assets/css/hero.css`: local fonts and current theme.
- `assets/js/config.js`, `copy.js`, `app.js`: configuration, bilingual copy and static functionality.
- `assets/js/experience.js`, `assets/js/hero-video.js`: navigation, carousel, photographic selector, GSAP/ScrollTrigger motion and lifecycle.
- `assets/js/vendor/`: local GSAP/ScrollTrigger with their license.
- `assets/images/`, `assets/fonts/`: local assets with their credits/licenses.
- Planning, content, design and QA Markdown files accompany the package.

## Behavior

### Animated brand typography

The homepage starts with `PINK OUT`, opens the space for `STEP`, hides that word and closes back to `PINK OUT`, then repeats for `HANG`, `TRY`, `WORK`, `CHILL`, `BRANCH`, and `STAND`. Each word has a 5.2-second cycle. Both brand words retain the same text. A rounded soft-pink background grows from the centre and pushes the brand words apart; the inserted cherry word stays centred with a matching line icon on each side. The word fades gently without sliding or bouncing, and the closing movement brings the brand back together. `THE WORLD IS OUT THERE.` stays below the heading. The panel width stays constant while the words move apart and together. The sequence starts automatically, independently of scroll or click.

`assets/css/brand-typography.css` and `assets/js/hero-series.js` are shared with the standalone `brand-typography.html` iframe document:

```html
<iframe src="brand-typography.html"
        title="PinkOut — Animated Brand Typography"
        width="600" height="180"
        style="display:block;width:100%;max-width:600px;border:0"></iframe>
```

The iframe has a transparent background and uses the same berry/cherry text as the white homepage panel. Serve it from this static package and adjust `src` to its hosted URL when embedding elsewhere. It needs no third-party libraries. The homepage motion toggle, reduced motion and data saving show the closed brand and fixed slogan. Hidden tabs and covered/offscreen heroes suspend the sequence and resume its current phase. The animated words are decorative for screen readers; the heading's accessible name remains `PINK OUT`.

Arabic/English switching; desktop mega-menu and mobile menu; horizontal results navigation; selectable photographic categories; clickable photo stacks; seven permanently visible world descriptions; saved interests stored only on the visitor's device; native interest dialog with validation/review; event sharing fallback; motion control; reduced-motion, low-data and responsive fallbacks.

The interface includes conceptual device screens. They do not announce a released app. Future idea entries are not bookable events. First-event date, venue, programme and prices are not confirmed.

## Registration integration

`assets/js/config.js` has `registrationEndpoint: null`. The default interface validates and reviews interest but does not transmit contact data or create a ticket. To integrate later, use a deliberate same-origin service and preserve the documented verified-success contract in `app.js`. The site includes no backend, authentication, payment or database. Contact details are not stored locally.

## Creative direction and motion

Museum of Ice Cream informed the current bright colour relationships and white invitation panel. Earlier SWSH research informed the photographic interaction language. All copy, logos, photos and film are PinkOut project/user assets; no reference scripts or media are bundled. The restored desktop hero transitions from the video invitation to a split-text, expanding-photo wall. Its viewport uses native CSS sticky positioning and no generated pin spacer. Reversing restores the invitation. Compact/reduced-motion/low-data layouts retain normal flow. Page exit pauses movement while retaining layout and scroll triggers; browser restoration refreshes them.

See QA.md for verification and device-testing limits.

## Hero background film

Archived earlier version — user-supplied Mixkit clip: `mixkit-pair-of-female-friends-having-fun-on-a-night-out-42299-hd-ready.mp4`. Bundled as `assets/video/hero-night-out.mp4` with a matching still poster. Illustrative footage, not a past PinkOut event. Muted looping inline playback, a bilingual play/pause control, offscreen/hidden-tab pausing, and poster fallback for reduced motion, data saving or blocked autoplay. No third-party player or external video request.

## Current bright revision

Shared styles: `assets/css/theme.css` and `hero.css`. Motion: `assets/js/experience.js`. The former replica files are retired. Desktop hero choreography is restored with explicit reversible states and native sticky layout. Browser page exit pauses movement without dismantling the layout. The palette follows the newly supplied Museum of Ice Cream direction: pink, cherry, white, mint, lavender and yellow.

## Browser return-state repair

Same-document history and full-page restoration both reconcile hero progress with the real scroll position. Top/bottom boundary frames settle immediately. Expanding photo masks use symmetric CSS variables. Interrupted video play promises remain resumable after intentional pauses.


### Centre mosaic film

Archived earlier version — `assets/video/cinema-moments.mp4` combines four six-second clips with half-second crossfades into a seamless 22-second loop (1280×720, 24fps, H.264, no audio, approximately 6.1MB). Three Pexels clips join the existing user-supplied Mixkit night-out clip. Credits and edit points are recorded in `assets/video/cinema-moments.sources.json` and `credits.html`. The closing crossfade returns into the opening clip; trimming the opening half-second aligns the native loop boundary.

`assets/js/cinema-video.js` owns lazy loading, muted inline looping, manual play/pause, motion/data preferences, offscreen/hidden-tab pausing and page restoration. The poster stays available for blocked or failed video playback. The centre film keeps the existing mosaic dimensions on every screen.


### Full video mosaic

All eight outer cells now play separate, seamless H.264 loops, alongside the centre montage. The outer loops add approximately 4.9MB combined. Smaller landscape clips use 640×360; art, café and dance use 960×540 for flexible framing; the shopping portrait uses 384×640. Every clip is muted, uses 24fps, has no audio stream, and has a matching poster fallback. `assets/video/cinema-wall.sources.json` records the stock creators, source links and edit durations.

The centre play/pause button now controls the entire wall. `assets/js/cinema-video.js` uses one playback owner and visibility observer for all nine videos; each visible cell loads its own source lazily and pauses when offscreen. Staggered starting positions keep the loops varied. Page visibility, restored pages, motion preferences and data saving apply to the whole wall.


### Saudi audience video selection — 21 October 2026

The active hero now uses `hero-pinkout-beach.mp4` (desktop, 1280×720) and `hero-pinkout-beach-mobile.mp4` (540×960), a 20.5-second montage cut from a single PNW Production golden-hour beach shoot: a group of friends walking toward camera, a group selfie, two friends laughing, and the group heading to the shoreline. One shoot keeps the colour and mood consistent, and its blush/rose wardrobe matches the brand palette. The nine-cell wall uses `cinema-sa-moments.mp4` plus café, Riyadh’s Kingdom Centre, coffee, walking friends, hands-only crafts, shopping, creative collaboration and the retained pottery loop. These replace the earlier nightlife, dance and yoga selections in the hero and mosaic. All footage remains illustrative stock; model nationality and filming location are not implied. The landmark source specifically identifies Riyadh.

Both montages and each outer loop are silent H.264, 24fps, with crossfades at the loop boundary and matching local JPG posters. Responsive framing keeps people and the tower arch visible. Existing lazy loading, shared wall pause, offscreen pausing and reduced-motion fallbacks remain in use. Current source credits and edit information are in `assets/video/saudi-friendly.sources.json` and `credits.html`; older source manifests describe archived revisions.

The phone hero has its own 540×960 edit, with scene-specific crops and a matching poster. Video sources switch at 800px, including live viewport changes; desktop keeps the full landscape montage.

### Clarity and polish revision — 21 October 2026

The homepage now reads in one order: hero (with a one-line description) → video wall → about (three principles) → mood stage, mood picker and the seven-experience catalog → first event → FAQ → closing → footer. Sections that repeated the catalog were removed: the results carousel (whose RTL arrows never moved it), feature tiles, conceptual phone screens, the vision panel, story panels and the future-ideas grid. The first-event section follows the catalog, so interests saved there pre-fill the interest form. A soft band appears behind the floating header once the page scrolls, so section text never sits under the logo or buttons.

`assets/css/polish.css` loads last on every page and holds this revision's spacing, type-size and layout rules. `experience.js` treats the carousel as optional. New or changed copy lives in `copy.js` (`heroIntro`, catalog/storage notes, interest-form wording, shorter English save labels); all other new text reuses existing approved entries.

### "New world" scroll layer — 21 October 2026

`assets/css/wonder.css` and `assets/js/wonder.js` add the playful scroll layer, inspired by the previous pinkoutsa.com stickers, Museum of Ice Cream's colour blocks and SWSH's scroll storytelling: a polka-dot portal that blooms open behind "About", twelve 3D stickers that pop in, drift with scroll, bob, and wiggle with hearts when tapped, two crossing ribbons whose speed and direction follow the scroll, whole-word title reveals (Arabic words are never split), a taped polaroid for the first event, rising sparkles, and a pink scroll-progress ribbon.

Without `wonder.css` the decorations stay hidden (`polish.css` hides them by default). `contain: paint` on the about section, the event card and the ribbon band stops tilted entrances from widening the page on phones. Reduced motion, the motion toggle and data saving leave every element visible in its settled state.

### Mood stage and mood mixer redesign — 21 October 2026

`assets/css/worlds.css` restyles both sections under new class names (`.mood-stage` / `ms-*`, `.mood-mixer` / `mm-*`), so the older stage and planner rules no longer apply.

**Mood stage.** The section is now a rounded colour block that changes pastel for each of the seven worlds. The photo sits in a white arch, with that world's sticker, a "01 / 07" counter and small sparkles. Below the arch, the world's name, heading and description come from the catalog, so they follow the language switch. A giant watermark of the world name drifts with the scroll, and the choices are cherry pills. `experience.js` still picks the world from the scroll position; `wonder.js` follows its `aria-pressed` choice. On phones the stage stacks into one screen. On short phones (≤700px tall) the choices become numbered circles whose names remain available to screen readers.

**Mood mixer.** `playful.js` builds four sticker mood tiles and a "Surprise me" pill, plus a route of three tilted polaroids along a dashed trail, dealt in when the mood changes. On phones the route becomes a swipeable row. Saved picks show as an always-visible row of chips.
