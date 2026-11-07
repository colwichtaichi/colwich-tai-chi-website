# Colton & Colwich T’ai Chi website

The website for Andrew Marshall’s Tai Chi class at Colton Village Hall. The planned address is https://www.colwichtaichi.org.uk.

Built with [Astro](https://astro.build) 7 as a static site: every page is generated in advance, and there are no forms, accounts, databases or tracking. It is designed to be hosted on Netlify, with this repository holding the editable source.

## Making a change

The intended way to make everyday changes is Netlify’s Agent Runners, from the Netlify project dashboard:

1. Describe the change in plain English. For example: “Change the price per session from £5 to £6.”
2. Check the Deploy Preview that Netlify builds next to your request. Ask for corrections if anything is wrong.
3. When the preview is right, open a pull request from the agent run, then merge it in GitHub. Netlify publishes the merged change.
4. Check the live website.

This follows Netlify’s documentation as checked on 7 November 2026. Agent Runners need a Netlify team on a credit-based plan, with credits available. Agent runs, AI usage and each production deploy use credits. On the Free plan, using up the monthly credits pauses the website until the credits reset.

[AGENTS.md](AGENTS.md) gives AI agents the rules for this site.

## Where things live

```
src/data/site.ts        Class details, venue, contact details, links, site address, indexing switch
src/data/videos.ts      The practice videos
src/pages/index.astro   Home page (all sections and their wording)
src/pages/video-demo.astro   Practice videos → /video-demo.html (keeps the old address)
src/pages/privacy/      Privacy information → /privacy/
src/pages/404.astro     Page-not-found
src/styles/fonts.css    The font pairing (one place to change it)
src/styles/tokens.css   Colours, spacing and type sizes
src/styles/global.css   Shared base styles, buttons, focus states
src/assets/             Photos, logo and TCIA badge (optimised during the build)
src/assets/video-thumbnails/   Local copies of each video’s YouTube thumbnail
public/                 Favicons
scripts/                Build checks, browser QA, link check, thumbnail download
netlify.toml            Build settings, security headers, caching and old-address redirects
```

## Common edits

- **Class time, price, phone, email, address:** edit `src/data/site.ts`. Every page reads from it.
- **Wording:** edit the paragraph in `src/pages/index.astro` (sections are marked with comments) or `src/pages/privacy/index.astro`. If the Privacy wording changes, update its “Last updated” date.
- **Videos:** edit `src/data/videos.ts`, then run `node scripts/fetch-video-thumbnails.mjs` to save the new video’s thumbnail. The site serves thumbnails itself instead of loading them from YouTube.
- **Photos:** replace the file in `src/assets/photos/` with a version that has no location or camera metadata. Astro resizes it during the build.
- **Fonts:** News Cycle (headings) and Lora (body). Change them in `src/styles/fonts.css`.

## Working on a computer

Requires Node 22.12 or later. `.nvmrc` and Netlify’s `NODE_VERSION` both use Node 22. No environment variables or secrets are needed.

```sh
npm ci             # installs the exact versions in package-lock.json
npm run dev        # live-editing server → http://127.0.0.1:4321
npm run build      # builds dist/ and runs the post-build checks
npm run preview    # serves dist/ → http://127.0.0.1:4321 (stop with: npx astro preview stop)
```

Use `npm install <package>` only when deliberately adding or upgrading a dependency.

## Checks

| Command | What it checks |
| --- | --- |
| `npm run build` | Builds the site, then `scripts/check-build.mjs`: required pages, one `<h1>` per page, titles, descriptions, canonical and sharing-image URLs, image `alt` text, internal links and `#section` anchors, robots.txt and font files. It also lists any remaining launch items as notes. |
| `npm run check` | Astro/TypeScript check. |
| `npm run qa` | Run after a build. Checks every page at 320, 390, 768 and 1280px wide for horizontal scrolling, broken images, console errors and axe accessibility issues (WCAG 2.2 AA rules), and tests the mobile menu and skip link with the keyboard. Saves screenshots to `qa-output/`. Uses Google Chrome if installed; otherwise run `npx playwright install chromium` first. |
| `npm run check:links` | Run after a build. Checks every external link, and confirms each practice video is still public on YouTube. |
| `npm run check:launch` | Fails until the launch settings below are switched on. |

## Search engines and launch settings

Until launch the site asks search engines not to index it, in two places:

- `allowIndexing: false` in `src/data/site.ts` (the page `robots` tag);
- the `X-Robots-Tag` header in `netlify.toml`.

At launch, once the domain serves the site over HTTPS, set `originConfirmed: true` and `allowIndexing: true`, and remove the `X-Robots-Tag` line. `npm run check:launch` then passes.

## Old page addresses

| Old address | New behaviour |
| --- | --- |
| `/` and `/index.html` | Home page |
| `/video-demo.html` | Kept as the Practice videos page |
| `/classes.html` | 301 → `/#classes` (netlify.toml) |
| `/tai-chi.html` | 301 → `/#tai-chi` |
| `/finding-us.html` | 301 → `/#find-us` |
| `/contact-us.html` | 301 → `/#contact` |

The redirects only work on Netlify. If Netlify’s “Pretty URLs” setting is on, Netlify serves links to the videos page as `/video-demo`. Both addresses load, and the page’s canonical address is `/video-demo.html`.

## Backups and recovery

- **The source:** this repository. To rebuild from scratch, clone it, run `npm ci` and `npm run build`. Nothing outside the repository is needed.
- **A separate copy:** keep a dated download of the repository (GitHub → Code → Download ZIP) somewhere other than GitHub, after each approved batch of changes.
- **Undo a published change:** in GitHub, open the merged pull request and choose **Revert**, then merge the revert. Netlify publishes the earlier version and the next AI edit starts from it.
- **Emergency:** in Netlify, open Deploys, choose an earlier working deploy and **Publish deploy**. This changes only what is live, and can stop new changes publishing automatically until auto publishing is turned back on. Then revert the change in GitHub too, so the source matches the live site before the next edit.

## Copyright

No licence is granted. The photographs, logo, accreditation badge and wording are not available for reuse.
