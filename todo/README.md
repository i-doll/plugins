# todo

Queue work for an agent to pick up after its current task, without interrupting it.

```
/plugin install todo --marketplace i-doll/plugins
```

| Command | Does |
|---|---|
| `/todo:add <item>` | Adds the item to the bottom of the list. |
| `/todo:add-top <item>` | Adds the item to the top, so it's picked up next. |
| `/todo:list` | Shows the list. |

The list is `.claude/todo.md` at the root of the git repo, or in the current folder outside one. The first add creates it, and in a git repo also adds it to `.git/info/exclude`, so it stays out of commits without changing `.gitignore`.

The plugin ignores a list that is tracked by git or is a symlink, since a repository could ship one to hand the agent its own instructions.

A Stop hook reads the list each time the agent finishes. If there's an item, it hands the agent the top one, and the agent deletes the entry once it's done. This repeats until the list is empty. If the agent stopped to ask you something, the top item stays where it is and the agent stops as usual.

You can edit the file by hand. Each item is a `- ` line, and indented lines below it belong to the same item.
