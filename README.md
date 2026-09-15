# Bloom Dental Group — site assets

Stylesheet and behaviour script for the bloomdentalgroup.com page templates.
The pages themselves live in Webflow; these two files are served from jsDelivr
because Webflow's asset manager does not accept `.css` or `.js`.

## How the pages reference these files

Each page's **Page settings → Custom code → Inside `<head>` tag** loads a
*commit-pinned* URL:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/peiyiwuanna/bloom-dental-assets@COMMIT/hifi.css">
<script src="https://cdn.jsdelivr.net/gh/peiyiwuanna/bloom-dental-assets@COMMIT/hifi.js"></script>
```

Pinning to a commit SHA rather than a branch means **pushing to this repo cannot
change the live site**. To ship a change: commit here, then update the SHA in
each page's head code. That is deliberate — it makes every visual change to a
live page an explicit, reviewable step rather than a side effect of a push.

## Files

| File | Notes |
|---|---|
| `hifi.css` | The full stylesheet. Opens with a global reset (`* { margin:0; padding:0 }`), so it must only ever load on the new page templates — **never** as Webflow site-wide custom code, which would flatten the spacing on the 15 existing Designer-built pages. |
| `hifi.js` | Hero slideshow, scroll reveals, counters, mobile nav, bubbly buttons, sticky action bar. Everything runs on `DOMContentLoaded`, so the tag is safe in either the head or the body — which matters because the page markup arrives in a Webflow Embed element. |

## Conventions worth knowing before editing

- The booking destination is **not** hardcoded in `hifi.js`. The script reads it
  off the `.nav-cta` link in the page markup, so each page's head/embed is the
  single source of truth for where "Book" goes.
- Images are **not** in this repo. They live in Webflow's asset manager so the
  client owns them; only CSS and JS are here, because Webflow cannot host them.
