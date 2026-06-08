# SEO & Google Search Console — Launch Checklist

How Fulltiime's SEO is wired, and the exact steps to verify ownership now and
switch on indexing at launch.

---

## The strategy (in one line)

**Beta is for testing, the apex (`fulltiime.com`) is for ranking.** Google can
*crawl* beta to let us validate, but beta is never *indexed*. At launch we drop
coming-soon mode and the apex becomes the indexable site.

---

## What's already in the code

| File | What it does |
|------|--------------|
| `frontend/lib/seo.ts` | Single source of truth: site URL, name, default description, OG image, and a `buildMetadata()` helper. |
| `frontend/app/layout.tsx` | Site-wide defaults: `metadataBase`, default title/description, OpenGraph, Twitter card, robots directives. |
| `frontend/app/robots.ts` | Generates `/robots.txt` — allows crawling, blocks `/login`, `/register`, `/api/`, points to the sitemap. |
| `frontend/app/sitemap.ts` | Generates `/sitemap.xml` — top-level routes + every news article. |
| `frontend/app/(main)/*/layout.tsx` | Per-section titles + descriptions (news, leagues, matches, live, standings, fixtures, teams, transfers, analytics). |
| `frontend/app/(main)/news/[slug]/layout.tsx` | Per-article title/description/OpenGraph pulled from the article data. |
| `frontend/middleware.ts` | Adds `X-Robots-Tag: noindex, nofollow` on `beta.`/`dev.` so staging is crawlable but never indexed. |

> **Canonical note:** every page's canonical URL points to `https://fulltiime.com`
> (via `SITE_URL`). So even when Google crawls beta, the page says "the real
> version lives on the apex." That's intentional.

---

## Now (pre-launch) — verify ownership

- [ ] Go to <https://search.google.com/search-console> → **Add property** →
      choose **Domain** → enter `fulltiime.com`.
- [ ] Google shows a **TXT record** like `google-site-verification=abc123…`.
- [ ] At the DNS provider for `fulltiime.com`, add a TXT record:
      - **Name / Host:** `@` (the root/apex)
      - **Value:** the full `google-site-verification=…` string
      - **TTL:** default
- [ ] Wait for DNS propagation (minutes–hours), then click **Verify** in GSC.

> A **Domain** property covers the apex **and every subdomain** (`beta.`, `www.`,
> `dev.`) in one shot — no separate beta verification needed.

---

## Now (pre-launch) — validate, don't index

- [ ] In GSC → **URL Inspection** → paste a beta URL, e.g.
      `https://beta.fulltiime.com/news/world-cup-2026-everything-you-need-to-know`.
- [ ] Click **Test Live URL** → confirm the rendered HTML, `<title>`, description
      and OG tags look right.
- [ ] Expect **"Indexing not allowed: 'noindex' detected"** — this is correct.
      Validation still works; beta just won't be added to Google.
- [ ] **Do not** submit a beta sitemap or request indexing on beta.

Set the production env var on the host (Vercel/etc.):

```
NEXT_PUBLIC_SITE_URL=https://fulltiime.com
```

(It already defaults to this, so this is belt-and-suspenders.)

---

## At launch — switch indexing on

- [ ] Remove (or gate) the coming-soon block in `frontend/middleware.ts` so the
      apex serves the real app instead of redirecting to `/coming-soon`.
- [ ] Confirm `https://fulltiime.com/robots.txt` loads and allows crawling.
- [ ] Confirm `https://fulltiime.com/sitemap.xml` loads with apex URLs.
- [ ] In GSC → **Sitemaps** → submit `sitemap.xml`.
- [ ] Spot-check a few pages with **URL Inspection** → **Request Indexing**.
- [ ] (Optional) 301-redirect `beta.fulltiime.com` → `fulltiime.com` so nobody
      lingers on staging.

The apex is already `index: true` from `app/layout.tsx`, so no metadata change is
needed at launch — only the middleware switch.

---

## Phase 2 — dynamic detail pages (not done yet)

The sitemap + per-page descriptions currently cover static sections and news.
The API-driven detail pages still use the site-wide default description:

- `/matches/[id]`, `/leagues/[id]`, `/teams/[id]`, `/fixtures/[id]`

To give each its own title/description, add a `layout.tsx` with `generateMetadata`
that fetches from the backend (`NEXT_PUBLIC_API_URL`) — and optionally add those
URLs to the sitemap. Revisit when those pages are crawlable.
