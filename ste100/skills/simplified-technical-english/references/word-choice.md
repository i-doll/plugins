# Word choice

The swaps that come up constantly in software documentation, verified against the
Issue 9 dictionary. This is a working subset, not the dictionary — roughly 150 of
the ~900 approved words and ~1,200 unapproved entries. When a word is not here and
you are unsure, say so instead of guessing.

Read the technical-verb section first. It resolves most software vocabulary
without any swap at all, and it is the part that a general-purpose STE cheat sheet
gets wrong.

## Software verbs are technical verbs

Rule 1.12 lets you use a verb that falls into a technical-verb category. Issue 9's
category 2, **Computer processes and applications**, sanctions ordinary software
vocabulary outright:

| Subcategory | Approved as technical verbs |
|---|---|
| Input and output | `click`, `digitize`, `enter`, `press`, `print`, `swipe`, `tap`, `type` |
| User interface and applications | `clear`, `close`, `copy`, `cut`, `delete`, `deselect`, `disable`, `drag`, `drag and drop`, `enable`, `encrypt`, `erase`, `filter`, `highlight`, `invalidate`, `maximize`, `minimize`, `navigate`, `open`, `paste`, `save`, `scroll`, `sort`, `store`, `tweet`, `validate`, `zoom in`, `zoom out` |
| System operations | `abort`, `boot`, `communicate`, `debug`, `download`, `format`, `install`, `load`, `manage`, `process`, `reboot`, `update`, `upgrade`, `upload` |

So `Delete the stale entries` and `Validate the payload` are correct STE in a
software manual, even though `delete` and `validate` are not approved dictionary
words in the general sense. Do not "fix" them.

Two limits. Rule 1.13 says a technical verb is not a noun — write
`Download the archive`, not `Start the download`. And a verb outside these lists
does not become a technical verb because it sounds technical: `configure`,
`initialize`, `authenticate`, `deploy`, `provision`, `refactor` are not here, so
they take a swap or a rewrite.

## Verbs to replace

| Not approved | Use |
|---|---|
| accomplish | do |
| allow | let |
| assist | help |
| attempt | try |
| commence | start |
| create | make |
| define | calculate |
| determine | find |
| eliminate | remove |
| enable *(outside a UI context)* | let |
| ensure | make sure (that) |
| execute | do |
| facilitate | help |
| function *(as a verb)* | operate |
| generate | be, make |
| handle | move, use |
| implement | do |
| indicate | show, specified |
| initiate | start |
| insert | put |
| log *(as a verb)* | record |
| maintain | keep |
| modify | change |
| obtain | get |
| perform | do |
| provide | give |
| render | make |
| request | tell |
| restart | start |
| result *(as a verb)* | cause |
| return *(as a verb)* | go |
| run | operate |
| terminate | stop |
| trigger | cause |
| utilize | use |
| verify | make sure (that) |

## Other parts of speech

| Not approved | Use |
|---|---|
| ability | can |
| able *(as in "able to")* | can |
| additional | more |
| e.g. | for example |
| entirely | fully |
| etc. | and so on |
| failure *(as in "failure to")* | if … not |
| i.e. | that is |
| order *(as in sequence)* | sequence |
| place *(as a noun)* | position |
| prior to | before |
| process *(as a noun)* | procedure |
| reference *(as a noun)* | refer to |
| via | through |

## Part-of-speech traps

Rule 1.2 fixes each approved word to one part of speech. These are the ones that
catch writers who know the word is in the dictionary but not in which role.

| Word | Approved as | Not approved as | Write instead |
|---|---|---|---|
| check | noun | verb | `Do a check of the connection` |
| test | noun | verb | `Do a test of the endpoint` |
| display | noun | verb | `The field shows the status` |
| function | noun | verb | `The parser operates on the input` |
| support | noun | verb | `The bracket holds the switch` |
| surface | noun | verb | `The response gives the warnings` |
| record | verb | — | `Record the value` is correct |
| key | technical noun | verb | `Refer to the illustration` |

`Check the log file` is the most common single violation in software
documentation. The STE form is `Do a check of the log file`, or better, name the
real action: `Examine the log file for errors`.

## Approved, despite what the internet says

Secondary summaries of STE routinely list these as banned. In Issue 9 they are
approved — do not swap them out:

`approximately` · `available` · `component` · `control` · `contact` · `deploy` ·
`error` · `exit` · `failure` (as a technical noun) · `input` · `monitor` ·
`occur` · `output` · `position` · `possible` · `problem` · `report` · `result`
(noun) · `schedule` · `select` · `send` · `receive` · `subsequent` ·
`sufficient`

`deploy` carries a caveat. It is approved with the physical meaning, to move into
position. Software's "ship to production" sense is a different meaning, so rule 1.3
bars it and category 2 does not list it. Write `install the release` or name the
real action.

## Words with no dictionary entry

These appear in neither the approved nor the unapproved list, so there is no
sanctioned swap. Under rule 1.1 they are unusable unless they qualify as a
technical noun (rule 1.5) or a technical verb (rule 1.12), and under rule 9.1 the
fix is usually a different sentence construction rather than a word swap.

`cache` · `configure` · `default` · `initialize` · `issue` · `message` ·
`multiple` · `numerous` · `parse` · `queue` · `response` · `retry` ·
`screen` · `specify` · `authenticate` · `authorize` · `overwrite`

Most survive as technical nouns, which is the usual resolution: `cache`, `queue`,
`default`, `message` and `response` name things a system has, and rule 1.5 admits
them as technical nouns in a software subject field. The verbs are the problem.
`Configure the timeout` has no approved verb, so rebuild the sentence:
`Set the timeout to 30 seconds`.

## Phrasal verbs

Rule 9.3 bars you from making a phrasal verb by putting a verb and a particle
together. The dictionary approves a small fixed set — `put on`, `come on`,
`go off` — and nothing else. `switch off` is not among them, despite looking like
one of the family: it takes `set … to OFF`.

| Do not write | Write |
|---|---|
| set up the environment | prepare the environment |
| shut down the service | stop the service |
| back up the database | make a backup of the database |
| roll back the migration | reverse the migration |
| turn on the flag | set the flag to `true` |
| carry out the check | do the check |
| find out the cause | find the cause |

`set up` and `setup` are different words. The noun `setup` is a technical noun and
survives; the verb phrase does not.
