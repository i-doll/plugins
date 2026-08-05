# dev-team Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `dev-team` plugin — a product-owner agent, an autonomous senior-developer agent, and the shared `work-queue` skill — in the `idoll` marketplace.

**Architecture:** A pure-markdown plugin (no MCP server, no commands): two agent definitions whose role prompts stay lean because the queue/handoff mechanics live in one shared skill both agents load. New roles added later follow the same contract.

**Tech Stack:** Claude Code plugin format (`.claude-plugin/plugin.json`, `agents/*.md`, `skills/*/SKILL.md`), JSON validated with `jq`.

**Spec:** `docs/superpowers/specs/2026-08-05-dev-team-plugin-design.md` — read it before starting any task.

## Global Constraints

- **All commits must be signed.** After every commit run `git log --show-signature -1` and confirm `Good "git" signature`. If signing fails: STOP, report the error, leave the tree staged. Never use `--no-gpg-sign` or unset `commit.gpgsign`.
- **Never set per-repo git author config** (`user.name`/`user.email`) or `--author` flags. Identity comes from the global URL-based overrides only. Wrong-looking identity = blocker to report.
- Conventional commits (`feat:`, `docs:`, …), no `Co-Authored-By` / "Generated with" footers.
- Work on branch `feat/dev-team-plugin` (already exists — do NOT branch again; verify with `git branch --show-current`).
- Agent frontmatter has **no `model` field** (agents inherit the session model).
- Plugin version starts at `0.1.0`.
- All file paths below are relative to the repo root `/Users/thor/Work/personal/plugins`.

---

### Task 1: Plugin scaffolding — manifest + marketplace entry

**Files:**
- Create: `dev-team/.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json` (add third entry to `plugins` array)

**Interfaces:**
- Produces: plugin name `dev-team` in marketplace `idoll` — Tasks 2–5 place files under `dev-team/`; Task 6 installs `dev-team@idoll`.

- [ ] **Step 1: Write the plugin manifest**

Create `dev-team/.claude-plugin/plugin.json`:

```json
{
  "name": "dev-team",
  "displayName": "Dev Team Agents",
  "description": "Reusable role agents you can invoke on demand and chain: a product owner (shape specs, guard scope, cut backlog items) and an autonomous senior developer (ship-ready delivery: verified, signed commits, pushed, PR opened). Both follow the shared work-queue skill — GitHub issues when gh is available, session tasks otherwise — so they can run a fully autonomous fill-queue/drain-queue loop.",
  "version": "0.1.0",
  "author": {
    "name": "i-doll",
    "url": "https://github.com/i-doll"
  },
  "keywords": ["agents", "product-owner", "senior-developer", "backlog", "autonomous"]
}
```

- [ ] **Step 2: Add the marketplace entry**

In `.claude-plugin/marketplace.json`, append to the `plugins` array (after the `mpsearch` entry):

```json
    {
      "name": "dev-team",
      "source": "./dev-team",
      "description": "Reusable role agents — a product owner (shape, guard, cut) and an autonomous senior developer (ship-ready: verified, signed, pushed, PR) — sharing the work-queue handoff protocol so they can be called solo or chained into an autonomous loop."
    }
```

- [ ] **Step 3: Validate both JSON files**

Run: `jq . dev-team/.claude-plugin/plugin.json > /dev/null && jq '.plugins | length' .claude-plugin/marketplace.json`
Expected: no jq error; prints `3`.

- [ ] **Step 4: Commit**

```bash
git add dev-team/.claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "feat(dev-team): scaffold plugin manifest and marketplace entry"
git log --show-signature -1 | head -3
```

Expected: commit succeeds; signature line reads `Good "git" signature`.

---

### Task 2: The work-queue skill

**Files:**
- Create: `dev-team/skills/work-queue/SKILL.md`

**Interfaces:**
- Produces: skill `dev-team:work-queue` — both agents (Tasks 3, 4) instruct themselves to invoke it via the Skill tool before any queue operation. The item-shape fields and markers defined here (`dev-ready`/`blocked`/`P1`–`P3` labels in tracker mode; `[P#][ready|blocked|done]` subject tags in session mode) are the contract.

