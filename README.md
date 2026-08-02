# plugins

`i-doll`'s self-hosted Claude Code **marketplace** (`idoll`). Currently one plugin,
**`firestorm-avatar`**, which bundles the skills and MCP connection for driving a Second Life
avatar through the embedded Firestorm MCP server.

This repo is both the marketplace (`.claude-plugin/marketplace.json`) and the plugin
(`firestorm-avatar/`).

## Install

```bash
claude plugin marketplace add i-doll/plugins        # or ~/Work/plugins for a local checkout
claude plugin install firestorm-avatar@idoll
```

See [`firestorm-avatar/README.md`](firestorm-avatar/README.md) for the viewer-side requirements
(a compiled `ID`-fork Firestorm with `IDMCPServerEnabled`) and the migration steps off any
hand-added skills/MCP entries.

## Layout

```
plugins/
├── .claude-plugin/marketplace.json     # marketplace "idoll" -> plugin ./firestorm-avatar
└── firestorm-avatar/                    # the plugin
    ├── .claude-plugin/plugin.json
    ├── .mcp.json                        # firestorm HTTP MCP server @ 127.0.0.1:33777
    ├── skills/{firestorm-avatar,firestorm-chat,firestorm-rlv-relay}/SKILL.md
    ├── MCP_TOOLS.md                     # tool reference snapshot
    └── README.md
```
