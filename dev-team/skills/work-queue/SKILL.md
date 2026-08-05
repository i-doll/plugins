---
name: work-queue
description: The dev-team handoff protocol — how work items are written, marked ready, claimed, clarified, blocked, and closed. Use when filling the backlog, working the queue, claiming the next work item, checking queue state, or handing work between dev-team agents (product owner → senior developer).
---

# The dev-team work queue

One protocol, two backends. Every dev-team agent follows this contract so a
product owner's output is always claimable by a developer, and two developers
never collide.

## Queue selection (deterministic — run the check, don't guess)

Run: `git remote get-url origin 2>/dev/null && gh auth status 2>&1 | head -2`

- Both succeed (a GitHub origin exists and `gh` is authenticated) → **tracker
  mode**: the GitHub issue tracker is the queue.
- Either fails → **session mode**: the session task list (TaskCreate/TaskList)
  is the queue.

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
blocked is the `blocked` label. Create missing labels once:
`gh label create dev-ready --color 0e8a16 --force` (same for `P1` `P2` `P3`,
`blocked`).

**Session mode:** TaskCreate with the same sections in `description`, and
`metadata`: `{"dev-ready": true, "priority": "P2"}`. Blocked:
`{"blocked": "<concrete blocker>"}`.

## Ordering

Priority first (P1 → P3), then oldest first within a priority.

## Claim discipline

Claim **before** working, so parallel developers never double-work an item:

- Tracker: `gh issue edit <n> --add-assignee @me`; skip issues that already
  have an assignee.
- Session: TaskUpdate → set `owner` to your agent name and `status` to
  `in_progress`; skip tasks that already have an owner.

## Finishing, blocking, clarifying

- **Finished:** record the PR link on the item (tracker: comment with the PR
  URL — do not close the issue, the merged PR closes it; session: metadata
  `{"pr": "<url>"}` and status `completed`).
- **Blocked:** record the concrete blocker (tracker: comment + `blocked`
  label; session: metadata `{"blocked": "..."}`), then move to the next ready
  item. Never idle on a blocked item; never improvise around it.
- **Clarification:** questions and answers live **on the item** (tracker:
  issue comments; session: append to the task description) so the paper trail
  survives the session. SendMessage to the other agent is the fast path when
  both are running; the item record is canonical either way.

## Definition of done (single source — do not restate elsewhere)

An item is done when: every acceptance criterion is met; lint, typecheck, and
the full test suite pass; commits are signed and conventional; the branch is
pushed; a PR is open; the item carries the PR link.
