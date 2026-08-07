---
name: trip-dossier
description: The travel-team contract for trip folders — where a trip lives on disk, what each specialist's brief is called, the header and entry shape every brief shares, the booking flags, and the research-integrity rules. Use before reading or writing anything under trips/, when scouting sights, hidden gems or food for a destination, when researching booking lead times, or when assembling a dossier from existing briefs.
---

# The travel-team trip dossier

One folder per trip, one brief per specialist. Every travel-team agent invokes
this skill before reading or writing a trip folder, so that any specialist's
output is legible to the next one and to the concierge — whether they run in
the same session or months apart.

This file is the single source for these conventions. Agent files cite it;
they do not restate it.

## Folder convention

`trips/<destination-slug>/`, relative to the directory the agent was invoked
in — not the plugin directory, not a repo root.

- **Slug:** lowercase, ASCII, diacritics folded, spaces to hyphens —
  `porto`, `san-sebastian`, `kyoto`. Qualify with region only when the bare
  name is genuinely ambiguous (`springfield-il`), and only after the
  ambiguity has been resolved with the traveler (see Error handling).
- **The folder is the trip.** It holds all state, it survives sessions, and
  re-running a specialist refreshes that specialist's brief in place.
- Create it if it is missing (`mkdir -p`). Read any brief already there.
- Write exactly one file — your own brief — and write it whole. Briefs are
  regenerated on refresh, not edited in place. Never rename, repair, or
  delete another agent's file.

## Brief filenames

Fixed, one per agent. No other filenames belong in a trip folder.

| File | Owner |
|---|---|
| `gems.md` | gem-scout |
| `must-sees.md` | mustsee-scout |
| `bookings.md` | bookings |
| `food.md` | food |
| `dossier.md` | concierge |

## Brief header

Every brief opens with the same block:

```
# Porto — hidden gems

Trip context
- Destination: Porto, Portugal
- Dates: 12–16 October 2026 (shoulder season)
- Party: two adults
- Interests: architecture, wine, long walks

Assumptions
- No budget given; entries span cheap to one splurge.

Researched: 2026-08-07
```

- **Trip context** records what the traveler actually gave — destination,
  dates or season, party, interests. Omit fields that were not given; do not
  invent them.
- **Assumptions** lists every gap you filled in order to proceed, one line
  each, stated plainly enough that the traveler can correct one. Drop the
  block entirely if you assumed nothing.
- **`Researched: <date>`** is the date the research ran, ISO format. Travel
  facts go stale — hours shift, restaurants close, timed-entry rules get
  rewritten — so every brief wears its date and a reader can judge how far to
  trust it. Refreshing a brief rewrites the date.

## Entry shape

Every place any specialist recommends is one entry in this shape:

```
### Jardim do Morro
- **Why go** — the river, both bridges and the whole old town at sunset, free
- **Time** — 45 min
- **When** — before 10:00 or after sunset; midday is packed
- **Area** — Vila Nova de Gaia
- **Booking** — walk-up
- **Source** — https://example.org/porto/jardim-do-morro
```

- **Name** — the place as a local would find it on a map.
- **Why go** — one line: the reason it earns a slot, not a description of
  what it is.
- **Time** — how long it actually takes, queue included.
- **When** — best time to go, or the crowd window to avoid; omit the line
  when timing genuinely doesn't matter.
- **Area** — the neighborhood or district, named. Nothing is plotted; there
  are no coordinates and no maps.
- **Booking** — one of the three flags below.
- **Source** — a URL that supports the claims in the entry.

One entry, one place. No multi-paragraph essays: if an entry needs a
paragraph it is either two entries or it does not belong.

Agents add their own structure *around* entries — a ranking, a skip list, a
book-by timeline, neighborhood groupings. The entry shape stays the same
inside all of them.

## Booking flags

- **`book-ahead`** — it sells out, needs timed entry, or a reservation is the
  difference between getting in and not.
- **`walk-up`** — turn up; no reservation needed at normal times.
- **`unknown`** — research did not settle it, or sources conflict. Say why in
  the entry. Never guess a flag to look decisive.

The bookings agent owns every lead-time fact — how far ahead, cancellation
windows, official site versus reseller, free days and timed-entry tricks.
Other specialists flag the entry and stop there.

## Research integrity

- **Web research is mandatory.** No brief is written from model memory alone.
  Memory suggests leads; the web confirms them.
- Every factual claim a traveler would act on — hours, prices, lead times,
  closures, seasonal shutdowns — carries a source URL.
- Prefer the operator's own site for hours and prices; corroborate with an
  independent source where it matters.
- **Conflicting sources are presented, not resolved.** State both with their
  dates and leave the disagreement visible. On a bookable fact, an unresolved
  conflict makes the booking flag `unknown`.
- Uncertainty is stated, never smoothed over. "Reportedly closed Mondays
  (2024 source, unconfirmed)" beats a confident sentence that is wrong.
- Cite what you actually read. A URL you did not fetch is not a source.

## Error handling

These cases apply to every travel-team agent. Cases specific to one agent
live in that agent's file.

- **Web research unavailable** — no network, or no search/fetch tool. Say so
  and stop. Do not fall back to memory: an unsourced brief is worse than no
  brief, because it reads exactly like a researched one.
- **Destination ambiguous** — "Springfield", "Valencia", "Cambridge". Return
  a blocking question, not a guess. No folder is created and no research runs
  until it is resolved.
- **Trip folder present but malformed** — hand-edited briefs, missing
  headers, freehand entries. Work with what parses, list what did not in your
  report, and overwrite only your own file.

## Out of scope for every agent

The plugin informs bookings; it never makes them. No flight or hotel search,
no price tracking, no booking execution. No hour-by-hour itineraries — a
dossier stays a loose menu. No maps or geo tooling.
