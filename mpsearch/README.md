# mpsearch (Claude Code plugin)

Lets an AI agent search the **Second Life Marketplace**: listings, copy/modify/transfer
permissions, reviews, creator stores and the category tree. Bundles the MCP server, a
skill and an auth command, with no install step — the server is committed here as a
dependency-free bundle.

## What's in here

- **`.mcp.json`** — registers the `mpsearch` stdio MCP server (`node dist/mcp.js`).
- **`dist/`** — the bundled server and CLI. Build output, committed on purpose so the
  plugin runs anywhere `node` exists. See *Rebuilding* below.
- **`skills/marketplace-search/`** — when to search, how to search well, and what
  Second Life shoppers actually judge items on.
- **`commands/auth.md`** — `/mpsearch:auth`, which walks a human through connecting a
  Second Life session.

## Tools

`search_marketplace`, `get_listing`, `get_reviews`, `browse_store`, `list_categories`,
`session_status`. Everything returns JSON, and every listing carries a direct
Marketplace `url`.

## Requirements

- **Node 20+** on PATH. Nothing else — no `npm install`, no Python, no API key.
- A **Second Life account** if you want Adult or Moderate listings, or reviews at all.
  General-rated search and listing detail work anonymously.

## The session, and why it matters

The Marketplace does not fail an Adult search made without a session. It **silently
returns General-rated substitutes** — measured on one query, 48 results logged out vs
96 logged in, with zero overlap and no warning from the site. Reviews are withheld
from anonymous visitors entirely, so "no reviews" and "not logged in" look identical.

The plugin surfaces both: search responses carry `authenticated`, `maturityEffective`
and `warnings`, and the skill instructs the agent to check them before trusting
results. Run `/mpsearch:auth` to connect a session; cookies are stored locally at
`~/.config/mpsearch/config.json`, mode 0600, and never transmitted anywhere.

The session hinges on **two** cookies, not one. `user_credentials` is the
Marketplace's own and lasts about ninety days; `session-token` is the single sign-on
token `id.secondlife.com` checks on every page load, and it lasts about three. A
capture holding only the first is worse than none — the site logs the session out
mid-request and drops the query with it — so capture while logged in at
<https://secondlife.com/my/account>, not just at the Marketplace.

## Rebuilding

The source lives in a separate repository (`mpsearch`) — this plugin ships only the
built artefact. From that repo:

```bash
pnpm install
pnpm run build          # tsc, then esbuild → bundles
pnpm run sync-plugin    # copies the bundles into this directory
```

`sync-plugin` writes to `~/Work/plugins/mpsearch/dist` by default; set
`MPSEARCH_PLUGIN_DIR` to point it elsewhere.

Bump `version` in `.claude-plugin/plugin.json` when the tool surface changes, and keep
it in step with the source repo's version.
