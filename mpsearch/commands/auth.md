---
description: Connect a Second Life session so Adult/Moderate listings and reviews are visible
---

The user wants to connect (or repair) the Second Life session that `mpsearch` uses.
Cookies are what unlock Adult and Moderate listings — and reviews, which the site
withholds from anonymous visitors entirely.

First, check where things stand by calling the `session_status` tool.

- If it reports **logged-in**, say so, mention that Adult listings are visible, and
  stop. Nothing to do.
- If it reports **anonymous** or **expired cookies**, walk the user through the
  capture below.

Capturing the session is a human step — it needs a browser and a terminal, and you
cannot do it for them. Present these instructions:

> Run this in your terminal (in Claude Code, prefix with `!` to run it here):
>
> ```
> node "${CLAUDE_PLUGIN_ROOT}/dist/cli.js" auth capture
> ```
>
> Then:
> 1. Open <https://marketplace.secondlife.com> in your browser, logged in.
> 2. Press F12 → **Network** tab → reload the page.
> 3. Right-click the first request (the HTML document) → **Copy** → **Copy as cURL**.
> 4. Paste it into the waiting prompt and press **Ctrl-D**.
>
> Nothing is transmitted anywhere — the cookies are written only to
> `~/.config/mpsearch/config.json`, mode 0600.

Explain *why* the cURL route rather than a plain cookie export: it carries the
User-Agent as well, and Cloudflare binds the `cf_clearance` cookie to the exact
User-Agent that earned it, so a cookie-only capture can start getting blocked.

If they already have a cookie jar from a browser extension, the alternative is:

```
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.js" auth import /path/to/cookies.txt
```

Once they have run it, call `session_status` again to confirm, and report the result
plainly — including if it still says anonymous, which usually means the browser
session itself was logged out.

Sessions expire after a while. When searches start warning about maturity, or
reviews come back empty, this is the fix.
