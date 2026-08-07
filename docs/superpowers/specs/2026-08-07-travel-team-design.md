# travel-team plugin — design

**Date:** 2026-08-07
**Status:** Approved (brainstormed with Five)

## Purpose

A new plugin, `travel-team`, in the `idoll` marketplace: five role agents that
help plan trips the way Five actually travels — a loose menu of things worth
seeing, what must be booked ahead (and by when) to get the most out of it,
and where to eat. Not an hour-by-hour schedule.

Follows the house pattern established by `dev-team`: independent specialist
agents, invocable à la carte, sharing one contract skill so their outputs
compose. Version 0.1.0.

## Structure

```
travel-team/
├── .claude-plugin/plugin.json      # v0.1.0, author i-doll
├── agents/
│   ├── gem-scout.md
│   ├── mustsee-scout.md
│   ├── bookings.md
│   ├── food.md
│   └── concierge.md
├── skills/
│   └── trip-dossier/SKILL.md       # shared contract
└── README.md
```

Plus the `travel-team` entry in the root `.claude-plugin/marketplace.json`
and root README updates (table row, install line, layout tree, pointer
sentence). No MCP server, no commands (a `/travel-team:plan` bootstrap is
possible later — YAGNI now). No `model` fields — agents inherit the session
model. Frontmatter descriptions written for proactive delegation.

## The trip-dossier skill (shared contract)

Every travel-team agent invokes this skill before reading or writing a trip
folder. It defines:

- **Folder convention:** `trips/<destination-slug>/` under the invocation
  directory. The folder is the trip: it holds all state, survives sessions,
  and re-running a specialist refreshes its brief in place.
- **Brief filenames:** `gems.md` (gem-scout), `must-sees.md` (mustsee-scout),
  `bookings.md` (bookings), `food.md` (food), `dossier.md` (concierge).
- **Brief header:** trip context as given (destination; dates/season, party,
  interests if known) plus explicit assumptions for whatever was missing,
  and a `Researched: <date>` line. Travel facts go stale; every brief wears
  its date.
- **Entry shape** (used by all specialists): name; one-line why-go; time
  needed; when to go (best time, or the crowd window to avoid);
  area/neighborhood; booking flag (`book-ahead` / `walk-up` / `unknown`);
  source URL. One entry, one place — no multi-paragraph essays.
- **Research integrity:** web research is mandatory. No brief is written
  from model memory alone — memory suggests leads; the web confirms them.
  Every factual claim a traveler would act on (hours, prices, lead times,
  closures) carries a source; conflicting sources are presented with dates,
  not silently resolved; uncertainty is stated, never smoothed over.

## The five agents

All five: tools `Read, Grep, Glob, Bash, Write, WebSearch, WebFetch, Skill,
SendMessage` (Write scoped by rule to the trip folder; Bash for slug/folder
handling only — nothing repo-mutating; no Edit, briefs are regenerated whole
on refresh). All five follow the established interaction constraint:
blocking questions returned as the result when ambiguity would materially
change the output; otherwise proceed with a prominent Assumptions list.
None of them commits — trip folders are content, not code.

### gem-scout

Locals-only and off-path finds: neighborhoods, one-room museums, viewpoints
without queues, the bakery worth a detour. Hard rule: nothing that appears
in mainstream top-10 lists for the destination — unless the entry is a
genuinely contrarian angle on a famous place (the unknown entrance, the
hour nobody comes). Writes `gems.md`; flags booking-sensitive finds for the
bookings agent (flag only — no lead-time research).

### mustsee-scout

The popular-but-worth-it canon, ranked by worth-it-ness. Each entry carries
crowd/time advice (when to go, how long it really takes) — and the file
includes a **Skip list**: famous attractions the scout judges not worth the
time, each with a one-line reason. The honest skip verdict is the point of
this agent. Writes `must-sees.md`; flags booking-sensitive entries.

### bookings

Everything that sells out or needs timed entry: how far ahead it really
books out (sourced, not guessed), official-site-vs-reseller warnings,
cancellation windows, free-day and timed-entry tricks. Reads any briefs
already in the trip folder to pick up flagged entries; researches lead
times itself. If trip dates are known, output includes a **book-by
timeline** (sorted soonest-first); if not, lead times are stated relative
("~6 weeks ahead in high season"). Writes `bookings.md`. Owns all
lead-time facts — other agents only flag.

### food

Meal suggestions from street food to book-ahead tables, grouped by
neighborhood and occasion (quick lunch near X, one splurge dinner). Marks
needs-reservation entries with the booking flag but leaves lead-time detail
to the bookings agent — food says what's worth eating, bookings says when
to act. Writes `food.md`.

### concierge

Merges whatever briefs exist in the trip folder into `dossier.md`: loose
sections Must-sees / Hidden gems / Eat / Book-ahead timeline / Practical
notes. Synthesis only: every dossier entry traces to a brief entry — the
concierge never invents content, and cross-brief duplicates are merged with
both sources kept. A missing brief becomes a stated gap ("no food.md — run
the food agent"). Practical notes are assembled from what the briefs
already carry (areas, timing advice), not fresh research.

## Error handling

- Web research unavailable (no network, search tool missing) → say so and
  stop. Never fabricate a brief from memory.
- Destination ambiguous ("Springfield") → blocking question, not a guess.
- Trip folder present but malformed (hand-edited briefs) → work with what
  parses, list what didn't, overwrite only the agent's own file.
- Concierge with an empty trip folder → returns the roster of specialists
  to run instead of an empty dossier.
- Sources conflict on a bookable fact → both stated with dates, flagged in
  the booking flag as `unknown` if unresolved.

## Testing

Smoke runs after install, one small real destination (e.g. Porto):

1. mustsee-scout → `must-sees.md` with ranked entries, crowd advice, a
   non-empty Skip list, all entries carrying source URLs and the header
   block.
2. gem-scout → `gems.md` with no top-10 overlap against the must-sees brief
   (spot-check), booking-sensitive finds flagged.
3. bookings (no dates given) → relative lead times, sourced; with dates →
   book-by timeline.
4. food → grouped suggestions, reservation flags present, no lead-time
   claims.
5. concierge → `dossier.md` merging all four, no invented entries
   (spot-check traceability), gaps stated if a brief is deleted first.
6. Citation check: sample five source URLs across briefs — they resolve and
   support the claim they're attached to.

## Non-goals

- No flight/hotel search, no price tracking, no booking execution — the
  plugin informs bookings, it never makes them.
- No hour-by-hour itineraries; the dossier stays a loose menu.
- No MCP server, no commands, no hooks.
- No maps/geo tooling — neighborhoods are named, not plotted.
