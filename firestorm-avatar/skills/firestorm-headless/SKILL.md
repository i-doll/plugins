---
name: firestorm-headless
description: Use when you need your own Second Life avatar to test something in-world without the user's viewer — LSL/Luau script behaviour, object and inventory behaviour, permissions, RLV — by launching the ID-fork Firestorm viewer with --headless and driving it over its MCP server. Covers launching on a chosen port and grid, logging in from a saved login, waiting for readiness, the script-test loop, cleanup, exit codes, and the rules that keep test output contained.
---

# Testing in-world with a headless Firestorm

`--headless` starts the user's ID-fork Firestorm with no window and no GPU rendering (Mesa
software GL). It logs an avatar in and serves the same MCP tools as the normal viewer, on a port
you choose. You launch it, use it and shut it down yourself. It runs beside the user's own
viewer without touching its settings, cache or MCP port. Linux only.

## Launch

```bash
cd ~/Work/phoenix-firestorm/build-linux-x86_64/newview/packaged
nohup ./firestorm --headless --mcp-port 33830 --grid util.aditi.lindenlab.com \
  --login-name "<saved login>" > /tmp/headless-33830.out 2>&1 &
```

- **Port:** `--mcp-port` is required. Use anything free except 33777, the user's own viewer.
- **Grid:** test on Aditi (`util.aditi.lindenlab.com`) unless the user says otherwise. Ask the
  user which avatar to use if you don't know.
- **Login:** `--login-name` picks a login the user saved in their normal viewer. A bare name gets
  `@<grid>` appended. Never put a password on the command line. On a machine without saved
  logins, set `IDHEADLESS_USERNAME` and `IDHEADLESS_PASSWORD` in the environment instead.
- **Start location:** the avatar logs in at its last location. Add an SLURL argument such as
  `"secondlife://Region%20Name/128/128/30"` to log in somewhere else.
- **One session per avatar.** A second headless launch for the same avatar exits with code 13.

Other flags: `--run-name NAME` names the inventory run folder (default: UTC timestamp),
`--idle-quit SECONDS` (default 900, 0 disables), `--status-file PATH`.

## Wait for ready

Poll `~/.firestorm_x64_headless/<port>/headless-status.json`. Its `state` goes `starting` →
`logging_in` → `cleaning_up` → `ready`, which takes about 40 s. Connect only on `ready`. On
`failed` the process has exited and `error` says why. The file also carries `region`,
`run_folder_id`, `rlv_run_folder_id` and a `cleanup` report.

| Exit | Meaning |
|---|---|
| 0 | Clean quit |
| 10 | Startup failure, or not ready within 300 s |
| 11 | MCP port already in use |
| 12 | Login failed (unknown saved login, bad password, TOS, MFA, grid down) |
| 13 | This avatar is already running headless |
| 14 | Disconnected from the grid after login |

## Talk to it

The firestorm MCP server in this plugin points at port 33777, so reach the headless viewer over
HTTP directly:

```bash
curl -s -N -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"ping","arguments":{}}}' \
  http://127.0.0.1:33830/mcp
```

Slow tools stream their answer as a `data: {...}` SSE line. `{"method":"tools/list"}` lists every
tool with its schema. The tools behave as in `MCP_TOOLS.md` and the `firestorm-avatar` skill,
including RLV enforcement. Two tools exist only in headless: `viewer.quit` and
`headless.getSession` (run name, run folder ids, and the ledger of objects this session rezzed).

## Script-test loop

1. `inventory.createItem {"name":"t1","type":"script"}`. With no `parent`, it lands in the run
   folder.
2. `script.write {"item_id":…, "target":"mono"|"lsl2"|"luau"|"lsl-luau", "text":"…"}`. The reply
   says whether it compiled, with the errors if not.
3. `object.create {"shape":"box"}` to get a prim to hold it.
4. `chat.listen {"channel":7777,"seconds":120}` before the script starts talking.
5. `object.addContents {"object_id":…, "item_ids":[…]}`. The script starts running.
6. `chat.replies {"channel":7777}` returns what the script said.

Have the script report with `llSay` on a non-zero channel; `llOwnerSay` isn't captured. Delay the
first output with a short `llSetTimerEvent` so the listener is in place. Encode values so nothing
is lost, for example wrap each one in `[…]` so leading and trailing spaces show. Use a new script
item for each test.

## Cleanup and containment

- Every object you rez or create through MCP goes on a ledger. `viewer.quit` deletes them all,
  then logs out and exits 0. SIGTERM and the idle timeout do the same. After a crash, the next
  launch of that avatar deletes the leftovers before `ready`.
- `"keep":true` on `object.create` or `object.rez` leaves that object in-world.
  `"temporary":true` makes the region delete it about a minute after rezzing.
- A linkset that mixes ledger and non-ledger prims is never deleted. It is reported under
  `cleanup.mixed`, and so are objects in another region under `cleanup.unresolved`. Clean those up
  yourself.
- Inventory you create goes under `Headless Tests/<run>/` and stays after the run. Destinations
  outside that folder (or `#RLV/Headless Tests/<run>/` for RLV shared-folder tests) are refused.
- End every session with `viewer.quit` and check the status file's `cleanup` report.

## Limits

- Snapshots (`vision.snapshot`) work but are rendered on the CPU: untextured and slow.
- Logs are in `~/.firestorm_x64_headless/<port>/logs/Firestorm.log`. If headless itself
  misbehaves, stop and report it to the user with the status file and the log. Don't modify or
  build the viewer.
