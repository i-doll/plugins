---
description: Add an item to the top of the todo list, so it is picked up next
argument-hint: <what to do>
allowed-tools: Bash(node:*)
---

Add this item to the top of the todo list by running the command below, with the text unchanged. Replace `TODO_ITEM_XXXX` in both places with `TODO_ITEM_` followed by 16 random hex characters, and check that the delimiter doesn't appear anywhere in the item before you run it:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/todo.mjs" add-top <<'TODO_ITEM_XXXX'
$ARGUMENTS
TODO_ITEM_XXXX
```

Confirm in one line. Don't act on the item now. If you were in the middle of something, carry on with it.
