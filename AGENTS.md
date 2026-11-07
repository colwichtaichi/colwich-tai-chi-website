# Rules for AI agents working on this website

Colton & Colwich T’ai Chi: Andrew Marshall’s community Tai Chi class. A static Astro 7 site hosted on Netlify. README.md covers the file layout and commands.

## Making changes

- Make only the change requested. Keep the existing design, wording, pages and addresses unless the request says otherwise.
- Change shared facts (class time, price, venue, contact details, links) in `src/data/site.ts`, and videos in `src/data/videos.ts`, not in page markup.
- Fonts are set in `src/styles/fonts.css`. Colours, spacing and type sizes are in `src/styles/tokens.css`.
- If the Privacy wording changes, update its “Last updated” date to the day of the change.
- If a fact is unknown, ask instead of inventing it. Don’t invent qualifications, services, policies, testimonials or links. Don’t add health claims.
- The TCIA badge is the only accreditation mark. Don’t add accreditation wording beyond the existing copy and the badge.
- Keep the site proportionate to a small brochure site. Don’t add booking, payments, forms, accounts, a blog, a mailing list, analytics, cookies or embedded video players without a specific request.
- Images must come from the site itself (the security policy blocks other sources). For a new video, add it to `src/data/videos.ts` and save its thumbnail with `node scripts/fetch-video-thumbnails.mjs`.
- Remove location and camera metadata from new photos before adding them.
- Keep the accessibility features: the skip link, visible keyboard focus, the mobile menu (which still works without JavaScript), image `alt` text and one `<h1>` per page.
- Don’t upgrade dependencies or change `package-lock.json` unless asked.
- Never add passwords, keys, tokens or private information to the repository. It is public.

## Settings that need care

- `netlify.toml` holds the security headers, caching and old-address redirects. Keep them.
- Search-engine indexing is controlled by `allowIndexing` in `src/data/site.ts` and the `X-Robots-Tag` header in `netlify.toml`. Change these only when asked to, as part of launch.

## Before finishing

Run `npm run build` (which includes the post-build checks) and `npm run check`. Report any failure plainly instead of working around it.
