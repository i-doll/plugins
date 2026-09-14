---
name: simplified-technical-english
description: "Write or audit documentation in ASD-STE100 Simplified Technical English, the controlled language used for aerospace and defence technical publications. Use when writing procedures, manuals, installation and troubleshooting guides, safety instructions, or release notes for an audience of non-native English readers or translators, and whenever asked for STE, Simplified Technical English, controlled language, controlled English, simplified English, or a readability pass over technical documentation. Also use to check existing documentation against the standard."
---

# Simplified Technical English

ASD-STE100 is a controlled language: a restricted dictionary plus 53 writing rules,
built so that a maintenance technician reading a manual in their third language
cannot misread it. It trades range for certainty. That trade is worth making for
procedures, safety instructions and reference material, and not worth making for
marketing copy, tutorials with a voice, or a design rationale.

Two modes. Pick by what was asked.

- **Write** — produce documentation that obeys the rules from the first draft.
- **Audit** — read existing documentation, report where it breaks the rules, and
  rewrite the offending text.

## Write

Draft normally, then apply the rules below in this order. The order matters: word
choice changes sentence structure, so fixing structure first wastes work.

1. **Words** — every word approved, a technical noun, or a technical verb.
2. **Verbs** — approved forms only, active voice.
3. **Sentences** — inside the word limit, one idea each.
4. **Structure** — procedures imperative, descriptions gradual, safety framed.
5. **Punctuation and count** — no semicolons, then count the words.

Read `references/word-choice.md` before step 1. It carries the swaps that come up
constantly in software documentation, and the part-of-speech traps that catch
writers who know the word is approved but not in which role.

## Audit

Report findings as a ranked list. Rank by how much ambiguity the violation causes
for a non-native reader, not by rule number — a 26-word sentence is a rounding
error next to a passive clause that hides who does the work.

For each finding give:

- `file:line`
- The rule number (`Rule 5.1`) or general recommendation (`GR-3`)
- The offending text
- A rewrite that obeys the rule and keeps the meaning

Do not report a violation without a rewrite. "This sentence is too long" is not a
finding, it is an observation. If a rewrite needs information the document does
not contain, say so and ask.

Never silently loosen a rule to make text pass. If a passage cannot be written in
STE without losing meaning, say that plainly and explain what would be lost.

## The rules

Issue 9, 2025-01-15. Rule statements below are compressed; the standard's own
wording, examples and explanatory text are authoritative.

### Section 1 — Words

- **1.1** Use only words that are approved in the dictionary, technical nouns, or technical verbs.
- **1.2** Use an approved word only as the part of speech the dictionary gives it.
- **1.3** Use an approved word only with its approved meaning.
- **1.4** Use only the approved forms of verbs and adjectives.
- **1.5** You may use a word that falls into one of the 22 technical-noun categories.
- **1.6** Use an unapproved word only when it is a technical noun or part of one.
- **1.7** Do not use a technical noun as a verb.
- **1.8** Use technical nouns that are approved in your company, industry, or subject field.
- **1.9** When you must pick a technical noun, pick the short, easily understood one.
- **1.10** Do not use regional, slang, or jargon words as technical nouns.
- **1.11** Do not use two different technical nouns for the same item.
- **1.12** You may use verbs that fall into a technical-verb category.
- **1.13** Do not use a technical verb as a noun.
- **1.14** Use American English spelling unless an official directive says otherwise.

### Section 2 — Multi-word nouns

- **2.1** Write multi-word nouns of no more than three words.
- **2.2** When a technical noun runs longer than three words, write it in full once. Then either give a shorter form, or hyphenate the words that act as one unit.

Three *words*, not three nouns — adjectives count. `runway light connection` is
fine; `runway light connection resistance calibration` forces the reader to hold
four modifiers before reaching the head noun. Break it with prepositions:
`calibration of the resistance of the runway light connection`.

### Section 3 — Verbs

- **3.1** Use only the verb forms the dictionary gives.
- **3.2** Use only the infinitive, the imperative, the simple present, the simple past, the simple future, and the past participle as an adjective.
- **3.3** Use the past participle as an adjective — before a noun, or after `be`, `become`, `stay`.
- **3.4** Do not use auxiliary verbs to build complex verb constructions.
- **3.5** Use an `-ing` form only as a technical noun or as a modifier inside one.
- **3.6** Use the active voice. In descriptive writing, use the passive only when the agent is unknown.
- **3.7** Describe an action with an approved verb, not with a noun or another part of speech.

Rule 3.2 rules out the present perfect (`has completed`), the past perfect
(`had completed`) and both progressives (`is completing`, `was completing`).
This is the rule that most often forces a rewrite rather than a word swap.

Rule 3.7 in practice: `Do an inspection of the disk` becomes `Inspect the disk`
only if `inspect` is approved — it is not, so the STE form is
`Examine the disk`. The rule pushes you to the verb, the dictionary picks which.

### Section 4 — Sentences

- **4.1** Write short, clear sentences. Procedures use the imperative. Descriptive sentences carry one topic each.
- **4.2** Do not omit words or use contractions to shorten a sentence.
- **4.3** Use a vertical list for complex text.
- **4.4** Use connecting words and phrases to join sentences on related topics.
- **4.5** Where applicable, put an article (`the`, `a`, `an`) or a demonstrative (`this`, `these`) before a noun or multi-word noun.

Rule 4.5 is the one that reads as verbose to a native speaker and is not.
`Set rotary switch to INPUT` becomes `Set the rotary switch to INPUT`.

### Section 5 — Procedural writing

