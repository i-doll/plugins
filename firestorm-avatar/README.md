# firestorm-avatar (Claude Code plugin)

Bundles the **client side** of the embedded Firestorm MCP server — the skills and the MCP
connection — so it's portable and versioned. It lets an AI agent drive the user's Second Life avatar:
movement (teleport/sit/stand), vision (viewport snapshot), inventory, appearance, profiles, search,
groups, 1:1 IM, answering offers/dialogs, in-world object touch, asset uploads, nearby-avatar
inspection, bridge-mediated in-world chat / RLV relays, and guarded L$ payments.

## What's in here

- **`.mcp.json`** — registers the `firestorm` MCP server (`http://127.0.0.1:33777/mcp`).
- **`skills/`** — three skills:
  - `firestorm-avatar` — the main avatar-driving guide (all tool areas, RLV enforcement, gotchas).
  - `firestorm-chat` — talking to in-world scripted objects on any channel via the LSL bridge.
  - `firestorm-rlv-relay` — the RLV Relay protocol over the bridge.
- **`MCP_TOOLS.md`** — snapshot of the full tool reference.

## Requirements (the server side is NOT in this plugin)

The actual MCP server is compiled into the user's `ID`-fork of Firestorm (`~/Work/phoenix-firestorm`),
not shipped here. To use this plugin you need that viewer:

- Running and logged in.
- Debug Setting **`IDMCPServerEnabled = 1`** (loopback, no auth — any local process can drive the
  avatar while enabled).
- For the `chat.*` tools: **`UseLSLBridge`** on and **`IDMCPBridgeChatEnabled = 1`**, with the
  bridge attached at **v2.30+**.
- For `money.pay` (spends real L$): **`IDMCPMoneyEnabled = 1`** (off by default), capped by
  **`IDMCPMoneyMaxAmount`** (default 1000). `money.getBalance` needs neither.

This plugin's version tracks the viewer's tool surface — keep them in step when the viewer's MCP
tools change (bump this plugin and re-snapshot `MCP_TOOLS.md`).

## Install

```bash
claude plugin marketplace add i-doll/plugins
claude plugin install firestorm-avatar@idoll
```

(Or for a local checkout: `claude plugin marketplace add ~/Work/plugins`.)

### Migrating off the manual setup

If you previously registered these by hand, remove the duplicates so there's a single source:

```bash
claude mcp remove firestorm -s user          # drop the hand-added MCP server
rm -rf ~/.claude/skills/firestorm-avatar \
       ~/.claude/skills/firestorm-chat \
       ~/.claude/skills/firestorm-rlv-relay   # drop the hand-added skills
```

## Update

```bash
claude plugin marketplace update idoll
```