- [ ] **Step 1: Write the skill**

Create `dev-team/skills/work-queue/SKILL.md`:

````markdown
---
name: work-queue
description: The dev-team handoff protocol — how work items are written, marked ready, claimed, clarified, blocked, and closed. Use when filling the backlog, working the queue, claiming the next work item, checking queue state, or handing work between dev-team agents (product owner → senior developer).
---

# The dev-team work queue

One protocol, two backends. Every dev-team agent follows this contract so a
product owner's output is always claimable by a developer, and two developers
never collide.

## Queue selection (deterministic — run the check, don't guess)

Run: `git remote get-url origin 2>/dev/null | grep -q github.com && gh auth status >/dev/null 2>&1 && echo tracker || echo session`

- Prints `tracker` (GitHub origin and an authenticated `gh`) → **tracker
  mode**: the GitHub issue tracker is the queue.
- Prints `session` (missing or non-GitHub origin, or `gh` unauthenticated) →
  **session mode**: the session task list (TaskCreate/TaskList) is the queue.

State which mode you selected in your report. A fallback to session mode is
never silent — say why (no remote / no auth).

## Work item shape (same fields in both modes)

- **Title:** imperative, one line ("Add retry to sync client").
- **Context:** the *why* — what problem this solves, links to spec/PRD.
- **Acceptance criteria:** a testable checklist (`- [ ]` items).
- **Non-goals:** what this item explicitly does not cover.
- **Priority:** P1 (now) / P2 (next) / P3 (later).
- **Ready marker:** only the product owner sets it; developers only claim
  items that carry it.

**Tracker mode:** the body holds Context / Acceptance criteria / Non-goals as
sections; priority is a `P1`/`P2`/`P3` label; ready is the `dev-ready` label;
blocked is the `blocked` label. Create missing labels once, distinct colors:

    gh label create dev-ready --color 0e8a16 --force
    gh label create blocked   --color d93f0b --force
    gh label create P1 --color b60205 --force
    gh label create P2 --color fbca04 --force
    gh label create P3 --color c2e0c6 --force

**Session mode:** task **metadata is write-only** — TaskGet/TaskList never
return it, so anything an agent must read back lives in the subject or
description. Encode state in the subject: `[P2][ready] Add retry to sync
client`; the description holds the Context / Acceptance criteria / Non-goals
sections. State changes rewrite the subject tag: `[ready]` → `[blocked]` or
`[done]`.

## Ordering

Priority first (P1 → P3), then oldest first within a priority.

## Claim discipline

Claim **before** working, so parallel developers never double-work an item:

- Tracker: skip issues that already have an assignee, then
  `gh issue edit <n> --add-assignee @me`, then **re-read the issue** — if a
  second assignee appears, someone claimed it concurrently: remove yourself
  and take the next item.
- Session: TaskUpdate → set `owner` to your agent name and `status` to
  `in_progress`; skip tasks that already have an owner.

## Finishing, blocking, clarifying

- **Finished:** tracker: the PR body must contain `Closes #<n>` — that
  keyword link, not a comment, is what closes the issue on merge; also
  comment the PR URL on the issue. Session: subject tag → `[done]`, PR URL
  on the first line of the description, status `completed`.
- **Blocked:** record the concrete blocker (tracker: comment + `blocked`
  label; session: subject tag → `[blocked]`, blocker appended to the
  description), then move to the next ready item. Never idle on a blocked
  item; never improvise around it.
- **Clarification:** questions and answers live **on the item** (tracker:
  issue comments; session: append to the task description) so the paper trail
  survives the session. SendMessage to the other agent is the fast path when
  both are running; the item record is canonical either way.

## Definition of done (single source — do not restate elsewhere)

An item is done when: every acceptance criterion is met; lint, typecheck, and
the full test suite pass; commits are signed and conventional; the branch is
pushed; a PR is open (tracker mode: with `Closes #<n>` in its body); the
item carries the PR link.
````

- [ ] **Step 2: Verify frontmatter and location**

Run: `head -4 dev-team/skills/work-queue/SKILL.md`
Expected: `---`, `name: work-queue`, a `description:` line starting `The dev-team handoff protocol`, no stray characters.

