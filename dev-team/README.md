# dev-team (Claude Code plugin)

Reusable role agents you call on demand and chain as needed. No MCP server,
no commands — just five agents, the protocol that lets them hand work to
each other, and the house style for changelog entries.

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
- **`agents/qa.md`** — three modes: **Verify** (independently check a
  PR/branch against its work item's acceptance criteria, pass/fail verdict
  with evidence), **Plan** (spec → test plan and edge-case inventory before
  implementation), **Break** (adversarial exploration of shipped work,
  reproducible defects filed to the queue). Tests are the only code it
  writes; it never fixes production code, never merges, and defects it files
  go to the product owner untriaged.
- **`agents/designer.md`** — three modes: **Explore** (feature idea/spec →
  2–3 genuinely different design directions), **Refine** (chosen direction →
  buildable design spec precise enough to cite as acceptance criteria),
  **Critique** (built UI vs design spec and good practice, findings ranked by
  impact). UI/UX only, not API design; it writes docs and mockups only —
  never commits, never cuts or prioritizes work items. Binding house design
  language in every mode: plain and simple, Tailwind `slate` as the neutral
  scale, light mode fully supported, flat colors only (no gradients) —
  deviations are findings, not preferences.
- **`agents/changelog.md`** — three modes: **Cut** (ref range + version →
  that release's entry), **Curate** (merged change or completed item → one
  entry under Unreleased, or a reasoned refusal), **Review** (entry plus its
  diff → ranked findings on slop, inaccuracy, and misses). Changelog files
  only, never code or other docs; every entry grounded in the diff; never
  tags, publishes, or decides version numbers. Writes to the `changelog`
  skill's style.
- **`skills/changelog/`** — the house style for changelog entries and the
  method for writing them from a diff. One imperative line per entry, verb
  first, no clause explaining how or when the change applies ("Persist sort
  order for search and store separately", never "The sort you pick is
  remembered, one for…"). Invoke it directly (`/dev-team:changelog`) when
  editing a CHANGELOG.md yourself; the changelog agent invokes it in every
  mode.
- **`skills/work-queue/`** — the shared handoff contract: queue selection
  (GitHub issues when the origin is on GitHub and `gh` is authenticated,
  session tasks otherwise), item shape, ready/blocked markers, claim
  discipline, definition of done.

## Usage

Call any agent on demand:

> Use the product-owner agent to shape this into a spec: …
>
> Use the senior-developer agent to fix the flaky retry test and open a PR.
>
> Use the qa agent to verify PR #42 against its work item and give a
> pass/fail verdict.
>
> Use the designer agent to explore 2–3 directions for the new settings
> screen.
>
> Use the changelog agent to cut the 0.3.0 release entry from last tag to
> HEAD.

Or chain them into an autonomous loop:

> Use the product-owner agent to cut docs/specs/foo.md into work items, have
> the designer agent write a design spec where one's needed, then have the
> senior-developer agent work the queue and the qa agent verify what ships.

The PO fills the queue with `dev-ready` items; the developer claims them one
at a time (one item = one branch = one PR) and reports what shipped and what
blocked. QA comments its verdicts on the item and files defects straight to
the queue for the product owner to triage; the designer hands its specs to
the product owner to attach. Neither claims nor prioritizes items. The
changelog agent works from a completed item or a merged change to cut or
curate an entry, committing that edit itself — but like QA and the designer,
it neither claims nor prioritizes items. Merging PRs stays with you.

## Hard rules for every committing agent

The senior developer, QA (in Verify mode, for the tests it adds), and the
changelog agent (for its own changelog edits) are the only agents that
commit, and all three are bound by the same rules:

- All commits signed — a signing failure blocks the item, never a fallback
  to unsigned.
- No per-repo author overrides — identity comes from global URL-keyed git
  config.
- Honest reporting — failures and skips are stated, never papered over.

## Adding more roles

New agents should follow `skills/work-queue/SKILL.md` for anything
queue-shaped; that contract is the extension point.
