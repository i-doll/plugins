#!/usr/bin/env node
// CLI for files.th3a.dev. The token comes from a config file, never argv.
import { readFile, writeFile, stat } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { spawn } from 'node:child_process';

const die = (message) => { console.error(message); process.exit(1); };

const CONFIG_DIR = join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), 'post-file');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

async function config() {
  try {
    const raw = await readFile(CONFIG_PATH, 'utf8');
    const mode = (await stat(CONFIG_PATH)).mode & 0o077;
    if (mode) console.error(`warning: ${CONFIG_PATH} is readable by other users (chmod 600 it)`);
    return JSON.parse(raw);
  } catch (cause) {
    if (cause.code === 'ENOENT') return {};
    if (cause instanceof SyntaxError) die(`${CONFIG_PATH} is not valid JSON`);
    throw cause;
  }
}

const settings = await config();
const BASE = process.env.POST_FILE_URL ?? settings.url ?? 'https://files.th3a.dev';
const TOKEN = process.env.POST_FILE_TOKEN ?? settings.token;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json',
  '.csv': 'text/csv; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.zip': 'application/zip',
};

function flag(args, name) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const value = args[i + 1];
  args.splice(i, value === undefined ? 1 : 2);
  return value ?? true;
}

// `auth: false` is for the share link, which is public: reading a file needs
// only its id, so `get` works on a machine that has no token configured.
// `missing: true` returns null on a 404 instead of exiting, for commands that
// try a file id and then a site id.
async function call(path, { auth = true, missing = false, ...init } = {}) {
  if (auth && !TOKEN) die(`No token. Create ${CONFIG_PATH}:\n\n  { "token": "…" }\n\nthen: chmod 600 ${CONFIG_PATH}`);
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { ...(auth ? { Authorization: `Bearer ${TOKEN}` } : {}), ...init.headers },
    });
  } catch (cause) {
    die(`Cannot reach ${BASE}: ${cause.message}`);
  }
  if (response.ok) return response;
  if (missing && response.status === 404) return null;

  const body = await response.text().catch(() => '');
  let detail = body.slice(0, 200);
  try { detail = JSON.parse(body).error.message; } catch {}
  const hint = {
    401: `Check the token in ${CONFIG_PATH}.`,
    405: 'Wrong route for that verb — this is a bug in the CLI, please report it.',
    411: 'Body length was not known — this is a bug in the CLI, please report it.',
    413: 'Over the service limit: 95 MiB, and at most 500 files in a folder.',
    404: 'No such file or site.',
  }[response.status];
  die(`${response.status} ${detail}${hint ? `\n${hint}` : ''}`);
}

