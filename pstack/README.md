# pstack (Claude Code port)

A port of [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan,
originally written as a Cursor plugin. MIT licensed; the upstream `LICENSE` ships here
unchanged.

Ported from cursor/plugins at `51a96e0`, upstream plugin version 0.14.1.

## What you actually asked for

Three skills, all typed by hand rather than triggered by Claude:

- **`/bro`** — restate the last message in plain language, no jargon.
- **`/no-comments`** — spawn the Comment Sicko agent over a diff, delete what it
  condemns, fix the code that made the comments necessary, and offer to encode any
  constraint a comment was carrying as a type, test, or lint rule.
- **`/unslop`** — strip AI tells from prose and put voice back. This one Claude also
  applies on its own, since it is meant to touch everything written.

## What came with them

`/no-comments` is not standalone. It spawns an agent and calls three skills, which call
more skills. The full cone is here, 22 skills and one agent:

| | |
| :--- | :--- |
| Entry points | `bro`, `no-comments`, `unslop` |
| Workflow | `architect`, `arena`, `how`, `why`, `interrogate`, `show-me-your-work` |
| Principles | 13 `principle-*` skills, from `fix-root-causes` to `guard-the-context-window` |
| Agent | `comment-sicko` |

Only `how`, `why` and `unslop` are model-invocable. The other 19 carry
`disable-model-invocation: true`, so their descriptions stay out of context until you
type the command.

## What changed in the port

Cursor and Claude Code differ in a few places the skills depend on:

- **Subagents.** Cursor's `Task` tool became the `Agent` tool, `generalPurpose` became
  `general-purpose`, and `subagent_type: "Comment Sicko"` became
  `subagent_type: "pstack:comment-sicko"`.
- **Read-only subagents.** Cursor's `readonly: true` flag has no equivalent, so those
  slots now instruct the subagent not to write instead of sandboxing it.
- **Model pools.** Upstream reads them from `~/.cursor/rules/pstack-models.mdc`. They
  now live in [`models.md`](models.md), overridable at `~/.claude/pstack-models.md`.
  Model slugs became `fable` / `opus` / `sonnet`.
- **MCP discovery.** `/why` enumerated Cursor's `mcps/` directory; it now searches the
  `mcp__<server>__<tool>` namespace with `ToolSearch`.
- **Task lists.** "Open a todolist" became `TaskCreate` / `TaskUpdate`.
- **Transcripts.** `/show-me-your-work` audits its log against `~/.claude/projects/`
  rather than Cursor's transcript directory.

Skill bodies are otherwise upstream's words.

## Two things worth knowing

**Model diversity is thinner here.** `/interrogate` calls model diversity the source of
its adversarial signal, and `/arena` wants a judge from a different family than the
writer. The `Agent` tool offers Claude models only, so both degrade to different tiers
of the same family. `models.md` says where a GPT opinion can be slotted in.

**`/unslop` overlaps `humanizer`.** Both strip AI tells and both can fire on their own.
Unslop is the stricter of the two (no em dashes at all, 31 numbered patterns). Pick one
if the double-invocation gets noisy.

## Requirements

Nothing to install. `/show-me-your-work` ships a bash helper for its decision log, and
`/why` finds more when a source-control, issue-tracker, chat or observability MCP is
connected. It works without them and reports the gaps.
