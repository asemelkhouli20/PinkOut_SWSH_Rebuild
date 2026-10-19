# Current motion revision

The user asked to restore the expanding-photo hero animation while retaining the bright Museum of Ice Cream-inspired colour direction. The sequence returns: video invitation, split text, growing central photograph, surrounding photo stacks.

The viewport is natively sticky inside a CSS-sized scroll shell. GSAP/ScrollTrigger animate explicit start/end values; they do not generate a pin spacer. Reverse scroll restores video opacity, heading visibility, controls and the initial photo crop. The sequence is enabled only on sufficiently large/tall desktop views where content fits; normal flow is the fallback.

Pagehide keeps the context and sticky geometry. Pageshow refreshes retained markers and synchronizes rendered progress. Language/viewport/motion rebuilds preserve hero progress or the current content offset. Video pauses behind the photo scene and resumes when reversed, subject to manual/system preferences and stale-promise guards.
