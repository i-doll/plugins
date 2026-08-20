# pstack model pools

Skills in this plugin fan work out to subagents and want different models on different
slots. Upstream pstack reads these pools from `~/.cursor/rules/pstack-models.mdc`. This
port reads them from here, and from `~/.claude/pstack-models.md` if that file exists,
which wins.

The `model` field on the `Agent` tool accepts `fable`, `opus`, `sonnet`, and `haiku`.
Omit it to inherit the session's model.

| Pool | Default | Why |
| :--- | :--- | :--- |
| `arena runners` | `fable`, `opus`, `sonnet` | Three shapes from three tiers, then synthesize |
| `arena cross-judge pool` | `fable`, `opus`, `sonnet` | Judge on a different model than the one that wrote |
| `architect runners` | `fable`, `opus`, `sonnet` | Design work, taste matters |
| `how explorers` | `sonnet` | Search and trace, high volume, low judgment |
| `how explainer` | `fable` | The reader-facing artifact |
| `how critics` | `fable`, `opus`, `sonnet` | Independent architecture critique |
| `interrogate reviewers` | `fable`, `opus`, `sonnet` | Adversarial review, diversity is the point |
| `why investigators` | `sonnet` | Query one source, report what it says |
| `why synthesizer` | `fable` | Calibrates confidence across contradictory evidence |

## What the port loses

Upstream fans these slots across model *families* (Claude, GPT, Grok), and several
skills lean on that: interrogate calls model diversity the source of its adversarial
signal, and arena wants the judge in a different family from the writer. The `Agent`
tool offers Claude models only, so family diversity degrades to tier diversity here.
Same prompt, three reasoning levels, correlated blind spots.

Where a genuinely independent read matters, the `codex:codex-rescue` agent runs on GPT
through the Codex CLI and can take one reviewer or judge slot. It is Bash-only and
built for rescue work, so treat it as one extra opinion, not a drop-in runner.

Never use `haiku` for these slots.
