# dev-team plugin — design

**Date:** 2026-08-05
**Status:** Approved (brainstormed with Five)

## Purpose

A new plugin, `dev-team`, in the `idoll` marketplace, containing reusable agents that can be
invoked on demand and chained as needed. Starting roster: a **product owner** agent and an
**autonomous senior developer** agent. More roles (QA, designer, …) will be added over time;
the design must let new agents join without rework.

The agents are independent specialists (not a hard-wired pipeline), but they share one
handoff contract — the `work-queue` skill — so they can be chained, including a fully
autonomous mode where the developer pulls new work from the product owner.

## Plugin structure

```
plugins/
├── .claude-plugin/marketplace.json     # + dev-team entry
└── dev-team/
    ├── .claude-plugin/plugin.json      # name, description, version 0.1.0
    ├── agents/
    │   ├── product-owner.md
    │   └── senior-developer.md
    ├── skills/
    │   └── work-queue/SKILL.md         # shared handoff protocol
    └── README.md                       # roles, install line, chaining examples
```

Follows existing repo conventions (per-plugin `.claude-plugin/plugin.json`, entry in the root
`marketplace.json`, README with install snippet). No `.mcp.json` (no server), no commands
(YAGNI for now; a `/dev-team:autonomous` bootstrap command can be added later if manual
chaining gets repetitive).

Agent frontmatter: `name`, `description` (written so Claude delegates proactively when
appropriate), `tools` scoped per role. **No `model` field** — agents inherit the session
model; per-invocation override remains available.

## Product owner agent

Role: a seasoned product owner who turns fuzzy intent into crisp, buildable work and pushes
back on scope.

**Three modes**, selected by invocation:

1. **Shape** — interrogate an idea → PRD/spec with acceptance criteria and explicit non-goals.
2. **Guard** — review a plan/spec/PR diff against product intent → gaps, YAGNI cuts, verdict.
3. **Cut** — split an approved spec into prioritized, INVEST-shaped work items via the
   work-queue protocol.

**Interaction constraint:** subagents cannot converse with the user mid-run. When ambiguity
would materially change the output, the PO returns its blocking questions as its result (the
user answers and re-invokes via SendMessage to continue with context). For minor gaps it
proceeds, listing assumptions prominently at the top of the deliverable. No silent guessing
on load-bearing decisions. If a request is too big, it says so and proposes a decomposition
instead of producing a bloated spec.

**Tools:** read access to everything, Bash (`gh`, read-only git), Write (docs only — PRDs and
specs; never code), TaskCreate/TaskUpdate (session queue). No Edit.

**Output destinations:** conversation by default; repo markdown or tracker when told. Cut
mode always writes to the queue.

## Senior developer agent

Role: a senior engineer who takes a work item to ship-ready — verified, committed, pushed, PR
opened — without hand-holding and without claiming "done" when it isn't.

**Discipline (baked into the prompt):**

- Root causes over symptom patches; simplicity first; minimal blast radius.
- Test-first for features and fixes; lint + typecheck + full test suite green before any commit.
- Conventional commits, one logical change per commit, no attribution footers.
- **All commits must be signed. A signing failure is a blocker — never fall back to unsigned
  commits (no `--no-gpg-sign`, no unsetting `commit.gpgsign`, no workarounds). Stop, report
  the signing error, leave the tree staged/intact.**
- **Never set a per-repo author override** — no repo-local `user.name`/`user.email` config,
  no `--author` flags. Commit identity comes exclusively from the global URL-based overrides
  keyed on the origin URL's `<user>` segment. If identity looks wrong, that's a blocker to
  report (likely a wrong origin URL), not something to patch locally.
- Branch from fresh main (`feat/`, `fix/`, …), push, open a PR whose body states what/why and
  how it was verified.
- Honest reporting: failing tests or skipped steps stated plainly, never papered over.

**Two invocation modes:**

1. **Single task** — "implement X / fix Y" → ship-ready, report back with the PR link.
2. **Autonomous loop** — claims the next ready item per the work-queue protocol, ships it,
   repeats until the queue is empty or everything ready is blocked. On ambiguity or an empty
   queue it messages the PO agent (SendMessage, when one is live) or returns asking for more
   work. It never invents scope.

**Boundaries:** one work item = one branch + one PR; it never merges its own PRs — merging
stays with the user. **Tools:** unrestricted (`*`). Blocked means reported-blocked, never
skipped-verification.

## work-queue skill (shared protocol)

The contract every dev-team agent loads before touching the queue.

- **Queue selection:** GitHub remote present + `gh` authenticated → tracker is the queue;
  otherwise → session tasks (TaskCreate/TaskList). One deterministic check so all agents
  agree. Fallback is announced in the agent's report, never silent.
- **Work item shape** (issue body or task description, same fields): imperative title;
  context (the why); acceptance criteria as a checklist; explicit non-goals; priority;
  `ready` marker (`dev-ready` label on issues, plain-text marker in session tasks). Dev
  agents only claim ready items. Ordering: priority, then age.
- **Claim discipline:** claim before working (self-assign on issue / task owner +
  in_progress) so parallel dev agents never double-work. Finished = PR link recorded on the
  item. Blocked = comment with the concrete blocker + `blocked` marker, move on.
- **Clarification channel:** dev↔PO exchanges happen as comments on the item (tracker mode)
  or task metadata (session mode) — durable paper trail. SendMessage is the fast path when
  both agents are live; the item record is canonical.
- **Definition of done** (single source): acceptance criteria met; lint + typecheck + full
  suite green; signed commits; branch pushed; PR open; item updated with PR link.

The skill description triggers on queue-related phrases ("work the queue", "fill the
backlog", "next work item") so it can also be invoked directly in the main session.

## Error handling

- No `gh` / no remote / auth failure → session-task fallback, stated in the report.
- Signing failure → hard blocker (see developer discipline). No unsigned commits, ever.
- Dev hits a wall (unfixable test, contradictory spec, missing dependency) → mark item
  blocked with concrete blocker, move to next ready item; nothing ready → report back, don't
  idle or improvise.
- Dirty working tree at claim time → stop and report; never stash or clobber user state.
- PO overwhelmed by scope → propose decomposition, don't bloat.

## Testing

Agent definitions are prompts; tests are smoke runs after installing from the local
marketplace checkout:

1. PO in each of its three modes against a toy request — outputs match this spec, including
   returning questions (not guesses) for an ambiguous request.
2. Dev with a trivial real task in a scratch repo — full chain: branch → verified signed
   commit → push → PR → item updated.
3. Fallback path in a repo with no remote — session-task mode engages and is reported.

README documents a chaining example: PO fills queue → dev drains queue.

## Non-goals (this iteration)

- No slash commands, hooks, or MCP servers.
- No auto-merge of PRs.
- No additional roles yet (QA, designer) — the work-queue contract is the extension point.
