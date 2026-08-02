---
name: firestorm-chat
description: Use when talking to in-world scripted objects, HUDs, vendors, or any LSL protocol from Five's Second Life avatar — sending chat on a channel and capturing the object's reply. Routes through the Firestorm LSL bridge (the `chat.*` tools of the firestorm MCP server) so it works on ANY channel, including negative/protocol channels the viewer can't use directly. For RLV relays specifically, use the firestorm-rlv-relay skill (which builds on this).
---

# In-world scripted chat (via the LSL bridge)

Second Life scripted objects talk on chat *channels*. The viewer itself can only say on
channel 0 / positive channels and only *hears* channel-0, owner-say, and debug chat — so it
can't hold a two-way conversation with a script on a private channel. The `chat.*` tools get
around this by routing through the **Firestorm LSL bridge**: a worn, owned LSL *script* that
can `llListen`/`llSay` on **any** channel and relays what it hears back to you.

## Prerequisites

- The viewer is running and logged in, and the **LSL bridge is enabled and attached**
  (`UseLSLBridge`). If it isn't, the tools return `-32005`.
- Opt-in Debug Setting **`IDMCPBridgeChatEnabled = 1`** (off by default — this capability can
  command RLV relays, so it's deliberately gated).
- The firestorm MCP server is enabled (`IDMCPServerEnabled`).

## The workflow — listen BEFORE you send

You cannot hear the answer to a question you asked before you were listening. So the order is
always:

1. **`chat.listen {channel, seconds?}`** — open a listen on the channel the object will *reply*
   on. Returns `{listening, channel, expires_in}`.
2. **`chat.send {channel, message, type?}`** — say your message on the channel the object
   *listens* on (often the same channel, sometimes a different one — read the object's docs).
3. **`chat.replies {channel, wait_seconds?}`** — read what came back. Pass `wait_seconds` (≤30)
   to block briefly for the first reply instead of polling: `{replies:[{from_id, from_name,
   text, time}]}`.
4. **`chat.stopListen {channel?}`** — **always close the listen when done.** Omit `channel` to
   close all of yours.

```
chat.listen  {channel: 9000, seconds: 15}
chat.send    {channel: 9000, message: "menu"}
chat.replies {channel: 9000, wait_seconds: 5}   -> the object's menu text
chat.stopListen {channel: 9000}
```

## Cleanup is mandatory

Bridge `llListen` slots are a **scarce, shared resource** — there is a **hard cap of 4**
concurrent agent listens. If you leak them the bridge stops accepting new listens. So:

- **Always `chat.stopListen`** as soon as you have what you need. Don't leave listens open
  "just in case."
- Listens **auto-expire** at their `seconds` deadline (default 30, max 120) as a backstop — but
  treat that as a safety net, not your cleanup strategy.
- If `chat.listen` returns an error about too many listens, you've leaked — `chat.stopListen`
  with no channel to clear them all, then retry.

## Channels, range, and identity

- **Range:** `type` is whisper (~10 m) / say (~20 m, default) / shout (~100 m), measured from
  your avatar. Use shout to reach an object across a room; the object must be in range.
- **By default the message is sent from the bridge object, not "as you."** Scripts see the
  bridge's object key as the sender (which is exactly what makes replies routable). To instead
  speak **as the avatar** — normal public chat that reads as Five — pass `chat.send
  {as_avatar: true}` (channel 0 or a positive channel only; it's fire-and-forget, no bridge
  listen, and can't reach negative/protocol channels). Use `as_avatar` for talking to people;
  use the default bridge path for talking to scripts/relays.
- **What's hearable:** the bridge hears normal object chat on the channel you listened on. It
  cannot hear things no script can hear. Objects that reply via `llRegionSayTo` to a *different*
  object won't be captured — only what's said on your listened channel in range.

## Errors

- `-32005` — bridge chat disabled (`IDMCPBridgeChatEnabled`) or the bridge isn't attached.
- `-32002` on `chat.replies` — you're not listening on that channel (call `chat.listen` first,
  or the listen already expired).
- `-32011` on `chat.send` — RLV `@sendchat` / `@sendchannel` blocks that channel.

## Scope discipline

Act on Five's behalf. Sending chat can trigger scripted objects and be heard by others in
range — don't spam, and don't drive other people's objects without reason. See
[[firestorm-avatar]] for the broader avatar-driving conventions and [[firestorm-rlv-relay]] for
the RLV relay protocol specifically.
