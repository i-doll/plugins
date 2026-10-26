---
description: Add an item to the top of the todo list, so it is picked up next
argument-hint: <what to do>
allowed-tools: Bash(node:*)
---

Add this item to the top of the todo list by running the command below exactly, with the text unchanged:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/todo.mjs" add-top <<'TODO_ITEM'
$ARGUMENTS
TODO_ITEM
```

Confirm in one line. Don't act on the item now. If you were in the middle of something, carry on with it.
