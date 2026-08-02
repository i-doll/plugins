---
name: firestorm-avatar
description: Use when driving Five's Second Life avatar through the Firestorm viewer — searching the world, browsing/organizing/wearing inventory, giving items, editing your own profile and viewing others', inspecting nearby avatars, group chat/notices, and uploading assets (images, sounds, animations, materials). All actions respect RLV restrictions. Tools are served by the embedded "firestorm" MCP server.
---

# Driving the Firestorm avatar

Five's custom Firestorm viewer (an `ID`-prefixed fork) embeds an MCP server so you can drive
the avatar directly. The tools appear under the **`firestorm`** MCP server (registered in
`~/.claude.json`, user scope). Everything runs on the viewer's main thread and is
non-blocking — long operations stream their result back over SSE.

## Prerequisites

- The viewer must be **running and logged in**. If tools return connection errors, the viewer
  is closed or `IDMCPServerEnabled` is off.
- Enable in the viewer: Debug Setting **`IDMCPServerEnabled = 1`** (off by default). Port is
  `IDMCPServerPort` (default 33777). Loopback only, no auth — enabling grants any local process
  full control of the avatar.
- Tools refuse before login with `-32003 NOT_LOGGED_IN`.

## What you can do (tool areas)

Call `tools/list` for exact parameters, or see `MCP_TOOLS.md` in the `phoenix-firestorm` repo
root for the written reference. By area:

| Area | Tools | Use for |
|---|---|---|
| Health | `ping` | Liveness check |
| Viewer | `viewer.notify` | Post a toast to get Five's attention (persistent by default; `tip:true` = fades) |
| RLV | `rlv.getStatus`, `rlv.getRestrictions`, `rlv.canDo` | See what's restricted **before** acting |
| Inventory | `inventory.getFolder`/`getItem`/`search`/`createFolder`/`rename`/`move`/`delete`/`giveItem`/`giveFolder`/`createItem`/`refresh` | Browse, organize, give |
| Notecards/Scripts | `notecard.read`/`write`, `script.read`/`write` | Read/edit item contents; scripts compile (mono/lsl2/luau/lsl-luau) |
| Appearance | `appearance.wearItems`/`detachItems`/`wearOutfit`/`listOutfits`/`getWorn` | Wear/remove, outfits |
| Profile | `profile.get`/`setSelf`, `profile.getPicks`/`getClassifieds`, `people.getNames`, `people.getFriends` | View/edit profiles, read picks & classified ads in full, resolve names, list friends (online + granted rights) |
| Search | `search.people`/`places`/`groups`/`events`/`land`/`classifieds` | Directory search (headless) |
| Nearby | `avatars.getNearby`/`getWorn` | Who's around, what they have attached |
| Groups | `group.list`/`getInfo`/`activate`/`sendIM`/`getNotices`/`sendNotice` | Group chat + notices |
| Uploads | `upload.image`/`sound`/`animation`/`material` | Upload assets (cost L$ — see below) |

## RLV restrictions are HARD-enforced

A tool call that would violate an active RLV restriction fails with JSON-RPC error **`-32011`**,
whose `data` names the `restriction` and the `sources` (the object(s) imposing it). This is not
advisory — the action does not happen.

