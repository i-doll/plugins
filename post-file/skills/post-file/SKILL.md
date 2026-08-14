---
name: post-file
description: Use when uploading a file to share it, getting a link to a document, publishing a report/notes/summary somewhere the user can open, or managing files already posted — "post this", "upload this", "give me a link to this", "share this file", "put this somewhere I can open", "list/delete my posted files". Covers files.th3a.dev, and the rule that markdown is published as a designed HTML page rather than uploaded as a .md file.
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
- Style both light and dark via `prefers-color-scheme`.

Post it with `--inline`, which sets the content type from the extension and
returns a URL that renders:

```sh
node "${CLAUDE_PLUGIN_ROOT}/bin/post-file.mjs" post report.html --inline
# https://files.th3a.dev/v1/files/<id>?disposition=inline
```

Inline is decided at upload time — an attachment upload cannot be made inline
afterwards, so re-upload if you get it wrong.

Post the raw file unchanged when the user explicitly asks for the source, or
when the markdown is input to another tool rather than something to read.

## Commands

```sh
post <file> [--name N] [--type T] [--inline] [--json]
list [--limit N] [--cursor C]
get <id> [--out FILE]
meta <id>
delete <id>
```

`post` prints the URL and nothing else, so it pipes. `--json` gives the full
file record. Content type comes from the extension unless `--type` overrides it.

## What to tell the user

Give them the URL. **It needs the bearer token**, so it is not a link they can
just click in a browser — say so rather than implying it is public.

Uploads are logged centrally with the filename; reads are not logged. Mention
that if they are posting something sensitive.

## When something fails

The CLI prints the status and a hint. The ones worth knowing:

- **401** — bad or missing token.
- **413** — over 95 MiB.
- **400** — bad filename (no `/`, `\`, control or bidirectional characters) or
  bad content type.
- **404** — no such file.
