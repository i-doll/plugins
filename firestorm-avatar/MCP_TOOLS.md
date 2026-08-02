# Firestorm Embedded MCP Server — Tool Reference

Custom fork (`ID` prefix). An in-process MCP server that lets an AI agent drive the avatar, with RLVa restrictions hard-enforced.

## Connecting

- **Endpoint:** `POST http://127.0.0.1:33777/mcp` (MCP Streamable-HTTP; JSON-RPC 2.0)
- **Enable:** Debug Setting `IDMCPServerEnabled = 1` (off by default). Port: `IDMCPServerPort` (default 33777).
- **Security:** loopback-only, no auth — any local process can drive the avatar while enabled.
- Deferred results (fetches, searches, uploads) stream back over SSE; `*` marks required params.

## RLV enforcement

Every mutating or identity-revealing tool passes a single RLV gate. A blocked call returns JSON-RPC error `-32011` with `{restriction, sources:[{object_id,root_id,attach_pt,name}], checkedAt}`. Use `rlv.getRestrictions` to see what's active and `rlv.canDo` to check a call before making it.

**51 tools** across 14 areas.

## Health

| Tool | Params | Description |
|---|---|---|
| `ping` | — | Liveness check. Returns {"pong": true}. |

## Viewer

| Tool | Params | Description |
|---|---|---|
| `viewer.notify` | `text*`: string<br>`title`: string<br>`tip`: boolean | Post a toast to the viewer to get the user's attention. `text` is the body; optional `title` shows on the first line. Default is a persistent notify toast (stays until dismissed, kept in the notification well); `tip:true` gives a lighter toast that fades on its own. |

## Chat (in-world, via LSL bridge)

Talk to in-world scripted objects, HUDs, vendors, and **RLV relays** on any channel — including negative/protocol channels the viewer itself can't use — by routing through the Firestorm LSL bridge. Requires `UseLSLBridge` **and** the opt-in Debug Setting `IDMCPBridgeChatEnabled = 1` (off by default). Messages are sent *from the bridge object*, not shown as your avatar's public chat.

