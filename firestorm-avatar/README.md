# firestorm-avatar (Claude Code plugin)

Bundles the **client side** of the embedded Firestorm MCP server — the skills and the MCP
connection — so it's portable and versioned. It lets an AI agent drive the user's Second Life avatar:
inventory, appearance, profiles, search, groups, asset uploads, nearby-avatar inspection, and
bridge-mediated in-world chat / RLV relays.

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

This plugin's version tracks the viewer's tool surface — keep them in step when the viewer's MCP
tools change (bump this plugin and re-snapshot `MCP_TOOLS.md`).

## Install

```bash
claude plugin marketplace add ~/Work/firestorm-avatar-plugin
claude plugin install firestorm-avatar@firestorm
```

(Or, once pushed to a git remote: `claude plugin marketplace add <owner>/<repo>`.)

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
claude plugin marketplace update firestorm
```
