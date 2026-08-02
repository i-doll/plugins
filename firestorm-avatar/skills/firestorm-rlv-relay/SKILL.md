---
name: firestorm-rlv-relay
description: Use when driving an RLV relay from Five's Second Life avatar — sending RLV relay commands (apply/lift restrictions like @detach, @tploc) to a worn relay and reading its ok/ko acknowledgements. Built on the firestorm-chat skill's chat.* tools over the LSL bridge. Covers the RLV Relay protocol (channel -1812221819, the ident,uuid,@cmd format, !version/!release/!pong, and the ack), plus how to confirm effects and clean up.
---

# RLV relay interaction (via the LSL bridge)

An **RLV relay** is a worn LSL object that lets in-world objects impose RLV restrictions on its
wearer. Normally a scripted object commands the relay on the relay channel and the relay applies
`@` restrictions to the wearer's viewer. The viewer itself can't speak that channel (it's
negative/protocol-protected), but the **Firestorm LSL bridge can** — so with the `chat.*` tools
you can act as the commanding object. Read [[firestorm-chat]] first; this skill is the relay
protocol on top of it.

## Prerequisites

Same as [[firestorm-chat]]: LSL bridge attached (`UseLSLBridge`), `IDMCPBridgeChatEnabled = 1`,
MCP server on. A relay must be **worn by the target avatar** and in a mode that accepts your
command (auto, or ask + the target agrees). This is consent-sensitive — see the bottom.

## The protocol

- **Channel:** `-1812221819` (the "RLVRS" relay channel). Commands and acks both use it.
- **Command format** — three comma-separated tokens:
  `ident,<target_avatar_uuid>,<command>`
  - `ident` — any label *you* choose; it's echoed back in the ack so you can correlate.
  - `target_avatar_uuid` — the UUID of the avatar whose relay you're commanding.
  - `command` — one or more `|`-separated RLV commands / meta-commands, e.g. `@detach=n`,
    `@tploc=n`, or `!version` / `!release` / `!pong`.
- **Ack** — the relay replies on the same channel: `ident,<relay_uuid>,<command>,<reply>` where
  `reply` is `ok`, `ko` (refused), `ping`, or a version string. Because the bridge is the
  commanding object, the ack comes back to the bridge and is captured.
- **Meta-commands:** `!version` (protocol version), `!release` (drop **all** restrictions this
  source applied), `!pong` (reply to the relay's `ping` keepalive).

## The loop — listen first, then command

```
chat.listen  {channel: -1812221819, seconds: 15}
chat.send    {channel: -1812221819, message: "iris,<TARGET-AVATAR-UUID>,@detach=n"}
chat.replies {channel: -1812221819, wait_seconds: 5}
   -> look for a reply whose text starts with "iris," and ends with ",ok" (or ",ko")
chat.stopListen {channel: -1812221819}
```

- **Correlate by your `ident`.** Multiple relays / commands may reply; match the leading token
  to the `ident` you sent. `ok` = applied, `ko` = refused (relay off/ask-declined/not
  whitelisted).
- **Release when done:** to lift what you applied, send `ident,<uuid>,!release` (frees
  everything from this source) or the specific `@…=y` (e.g. `@detach=y`).
- **Keepalive:** if you hold restrictions for a while, the relay may `ping`; reply
  `ident,<uuid>,!pong` or it will auto-release. For short interactions you can ignore this.

## Confirm the effect independently

The `ok` ack means the relay accepted it; to confirm the restriction is actually **in force on
the wearer**, use the existing **`rlv.getRestrictions`** tool (from [[firestorm-avatar]]) — for
your *own* avatar the applied `@` restrictions show up there. This is the reliable ground truth,
separate from the chat ack.

## Cleanup is mandatory

The relay channel listen uses a scarce bridge slot (hard cap 4). **Always `chat.stopListen`**
after the exchange. Don't leave the relay-channel listen open between commands unless you're
actively waiting for an ack.

## Consent and authority — important

- Commanding your **own** worn relay (self-bondage / testing your own setup) is straightforward.
- Commanding **another avatar's** relay applies real restrictions to *them*. Only do this with
  clear, current consent, and only if their relay's mode/whitelist already permits it (a `ko`
  usually means it doesn't). When in doubt, don't — surface the situation to Five instead.
- RLV `@sendchannel` on your own avatar can block the relay channel; `chat.send` will return
  `-32011` if so.
