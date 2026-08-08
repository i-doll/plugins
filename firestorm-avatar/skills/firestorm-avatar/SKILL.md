---
name: firestorm-avatar
description: Use when driving the user's Second Life avatar through the Firestorm viewer — moving (teleport/sit/stand), seeing (viewport snapshot), searching the world, browsing/organizing/wearing inventory, giving items, editing your own profile and viewing others', inspecting nearby avatars, 1:1 IM and group chat/notices, answering offers/dialogs, touching in-world objects, uploading assets (images, sounds, animations, materials), and paying L$. All actions respect RLV restrictions. Tools are served by the embedded "firestorm" MCP server.
---

# Driving the Firestorm avatar

The user's custom Firestorm viewer (an `ID`-prefixed fork) embeds an MCP server so you can drive
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
| Viewer | `viewer.notify` | Post a toast to get the user's attention (persistent by default; `tip:true` = fades) |
| RLV | `rlv.getStatus`, `rlv.getRestrictions`, `rlv.canDo` | See what's restricted **before** acting |
| Inventory | `inventory.getFolder`/`getItem`/`search`/`createFolder`/`rename`/`move`/`delete`/`giveItem`/`giveFolder`/`createItem`/`refresh` | Browse, organize, give |
| Notecards/Scripts | `notecard.read`/`write`, `script.read`/`write` | Read/edit item contents; scripts compile (mono/lsl2/luau/lsl-luau) |
| Appearance | `appearance.wearItems`/`detachItems`/`wearOutfit`/`listOutfits`/`getWorn` | Wear/remove, outfits |
| Profile | `profile.get`/`setSelf`, `profile.getPicks`/`getClassifieds`, `people.getNames`, `people.getFriends` | View/edit profiles, read picks & classified ads in full, resolve names, list friends (online + granted rights) |
| Search | `search.people`/`places`/`groups`/`events`/`land`/`classifieds` | Directory search (headless) |
| Nearby | `avatars.getNearby`, `avatars.getWorn` | Who's around, where they are & which way they face, what they have attached |
| Movement & world | `objects.getNearby`, `movement.teleport`/`walkTo`/`turn`/`sit`/`stand`, `agent.getLocation`, `object.touch` | Find nearby objects, go somewhere (teleport or walk), turn in place, sit, know where you are, operate objects |
| Animation (AO) | `ao.getStatus`/`setEnabled`/`selectSet`/`cycle` | Firestorm client-side animation overlay |
| Vision & HUD | `vision.snapshot`, `hud.click` | See the scene (snapshot; `show_hud:true` includes HUD overlays), click a HUD button by screen coordinate |
| IM (1:1) | `im.send`/`replies`/`getConversations`/`getMessages` | Private person-to-person messaging |
| Notifications | `notifications.list`/`respond` | Answer offers (items/teleport/friendship/group) + blue-menu dialogs |
| Groups | `group.list`/`getInfo`/`activate`/`sendIM`/`getNotices`/`sendNotice` | Group chat + notices |
| Uploads | `upload.image`/`sound`/`animation`/`material` | Upload assets (cost L$ — see below) |
| Money | `money.getBalance`/`pay` | Check balance; pay L$ (pay is fenced — see below) |

## RLV restrictions are HARD-enforced

A tool call that would violate an active RLV restriction fails with JSON-RPC error **`-32011`**,
whose `data` names the `restriction` and the `sources` (the object(s) imposing it). This is not
advisory — the action does not happen.

