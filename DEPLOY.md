# Helix Reps: deploy notes

Live at https://hxreps.puddingtime.net (Cloudflare Worker `hxreps`, static assets from `public/`). Pushing to `main` deploys.

## What this is

`public/index.html` is the whole site. One self-contained file: markup, CSS and JavaScript inline. No build step, no backend, no framework. No analytics script in the page (see Storage and privacy).

## Requirements

- Any static host (Cloudflare Pages or Workers static assets, GitHub Pages, Netlify, S3 + CDN).
- Serve `index.html` at `/` over HTTPS with `Content-Type: text/html; charset=utf-8`.
- No server-side routing. The page does not use the URL path, query string or hash.

## External requests

- Google Fonts only (`fonts.googleapis.com`, `fonts.gstatic.com`) for IBM Plex Sans and IBM Plex Mono. The page falls back to system fonts if they are blocked. To remove the dependency, self-host the two families and replace the `<link>` in `<head>` with local `@font-face` rules.
- Outbound links go to `docs.helix-editor.com` and open in a new tab.

If you set a Content-Security-Policy, it needs:
`default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com`

## Storage and privacy

- Progress (stars, sprint best, tutorial ticks) is kept in the visitor's browser under the `localStorage` key `helix-reps-v2`. The page itself sends nothing anywhere. No cookies.
- The site is registered with NeatStats. `<head>` carries its domain verification tag (`neatstats_verification`); keep it, or NeatStats loses verification. NeatStats tracks without any script in the page, so the CSP above needs no NeatStats entry. If a NeatStats script is ever added, add its domains to `script-src` and `connect-src` in `public/_headers`.

## Done

- Domain: hxreps.puddingtime.net.
- Favicon (`public/favicon.svg`, `public/apple-touch-icon.png`) and Open Graph image (`public/og.png`, 1200×630); `og:url` and `og:image` set.
- Footer credits Mike Hall, MIT licence (`LICENSE`).

## Editing later

- Drills live in the `STAGES` array and tutorial lessons in `TUTORIAL`, both inside the `<script>` between the `ENGINE-START` and `ENGINE-END` comments. Each drill carries a `sol` (space-separated keys); par is its length.
- The same block holds the Helix emulator (`feed`, `isSolved`). It has no DOM dependencies, so it can be extracted and run under Node to check that every drill's `sol` still solves it after an edit.
- If drill ids change, bump the storage key (`helix-reps-v2`) so stale progress is dropped.

## Known limits

- Needs a hardware keyboard. It renders on a phone but cannot be played there.
- The emulator covers only the keys the drills use. Indent width is fixed at two spaces and comment toggling always uses `# `.

## Deploys

Workers Builds watches `pdxmph/hxreps` on `main` and runs `npx wrangler deploy` on every push (trigger "hxreps main"). `wrangler deploy` from this folder also works.

## Tests

`tests/footer-layout.mjs` checks the footer's two-row layout at 1280, 1000 and 390px in headless Chromium. It needs Playwright; point `PLAYWRIGHT` at its `index.mjs` and `CHROME` at a Chromium binary if they aren't resolvable. `tests/` is outside `public/`, so it is never deployed.
