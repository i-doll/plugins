# plugins

`i-doll`'s self-hosted Claude Code **marketplace** (`idoll`).

| Plugin | What it does |
|---|---|
| **`firestorm-avatar`** | Skills + MCP connection for driving a Second Life avatar through the embedded Firestorm MCP server. |
| **`mpsearch`** | Skills + a bundled MCP server for searching the Second Life Marketplace: listings, permissions, reviews, stores, categories. |
| **`dev-team`** | Reusable role agents — product owner, autonomous senior developer, QA, designer, and changelog editor — sharing a work-queue handoff protocol. |
| **`travel-team`** | Five travel-planning role agents — gem-scout, mustsee-scout, bookings, food, and concierge — sharing a trip-dossier skill so their sourced research composes into a loose menu of a trip. |
| **`ste100`** | ASD-STE100 Simplified Technical English as a skill — write documentation in the controlled language, or audit existing docs against its 53 rules. |

This repo is both the marketplace (`.claude-plugin/marketplace.json`) and the plugins themselves.

## Install

```bash
claude plugin marketplace add i-doll/plugins        # or ~/Work/plugins for a local checkout
claude plugin install firestorm-avatar@idoll
claude plugin install mpsearch@idoll
claude plugin install dev-team@idoll
claude plugin install travel-team@idoll
claude plugin install ste100@idoll
```

See [`firestorm-avatar/README.md`](firestorm-avatar/README.md) for the viewer-side requirements
(a compiled `ID`-fork Firestorm with `IDMCPServerEnabled`) and the migration steps off any
hand-added skills/MCP entries.

See [`mpsearch/README.md`](mpsearch/README.md) for how to connect a Second Life session — Adult
and Moderate listings, and reviews, are invisible without one — and how to rebuild its bundled
server from source.

See [`dev-team/README.md`](dev-team/README.md) for the agent roles and the fill-queue/drain-queue
chaining pattern.

See [`travel-team/README.md`](travel-team/README.md) for the agent roles and the trip-folder
convention the shared trip-dossier skill uses.

See [`ste100/README.md`](ste100/README.md) for what the skill covers, the software-documentation
readings it adds, and why it carries a partial dictionary rather than a vendored copy of the
standard.

## Layout

```
plugins/
├── .claude-plugin/marketplace.json     # marketplace "idoll" -> all plugins
├── firestorm-avatar/
│   ├── .claude-plugin/plugin.json
│   ├── .mcp.json                       # firestorm HTTP MCP server @ 127.0.0.1:33777
│   ├── skills/{firestorm-avatar,firestorm-chat,firestorm-rlv-relay}/SKILL.md
│   ├── MCP_TOOLS.md                    # tool reference snapshot
│   └── README.md
├── mpsearch/
│   ├── .claude-plugin/plugin.json
│   ├── .mcp.json                       # mpsearch stdio MCP server (node dist/mcp.js)
│   ├── dist/{mcp,cli}.js               # dependency-free bundles, built from the mpsearch repo
│   ├── skills/marketplace-search/SKILL.md
│   ├── commands/auth.md                # /mpsearch:auth — connect a Second Life session
│   └── README.md
├── dev-team/
│   ├── .claude-plugin/plugin.json
│   ├── agents/{changelog,designer,product-owner,qa,senior-developer}.md
│   ├── skills/work-queue/SKILL.md
│   └── README.md
├── travel-team/
│   ├── .claude-plugin/plugin.json
│   ├── agents/{bookings,concierge,food,gem-scout,mustsee-scout}.md
│   ├── skills/trip-dossier/SKILL.md
│   └── README.md
└── ste100/
    ├── .claude-plugin/plugin.json
    ├── skills/simplified-technical-english/
    │   ├── SKILL.md                    # the 53 rules + write/audit modes
    │   └── references/word-choice.md   # swaps, POS traps, technical verbs
    └── README.md
```

## A note on bundled build output

`mpsearch/dist/` is committed build output, not source. It is built in the separate `mpsearch`
repository and copied here by `pnpm run sync-plugin` there, so that installing this plugin needs
nothing beyond `node` — no package install step. Rebuild and re-sync after changing that repo's
source, or the plugin ships stale code.
