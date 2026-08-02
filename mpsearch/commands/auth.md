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
> Then, in your browser:
> 1. Open <https://marketplace.secondlife.com> while logged in to Second Life.
> 2. Open developer tools (**F12**, or ⌥⌘I on macOS) and select the **Network** tab.
> 3. Reload the page.
> 4. Right-click the first request — the HTML document, usually the top row — and
>    choose **Copy → Copy as cURL**. If your browser offers variants, pick the
>    **bash** one; the Windows `cmd` form is also accepted.
> 5. Paste it into the waiting prompt, then press **Ctrl-D** (on Windows, **Ctrl-Z**
>    then Enter).
>
> Nothing is transmitted anywhere — the cookies are written only to the local config
> file (`$XDG_CONFIG_HOME/mpsearch/config.json`, falling back to
> `~/.config/mpsearch/config.json`), created mode 0600.

Chrome, Edge, Firefox and Safari all expose "Copy as cURL" in the Network tab, so
this works whatever they use.

Explain *why* the cURL route rather than a plain cookie export: it carries the
User-Agent as well, and Cloudflare binds the `cf_clearance` cookie to the exact
User-Agent that earned it, so a cookie-only capture can start getting blocked later.

If they already have a cookie jar exported by a browser extension, the alternative is:

```
node "${CLAUDE_PLUGIN_ROOT}/dist/cli.js" auth import /path/to/cookies.txt
```

This needs Node 20 or newer on PATH. If `node` is missing, say so plainly rather than
improvising — the bundled CLI cannot run without it.

Once they have run it, call `session_status` again to confirm, and report the result
plainly — including if it still says anonymous, which usually means the browser
session itself was logged out.

Sessions expire after a while. When searches start warning about maturity, or reviews
come back empty, this is the fix.
