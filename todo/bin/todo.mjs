#!/usr/bin/env node
import { readFile, writeFile, mkdir, appendFile, lstat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const die = (message) => { console.error(message); process.exit(1); };

const HEADER = '# Todo\n\nItems to pick up once the current task is done. The top item goes first.\n';
const ENTRY = '.claude/todo.md';

function git(cwd, ...args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

const rootOf = (cwd) => git(cwd, 'rev-parse', '--show-toplevel') ?? cwd;

async function read(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (cause) {
    if (cause.code === 'ENOENT') return null;
    throw cause;
  }
}

async function untrusted(root) {
  for (const part of ['.claude', ENTRY]) {
    const info = await lstat(join(root, part)).catch(() => null);
    if (info?.isSymbolicLink()) return `${part} is a symlink`;
  }
  if (git(root, 'ls-files', '--error-unmatch', ENTRY) !== null) return `${ENTRY} is tracked by git, so it came with the repository`;
  return null;
}

async function ignore(cwd) {
  const exclude = git(cwd, 'rev-parse', '--path-format=absolute', '--git-path', 'info/exclude');
  if (!exclude) return;
  if (git(cwd, 'check-ignore', '-q', ENTRY) !== null) return;
  const current = (await read(exclude)) ?? '';
  await mkdir(dirname(exclude), { recursive: true });
  await appendFile(exclude, `${current && !current.endsWith('\n') ? '\n' : ''}/${ENTRY}\n`);
}

function items(text) {
  const lines = text.split('\n');
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('- ')) continue;
    let end = i + 1;
    while (end < lines.length && lines[end].startsWith('  ')) end++;
    found.push({ start: i, end, text: lines.slice(i, end).join('\n') });
  }
  return found;
}

function format(input) {
  const lines = input.trim().split('\n').map((line) => line.trimEnd());
  return [`- ${lines[0]}`, ...lines.slice(1).map((line) => (line ? `  ${line}` : '  '))].join('\n');
}

async function stdin() {
  if (process.stdin.isTTY) return '';
  process.stdin.setEncoding('utf8');
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

async function add(cwd, top) {
  const input = (process.argv.slice(3).join(' ') || await stdin()).trim();
  if (!input) die('Nothing to add: pass the item as arguments or on stdin.');
  const root = rootOf(cwd);
  const path = join(root, ENTRY);
  const problem = await untrusted(root);
  if (problem) die(`Not using the todo list: ${problem}.`);
  let text = await read(path);
  if (text === null) {
    await mkdir(dirname(path), { recursive: true });
    await ignore(root);
    text = HEADER;
  }
  const entry = format(input);
  const existing = items(text);
  const lines = text.replace(/\n*$/, '').split('\n');
  if (top && existing.length) lines.splice(existing[0].start, 0, entry);
  else lines.push(...(existing.length ? [] : ['']), entry);
  await writeFile(path, `${lines.join('\n')}\n`);
  const count = existing.length + 1;
  console.log(`Added to ${top ? 'the top of ' : ''}${relative(cwd, path) || path} (${count} item${count === 1 ? '' : 's'}).`);
}

async function list(cwd) {
  const root = rootOf(cwd);
  const problem = await untrusted(root);
  if (problem) die(`Not using the todo list: ${problem}.`);
  const text = await read(join(root, ENTRY));
  const found = text === null ? [] : items(text);
  if (!found.length) return console.log('The todo list is empty.');
  console.log(found.map((item, n) => item.text.replace(/^- /, `${n + 1}. `)).join('\n'));
}

async function stop() {
  const event = JSON.parse(await stdin() || '{}');
  const cwd = event.cwd ?? process.cwd();
  const root = rootOf(cwd);
  if (await untrusted(root)) return;
  const path = join(root, ENTRY);
  const text = await read(path);
  const queue = text === null ? [] : items(text);
  const next = queue[0];
  const marker = join(tmpdir(), `claude-todo-${(event.session_id ?? 'default').replace(/[^\w-]/g, '')}`);
  if (!next) return;
  const state = `${queue.length}\n${next.text}`;
  if (event.stop_hook_active && (await read(marker)) === state) return;
  await writeFile(marker, state);
  const reason = [
    `The todo list at ${path} has items waiting. If you stopped to ask the user something, or your current task isn't finished, stop now and leave the list alone.`,
    'Otherwise take the top item now:',
    '',
    next.text,
    '',
    'Delete its entry from the file once it is done, then stop as usual.',
  ].join('\n');
  console.log(JSON.stringify({ decision: 'block', reason }));
}

const cwd = process.cwd();
const command = process.argv[2];
if (command === 'add') await add(cwd, false);
else if (command === 'add-top') await add(cwd, true);
else if (command === 'list') await list(cwd);
else if (command === 'stop-hook') await stop();
else die('usage: todo.mjs add|add-top <item> | list | stop-hook');
