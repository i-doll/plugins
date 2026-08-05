# dev-team QA + Designer agents — design

**Date:** 2026-08-05
**Status:** Approved (brainstormed with Five)
**Builds on:** `2026-08-05-dev-team-plugin-design.md` (v0.1.0 — product-owner,
senior-developer, work-queue skill)

## Purpose

Add two roles to the `dev-team` plugin — a **QA** agent and a **Designer**
agent — following the contract the first iteration established: independent
specialists, invocable on demand, chained through the `work-queue` skill.
Version bumps to 0.2.0.

This iteration is dogfooded: the product-owner (primed with its committed
definition) cuts this spec into queue items; senior-developer-primed agents
implement them; the orchestrator keeps the same per-task review gates used to
build v0.1.0.

## QA agent

Role: an independent verifier with a breaker's instinct. It never fixes
production code and never merges — it produces evidence, verdicts, tests, and
defect reports.

**Three modes**, selected by invocation:

1. **Verify** — given a PR/branch and its work item: independently check every
   acceptance criterion, hunt for regressions, write the tests the developer
   missed (tests are the only code it may write), and deliver a pass/fail
   verdict with evidence (commands run, output). The verdict lands on the
   PR/item as a comment; defects go back to the developer via the item, never
   fixed in place.
2. **Plan** — given a spec before implementation: produce the test plan and
   edge-case inventory as an artifact the product owner can attach to work
   items (acceptance-criteria fodder).
3. **Break** — adversarial exploration of the shipped thing (hostile inputs,
   edge states, misuse). Every reproducible defect becomes a new queue item
   per the work-queue protocol, filed **without** a ready marker or priority —
   the product owner triages; QA never sets priorities.

**Tools:** full read access, Bash (running tests; `gh` for PR/issue reading,
commenting, and issue creation in Break mode), Write (test files and test
plans only — never production code), Skill, TaskCreate/TaskUpdate/TaskList/
TaskGet, SendMessage. No Edit of production code; editing existing test files
it owns in Verify mode is allowed via Write.

**Committing:** in Verify mode QA may commit the tests it adds, under the
same hard rules as the senior developer (signed commits mandatory — signing
failure halts the run; no per-repo author overrides; conventional commits).

## Designer agent

Role: a UI/UX designer with taste and opinions — visual design, interaction,
copy. Deliberately **not** an API/interface designer; that pressure lives
with the product owner and senior developer (a future role if ever needed).

**Three modes**, selected by invocation:

1. **Explore** — given a feature idea or spec: produce 2–3 genuinely
   different design directions (layout, interaction model, copy tone) as
   concrete artifacts — HTML mockups or annotated markdown, whichever the
   invocation asks for (default: annotated markdown).
2. **Refine** — given a chosen direction and constraints: produce the
   buildable design spec — component inventory, states, copy, hierarchy and
   spacing decisions — precise enough for a work item to cite as acceptance
   criteria.
3. **Critique** — review built UI (screenshots, a running app, or code)
   against the design spec and good practice; findings ranked by impact; no
   code edits, ever.

**Tools:** read access, Bash (read-only git + `gh` reading), Write (design
docs and mockups only), Skill, TaskCreate/TaskUpdate/TaskList/TaskGet,
SendMessage. It loads the `frontend-design` skill when available for taste
calibration; its absence is not an error.

**Queue integration:** Designer deliverables attach to items via the product
owner — the Designer writes docs; it never cuts, claims, or prioritizes work
items. It never commits.

## Shared rules (both agents)

- Subagent interaction constraint as established: blocking questions returned
  as the result, minor gaps proceed with a prominent Assumptions list, no
  silent guessing on load-bearing decisions.
- Invoke the `dev-team:work-queue` skill before **any** queue operation.
- The work-queue skill's definition of done stays single-sourced; neither new
  agent restates it or the marker vocabulary.
- No `model` field — agents inherit the session model.
- Frontmatter descriptions written for proactive delegation.

## Plugin changes

- `dev-team/agents/qa.md`, `dev-team/agents/designer.md` — new.
- `dev-team/.claude-plugin/plugin.json` — description mentions four roles;
  version `0.2.0`.
- `.claude-plugin/marketplace.json` — dev-team entry description updated.
- `dev-team/README.md` — two new "What's in here" bullets, Usage examples for
  both roles, "Adding more roles" section stays.
- Root `README.md` — dev-team table row and layout tree updated (agents line
  gains the two names).
- work-queue SKILL.md: one addition — a note that defect items filed by QA
  carry no ready marker/priority until the product owner triages them.

## Error handling

Inherited from v0.1.0 wholesale (fallback announcement, blocked-item
discipline, dirty-tree stop, signing halts the run for any committing agent),
plus:

- QA Verify on a branch with no work item → proceed against the PR
  description as criteria, flag the missing item in the verdict.
- Designer Critique without a design spec → critique against good practice
  alone and say so.
- QA Break finding a non-reproducible defect → note it in the report; no
  queue item without a reproduction.

## Testing

Smoke runs after install (version 0.2.0 visible):

1. QA Verify against a toy PR with one deliberately failed acceptance
   criterion → fail verdict with evidence, defect recorded on the item.
2. QA Break against a toy CLI → reproducible defect filed as an untriaged
   queue item.
3. Designer Explore on a small feature idea → 2–3 distinct directions.
4. Designer Critique against a toy page with a planted flaw → flaw found and
   ranked.

## Non-goals (this iteration)

- No API/interface-designer role.
- No commands, hooks, or MCP servers.
- No auto-merge; QA's verdict is advisory — merging stays with the user.
