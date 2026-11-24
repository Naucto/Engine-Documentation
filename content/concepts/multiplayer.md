---
title: Multiplayer
slug: concepts/multiplayer
section: concepts
order: 2
description: The model behind the net API, so that a game played online by several people stays consistent on every screen.
---

# Multiplayer

Naucto games can be played online by several players at once. This page explains the model behind the `net` API and how to test it alone; the function-by-function reference lives in [Networking](/learn/api/net).

Two words are used throughout: a player is a person, and a **peer** is one machine in the session, the host's included. The rest of the vocabulary is in the [Glossary](/learn/reference/glossary).

## Sessions and the host

A multiplayer game runs inside a **session**. One player creates it with [[net.host]] and becomes the host; the others enter with [[net.join]]. The platform takes care of the whole matchmaking surface, session titles, visibility, invite codes, browsing, through its own dialogs. Your game decides only the capacity and when to call `net.host`, `net.join` and [[net.leave]].

`net.host` takes a table with three keys: `max_players`, the capacity including the host, `2` when left out, an optional `title`, and `listed = true` for a session that is in the public list from the start. Players cannot raise the capacity from the dialog.

The host is the session's referee. All shared writes, lock grants and queue operations are **ordered by the host**, which is what keeps every peer's view consistent. Give global responsibilities to the host: physics for shared objects, scoring, spawning.

There is no host migration, no handing of the host's role to another peer when the host leaves: the session ends for everyone, and each peer's `net.on("ended")` callback fires.

Peers connect directly to the host, with an automatic **relay** when a direct connection is impossible: a server in the middle that passes the traffic on. This is invisible to your code.

## Three ways to communicate

The API offers three complementary tools; picking the right one keeps your game simple.

### Shared state

[[net.state]] is a replicated table, one every peer holds a copy of, for anything that **is**: positions, scores, the ball, the world. Write it like a normal table; every peer reads the same values, and a player who joins later receives a snapshot, the current contents, on arrival.

A **path** is the address of a value in that table, written with dots: `net.state.players[3].x` is the path `players.3.x`, and each word between the dots is a segment. That is how the NET tab lists what the game shares, one row per path, and what the patterns of [[net.on]] name. React to changes with `net.on(pattern, function(path, new_value) … end)`, where `*` in the pattern matches one segment and `**` any number of them: `"players.*.x"` fires for every player's `x`.

### Events

[[net.emit]] and `net.on("event:…")` carry one-shot messages for things that **happen**: a serve, a tag, a game start. Events are not stored, a player who joins later never sees past events, so anything that must survive a join belongs in `net.state`. The sender does not receive its own event.

### Locks and queues

[[net.lock]] and [[net.queue]] are coordination objects for when players **compete**: two players grabbing the same coin, or work items that exactly one peer should process. Create one and place it in `net.state` (`net.state.respawns = net.queue()`), then use it from there. Both are ordered by the host, so simultaneous actions are cleanly serialized, and being in `net.state` they obey the same per-path permissions as any other key. A player who leaves releases every lock it held.

## Who writes what

`net.state` is **allow-by-default**: with nothing configured, any peer may read or write any key, and games stay consistent by convention. Each player writes only its own branch, keyed by its player id; the host writes everything global, the ball, the scores, who is "it"; everyone reads everything. When two peers genuinely must write the same key, protect it with `net.lock`.

The **callback** is the function you hand to `net.host` or `net.join`, and it runs once the session exists; only inside it, or later while the session runs, may the game touch `net.state`: outside a session, that raises `net: no active session`.

One strategy, used by every netplay tutorial: the host creates the `players` branch with its own entry, and gives every newcomer an entry when `peer.joined` fires, which it does on the host only. A player who joins has nothing to create; its callback only switches state.

``` lua
local function new_entry()
  return { x = 24, y = 40 }
end

function host_game()
  net.host({ max_players = 4 }, function()
    net.state.players = { [net.id()] = new_entry() }
    net.on("peer.joined", function(id)
      net.state.players[id] = new_entry()      -- the host provisions the newcomer
    end)
    net.on("peer.left", function(id)
      net.state.players[id] = nil
    end)
    state = "playing"
  end)
end

function join_game()
  net.join(function()
    state = "playing"                           -- the host has made my branch
  end)
end
```

From then on, each step, a player writes only its own keys: `net.state.players[net.id()].x = my_x`.

## Enforcing it: permissions

