# PinkOut — Current bright revision QA

## Restored cinematic sequence

- Fifteen actual-GSAP simulations verify the native-sticky scene, expansion, photo appearances, repeated reverse restoration of video/headline/controls/crop, retained Back-cache geometry, a single timeline after language change, pause/resume and compact/reduced-motion/low-data fallbacks. No generated pin spacer exists.
- Video-controller coverage now includes pause while the photo scene covers the film and resume on reverse (18 checks total).
- Live Chrome inspection reproduced the same-document Back failure at scroll zero, uneven intermediate photo cropping and ghosted transition text. The revision adds explicit history/boundary reconciliation, symmetric CSS-variable masking and separate transition phases. Live Chrome confirms symmetric intermediate masking and full hero/video restoration on reverse scrolling. A hashchange refresh interrupted native event-link scrolling; it was removed before final publication.

## Retained interface checks

- Thirteen photo-input checks pass after restoration: click, keyboard activation, drag suppression, cancelled touch and the following tap.
- Existing bilingual forms/menu/interests functionality is unchanged. The preceding revision passed twenty behavior checks and selected structural axe A/AA checks on four pages with zero violations.
- JavaScript syntax and 210 local file/anchor references pass in this revision.

These are DOM and actual GSAP timeline simulations, not physical browser, frame-rate or Core Web Vitals measurements. The supported local preview infrastructure is unavailable. Live hosted Chrome inspection is available. Physical phones, frame-rate profiling and screen-reader testing remain outside the checks performed.

## Current fixes

The old generated hero pin was replaced with native CSS sticky layout. The requested hero animation is restored using explicit reversible states; compact/fallback views show the media wall in normal flow. Pagehide pauses loops instead of reverting the document before browser cache restoration. Pageshow refreshes retained triggers; video uses guarded playback attempts and re-measures visibility. The current theme uses bright colour blocks and berry/cherry contrast. Hero content remains on a white panel with a light film overlay.

## Intentional boundaries

The default endpoint is null. Interest details can be validated/reviewed but are not sent, paid or booked. No personal data is stored locally. Planned city: Riyadh; date, venue, programme and prices remain unannounced. Photos and film are illustrative, not past PinkOut attendance. Devices are concepts, and future ideas are not announced events.

## Browser defect regressions

Same-document popstate reconciliation runs after native scroll restoration. Boundary scroll frames restore the exact beginning/end rather than retaining a stale scrub frame. The photo mask animates symmetric CSS variables, avoiding shorthand token interpolation. Hero copy finishes fading before the opaque photo scene enters. Intentional video pauses invalidate pending play promises; AbortError does not permanently block later playback. Fifteen GSAP/lifecycle and eighteen video-controller regression checks pass.

Event anchors use immediate native navigation: a long browser smooth scroll can be interrupted when lazy image loads refresh ScrollTrigger. Section choreography, carousel movement and other interaction motion remain enabled.

## Local browser layout review — 19 October 2026

Reviewed the local HTTP preview at 390 × 844, 890 × 912 and 1440 × 900, including Arabic/English, catalogue, FAQ expansion, interest dialog, stage and device scenes. Browser measurements found no section/device horizontal overflow after the tablet frame adjustment. No browser errors were reported during this review. Verified the desktop hero photo transition visually. This is browser preview testing, not physical-device or frame-rate testing.

Stage selection now follows scrolling without pointer-hover overrides, with a shorter travel range and a progress line. Paused motion removes the extra stage travel. Cards use modest one-time vertical entrances. The vision action opens event details; the interest form is explicitly a preview. Input text now contrasts with its white background. Shared asset versions were updated so browsers request the revised files.


## Interaction review — 20 October 2026

Reviewed the old PinkOut site, Museum of Ice Cream and SWSH in the browser before implementing the new interactions.

- Added the flower cursor, contextual hints, bounded card tilt and short flower click feedback. Verified the native cursor style and pointer-driven tilt in the local browser.
- Added a bilingual mood picker with four routes, a surprise action that always changes the mood, and synchronized saved-world controls. Verified route changes, saving/removing and the saved collection links.
- Added a native photo dialog to world thumbnails, story photos and mood cards. Verified next/previous wrapping, arrow keys, Escape and focus returning to the opener.
- Made hero world chips real links; verified a direct pointer click reaches the matching world.
- Corrected the creative-workshop news card and reduced the catalogue entrance displacement.
- Moved the stage deep-link target onto its non-sticky wrapper. A fresh direct link starts at the first world; scrolling advances the choices.
- Checked layouts at 390 × 844, 890 × 900, 1280 × 720 and 1440 × 900, including Arabic and English. Checked phone visibility on mobile and stage text boundaries on tablet.
- Motion pause disables the cursor and decorative effects, removes extended stage travel, and leaves mood selection usable. Restored motion after testing.
- Checked interest-form empty-field errors, desktop navigation opening/Escape, local file references, anchors and duplicate IDs. No broken loaded images or JavaScript console errors observed during these checks.

The registration endpoint remains unconfigured: the existing form is a clearly labelled preview, not a live booking or submission flow.

- Final mobile-menu review caught white links on the white menu panel; fixed the shared menu link colour and rechecked the menu visually.


## Flat cinema mosaic — 20 October 2026

Replaced the five overlapping cinema elements with nine flush grid tiles, with a large centre image and fully occupied surrounding cells. Images use cover sizing, and the wide tiles request appropriately sized responsive assets. Removed floating rotations and individual side entrances; the scroll reveal now opens the entire mosaic together. The two photo-switch buttons crossfade within their fixed cells.

Verified in the local browser at 1440 × 900 and 390 × 844: all nine tiles fill their cells, no horizontal overflow or broken images, and a pointer click changes the photo without moving its tile. Desktop uses a four-column mosaic; mobile uses two columns with a full-width lead image. No console errors observed.