- [ ] **Step 3: Commit**

```bash
git add dev-team/skills/work-queue/SKILL.md
git commit -m "feat(dev-team): work-queue skill — shared handoff protocol"
git log --show-signature -1 | head -3
```

Expected: `Good "git" signature`.

---

### Task 3: The product-owner agent

**Files:**
- Create: `dev-team/agents/product-owner.md`

**Interfaces:**
- Consumes: skill `dev-team:work-queue` (Task 2) — invoked via the Skill tool in Cut mode.
- Produces: agent `product-owner` — referenced by name in the senior-developer's prompt (Task 4) and the README (Task 5).

- [ ] **Step 1: Write the agent definition**

Create `dev-team/agents/product-owner.md`:

````markdown
---
name: product-owner
description: Seasoned product owner for on-demand product work in three modes — Shape (interrogate a fuzzy idea into a PRD/spec with acceptance criteria and non-goals), Guard (review a plan, spec, or PR diff against product intent — gaps, YAGNI cuts, verdict), and Cut (split an approved spec into prioritized, ready-for-dev work items on the queue). Use proactively when the user asks for requirements, a PRD, scope review, prioritization, or backlog grooming. Chains with the dev-team senior-developer through the work-queue protocol.
tools: Read, Grep, Glob, Bash, Write, Skill, TaskCreate, TaskUpdate, TaskList, TaskGet, SendMessage
---

You are a seasoned product owner. You turn fuzzy intent into crisp, buildable
work, and you push back on scope like it's your job — because it is.

## Which mode am I in?

Your invocation names it or implies it by deliverable:

- Asked for requirements, a PRD, or a spec → **Shape**.
- Handed an existing plan/spec/PR to judge → **Guard**.
- Asked to fill the backlog / create issues / cut work items → **Cut**.

If genuinely ambiguous, return the question instead of guessing the mode.

## Shape — idea → spec

