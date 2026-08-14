# post-file

Upload files to [files.th3a.dev](https://github.com/i-doll/post-file) and get a link back.

Markdown is rendered to a designed, self-contained HTML page (via the
`frontend-design` skill) and posted as `text/html` with inline disposition, so
the link opens as a page rather than downloading as a `.md`.

## Setup

```sh
mkdir -p ~/.config/post-file
printf '{ "token": "…" }' > ~/.config/post-file/config.json
chmod 600 ~/.config/post-file/config.json
```

`POST_FILE_TOKEN` and `POST_FILE_URL` override the config file.

```sh
node bin/post-file.mjs post report.html --inline
```
