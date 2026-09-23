---
name: changelog
description: The house style for changelog entries and the method for writing them from a diff. Use whenever writing, editing, or reviewing a CHANGELOG.md or release notes — adding an Unreleased line after a change, cutting a release entry from a ref range, or checking existing entries for shape and accuracy. Every entry is one imperative line, verb first, grounded in the diff, with no clause explaining how or when it applies.
---

# Changelog entries

One entry is one short imperative line that says what the change does. It reads
like a well-written commit subject, not like a sentence from the docs. The
reader is someone scanning the file to find out what changed, not someone
learning how the feature works.

## The shape of an entry

Three lines for the same change. Only the last one is acceptable.

```diff
- The sort you pick is remembered, one for the marketplace search and one for
- stores, and applied whenever a page does not name its own.
- A remembered sort order, one for search and one for stores.
+ Persist sort order for search and store separately.
```

The first is a narrative sentence: it addresses the reader as "you", it
explains the mechanism, and it carries a trailing clause about when the
behaviour applies. The second is a noun phrase: it names a thing, not a change.
The third is a verb, its object, and the one qualifier that distinguishes this
change from the obvious version of it.

### Rules

1. **Start with a verb in the imperative.** Add, Remove, Fix, Rename, Persist,
   Stop, Show, Allow, Require. Never a noun phrase ("A remembered sort order"),
   never a full declarative sentence ("The sort you pick is remembered").
2. **One line.** Around ten words. If the line wraps, cut a qualifier; do not
   add a second sentence.
3. **No explanatory clauses.** Nothing that begins with "so that", "which",
   "whenever", "when", "instead of", "rather than", "used to". How it works
   and when it applies belong in the docs. If the reader cannot guess the
   old behaviour from the new one, the entry is still complete.
4. **No second person.** No "you", "your".
5. **Plain names for surfaces.** "search" and "store", not "the marketplace
   search page" and "a store's own page". Use the product's own word for a
   thing, once, unqualified.
6. **Name the change, not the code.** "Persist sort order", not "add
   `sortOrder` to the settings store". Identifiers appear only when the
   identifier is what changed (a renamed flag, a removed option).
7. **Banned outright.** Marketing adjectives ("Enhanced", "Improved X for
   better Y"), emoji, "various fixes and improvements", commit messages
   pasted verbatim, and any line that describes a refactor.
8. **Breaking changes first**, marked as such, in the same shape as every
   other line.
9. **User-visible changes only.** Internal refactors, CI, tests, formatting,
   dependency bumps and comment edits do not get a line unless observable
   behaviour changed.

### Structure

The repo's existing changelog convention wins. Absent one, use
[Keep a Changelog](https://keepachangelog.com/): an `Unreleased` section at
the top, then `## [x.y.z] — YYYY-MM-DD` per release, each with only the
`Added` / `Changed` / `Fixed` / `Removed` / `Deprecated` / `Security` headings
it needs. A new change goes under `Unreleased` in the one heading that fits;
one change, one line.

## Method

The diff is the source. Commit messages, PR titles and work items are leads
to what someone meant to do; the diff is what shipped.

1. **Read the diff**, not just the log. `git diff <range>` or `git show`. A
   range that resolves to nothing, a shallow clone, or unreadable objects
   means you report what is missing and write nothing.
2. **Select** the hunks a user would notice. Most hunks in most changes are
   not changelog-worthy; a reasoned "nothing to add" is a normal outcome.
3. **Write each line** to the rules above, then reread it against the diff:
   does the diff actually do what the line says, and nothing the line omits
   that a user would care about?
4. **Place it** under the right heading, in the repo's existing convention.
5. **Cut a release** by giving the `Unreleased` lines a version heading and a
   date. The version number is an input; do not decide semver bumps.

## Reviewing existing entries

Check each line against the rules, then against the diff it claims to
describe. Rank findings: a line that is wrong about the change outranks a
line in the wrong shape, and a user-visible change with no line outranks
both. For each finding give the line, the rule, and the rewrite.

## Self-check before finishing

For every line you wrote or kept:

- Does it start with an imperative verb?
- Is it one line with no "when / which / so that / instead of" clause?
- Would a maintainer skimming the file know what changed without reading the
  diff, and would they learn nothing about *how* it works from the line?
- Can you point at the hunk that makes it true?

Any "no" means rewrite or delete.