- Before a restricted action, check `rlv.getRestrictions` (what's active) or `rlv.canDo`
  (would this specific call be allowed?).
- Common gates: `@showinv` (inventory browse), `@detach`/wearable locks (appearance),
  `@shownames` (others' names/profiles), `@viewnote`/`@viewscript` (contents), `@shownearby`
  (nearby avatars), `@showsearch` (search), `@share` (giving), `@setgroup` (group activate).
- If blocked, surface the restriction and its source object to Five rather than retrying.

## Uploads cost real L$ — always dry-run first

Every upload tool is two-phase and **defaults to a dry run**:

1. **Dry run** (no `confirm`): returns a per-file manifest — validation + L$ **cost estimate** —
   plus the total and your current balance. **Spends nothing.**
2. **Confirm** (`"confirm": true`): actually uploads.

The intended flow for "upload these for me into folder X": dry-run → show Five the cost →
get approval → re-call with `confirm: true`. One approval per batch, not per file.

- Files come from `paths` (explicit list) and/or `dir` (globs that type's extensions).
- `dest` = folder UUID or well-known name (default = the type's system folder: Textures/
  Sounds/Animations/Materials). `names` overrides per-file inventory names (default = filename stem).
- There is **no RLV gate** on uploads; the `confirm` requirement is the spend guard.

## Identifying what someone is wearing

When Five asks "what boots is X wearing?" (or any specific item — a hat, a collar, a skirt):

1. Call `avatars.getWorn` for that avatar. It returns every attachment with its **object name**
   (resolved via a server round-trip; the call is deferred a moment while names come back).
2. **Match on the object NAME, not the attach point.** Rigged mesh can be attached *anywhere* on
   the body — boots are frequently on the spine, chest, pelvis, an eyeball, whatever the creator
   picked. The attach point tells you nothing reliable about what the item *is*.
3. **Match the item type loosely / by synonym.** "boots" can read as `boot`, `shoe`, `heels`,
   `stilettos`, `sneakers`, `platforms`, etc. Look across all attachment names for anything that
   plausibly matches the requested category, and present the best candidate(s) with their names.
4. If several plausibly match (or none clearly do), list the candidates by name and let Five
   decide, rather than guessing from position.

Only attached *objects* are visible this way — never another avatar's clothing/bodypart wearable
layers or HUDs (see gotchas). So "boots" that are actually a system/mesh *clothing* layer won't
appear; say so if nothing matches.

## Gotchas (learned the hard way)

- **Upload cost is grid- and account-dependent.** Uploads are free on the Beta/test grid **and
  for some accounts** (Five's included), so `cost: 0` is often legitimate, not a bug. On
  accounts/grids that charge, the dry-run shows the real price (≈L$10, more for ≥2K textures).
  Trust the dry-run's `total_cost` + `balance`.
- **Sounds: ≤10 seconds, 44.1 kHz mono 16-bit PCM.** The dry-run does *not* yet check length —
  an over-length WAV passes dry-run but fails on `confirm` with SL's generic "server
  difficulties" error. If a sound upload fails that way, suspect length first.
- **Animations:** `.bvh` is converted client-side (knobs: `loop`, `priority` 0-4, `ease_in`/
  `ease_out`, `hand_pose`); pre-baked `.anim` uploads as-is. `luau`/`lsl-luau` script targets and
  Luau features need region support that isn't universal.
- **Materials are fire-and-forget.** `upload.material` returns the enqueue + estimated cost but
  no per-item id — verify the created items with `inventory.getFolder` on the dest.
- **Read-after-write is fine now.** `script.read`/`notecard.read` resolve the asset server-side
  by item id, so reading right after a write works. If a result ever looks stale, `inventory.refresh`
  forces a fresh fetch. (Scripts/notecards carry a null *local* asset id by design — that's normal.)
- **Others' wearables aren't observable.** `avatars.getWorn` reports attached objects only, never
  another avatar's clothing/bodypart layers (the viewer only holds the baked result). HUDs are
  never enumerable for anyone.
- **Picks and classifieds need their own call.** `profile.get` returns pick ids and names
  only, and no classifieds at all — descriptions live behind a per-item round-trip. Use
  `profile.getPicks` / `profile.getClassifieds` to read the actual text. Residents often
  use picks as prose (a backstory split across `part 1`..`part 5`, or a captioned gallery),
  so titles alone tell you almost nothing — read `desc` in the order returned: it is the
  profile's listing order, the same order the viewer's Picks tab shows. (`sort_order` is
  vestigial — always 0 — and `sim_name` is usually empty; use `pos_global`.) Both
  tools can return PARTIAL results: check `missing` for ids that didn't answer, and treat
  `listing_answered: false` as "the list never arrived", not "they have none".

## Scope discipline

When Five is testing, act only on **Five's own** avatar and inventory unless explicitly told
otherwise — don't give inventory to, or otherwise act on, other avatars.
