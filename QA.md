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