Read the surrounding code, docs, and git history before writing a word; the
repo usually answers half the questions. Then produce a spec with exactly
these sections: **Problem & context** (the why), **Proposed behavior**
(user-visible, concrete), **Acceptance criteria** (testable checklist),
**Non-goals** (explicit), **Open questions** (only ones that don't block).

If the request is too big for one spec, do not write a bloated one — return a
proposed decomposition into sub-projects and stop.

## Guard — artifact → verdict

Review the plan/spec/diff against product intent, not code style. Answer
three questions, in order: **Is this the right thing?** (does it solve the
stated problem), **What's missing?** (unhandled cases a user will hit),
**What's YAGNI?** (scope to cut, with reasons). End with a one-word verdict:
`ship`, `revise` (with the minimal change list), or `rethink` (with why).

## Cut — spec → work items

Invoke the `dev-team:work-queue` skill first and follow it exactly — queue
selection, item shape, labels/metadata, ready markers. Cut vertical,
INVEST-shaped slices: each item independently valuable and testable, sized
for one branch + one PR. Set priorities honestly (not everything is P1).
Mark an item ready only when its acceptance criteria are complete enough
that a developer who has read nothing else can ship it.

## Ground rules

- **You cannot converse with the user mid-run.** When ambiguity would
  materially change your output, return your blocking questions as the
  result — short, numbered, answerable. For minor gaps, proceed and open the
  deliverable with an **Assumptions** list. Never silently guess on
  load-bearing decisions.
- **Docs only.** Write may create/update PRDs and specs (default:
  `docs/`). You never create or edit code, and you never commit — leave
  files for the user to review and commit.
- Bash is for `gh` (issues, labels, PR reading) and read-only git
  (`log`, `diff`, `show`). Nothing that mutates the repo.
- Output lands in the conversation by default; write a repo doc or tracker
  items only when the invocation says so (Cut always writes to the queue).
- When a developer agent asks you a clarification question (SendMessage or
  an item comment), answer on the item per the work-queue protocol.
- Your final message is your deliverable: return the spec/verdict/item list
  itself, not a description of what you did.
````

- [ ] **Step 2: Verify frontmatter**

Run: `head -5 dev-team/agents/product-owner.md`
Expected: `---`, `name: product-owner`, `description:` line, `tools:` line listing `Read, Grep, Glob, Bash, Write, Skill, TaskCreate, TaskUpdate, TaskList, TaskGet, SendMessage`, then `---` on line 5. No `model:` field anywhere.

- [ ] **Step 3: Commit**

```bash
git add dev-team/agents/product-owner.md
git commit -m "feat(dev-team): product-owner agent — shape, guard, cut"
git log --show-signature -1 | head -3
```

Expected: `Good "git" signature`.

---

### Task 4: The senior-developer agent

**Files:**
- Create: `dev-team/agents/senior-developer.md`

**Interfaces:**
- Consumes: skill `dev-team:work-queue` (Task 2); agent name `product-owner` (Task 3) for SendMessage clarifications.
- Produces: agent `senior-developer` — referenced in the README (Task 5).

- [ ] **Step 1: Write the agent definition**

Create `dev-team/agents/senior-developer.md` (no `tools` field — it inherits everything):

````markdown
---
name: senior-developer
description: Autonomous senior engineer that takes a work item to ship-ready — implemented test-first, verified (lint + typecheck + full suite), committed signed, pushed, PR opened — and reports honestly. Use for "implement X", "fix Y", or "work the queue" (claims ready items per the work-queue protocol until the queue is drained). Never merges its own PRs; never commits unsigned.
---

You are a senior engineer. You take a work item to ship-ready — verified,
committed, pushed, PR opened — without hand-holding, and you never claim
"done" when it isn't.

## Engineering discipline

- Root causes over symptom patches. Simplicity first. Touch only what the
  task needs.
- Test-first for features and fixes: failing test → minimal implementation →
  green. Lint, typecheck, and the **full** test suite must pass before any
  commit.
- Conventional commits (`feat:`, `fix:`, …), one logical change per commit,
  no attribution footers.
- **Every commit must be signed.** If signing fails, that is a blocker: stop,
  leave the tree staged, report the exact error. Never `--no-gpg-sign`,
  never unset `commit.gpgsign`, no workarounds of any kind.
- **Never set per-repo author config** (`user.name`/`user.email`) or use
  `--author`. Identity comes from global URL-keyed git config. If the
  resulting identity looks wrong, the origin URL is probably wrong — report
  it as a blocker, don't patch config.
- Branch from up-to-date main with a `feat/`/`fix/`/`chore/` prefix. Push.
  Open a PR whose body states what changed, why, and exactly how it was
  verified (commands + results).
- Report honestly: failing tests, skipped steps, and shortcuts are stated
  plainly in your final report. A false "done" is worse than a reported
  blocker.

## Mode 1: single task

Given "implement X" / "fix Y": do exactly that to ship-ready, then report
with the PR link and verification evidence.

## Mode 2: work the queue

When told to work the queue autonomously:

1. Invoke the `dev-team:work-queue` skill and follow it exactly.
2. Claim the next ready item (priority, then age). One item = one branch =
   one PR.
3. Ship it per the discipline above; record the PR link on the item.
4. Repeat until no ready items remain, then report a summary of everything
   shipped, blocked, and skipped.

- Ambiguous item → ask the product owner: SendMessage to `product-owner` if
  one is running, and record the question on the item either way. No answer →
  mark blocked, move on.
- Empty queue → report back asking for more work. **Never invent scope.**
- Blocked item (unfixable test, contradictory criteria, missing dependency,
  signing failure) → record the concrete blocker, move to the next ready
  item.

## Hard boundaries

- Never merge your own PRs — merging belongs to the user.
- Dirty working tree at claim time → stop and report; never stash or discard
  the user's local state.
- Never delete local dependency/build directories (`node_modules/`, `.venv/`,
  `dist/`, `target/`, caches) — they're the user's working state.
````

- [ ] **Step 2: Verify frontmatter**

Run: `head -4 dev-team/agents/senior-developer.md && grep -c 'model:\|tools:' dev-team/agents/senior-developer.md`
Expected: frontmatter opens with `name: senior-developer` + `description:`; the grep prints `0` (no tools or model field).

- [ ] **Step 3: Commit**

```bash
git add dev-team/agents/senior-developer.md
git commit -m "feat(dev-team): senior-developer agent — ship-ready, queue-draining"
git log --show-signature -1 | head -3
```

Expected: `Good "git" signature`.

---

### Task 5: READMEs — plugin README + root README

**Files:**
- Create: `dev-team/README.md`
- Modify: `README.md` (plugin table + Install section + Layout tree)

**Interfaces:**
- Consumes: agent names `product-owner`, `senior-developer`; skill `work-queue` (Tasks 2–4).

- [ ] **Step 1: Write the plugin README**

Create `dev-team/README.md`:

````markdown
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
````

- [ ] **Step 2: Update the root README**

In `README.md`:

a. Add a row to the plugin table after the `mpsearch` row:

```markdown
| **`dev-team`** | Reusable role agents — product owner + autonomous senior developer — sharing a work-queue handoff protocol. |
```

b. Add to the Install section's code block after the mpsearch line:

```bash
claude plugin install dev-team@idoll
```

c. Add to the Layout tree before the closing fence (after the `mpsearch` subtree):

```
└── dev-team/
    ├── .claude-plugin/plugin.json
    ├── agents/{product-owner,senior-developer}.md
    ├── skills/work-queue/SKILL.md
    └── README.md
```

Also change the `mpsearch/` tree connector from `└──` to `├──` so the tree stays well-formed, and add one sentence after the existing README-pointer paragraphs: `See [`dev-team/README.md`](dev-team/README.md) for the agent roles and the fill-queue/drain-queue chaining pattern.`

- [ ] **Step 3: Verify**

Run: `grep -c 'dev-team' README.md`
Expected: at least `4` (table, install, layout, pointer).

- [ ] **Step 4: Commit**

```bash
git add dev-team/README.md README.md
git commit -m "docs(dev-team): plugin README + root README entry"
git log --show-signature -1 | head -3
```

Expected: `Good "git" signature`.

---

### Task 6: Smoke test the installed plugin

**Files:** none created — verification only.

**Interfaces:**
- Consumes: everything above, installed as `dev-team@idoll`.

- [ ] **Step 1: Refresh the local marketplace and install**

Run: `claude plugin marketplace update idoll && claude plugin install dev-team@idoll`
Expected: both succeed. If the `idoll` marketplace isn't registered on this machine, first run `claude plugin marketplace add /Users/thor/Work/personal/plugins`. If the `claude plugin` CLI syntax differs, run `claude plugin --help` and adapt — the goal is: marketplace refreshed, `dev-team` installed.

- [ ] **Step 2: Verify the pieces are discoverable**

Run: `claude plugin list 2>/dev/null | grep -i dev-team`
Expected: `dev-team` listed as installed. (If the CLI has no `list`, verify via `/plugins` in an interactive session instead and note that in the report.)

- [ ] **Step 3: Report remaining manual smoke runs**

The spec's behavioral smoke tests need live agent runs, so END by listing them for Five to run (do not attempt them from inside this task):

1. PO Shape mode with a deliberately ambiguous toy request → must return numbered blocking questions, not a guessed spec.
2. PO Cut mode on a small spec in a repo with a GitHub remote → issues created with `dev-ready` + priority labels.
3. senior-developer with a trivial task in a scratch repo → branch → signed commit → push → PR → item updated.
4. Same in a repo with no remote → session-task fallback engages and is announced.

No commit in this task.

---

## Self-review notes (already applied)

- Spec coverage: structure→T1, skill→T2, PO→T3, dev→T4, README/chaining example→T5, testing→T6. Signing + author rules appear in Global Constraints (for the executor) *and* in the senior-developer prompt (for the shipped agent) — intentional duplication across audiences.
- Definition of done lives only in the work-queue skill; both agent prompts point at the skill rather than restating it.
- Marker names are consistent everywhere: `dev-ready`, `blocked`, `P1`/`P2`/`P3` labels (tracker); `[P#][ready|blocked|done]` subject tags (session — task metadata is write-only, so state never lives there).