// Packs a folder with the system tar. COPYFILE_DISABLE keeps macOS from adding
// `._` resource-fork files beside anything with extended attributes.
function pack(dir) {
  return new Promise((done, fail) => {
    const tar = spawn('tar', ['-C', dir, '-czf', '-', '.'], {
      env: { ...process.env, COPYFILE_DISABLE: '1' },
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    const chunks = [];
    tar.stdout.on('data', (chunk) => chunks.push(chunk));
    tar.on('error', fail);
    tar.on('close', (code) => (code === 0 ? done(Buffer.concat(chunks)) : fail(new Error(`tar exited with ${code}`))));
  });
}

async function postFolder(dir, { name, json }) {
  await stat(join(dir, 'index.html')).catch(() => die(`${dir} has no index.html at its top level. Post the folder that contains it.`));
  const archive = await pack(dir).catch((cause) => die(`Cannot pack ${dir}: ${cause.message}`));
  const response = await call('/v1/sites', {
    method: 'POST',
    body: archive,
    headers: { 'Content-Type': 'application/gzip', 'X-Site-Name': name ?? basename(resolve(dir)) },
  });
  const { site } = await response.json();
  if (json) return console.log(JSON.stringify(site, null, 2));
  console.log(site.url);
}

async function post(args) {
  const name = flag(args, 'name');
  const type = flag(args, 'type');
  const inline = Boolean(flag(args, 'inline'));
  const json = Boolean(flag(args, 'json'));
  const file = args[0];
  if (!file) die('usage: post-file post <file|folder> [--name N] [--type T] [--inline] [--json]');

  const info = await stat(file).catch(() => die(`Cannot read ${file}`));
  if (info.isDirectory()) {
    if (type || inline) die('--type and --inline apply to single files. A folder is always served as a live site.');
    return postFolder(file, { name, json });
  }

  const bytes = await readFile(file).catch(() => die(`Cannot read ${file}`));
  const filename = name ?? basename(file);
  const contentType = type ?? TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';

  if (/^text\/markdown/.test(contentType)) {
    console.error('note: markdown posts as a downloadable file. Render it to HTML and post that to get a link that opens as a page.');
  }

  const response = await call('/v1/files', {
    method: 'POST',
    body: bytes,
    headers: {
      'Content-Type': contentType,
      'X-Filename': filename,
      ...(inline ? { 'X-Content-Disposition': 'inline' } : {}),
    },
  });

  const { file: uploaded } = await response.json();
  if (json) return console.log(JSON.stringify(uploaded, null, 2));
  // `url` is the whole link: a bare id, public, no query string. Whether it
  // renders or downloads was decided by --inline at upload time.
  console.log(uploaded.url);
}

async function list(args) {
  const limit = flag(args, 'limit');
  const cursor = flag(args, 'cursor');
  const query = new URLSearchParams();
  if (limit) query.set('limit', String(limit));
  if (cursor) query.set('cursor', String(cursor));
  const { files, cursor: next } = await (await call(`/v1/files?${query}`)).json();

  if (!files.length) return console.log('No files.');
  for (const f of files) console.log(`${f.id}  ${String(f.size).padStart(9)}  ${f.created_at}  ${f.filename}`);
  if (next) console.log(`\nMore: --cursor ${next}`);
}

async function sites(args) {
  const limit = flag(args, 'limit');
  const cursor = flag(args, 'cursor');
  const query = new URLSearchParams();
  if (limit) query.set('limit', String(limit));
  if (cursor) query.set('cursor', String(cursor));
  const { sites: found, cursor: next } = await (await call(`/v1/sites?${query}`)).json();

  if (!found.length) return console.log('No sites.');
  for (const s of found) console.log(`${s.id}  ${String(s.size).padStart(9)}  ${String(s.file_count).padStart(4)} files  ${s.created_at}  ${s.name}`);
  if (next) console.log(`\nMore: --cursor ${next}`);
}

async function get(args) {
  const out = flag(args, 'out');
  const id = args[0];
  if (!id) die('usage: post-file get <id> [--out FILE]');
  const response = await call(`/${id}`, { auth: false });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!out) return process.stdout.write(bytes);
  await writeFile(out, bytes);
  console.log(`Wrote ${out} (${bytes.length} bytes)`);
}

async function meta(args) {
  const id = args[0];
  if (!id) die('usage: post-file meta <id>');
  const asFile = await call(`/v1/files/${id}/metadata`, { missing: true });
  const body = await (asFile ?? await call(`/v1/sites/${id}/metadata`)).json();
  console.log(JSON.stringify(body.file ?? body.site, null, 2));
}

async function remove(args) {
  const id = args[0];
  if (!id) die('usage: post-file delete <id>');
  const deleted = await call(`/v1/files/${id}`, { method: 'DELETE', missing: true });
  if (!deleted) await call(`/v1/sites/${id}`, { method: 'DELETE' });
  console.log(`Deleted ${id}`);
}

const commands = { post, upload: post, list, ls: list, sites, get, meta, delete: remove, rm: remove };

const [command, ...rest] = process.argv.slice(2);
if (!command || command === '--help' || command === '-h') {
  console.log(`post-file — upload to ${BASE}

  post <file> [--name N] [--type T] [--inline] [--json]
  post <folder> [--name N] [--json]    folder with index.html, served as a live site
  list [--limit N] [--cursor C]
  sites [--limit N] [--cursor C]
  get <id> [--out FILE]
  meta <id>
  delete <id>

Token from ${CONFIG_PATH}: { "token": "…", "url": "…" }
POST_FILE_TOKEN and POST_FILE_URL override it.`);
  process.exit(command ? 0 : 1);
}
if (!commands[command]) die(`Unknown command: ${command}`);
await commands[command](rest);
