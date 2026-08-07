# travel-team (Claude Code plugin)

Five role agents that plan a trip the way it actually gets used: a loose menu
of things worth seeing, what has to be booked ahead (and by when) to get the
most out of it, and where to eat. Not an hour-by-hour schedule — the trip
stays yours to run.

Follows the house pattern set by `dev-team`: independent specialist agents,
invocable à la carte, sharing one contract skill so their outputs compose.

## What's in here

- **`agents/mustsee-scout.md`** — ranks the popular-but-worth-it canon
  best-first, an argument about order rather than a list, with crowd and
  timing advice on every entry. Publishes an honest **Skip list**: famous
  attractions judged not worth the time, each with a concrete, checkable
  reason. Writes `must-sees.md`; flags booking-sensitive entries and stops
  there — lead times are not its job.
- **`agents/gem-scout.md`** — the locals-only, off-path counterweight. Hard
  rule: **nothing that appears in mainstream top-10 lists for the
  destination**, with one narrow exception for a genuinely contrarian angle
  on a famous place (the entrance nobody uses, the hour nobody comes).
  Writes `gems.md`, grouped by area; flags booking-sensitive finds and
  leaves the lead-time research to bookings.
- **`agents/bookings.md`** — owns every lead-time fact in the trip folder.
  Reads the flags the other specialists left, confirms them, and researches
  past them for what nobody flagged. Branches on whether trip dates are
  known: with dates, a **book-by timeline** sorted soonest-first; without
  them, lead times stated relative to season or day of week ("~6 weeks
  ahead in high season"). Writes `bookings.md`. Never makes a booking.
- **`agents/food.md`** — where to eat across the whole range, from the
  three-stool counter to the table worth planning an evening around,
  grouped by neighborhood and then by occasion. Names one splurge and its
  price band at the top of the file. Marks tables that need a reservation
  with the booking flag and **leaves the timing to bookings** — food says
  what's worth eating, bookings says when to act. Writes `food.md`.
- **`agents/concierge.md`** — synthesis only; the one agent that does no
  research of its own. Merges whatever briefs exist in the trip folder into
  `dossier.md` (Must-sees, Hidden gems, Eat, Book-ahead timeline, Practical
  notes). Every dossier entry traces back to a brief entry — it never
  invents content — and a missing brief becomes a stated gap naming the
  agent that fills it. Run on an empty trip folder, it returns the roster
  of specialists to run instead of an empty dossier.
- **`skills/trip-dossier/`** — the shared contract every agent above invokes
  before touching a trip folder. Fixes the `trips/<destination-slug>/`
  folder convention (the folder *is* the trip; re-running a specialist
  refreshes its brief in place), the five brief filenames (`gems.md`,
  `must-sees.md`, `bookings.md`, `food.md`, `dossier.md`), the dated brief
  header (trip context, an Assumptions block, a `Researched: <date>`
  line), the shared entry shape (name, why go, time, when, area, booking
  flag, source), and the research-integrity rules — sourced claims, no
  brief written from memory alone, conflicting sources presented with
  dates rather than silently resolved.

## Usage

Call any agent on demand:

> Use the mustsee-scout agent to rank what's worth seeing on a five-day trip
> to Porto in October.
>
> Use the gem-scout agent to find what locals actually do in Lisbon that a
> first-timer would never hear about.
>
> Use the bookings agent to check what needs booking ahead for a Kyoto trip
> in April and by when.
>
> Use the food agent to find where to eat in Naples, from a quick lunch to
> one splurge dinner.
>
> Use the concierge agent to pull together the dossier for the Porto trip
> from whatever's in the trip folder so far.

Or chain them into a full trip pass — specialists first, concierge last, so
there's something in the folder for it to merge:

> Use the mustsee-scout, gem-scout, food and bookings agents to research a
> five-day Porto trip in October, then have the concierge agent merge their
> briefs into one dossier.

Each specialist writes its own brief into `trips/<destination-slug>/`
relative to where it's invoked; the concierge reads whatever's there. Run
them in any order or drop any of them — a missing brief just shows up as a
gap in the dossier, not an error.

## Requirements

The four specialists research over the web at runtime (`WebSearch`,
`WebFetch`) — there's no offline mode. The concierge does no research of
its own; it merges what is already in the folder. If web access isn't
available, an agent says so and stops rather than falling back to memory.

## Hard rules for every agent

- **Web research is mandatory.** No brief is ever written from model memory
  alone — memory suggests leads, the web confirms them, and every factual
  claim a traveler would act on carries a source.
- **No agent commits.** Trip folders are content, not code — no `git`
  anything, from any of the five.
- **The plugin informs bookings; it never makes them.** No booking flow, no
  reservation platform, no held slot, no checkout. Bookings tells the
  traveler what to do and by when; they do it.

## Non-goals

- No flight or hotel search, no price tracking, no booking execution.
- No hour-by-hour itineraries — the dossier stays a loose menu, never a
  schedule.
- No MCP server, no commands, no hooks.
- No maps or geo tooling — neighborhoods are named, not plotted.

## Adding more roles

New agents should follow `skills/trip-dossier/SKILL.md` for anything
trip-folder-shaped — the folder convention, brief filenames, header,
entry shape and research-integrity rules are the extension point.