## Navigation, hero and news refinement — 20 October 2026

- Added a floating glass navbar with blur, translucent background, visible borders, clear active controls and a solid fallback. The video now extends behind the navbar; the cinematic scroll start follows the new full-height canvas.
- Removed the world-signatures markup. Kept the video pause button accessible in its own corner. Reduced the hero invitation from its previous 920px maximum width to a content-sized panel capped at 600px, with smaller text and padding.
- Rebuilt all six news cards with large images, category labels, descriptions and consistent action rows. Added Arabic/English descriptions and matched the clay idea to the pottery photograph. Three columns on desktop, two on tablet, one on mobile.
- Browser checks at 1440 × 900 and 390 × 844 covered the hero, glass menu, news layouts and card navigation; also reviewed the 890px tablet breakpoint. Confirmed removed signatures, loaded news images, no horizontal overflow and no observed console errors.


## Centre-tile video loop — 20 October 2026

The centre mosaic cell now contains a 22-second H.264 montage of four stock clips: pottery, café conversation, dancing and the existing night-out footage. Half-second crossfades include the loop boundary. A matching poster remains underneath the video, and a bilingual play/pause button is available. Sources and edit points are recorded in `assets/video/cinema-moments.sources.json`; Pexels creators are linked from the credits page.

Verified locally in the browser: the video has no source attached before the desktop scene is revealed; it autoplays muted when visible; play time wrapped from 21.9 seconds to the next cycle; manual pause/resume works; leaving the scene pauses it while the hero resumes; global motion pause stops it. At 390 × 844 the video and tile rectangles match, playback and the control work, and the page has no horizontal overflow. No browser console errors observed. The montage is 1280 × 720, 24fps, approximately 6.1MB, with no audio stream.


## All-video mosaic — 20 October 2026

Replaced the eight surrounding photo cells and photo-stack controls with eight independent looping stock videos. The centre montage remains, giving nine video cells in the original flat mosaic. Added art, fragrance, shopping and yoga clips with creator links in credits.html, and recorded all outer-video sources in cinema-wall.sources.json. The eight outer videos total approximately 4.9MB. Each has a matching poster and a soft loop transition.

One bilingual centre control now pauses or resumes the entire wall. Every tile loads only when visible, plays muted inline, and pauses outside the viewport or while the page is hidden. The global motion setting applies to all nine.

Local browser checks: no sources attached to the nine videos before the desktop scene is revealed; all nine play without media errors in the visible scene; all nine pause/resume together; scrolling back to the hero pauses the full wall; mobile motion pause stops all nine while they remain visible; restoring motion resumes playback. Reviewed desktop and 390 × 844 mobile framing, including uncropped faces in the landscape café/dance mobile tiles and the portrait desktop crops. No horizontal overflow or console errors observed. All eight outer MP4 files passed a full decode check.


## Saudi audience footage — 21 October 2026

Replaced the active hero and eight mosaic selections with modest café gatherings, shopping friends, walking, creative collaboration, hands-only crafts, Arabic coffee and the Kingdom Centre in Riyadh. Retained the hands-on pottery loop. New centre and hero montages run 22 seconds, with silent 24fps H.264 playback and half-second crossfades including the loop boundary. Credits and crop/edit information are in `assets/video/saudi-friendly.sources.json`. All people footage is illustrative stock; no model nationality or filming location is implied.

A separate 540×960 portrait hero uses scene-specific crops. Its source and poster switch at 800px, including live viewport changes. Verified landscape → portrait → landscape in the local browser, with the correct source and active playback each time.

Browser review at 1280×720 and 390×844 confirmed all nine mosaic cells play muted without media errors, shared pause/resume works, and the layouts have no horizontal overflow. The covered desktop hero pauses behind the wall. Reviewed the mobile tower arch and people framing and saved desktop/phone previews. No console errors observed. All ten new MP4s passed a full decode check; the active media paths exist and the updated hero controller passes JavaScript syntax validation. These checks use the local browser, not physical-device Safari testing.

## Animated brand typography — 21 October 2026

The homepage and standalone `brand-typography.html` share the automatic brand sequence. The initial and between-word state is `PINK OUT`. A rounded soft-pink badge expands from the centre, moving the two brand words apart symmetrically. The inserted cherry word remains centred, fades gently and has a matching SVG line icon on each side. The first icon is mirrored to face outward. There is no vertical word movement. Each cycle lasts 5.2 seconds, with a readable hold and eased opening/closing. PINK and OUT retain their text and colour, the panel stays the same width and the slogan stays below the heading. Language switching cannot replace the brand, and the heading retains a stable accessible name.

Passed JavaScript syntax validation, `git diff --check`, and the temporary Node VM harness for two full word cycles, closed states, fade/gap ordering, no overlapping cycles, suspension/restoration, responsive remeasurement and motion/reduced-motion/data-saving fallbacks. The harness also verifies that animated keyframes never translate or scale the inserted word.

Reviewed rendered headless Chrome screenshots of the open STEP badge at 600px, the longest word BRANCH inside a true 320px iframe, and BRANCH in the homepage at 390×844. Both icons, both brand words and the complete slogan fit. Renderer measurements reported no horizontal overflow in either mobile layout. Narrow viewports were provided by actual iframe dimensions because macOS headless Chrome enforces a minimum desktop window width. Render tests use temporary instrumented copies to pause the real Web Animations API at exact phases; this is not physical-device Safari testing.

Renderer checks at 0, 900, 1450, 2300, 4100 and 5100ms confirmed equal outward movement of PINK/OUT, a stationary inserted-word centre and slogan, intermediate opening/closing widths, and fully closed endpoints.
