---
name: marketplace-search
description: Use when searching, browsing or evaluating anything on the Second Life Marketplace — finding avatars, mesh bodies, heads, clothing, skins, furniture, animations, AOs, HUDs, collars or any SL product; comparing prices in Linden dollars; checking copy/modify/transfer permissions before recommending a purchase; reading reviews; or browsing a creator's store. Also covers why Adult and Moderate listings and reviews need a logged-in session.
---

# Searching the Second Life Marketplace

The `mpsearch` MCP server exposes the Marketplace as tools: `search_marketplace`,
`get_listing`, `get_reviews`, `browse_store`, `list_categories`, `session_status`.

## The trap: an anonymous search does not fail, it lies

Without a logged-in session the Marketplace **silently returns General-rated
substitutes** for Adult and Moderate searches. It does not error. Measured on one
query: 48 results logged out, 96 logged in, **zero overlap** — entirely different
products, no warning from the site.

So on every search response, read these before trusting anything:

- `authenticated` — false means you are seeing General-rated results only
- `maturityEffective` vs `maturityRequested` — a drop to `G` means substitution happened
- `warnings` — non-empty means say so in your answer

If `authenticated` is false and the user wants Adult or Moderate content, **tell them
and stop guessing**. Fixing it is a human step in a terminal — point them at
`/mpsearch:auth`. Never present General-rated results as though they answered an
Adult query.

**Reviews need the session too.** Anonymously the reviews section is absent from the
page entirely, so an empty `get_reviews` result means "not logged in", *not* "this
item has no reviews". Check `warnings` before concluding a listing is unreviewed.

When in doubt, call `session_status` first. It is one cheap request.

## How to search well

**Scope by category rather than piling on keywords.** `list_categories` with no
argument gives the 28 top-level ids; pass one as `parentId` to get subcategories
with listing counts. "Complete Avatars → Complete Animal Avatars" (id 99) beats
guessing the phrase a merchant happened to use. A listing from `get_listing` also
reports its own `categoryIds` — the fastest route to "more things like this".

**Sort deliberately.** Default is relevance. `purchase_count_desc` (best selling) is
the most reliable quality proxy on a site where review counts are thin and old.
`rating_weighted_desc` works when you specifically want well-reviewed items.

**Set `excludeDemos: true` for clothing, bodies and skins.** Demos otherwise crowd
out the real listings — most fashion merchants list a demo beside every product.

**Filter on permissions when it matters.** `requireCopy`, `requireModify`,
`requireTransfer` map to the site's own filters. See below for why this matters more
in Second Life than it looks.

**Paginate honestly.** `totalResults` caps at 10000 and sets `totalIsLowerBound`;
`lastPage` tells you how far the pages actually run.

## What Second Life shoppers actually care about

**Permissions are the thing people get burned by.** Every listing carries
copy / modify / transfer flags, and they are not negotiable after purchase:

- **no-copy** — you own exactly one instance; if you delete it or it fails to
  return from a rezzed object, it is gone. Risky for anything you rez in-world.
- **no-modify** — you cannot resize, retexture or edit scripts. Fatal for furniture,
  jewellery and anything that must fit a specific body.
- **no-transfer** — you cannot give or resell it. Note that **copy and transfer are
  almost never both granted**; a "copy" item is normally no-transfer, so it cannot
  be gifted. If the user is buying a present, they need a transfer item.

Always surface the permissions when recommending something. `get_listing` returns
them; search results do not.

**Body and head compatibility governs clothing.** Mesh clothing fits specific bodies
(Maitreya Lara / LaraX, Reborn, Legacy, Erika, Kupra…). A listing that does not name
the user's body probably will not fit. The listing `name`, `description` and
`features` are where merchants state fit — read them via `get_listing` before
recommending, and say which bodies are supported.

**"Fatpack" means all colours/textures included** and is usually far better value
than single colours if the user wants more than one.

**Land impact matters for rezzed objects** (furniture, buildings, vehicles) because
parcels have hard limits. `landImpactMax` filters on it; irrelevant for worn items.

**Reviews skew old.** Many items were last reviewed years ago, and a review may
describe a version the merchant has since replaced. Weigh `postedAt` before quoting
one as current.

## Presenting results

Give the direct `url` from each result — it is a clickable Marketplace link and the
user will want to open it. Include the price as `L$` and name the store, since
Second Life shoppers navigate by creator reputation. Prefer a handful of well-chosen
items with permissions and fit noted over a long undifferentiated list.

If the user liked something, `browse_store` on its `storeId` is usually a better
follow-up than another keyword search.
