# dev-team (Claude Code plugin)

Reusable role agents you call on demand and chain as needed. No MCP server,
no commands — just two agents and the protocol that lets them hand work to
each other.

## What's in here

- **`agents/product-owner.md`** — three modes: **Shape** (fuzzy idea → PRD
  with acceptance criteria + non-goals), **Guard** (plan/spec/PR vs product
  intent: gaps, YAGNI, verdict), **Cut** (approved spec → prioritized,
  ready-for-dev work items). Docs-only: it never touches code and never
  commits.
- **`agents/senior-developer.md`** — takes a work item to ship-ready:
  test-first, lint + typecheck + full suite green, **signed** conventional
  commits, branch pushed, PR opened. Works a single task or drains the queue
  autonomously. Never merges its own PRs.
- **`skills/work-queue/`** — the shared handoff contract: queue selection
  (GitHub issues when `gh` is authenticated, session tasks otherwise), item
  shape, ready/blocked markers, claim discipline, definition of done.

## Usage

Call either agent on demand:

> Use the product-owner agent to shape this into a spec: …
>
> Use the senior-developer agent to fix the flaky retry test and open a PR.

Or chain them into an autonomous loop:

> Use the product-owner agent to cut docs/specs/foo.md into work items,
> then have the senior-developer agent work the queue.

The PO fills the queue with `dev-ready` items; the developer claims them one
at a time (one item = one branch = one PR) and reports what shipped and what
blocked. Merging PRs stays with you.

## Hard rules baked into the developer

- All commits signed — a signing failure blocks the item, never a fallback
  to unsigned.
- No per-repo author overrides — identity comes from global URL-keyed git
  config.
- Honest reporting — failures and skips are stated, never papered over.

## Adding more roles

New agents (QA, designer, …) should follow `skills/work-queue/SKILL.md` for
anything queue-shaped; that contract is the extension point.
