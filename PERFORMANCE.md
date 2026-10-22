# Frontend code-splitting measurements

## Build output

Measured with `npm run build` on 2026-09-24.

| Metric | Before lazy loading | After lazy loading |
| --- | ---: | ---: |
| Entry JavaScript | 181.44 kB (57.95 kB gzip) | 172.65 kB (56.22 kB gzip) |
| Route chunks | Included in entry | `Projects`: 5.73 kB (2.04 kB gzip); `Contact`: 4.68 kB (1.70 kB gzip) |
| Modules transformed | 37 | 38 |

The entry bundle is 8.79 kB smaller raw and 1.73 kB smaller gzip after moving the Projects and Contact routes behind `React.lazy()`.

## Browser measurements

Use the production preview (`npm run preview`), open DevTools > Network, enable Disable cache, and record the page load after a hard reload. Repeat with Slow 3G selected to observe the `Loading page...` fallback before visiting a lazy route.

| Network metric | Before | After |
| --- | --- | --- |
| Initial JS transferred on `/` | Record in DevTools | Record in DevTools |
| Initial load time on `/` | Record in DevTools | Record in DevTools |
| `/projects` chunk request | Included in initial bundle | `Projects-*.js` on first visit |
| `/contact` chunk request | Included in initial bundle | `Contact-*.js` on first visit |

The production build output above is the recorded bundle-size evidence. Browser transfer and timing values vary with browser cache, network throttling, and the preview server, so they should be captured in the same DevTools session used for the comparison.