Convention is enough for a cooperative game, but you can make it a rule. The **NET** tab gives every `net.state` path two flags, Read and Write, enforced by the host at runtime, and you set them before anything runs. With Write off, only the host may write the path: a write from another peer is rejected and rolled back, so a player cannot set its own `score` or declare itself the `winner`. With Read off, the host keeps the path private and never sends it to the other peers, in the snapshot or live updates, which is what a shuffled deck wants.

A path takes the rule of its nearest ancestor that has one, and a path no rule reaches stays open. Declaring a path in the NET tab does not give it a rule: it follows its parent until you tick Read or Write on it. The host is always the authority. The only way a game learns that a write was refused is `net.on("error", function(path, reason) … end)`, where `reason` is `"forbidden"` for a permission and `"conflict"` for a write that raced another. A lock acquire, a queue push or a queue pop that the permissions refuse fires the same `"error"` with `"forbidden"`. See [Permissions](/learn/tutorials/permissions) for a worked example.

## Session lifecycle

A robust multiplayer game is a small state machine around the session:

{{svg:img/session.svg}}

Points that deserve care:

- `net.host` and `net.join` raise an error only if called while a session is already active; a repeat call made while a dialog is still open is silently ignored. Either way, do not call them every step: switch state first.
- The callback is the only signal: if the player cancels the dialog, nothing fires and your game stays in `"waiting"`. Give that state a way back to `"menu"`, a key the player can press, or switch to `"waiting"` only inside the callback, so a cancelled dialog leaves the game where it was.
- Outside a session, `net.lock()`, `net.queue()`, `net.leave()` and `net.invite()` work, and every other `net` function raises `net: no active session`. Gate your network code behind your `"playing"` state.
- `peer.joined` and `peer.left` fire on the host only: that is where a newcomer's branch is created and a leaver's state cleaned up, as above.
- An error inside a `net` callback (`net.on`, a lock's `acquire`, a queue's `pop`, the host or join callback) does **not** halt the game: it is only printed to the Console as `Error: …`. Read the Console while testing.
- Re-running or reloading the game tears the session down.

## Opened on a session

A player does not always arrive through your menu. The hub's Join, a friend's open slot and an invitation all open the game's page **on a session**: the page names it above the screen, and [[net.invite]] hands it to the game as a table with its `title`, its `host`, `players` and `max_players`, or `nil` when the game was opened on its own.

Check it in `_init`, and join at once instead of showing the menu. `net.join` then enters that session without its dialog:

``` lua
local state = "menu"

local function on_connected()
  state = "playing"
end

function _init()
  if net.invite() then
    net.join(on_connected)
  end
end
```

A game that never reads `net.invite` is served too: the join its own menu offers enters the session the player came for. A session that has ended, is full or is not open to the player says so, and the usual join dialog opens in its place.

The invite lasts as long as the visit. A restart finds it again, so the game goes back in; once the player has left the session, `net.invite()` is `nil` and `net.join` asks which session, as it always did.

## Testing alone

The NET tab is also the test bench. Once your game has called `net.host`, **Spawn a second client** in the DEBUG drawer of its SESSION column opens a second copy of the game as a small screen inside that drawer, on this machine, playing under an id of its own. That copy is opened on your session, as an invited player's is, and starts at `_init` like any run. A game that joins from `_init` when `net.invite()` answers is in at once; any other has to reach `net.join()` through its own menu: click its screen to give it the keyboard, then press the key your menu uses to join. The drawer says `Waiting for this client to call net.join()` until then.

Latency and Loss sliders degrade that client's outgoing traffic, and Route says whether the session is direct or relayed; the RULES table shows, beside the Read and Write of every path, what the session holds there and who owns it. Force a relay refuses the direct path for the next session, to measure what a relayed game costs.

Two things to do first, because you leave the CODE tab to use the rig:

- **Pop the viewer out** with the button at the top of the console column, so your own game keeps running while you are on NET; docked, it pauses there, and the host with it.
- **Turn Auto off**. With Auto on, an edit reruns the game, and rerunning ends the session.

Who can join is shown there too: everyone in the work session can take a player slot, and anyone else needs the invite code from the host dialog, where the host can also list the session publicly.

## Practical constraints

- Shared values are numbers, strings and booleans; nested tables are flattened into their scalar leaves. Functions can never be shared, sent or queued.
- Change events fire on real changes. Writing the same value again is silent, so a state write cannot serve as a ping; use `net.emit` for that.
- `pairs(net.state.players)` yields **string keys**, even for numeric player ids.

Ready to build something? The [pong](/learn/tutorials/pong), [click-race](/learn/tutorials/click-race) and [tag](/learn/tutorials/tag) tutorials each exercise a different part of the API.