- **5.1** Maximum 20 words per sentence. Warnings and cautions obey this too.
- **5.2** One instruction per sentence, unless two actions happen at the same time.
- **5.3** Write instructions in the imperative.
- **5.4** When the reader must know a condition first, open with the descriptive statement, then a comma, then the command.
- **5.5** Notes give information only. A note never carries an instruction.

### Section 6 — Descriptive writing

- **6.1** Give information gradually.
- **6.2** Use key words and key phrases to give the text a logical structure.
- **6.3** Maximum 25 words per sentence.
- **6.4** Use paragraphs to group related information.
- **6.5** One topic per paragraph.
- **6.6** Maximum six sentences per paragraph.

Descriptive writing takes no imperative. `Configure the timeout` is procedural;
the descriptive form is `The timeout controls how long the client waits.`

### Section 7 — Safety instructions

- **7.1** Use a word that identifies the level of risk.
- **7.2** Start a safety instruction with a clear, accurate command or condition.
- **7.3** Give an explanation that shows the risk or the possible result.

A **warning** means a risk of injury or death. A **caution** means a risk of
damage to objects. Do not swap them, and do not open with the explanation —
command first, reason second.

### Section 8 — Punctuation and word count

- **8.1** All standard English punctuation is available except the semicolon.
- **8.2** Use hyphens to connect directly related words.
- **8.3** Parentheses are for references, identifying letters and numbers, work-step numbers, abbreviations, singular-and-plural forms, short explanations, and alternatives.
- **8.4** In a vertical list, a colon ends a sentence for counting purposes.
- **8.5** Text inside parentheses counts as one word.
- **8.6** Each of these counts as one word: a number; a number with its unit; an abbreviation; an alphanumeric identifier; quoted text; a title, heading, placard, or label; a proper noun of a person, group, organization, or geopolitical entity.
- **8.7** A hyphenated word counts as one word.

Rule 8.6 is what makes the 20-word limit workable in technical text.
`Set the timeout to 30 seconds` counts `30 seconds` once.

### Section 9 — Writing practices

- **9.1** When a word-for-word replacement will not do, restructure the sentence.
- **9.2** Use each approved word correctly.
- **9.3** Do not put a verb and a particle together to make a phrasal verb.
- **9.4** Keep terminology and wording consistent.

Rule 9.1 is the escape hatch and the hardest rule to apply. `The oil level must
be visible during the test` has no approved word for `visible`, so the sentence
is rebuilt around an approved verb: `During the test, make sure that you can see
the oil level.`

### General recommendations

- **GR-1** Keep the conjunction `that`. `Make sure that the valve is open`, not `Make sure the valve is open`.
- **GR-2** Watch the preposition `with` — it can read as association, means, or accompaniment. Reread any sentence that uses it.
- **GR-3** Replace an ambiguous pronoun with the noun it refers to.
- **GR-4** Make sure `this` has exactly one possible referent.
- **GR-5** Watch for false friends, words that look like a word in the reader's language but mean something else.
- **GR-6** Do not use Latin abbreviations. Write `for example`, not `e.g.`; `that is`, not `i.e.`; `and so on`, not `etc.`
- **GR-7** Use inclusive, gender-neutral language. `he` and `she` are not approved.
- **GR-8** The possessive form is permitted. If you are unsure the sentence is right, avoid it.

## Software documentation

STE was written for aircraft maintenance manuals. The rules carry over to software
documentation, with these readings.

**Identifiers are technical nouns.** Function names, CLI flags, environment
variables, types, HTTP status names, and error strings are technical nouns under
rules 1.5 and 1.8. Keep them verbatim — never rewrite `getUserById` into approved
words. Rule 1.11 then binds you to one name per concept: if the API says
`workspace`, the prose says workspace, not project, not tenant, not org.

**Identifiers do not count toward rule 2.1.** `the OAuth refresh token` is a
three-word multi-word noun. `the ACCESS_TOKEN_TTL variable` is a technical noun
plus an article and a head noun, not a four-word cluster.

**Code blocks are exempt from word counts.** Rules 5.1, 6.3 and 8.x apply to
prose. Do not reflow a code sample, a log line, or a config excerpt to hit a word
limit. Inline code spans count as one word under rule 8.6, the same as quoted text.

**Most software verbs are already legal.** Issue 9's technical-verb category 2,
*Computer processes and applications*, sanctions `click`, `enter`, `press`, `type`,
`delete`, `disable`, `enable`, `save`, `scroll`, `validate`, `abort`, `boot`,
`debug`, `download`, `install`, `load`, `process`, `reboot`, `update`, `upgrade`
and `upload` outright under rule 1.12. `Delete the stale entries` is correct STE.
Do not swap these for dictionary words. The verbs that do need replacing —
`configure`, `initialize`, `authenticate`, `execute`, `run` — are in
`references/word-choice.md`.

**Headings are titles.** Rule 8.6 counts a heading as one word, so heading style
is a house-style question, not an STE question.

**Reference documentation is descriptive writing.** Section 6 governs it —
25-word sentences, one topic per paragraph, no imperative. Only the how-to guides
and runbooks are procedures under section 5.

## What this skill cannot do

This encodes the writing rules faithfully, but it carries a **partial dictionary** —
the swaps in `references/word-choice.md`, not all 900 approved words and 1,200
unapproved entries. So it can catch the common violations and rewrite them, and it
**cannot certify conformance**. Never tell a user their document is STE-compliant.
Say which rules were checked and that the dictionary coverage is partial.

For real conformance work, the standard is free from
[asd-ste100.org](https://www.asd-ste100.org/) on request, and the checking tools
listed there hold the full dictionary.

When a word is not in `references/word-choice.md` and you are unsure it is
approved, say so rather than guessing. A confident wrong swap is worse than a
flagged uncertainty — it silently changes meaning in a document whose entire
purpose is to not be misread.
