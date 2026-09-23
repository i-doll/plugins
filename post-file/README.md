# post-file

Upload files to [files.th3a.dev](https://github.com/i-doll/post-file) and get a link back —
a bare `https://files.th3a.dev/<uuid>` that anyone can open, no token needed.
Posting takes the token; reading does not, so treat every link as public to
whoever holds it. `delete` is the only way to unpublish.

Markdown is rendered to a designed, self-contained HTML page (via the
`frontend-design` skill) and posted as `text/html` with inline disposition, so
the link opens as a page rather than downloading as a `.md`.

A folder with an `index.html` posts as a live site on its own subdomain, with
its scripts and assets working.

## Setup

```sh
mkdir -p ~/.config/post-file
printf '{ "token": "…" }' > ~/.config/post-file/config.json
chmod 600 ~/.config/post-file/config.json
```

`POST_FILE_TOKEN` and `POST_FILE_URL` override the config file.

```sh
node bin/post-file.mjs post report.html --inline
node bin/post-file.mjs post dist    # a folder with index.html → https://<id>.preview.th3a.dev/
```
