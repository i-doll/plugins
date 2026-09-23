---
name: post-file
description: Use when uploading a file to share it, getting a link to a document, publishing a report/notes/summary somewhere the user can open, sharing a preview of a built site, prototype or any folder with an index.html, or managing files and sites already posted — "post this", "upload this", "give me a link to this", "share this file", "share a preview of this site", "post this folder", "put this somewhere I can open", "list/delete my posted files". Covers files.th3a.dev and its live previews, and the rule that markdown is published as a designed HTML page rather than uploaded as a .md file.
---

# Posting files to files.th3a.dev

Use the bundled CLI. It reads the bearer token from
`$XDG_CONFIG_HOME/post-file/config.json` (default `~/.config/post-file/config.json`),
so no token is ever passed on a command line:

```sh
node "${CLAUDE_PLUGIN_ROOT}/bin/post-file.mjs" --help
```

If the config is missing, the CLI prints the path and the shape to create. Tell
the user to create it themselves — never write their token to disk for them, and
never pass one as an argument.

## Markdown becomes a page, not a file

**Never post a `.md` file.** It downloads as a file the user has to open in an
editor. Render it to a single self-contained HTML page and post that, so the
link opens as a page.

Before writing that page, invoke the **`frontend-design`** skill. A wall of
unstyled `<p>` tags is a worse answer than the markdown was.

Constraints the service imposes on the page:

- **No JavaScript.** Downloads carry `Content-Security-Policy: sandbox`, so
  scripts silently do nothing.
- **One file.** No external CSS, fonts, or images — nothing else was uploaded.
  Inline the CSS; embed images as `data:` URIs.

If the page really needs scripts or separate asset files, post it as a folder
instead (next section).
- Style both light and dark via `prefers-color-scheme`.

Post it with `--inline`, which sets the content type from the extension and
returns a URL that renders:

```sh
node "${CLAUDE_PLUGIN_ROOT}/bin/post-file.mjs" post report.html --inline
# https://files.th3a.dev/<id>
```

Inline is decided at upload time and baked into the link — an attachment upload
cannot be made inline afterwards, so re-upload if you get it wrong.

Post the raw file unchanged when the user explicitly asks for the source, or
when the markdown is input to another tool rather than something to read.

## Folders become live previews

Post a folder that has an `index.html` at its top level, and it is served as a
working site on its own subdomain. Scripts run, and assets load:

```sh
node "${CLAUDE_PLUGIN_ROOT}/bin/post-file.mjs" post dist
# https://<id>.preview.th3a.dev/
```

Use this for a built site, a prototype, or any HTML page with separate
scripts, styles or images. Point it at the build output (`dist`, `build`,
`out`), not the project root: everything in the folder is uploaded, so a
`node_modules` or `.git` inside it would be too.

- The site is at the root of its own host, so both `assets/app.js` and
  `/assets/app.js` work. Run the build first if the folder is a project.
- `dir/` serves `dir/index.html`. There is no single-page-app fallback: a
  client-side route works only when the page is opened at `/`.
- Limits: 95 MiB unpacked and at most 500 files. Symlinks are refused.
- `--name` sets the display name, which defaults to the folder's name.
  `--type` and `--inline` do not apply to folders.

## Commands

```sh
post <file> [--name N] [--type T] [--inline] [--json]
post <folder> [--name N] [--json]
list [--limit N] [--cursor C]
sites [--limit N] [--cursor C]
get <id> [--out FILE]
meta <id>
delete <id>
```

`post` prints the URL and nothing else, so it pipes. `--json` gives the full
record. Content type comes from the extension unless `--type` overrides it.
`list` shows files and `sites` shows folders. `meta` and `delete` take either
kind of id. Deleting a site removes every file in it.

## What to tell the user

Give them the URL, on its own line so it is easy to click. It is a plain
`https://files.th3a.dev/<uuid>`, or `https://<uuid>.preview.th3a.dev/` for a
folder, and it needs nothing else — no token, no login. Anyone who has it can
open it.

That cuts both ways, so before posting anything with personal details,
credentials, client names, or private conversation, say plainly that the link is
public to whoever holds it and let the user decide. The id is unguessable, so
nobody finds it by accident, but there is no second check behind it and no
expiry — `delete` is the only way to take something down.

Uploads are logged centrally with the filename; reads are not logged. Mention
that too if they are posting something sensitive.

A site that calls a third-party API or loads from a third-party CDN reveals
its preview link to that third party through the `Origin` header. If the
folder is private, say so before posting.

## When something fails

The CLI prints the status and a hint. The ones worth knowing:

- **401** — bad or missing token. Only `post`, `list`, `meta` and `delete` need
  one; `get` and the link itself do not.
- **413** — over 95 MiB, or a folder with more than 500 files.
- **400** — bad filename (no `/`, `\`, control or bidirectional characters) or
  bad content type. For a folder, the message names the problem: no
  `index.html`, a symlink, or an unsafe path.
- **404** — no such file or site.
