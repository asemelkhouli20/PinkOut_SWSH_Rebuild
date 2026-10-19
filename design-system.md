# PinkOut — Playful experience design system

## Creative direction

The requested Museum of Ice Cream reference inspires bright colour blocks, berry typography, cherry actions, real full-bleed photography and an inviting white panel over the hero film. The dark black/orange treatment is retired. The one-page event/community journey and all seven visible experience descriptions remain.

## Palette

- Canvas: sorbet white `#fff5f8`.
- Text: deep berry `#7d163f`; secondary `#924060`.
- Primary actions: cherry `#df004c`; hover `#b90040`; white labels.
- Event block: pink `#ffc9de`.
- Secondary blocks: mint `#c7efdf`, lavender `#ddcffb`, butter yellow `#fff0aa`, sky blue `#d8ecff`.
- Photo-led category section retains white text over a berry-tinted photograph for contrast. Other content uses bright backgrounds.

## Typography and structure

Local IBM Plex Sans Arabic, Arabic-first RTL; Arial/Helvetica English. Hero headings 34–66px across breakpoints. Bold, readable type, broad photographic compositions, balanced white space, 16–48px responsive gutters. No script display typography.

The hero is in normal document flow: visible film, content-sized white invitation panel, then wrapping world labels and a separate 44px pause control. On suitable desktop viewports, a reversible native-sticky sequence transitions into split text, an expanding central photo and surrounding photo stacks. It keeps the bright palette. Small/short, reduced-motion, low-data and content-overflow views use the normal-flow layout. The following media wall is its own section and adapts from four desktop columns to two mobile columns. Header uses a real middle navigation column. The clickable photo stacks now live in the media wall.

## Motion and return behaviour

GSAP coordinates title lifts, visible media-wall movement, device entrances, image parallax and ambient photo movement. ScrollTrigger follows native scroll. The restored hero choreography uses explicit start/end values inside a CSS sticky container, with no generated pin spacer. Reversing restores the video, headline and controls. Arabic glyphs are never split. Page exit pauses ambient loops and video without reverting the document layout; pageshow refreshes the retained triggers and resumes allowed movement. Video attempts use generation guards so stale promises cannot interrupt restored playback. Explicit pause, reduced motion and data saving remain supported.

## Implementation

`assets/css/theme.css` contains shared responsive styles and the bright palette. `hero.css` owns the video and media-wall layout. `assets/js/experience.js` owns decorative interactions; `hero-video.js` owns playback. `config.js`, `copy.js`, and `app.js` retain bilingual navigation, interests and the static form preview. No framework, build step or backend is required.
