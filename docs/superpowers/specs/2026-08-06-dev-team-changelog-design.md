# dev-team changelog agent — design

**Date:** 2026-08-06
**Status:** Approved (brainstormed with Five)
**Builds on:** dev-team v0.2.0 (product-owner, senior-developer, qa, designer,
work-queue skill)

## Purpose

Add a fifth role to the `dev-team` plugin: a **changelog** agent that writes
changelogs the way a careful maintainer does — terse, truthful, user-facing —
and refuses to write the padded AI-slop kind. Version bumps to 0.3.0.

This iteration is dogfooded like v0.2.0, now with the real plugin agents
(`dev-team:product-owner` cuts, `dev-team:senior-developer` implements) since
the reloaded session registers them natively.

## Changelog agent

Role: a changelog editor with a maintainer's discipline. Its unit of work is
the entry, its source of truth is the diff, and its default answer to "should
this be in the changelog?" is no unless a user would notice the change.

**Three modes**, selected by invocation:

1. **Cut** — given a ref range (default: last tag → HEAD) and a version
   number: read the commits *and their diffs*, select the user-visible
   changes, and write that release's entry into the changelog. The version
   number is an input — the agent records it, it never decides semver bumps.
2. **Curate** — given a merged change or completed work item: decide whether
   it is changelog-worthy at all; if yes, file one entry under Unreleased in
   the right category; if no, say so and why. Refusal is a first-class
   outcome, not a failure.
3. **Review** — given an existing changelog entry (or whole file) and the
   diff it claims to describe: flag slop phrasing, inaccuracies, entries no
   user cares about, and user-visible changes the entry *missed*. Findings
   ranked; no edits in this mode unless asked to fix what it found.

**Style contract (binding in every mode):**

- User-visible changes only. Internal refactors, CI, test-only, and
  formatting changes do not appear unless they change observable behavior.
- One terse line per entry, plain language, naming the actual behavior
  change ("`walkTo` no longer flies by default; pass `fly: true`").
- Breaking changes first, marked as such.
- Banned: marketing adjectives ("Enhanced", "Improved X for better Y"),
  emoji, "various fixes and improvements", restating commit messages
  verbatim, entries that describe the code instead of the change.
- Every entry must be grounded in the diff. Commit messages are leads, not
  sources — they lie and omit. An entry the agent cannot ground in an actual
  diff hunk is not written; in Review mode it is flagged.
- Format: the repo's existing changelog convention wins, always. Absent one:
  Keep a Changelog structure (Added/Changed/Fixed/Removed/Deprecated/
  Security) with semver headings and dates.

**Committing:** the agent commits its changelog edits itself, under the same
hard rules as every committing dev-team agent: signed commits mandatory —
signing failure halts the run; no per-repo author config or `--author`;
conventional message; dirty working tree at start → stop and report.

**Tools:** Read, Grep, Glob, Bash (git log/diff/show/tag, `gh` reading, and
committing), Write, Edit, Skill, TaskCreate/TaskUpdate/TaskList/TaskGet,
SendMessage. Write and Edit are scoped by rule to changelog files only —
never code, never other docs. (Edit is granted — unlike its siblings —
because inserting an entry into a long existing CHANGELOG.md is surgical
work where full-file rewrites risk truncation.)

**Shared rules:** identical to the other roles — blocking questions returned
as the result, Assumptions list for minor gaps, no silent guessing; invoke
`dev-team:work-queue` before any queue operation (Curate is often pointed at
completed queue items); the work-queue definition of done and marker
vocabulary stay single-sourced; no `model` field; frontmatter description
written for proactive delegation.

## Plugin changes

- `dev-team/agents/changelog.md` — new.
- `dev-team/.claude-plugin/plugin.json` — five roles in description, version
  `0.3.0`, keyword `changelog`.
- `.claude-plugin/marketplace.json` — dev-team entry description updated.
- `dev-team/README.md` — one "What's in here" bullet, one usage example;
  "Hard rules" section already generalizes to every committing agent and now
  simply covers one more.
- Root `README.md` — layout tree agents line gains `changelog`; table row
  wording updated if it enumerates roles.
- No work-queue skill changes.

## Error handling

Inherited wholesale from v0.2.0 (announced fallbacks, blocked-item
discipline, dirty-tree stop, signing halts the run), plus:

- Cut with no tags and no stated range → ask for the range rather than
  guessing "everything".
- Curate/Cut where the diff is unreadable (shallow clone, missing objects) →
  report what's missing; never write entries from commit messages alone.
- Review with no diff available → refuse the accuracy half, deliver only the
  style half, and say that's what happened.

## Testing

Smoke runs after install (0.3.0 visible, five agents registered):

1. Cut on a toy repo with a tag, mixed user-visible + internal commits →
   entry contains only the user-visible changes, correct format, version as
   given.
2. Curate pointed at an internal refactor → refusal with reason.
3. Review against a planted slop entry ("Improved performance and fixed
   various bugs ✨") → all slop patterns flagged plus the missed real change.

## Non-goals

- No release automation: no tagging, no publishing, no version-number
  decisions.
- No commit-message writing or PR-description writing — changelog files
  only.
- Item #19 (queue-selection SSH-alias misroute) stays deferred; unchanged by
  this iteration.
