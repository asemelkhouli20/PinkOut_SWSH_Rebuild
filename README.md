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

Arabic/English switching; desktop mega-menu and mobile menu; horizontal results navigation; selectable photographic categories; clickable photo stacks; seven permanently visible world descriptions; saved interests stored only on the visitor's device; native interest dialog with validation/review; event sharing fallback; motion control; reduced-motion, low-data and responsive fallbacks.

The interface includes conceptual device screens. They do not announce a released app. Future idea entries are not bookable events. First-event date, venue, programme and prices are not confirmed.

## Registration integration

`assets/js/config.js` has `registrationEndpoint: null`. The default interface validates and reviews interest but does not transmit contact data or create a ticket. To integrate later, use a deliberate same-origin service and preserve the documented verified-success contract in `app.js`. The site includes no backend, authentication, payment or database. Contact details are not stored locally.

## Creative direction and motion

Museum of Ice Cream informed the current bright colour relationships and white invitation panel. Earlier SWSH research informed the photographic interaction language. All copy, logos, photos and film are PinkOut project/user assets; no reference scripts or media are bundled. The restored desktop hero transitions from the video invitation to a split-text, expanding-photo wall. Its viewport uses native CSS sticky positioning and no generated pin spacer. Reversing restores the invitation. Compact/reduced-motion/low-data layouts retain normal flow. Page exit pauses movement while retaining layout and scroll triggers; browser restoration refreshes them.

See QA.md for verification and device-testing limits.

## Hero background film

User-supplied Mixkit clip: `mixkit-pair-of-female-friends-having-fun-on-a-night-out-42299-hd-ready.mp4`. Bundled as `assets/video/hero-night-out.mp4` with a matching still poster. Illustrative footage, not a past PinkOut event. Muted looping inline playback, a bilingual play/pause control, offscreen/hidden-tab pausing, and poster fallback for reduced motion, data saving or blocked autoplay. No third-party player or external video request.

## Current bright revision

Shared styles: `assets/css/theme.css` and `hero.css`. Motion: `assets/js/experience.js`. The former replica files are retired. Desktop hero choreography is restored with explicit reversible states and native sticky layout. Browser page exit pauses movement without dismantling the layout. The palette follows the newly supplied Museum of Ice Cream direction: pink, cherry, white, mint, lavender and yellow.

## Browser return-state repair

Same-document history and full-page restoration both reconcile hero progress with the real scroll position. Top/bottom boundary frames settle immediately. Expanding photo masks use symmetric CSS variables. Interrupted video play promises remain resumable after intentional pauses.