- Before a restricted action, check `rlv.getRestrictions` (what's active) or `rlv.canDo`
  (would this specific call be allowed?).
- Common gates: `@showinv` (inventory browse), `@detach`/wearable locks (appearance),
  `@shownames` (others' names/profiles), `@viewnote`/`@viewscript` (contents), `@shownearby`
  (nearby avatars), `@showsearch` (search), `@share` (giving), `@setgroup` (group activate),
  `@tplm`/`@tploc`/`@tplocal` (teleport), `@sit`/`@unsit` (sit/stand), `@touchworld`/`@touchall`/
  `@interact` (object.touch), `@sendim`/`@recvim` (IM), `@pay`/`@buy` (money.pay).
- If blocked, surface the restriction and its source object to the user rather than retrying.

## Uploads cost real L$ — always dry-run first

Every upload tool is two-phase and **defaults to a dry run**:

1. **Dry run** (no `confirm`): returns a per-file manifest — validation + L$ **cost estimate** —
   plus the total and your current balance. **Spends nothing.**
2. **Confirm** (`"confirm": true`): actually uploads.

The intended flow for "upload these for me into folder X": dry-run → show the user the cost →
get approval → re-call with `confirm: true`. One approval per batch, not per file.

- Files come from `paths` (explicit list) and/or `dir` (globs that type's extensions).
- `dest` = folder UUID or well-known name (default = the type's system folder: Textures/
  Sounds/Animations/Materials). `names` overrides per-file inventory names (default = filename stem).
- There is **no RLV gate** on uploads; the `confirm` requirement is the spend guard.

## Identifying what someone is wearing

When the user asks "what boots is X wearing?" (or any specific item — a hat, a collar, a skirt):

1. Call `avatars.getWorn` for that avatar. It returns every attachment with its **object name**
   (resolved via a server round-trip; the call is deferred a moment while names come back).
2. **Match on the object NAME, not the attach point.** Rigged mesh can be attached *anywhere* on
   the body — boots are frequently on the spine, chest, pelvis, an eyeball, whatever the creator
   picked. The attach point tells you nothing reliable about what the item *is*.
3. **Match the item type loosely / by synonym.** "boots" can read as `boot`, `shoe`, `heels`,
   `stilettos`, `sneakers`, `platforms`, etc. Look across all attachment names for anything that
   plausibly matches the requested category, and present the best candidate(s) with their names.
4. If several plausibly match (or none clearly do), list the candidates by name and let the user
   decide, rather than guessing from position.

Only attached *objects* are visible this way — never another avatar's clothing/bodypart wearable
layers or HUDs (see gotchas). So "boots" that are actually a system/mesh *clothing* layer won't
appear; say so if nothing matches.

## Embodiment: moving, seeing, and answering

- **Seeing.** `vision.snapshot` renders the current view to an image you can actually look at —
  use it to judge a scene, an outfit, or a build that structured data (`avatars.getNearby`) can't
  convey. Cheap; default returns inline base64 jpeg. Pass `show_hud:true` to include your HUD
  overlays (the viewer UI itself stays hidden); then `hud.click {x, y}` presses a HUD button by
  **normalized 0..1 top-left coordinate** — aim by where the button sits in that screenshot.
  (`hud.click` only hits HUDs; use `object.touch` for in-world objects.)
- **Finding things to interact with.** `objects.getNearby` lists rezzed in-world objects (seats,
  vendors, furniture) with their `object_id`, name, and distance — this is how you get the ids that
  `object.touch`, `movement.sit`, and `movement.walkTo` need. `scripted_only:true` cuts scenery
  noise down to interactive objects. (It does **not** list avatars — use `avatars.getNearby` for
  those, and `avatars.getWorn` for a specific avatar's attachment object_ids.)
- **Positioning relative to a person.** `avatars.getNearby` gives each avatar's `position` and
  `facing` (unit vector, + `heading_deg`). "Behind" someone is the side their back is toward, **not**
  the side away from you — so to stand behind them walk to `position − N·facing`, and to their front
  `position + N·facing` (N metres). Then `movement.turn {avatar_id}` to face them. Don't infer
  "behind" from your own approach direction; use their `facing`.
- **Moving.** Two ways: `movement.teleport` (instant, any distance — exactly one of a landmark item,
  a global `[x,y,z]`, a nearby `avatar_id`, or a **`slurl`** like `maps.secondlife.com/secondlife/Region/x/y/z`
  or `secondlife://Region/x/y/z`, region name resolved automatically; async, up to 60s;
  `status:"timeout"` may just be a slow region, `"failed"` = sim refused) and `movement.walkTo` (walk on foot — the "move to here"
  autopilot — to a position/object/avatar; best for short in-region moves; **stays on foot, never
  flies** even for far/high targets unless you pass `fly:true`; **pass `pathfind:true` to route
  around obstacles / through doorways / up & down stairs & ramps** in a cluttered, multi-room, or
  multi-level space — a raycast-grid A\* with per-cell floor height, ~1s to plan (straight-line is
  the default and faster; use `pathfind` only when the direct path is blocked); returns
  `status:"arrived"|"stopped"` + final distance). Get positions from `search.places`,
  `avatars.getNearby`, or `objects.getNearby`. `movement.turn` rotates in place without walking
  (a relative `degrees`, +left/−right, or something to face). `movement.sit`/`stand` wait ~5s and
  report the actual sitting state.
- **Movement takes real time — one move at a time.** `movement.teleport`/`walkTo`/`sit`/`stand`
  are asynchronous, and each tool call **blocks until the move actually completes** (or times out —
  up to ~60s for teleport/walk, ~5s for sit/stand), then returns the outcome. So **wait for each
  call to return before issuing the next move** — don't fire a sequence of moves in quick succession;
  a new move sent while the avatar is still travelling lands mid-transition and behaves erratically.
  Always read the returned `status` first: `walkTo` can come back `"stopped"` (blocked / didn't reach
  the target) rather than `"arrived"`, and teleport can `"timeout"`/`"failed"` — chaining another move
  on top of that compounds the error. Pattern: *plan → one move → read its result → then the next*.
  **Never issue movement calls in parallel / the same batch** — the viewer enforces one move at a
  time: a `teleport`/`walkTo`/`sit`/`stand` sent while another is still running is **rejected**
  (`-32005 "a movement is already in progress"`). If you get that, wait for the in-flight move to
  return, then send the next.
- **Firestorm AO.** `ao.getStatus` shows whether the client-side animation overlay is on, the active
  set, and available sets; `ao.setEnabled`, `ao.selectSet {name}`, and `ao.cycle {next|prev}` control it.
- **Answer what's offered to you.** Anything pushed at the avatar — an inventory offer, a teleport
  offer, a friendship request, a group invite, or a scripted object's **blue-menu (`llDialog`)** —
  shows up in `notifications.list` as a typed entry with its `buttons`. Press one with
  `notifications.respond {id, button}` (button by **name**: `Keep`/`Discard`, `Accept`/`Decline`,
  or a dialog's own label). **This is the only way to answer a blue menu.** A common loop:
  `object.touch` a vendor/furniture → it opens a menu → `notifications.list` → `notifications.respond`.
  To **clear** a notification you don't need to act on — a `group_notice`, an info toast — use
  `notifications.dismiss {id}` (omit `id` to clear all). It does **not** press any button, so it
  never accepts/declines an offer or keeps/discards an attachment; only use `respond` when you
  actually want to act. Prefer `dismiss` for group notices; `respond` for real offers/dialogs.
- **Private conversation.** `im.send` DMs an avatar; their replies collect in an always-on buffer
  you drain with `im.replies` (optionally `wait_seconds` for a quick back-and-forth). `im.getMessages`
  reads history without clearing the user's unread badge. This is 1:1 — group chat is `group.sendIM`,
  public chat is `chat.send`.

## Paying L$ is fenced

`money.getBalance` is read-only and always works. `money.pay` **spends real currency** and is
locked down: it does nothing unless the user has set **`IDMCPMoneyEnabled = 1`** (off by default),
it's capped by `IDMCPMoneyMaxAmount` (default L$1000), it honours RLV `@pay`/`@buy`, and it checks
you can afford it. Preview any payment first with `dry_run:true` — it resolves the recipient's name
and the amount without sending. If a real pay is refused, surface *why* (switch off, over cap,
RLV, or funds) rather than retrying.

## Gotchas (learned the hard way)

- **Upload cost is grid- and account-dependent.** Uploads are free on the Beta/test grid **and
  for some accounts**, so `cost: 0` is often legitimate, not a bug. On
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

When the user is testing, act only on **the user's own** avatar and inventory unless explicitly told
otherwise — don't give inventory to, or otherwise act on, other avatars.