**Workflow: `chat.listen` → `chat.send` → `chat.replies` → `chat.stopListen`.** You must open a listen *before* sending if you want the reply. Bridge listen slots are scarce — **always `chat.stopListen` when done** (listens also auto-expire, and there's a hard cap of 4 concurrent). See the `firestorm-chat` and `firestorm-rlv-relay` skills.

| Tool | Params | Description |
|---|---|---|
| `chat.listen` | `channel*`: integer<br>`seconds`: integer | Open a bridge listen on `channel` (any integer, incl. negative) so replies can be captured. `seconds` default 30, max 120; auto-closes at the deadline. Returns `{listening, channel, expires_in}`. Call this **before** `chat.send`. |
| `chat.send` | `channel*`: integer<br>`message*`: string<br>`type`: whisper \| say \| shout<br>`as_avatar`: boolean | Say `message` on `channel`. Default routes via the bridge (any channel incl. negative; sent from the bridge object). `as_avatar:true` speaks as **your avatar** instead (channel 0 / positive only — for normal public chat). `type` sets range (~10/20/100 m). RLV `@sendchat`/`@sendchannel` enforced (`-32011`). |
| `chat.replies` | `channel*`: integer<br>`wait_seconds`: integer | Drain messages heard on a listened channel: `{listening, channel, replies:[{from_id, from_name, text, time}]}`. If nothing buffered and `wait_seconds` (max 30) given, waits up to that for the first reply. Errors if not listening on the channel. |
| `chat.stopListen` | `channel`: integer | Close a listen and free its bridge slot. Give `channel` to close one, or omit to close **all**. Always call when done. Returns `{stopped}`. |

## RLV

| Tool | Params | Description |
|---|---|---|
| `rlv.canDo` | `tool*`: string<br>`arguments`: object | Check whether a tool call would be allowed under current RLV restrictions, WITHOUT executing it. {"tool"} (tool name) and optional {"arguments"} (that tool's arguments). Returns {allowed} and, if blocked, the restriction and its source object(s). |
| `rlv.getRestrictions` | `filter`: string | List all active RLVa restrictions with their source objects. Optional {"filter"} substring-matches the behaviour name. Consult this to know which actions are currently blocked before attempting them. |
| `rlv.getStatus` | — | Whether RLVa restriction enforcement is currently enabled. |

## Inventory

| Tool | Params | Description |
|---|---|---|
| `inventory.createFolder` | `parent*`: string<br>`name*`: string | Create a new folder. {"parent"} (folder UUID or "root") and {"name"}. Returns the new folder id. |
| `inventory.createItem` | `parent*`: string<br>`name*`: string<br>`type*`: notecard \| script | Create a new empty notecard or script. Returns the new item id; add content with notecard.write / script.write. |
| `inventory.delete` | `id*`: string<br>`confirm*`: boolean | Move an item or folder to Trash. Requires {"id"} and {"confirm": true}. |
| `inventory.getFolder` | `folder*`: string | List the direct contents of an inventory folder. {"folder"} is a folder UUID or a well-known name: "root", "cof", "outfits", "trash". Fetches the folder if needed. Blocked by RLV @showinv. |
| `inventory.getItem` | `item_id*`: string | Get details for one inventory item by {"item_id"} (UUID). Fetches it if not yet loaded. Blocked by RLV @showinv. |
| `inventory.giveFolder` | `folder_id*`: string<br>`to_agent*`: string | Give a folder (and its contents) to another avatar. {"folder_id"} and {"to_agent"} (UUID). Blocked by RLV @share. |
| `inventory.giveItem` | `item_id*`: string<br>`to_agent*`: string | Give a copy of an inventory item to another avatar. {"item_id"} and {"to_agent"} (UUID). No-copy items are refused. Blocked by RLV @share. |
| `inventory.move` | `id*`: string<br>`dest*`: string | Move an item or folder into another folder. {"id"} and {"dest"} (folder UUID). |
| `inventory.refresh` | `item_id*`: string | Force a fresh server fetch of an inventory item's metadata ({"item_id"}) — e.g. to pick up a rename/move made elsewhere. Returns {refreshed, has_asset}. Scripts/notecards carry no local asset id (resolved server-side on read), so has_asset is false for them even though they read fine. |
| `inventory.rename` | `id*`: string<br>`name*`: string | Rename an inventory item or folder. {"id"} and {"name"}. |
| `inventory.search` | `name*`: string<br>`limit`: integer | Search loaded inventory by name substring. {"name"} required; optional {"limit"} (default 100, max 500). Blocked by RLV @showinv. |

## Notecards

| Tool | Params | Description |
|---|---|---|
| `notecard.read` | `item_id*`: string | Read a notecard's text by {"item_id"} (UUID). Returns {text, has_embedded_items}. Blocked by RLV @viewnote. |
| `notecard.write` | `item_id*`: string<br>`text*`: string | Replace a notecard's text. {"item_id"} (UUID) and {"text"}. The notecard must be modifiable. Blocked by RLV @viewnote. |

## Scripts (LSL)

| Tool | Params | Description |
|---|---|---|
| `script.read` | `item_id*`: string | Read an LSL script's source by {"item_id"} (UUID). Returns {text}. Blocked by RLV @viewscript. |
| `script.write` | `item_id*`: string<br>`text*`: string<br>`target`: mono \| lsl2 \| luau \| lsl-luau | Replace a script's source and recompile. `mono` (default) and `lsl2` take **LSL** source; `lsl-luau` takes **LSL** source and compiles it to Luau; `luau` takes **Luau** source. `lsl-luau`/`luau` need region Luau support. Returns {compiled, errors?}. Blocked by RLV @viewscript. |

## Appearance

| Tool | Params | Description |
|---|---|---|
| `appearance.detachItems` | `item_ids*`: string[] | Take off / detach worn items. {"item_ids"} is an array of item UUIDs. Blocked per item by RLV @detach and wearable locks. |
| `appearance.getWorn` | — | List the items currently worn/attached (the Current Outfit Folder). Blocked by RLV @showinv. |
| `appearance.listOutfits` | — | List saved outfits (subfolders of My Outfits). Blocked by RLV @showinv. |
| `appearance.wearItems` | `item_ids*`: string[]<br>`replace`: boolean | Wear/attach inventory items. {"item_ids"} is an array of item UUIDs; optional {"replace"} (default false) replaces what's on the same slot/point. Blocked per item by RLV wearable/attachment locks. |
| `appearance.wearOutfit` | `folder`: string<br>`name`: string<br>`mode`: string | Wear a saved outfit folder. {"folder"} (outfit UUID) or {"name"} (an outfit under My Outfits); {"mode"} "replace" (default) or "add". Every item is checked against RLV wearable/attachment locks; a single locked item blocks the whole outfit. |

## Profile

| Tool | Params | Description |
|---|---|---|
| `profile.get` | `avatar_id`: string | Fetch an avatar's profile. Optional {"avatar_id"} (UUID) defaults to yourself. Viewing another avatar is blocked by RLV @shownames. |
| `profile.getPicks` | `avatar_id`: string<br>`pick_ids`: string[] | Read the full text of an avatar's picks — `desc`, `snapshot_id`, `parcel_id`, `pos_global`. Picks return in the profile's listing order (the viewer's Picks tab order); `sort_order` is vestigial and always 0 — don't sort by it. `sim_name` is usually empty; `pos_global` and `original_name` are the reliable location signals. `profile.get` returns pick ids and names only. Omit `pick_ids` to discover them (explicit ids return in the order you gave them). Results may be partial: unanswered ids land in `missing`, and `listing_answered: false` means the pick list never came back (as opposed to the avatar having none). Blocked by RLV @shownames. |
| `profile.getClassifieds` | `avatar_id`: string<br>`classified_ids`: string[] | Read an avatar's classified ads in full — `description`, `snapshot_id`, `parcel_name`, `sim_name`, `pos_global`, `category`, `creation_date`, `expiration_date`, `price_for_listing`. Ads return in the profile's listing order. `profile.get` does not list classifieds at all. Same `missing` / `listing_answered` semantics as `profile.getPicks`. Blocked by RLV @shownames. |
| `profile.setSelf` | `about_text`: string<br>`fl_about_text`: string<br>`allow_publish`: boolean<br>`hide_age`: boolean<br>`image_id`: string<br>`fl_image_id`: string | Update your own profile. Any of {"about_text", "fl_about_text", "allow_publish" (bool), "hide_age" (bool), "image_id", "fl_image_id"}. Blocked by RLV @editprofile (and @editpfp for images). |

## People

| Tool | Params | Description |
|---|---|---|
| `people.getNames` | `ids*`: string[] | Resolve avatar UUIDs to names. {"ids"} is an array of UUIDs. Cached names return immediately; misses are warmed for a retry. Names hidden by RLV @shownames are omitted. |
| `people.getFriends` | `online_only`: boolean | List your friends/contacts: id, name, `online`, and the granted rights each way — `they_grant_me` / `i_grant_them` (each with `online`/`map`/`modify`). `online_only:true` filters to those shown online. A friend's `online` is only meaningful/true when they granted you see-online (`they_grant_me.online`). Names hidden by RLV @shownames are omitted. |

## Directory search

| Tool | Params | Description |
|---|---|---|
| `search.classifieds` | `query*`: string | Search Classifieds. {"query"} (min 3 chars). Blocked by RLV @showsearch. |
| `search.events` | `query*`: string | Search upcoming Events. {"query"} (min 3 chars). Blocked by RLV @showsearch. |
| `search.groups` | `query*`: string | Search the Groups directory. {"query"} (min 3 chars). Blocked by RLV @showsearch. |
| `search.land` | `max_price`: integer<br>`min_area`: integer | Search for-sale Land (parcels), price-sorted ascending. Optional {"max_price"} (L$) and {"min_area"} (m2) filters. Blocked by RLV @showsearch. |
| `search.people` | `query*`: string | Search the People directory. {"query"} (min 3 chars). Returns matching residents. Blocked by RLV @showsearch; names hidden by @shownames are omitted. |
| `search.places` | `query*`: string | Search the Places directory. {"query"} (min 3 chars). Returns matching parcels (name, dwell, for-sale). Blocked by RLV @showsearch. |

## Nearby avatars

| Tool | Params | Description |
|---|---|---|
| `avatars.getNearby` | `radius`: number | List avatars within {"radius"} metres (default 128, max 512) of you: id, distance, whether their body is loaded, and name (subject to RLV @shownames). Blocked by RLV @shownearby. |
| `avatars.getWorn` | `avatar_id*`: string<br>`resolve_names`: boolean | List the publicly-visible ATTACHMENTS worn by a nearby avatar ({"avatar_id"}): attach-point name, point id, object id, and the object **name** (resolved via a server round-trip; pass `resolve_names:false` to skip and return immediately). **To identify an item type (boots, hat, collar…), enumerate all attachments and match on the object name — never infer from the attach point, since rigged mesh can attach anywhere.** Only in-world attachments are observable — HUDs and clothing/bodypart wearables cannot be enumerated for anyone. The avatar must be loaded in range. Blocked by RLV @shownearby / @shownames. |

## Groups

| Tool | Params | Description |
|---|---|---|
| `group.activate` | `group_id*`: string | Set your active (tag) group to {"group_id"}. Blocked by RLV @setgroup. |
| `group.getInfo` | `group_id*`: string | Fetch a group's details ({"group_id"}): name, charter, member count. Fetches from the server if not cached. |
| `group.getNotices` | `group_id*`: string | List a group's notices ({"group_id"}): notice id, subject, sender, whether it has an attachment, and timestamp. |
| `group.list` | — | List the groups you belong to, plus your active group. |
| `group.sendIM` | `group_id*`: string<br>`message*`: string | Send a message to a group's chat. {"group_id"} and {"message"}. You must be a member of the group. |
| `group.sendNotice` | `group_id*`: string<br>`subject*`: string<br>`message*`: string | Send a notice to a group. {"group_id"}, {"subject"}, {"message"}. Requires the group's Send Notices power. |

## Uploads

Uploads cost real **L$**. Every upload tool is two-phase: a call **without** `confirm:true` is a **dry run** — it validates each file and returns a per-file + total L$ cost estimate plus your balance, spending nothing. Pass `confirm:true` to actually upload. Files come from `paths` (explicit list) and/or `dir` (globs that type's extensions). `dest` is a folder UUID/name (default = the type's system folder); `names` overrides per-file inventory names. No RLV gate — the confirm requirement is the spend guard. Results stream back over SSE.

| Tool | Params | Description |
|---|---|---|
| `upload.image` | `paths`: string[]<br>`path`: string<br>`dir`: string<br>`dest`: string<br>`names`: string[]<br>`confirm`: boolean | Upload images (png/jpg/jpeg/tga/bmp) as textures. Large images are downscaled to the texture size limit. Dry-run without `confirm:true`; upload with it (costs L$; textures ≥2K cost more). |
| `upload.sound` | `paths`: string[]<br>`path`: string<br>`dir`: string<br>`dest`: string<br>`names`: string[]<br>`confirm`: boolean | Upload sounds. WAV must be **44.1 kHz, mono, 16-bit PCM, ≤10s** (encoded to Ogg Vorbis). Dry-run without `confirm:true`; upload with it. |
| `upload.animation` | `paths`: string[]<br>`path`: string<br>`dir`: string<br>`dest`: string<br>`names`: string[]<br>`loop`: boolean<br>`priority`: integer<br>`ease_in`: number<br>`ease_out`: number<br>`hand_pose`: integer<br>`confirm`: boolean | Upload animations: `.bvh` (converted client-side) or pre-baked `.anim`. For `.bvh`, optional tuning: `loop`, `priority` (0-4, default 2), `ease_in`/`ease_out` (seconds), `hand_pose` (default 1); ignored for `.anim`. Dry-run without `confirm:true`; upload with it. |
| `upload.material` | `paths`: string[]<br>`path`: string<br>`dir`: string<br>`dest`: string<br>`names`: string[]<br>`confirm`: boolean | Upload GLTF materials (`.gltf`/`.glb`). A file may hold several materials; each becomes an item and its textures upload too (cost = sum of those textures). Dry-run without `confirm:true`; upload with it. Note: materials upload asynchronously — verify results with `inventory.getFolder` on the dest. |

**Upload notes / gotchas:**

- **Cost is grid- and account-dependent.** Uploads are free on the Beta/test grid **and for some accounts** (certain benefit tiers), so `cost: 0` is often legitimate — not a bug. On accounts/grids that do charge, the same benefits lookup reports the real per-item price (≈L$10, more for ≥2K textures). Either way, the dry-run's `total_cost` + `balance` are the source of truth; confirm from those.
- **Server-side validation still bites at upload.** The dry-run checks extension + existence (+ decodability for images), but the strict per-type rules are enforced by the server/encoder at upload time: sounds must be **≤10s** 44.1 kHz mono 16-bit PCM — an over-length WAV *passes dry-run* but fails on `confirm` with SL's generic "server difficulties" error. Trim to ≤10s.
- **Confirmed results.** Image/sound/animation return real `item_id` + `asset_id` per file once the server finishes. Materials are fire-and-forget (no per-item callback) — the response reports the enqueue + estimated cost; confirm the actual items with `inventory.getFolder` on the dest.
- **Batch = one response.** A batch fans out to N concurrent uploads and the tool replies once, when all N have reported (or pre-validation-failed).
