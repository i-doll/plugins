# ste100

Write and audit documentation in [ASD-STE100 Simplified Technical
English](https://www.asd-ste100.org/), the controlled language the aerospace and
defence industries use for technical publications.

STE is a restricted dictionary plus 53 writing rules, designed so that a
technician reading a manual in their third language cannot misread it. It trades
expressive range for certainty — worth it for procedures, safety instructions and
reference material, not worth it for tutorials with a voice.

## Install

```bash
claude plugin install ste100@idoll
```

## What it does

One skill, `simplified-technical-english`, with two modes:

- **Write** — produce documentation that obeys the rules from the first draft.
- **Audit** — read existing documentation, report violations with `file:line` and
  the rule number, and rewrite the offending text.

It fires on requests to write or review technical documentation, and on any
mention of STE, Simplified Technical English, controlled language, or simplified
English.

## What it contains

`skills/simplified-technical-english/SKILL.md` carries all 53 writing rules of
Issue 9 (2025-01-15) across the nine sections, plus the eight general
recommendations, stated as checkable constraints and keyed to their real rule
numbers.

`references/word-choice.md` carries the word-level material: the swaps that come
up in software documentation, the part-of-speech traps, and the technical-verb
categories.

## Software documentation

STE was written for aircraft maintenance manuals, and most guides to it read that
way. The skill adds the readings that make the rules survive contact with a
README: identifiers are technical nouns and stay verbatim, code blocks are exempt
from word counts, reference docs are descriptive writing while runbooks are
procedures.

The one that matters most: Issue 9's technical-verb category 2, *Computer
processes and applications*, explicitly sanctions `click`, `delete`, `enable`,
`install`, `update`, `validate` and two dozen more. A naive STE pass rewrites
those into dictionary words and makes the documentation worse. This one does not.

## What it cannot do

It carries a **partial dictionary** — about 150 entries, not the full ~900
approved words and ~1,200 unapproved ones. It catches the common violations and
rewrites them; it **cannot certify conformance**, and it is written to say so
rather than claim a document is compliant.

For conformance work, ASD gives Issue 9 away free on request at
[asd-ste100.org](https://www.asd-ste100.org/), and the checking tools listed there
hold the full dictionary.

The standard itself is copyrighted and not redistributable, so no part of it is
vendored here. `reference/` is gitignored for exactly that reason: if you extract
your own copy for local use, it stays out of the repo.
