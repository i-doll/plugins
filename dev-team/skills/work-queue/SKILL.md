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
