---
title: Multiplayer
slug: concepts/multiplayer
section: concepts
order: 2
description: The model behind the net API, so that a game played online by several people stays consistent on every screen.
legacy_slugs:
- multiplayer.html
---

# Multiplayer

Naucto games can be played online by several players at once. This page explains the model behind the `net` API and how to test it alone; the function-by-function reference lives in [Networking](/learn/api/net).

## Sessions and the host

A multiplayer game runs inside a **session**. One player creates it with [[net.host]] and becomes the host; the others enter with [[net.join]]. The platform takes care of the whole matchmaking surface, session titles, visibility, invite codes, browsing, through its own dialogs. Your game decides only the capacity and when to call `net.host`, `net.join` and [[net.leave]].

`net.host` takes a table with two keys: `max_players`, the capacity including the host, `2` when left out, and an optional `title`. Players cannot raise the capacity from the dialog.

The host is the session's referee. All shared writes, lock grants and queue operations are **ordered by the host**, which is what keeps every player's view consistent. Give global responsibilities to the host: physics for shared objects, scoring, spawning. And there is no host migration: when the host leaves, the session ends for everyone and each peer's `net.on("ended")` callback fires.

Players connect directly to the host peer to peer, with an automatic relay when a direct connection is impossible. This is invisible to your code.

## Three ways to communicate

The API offers three complementary tools; picking the right one keeps your game simple.

### Shared state

[[net.state]] is a replicated table for anything that **is**: positions, scores, the ball, the world. Write it like a normal table; every peer reads the same values, and late joiners receive the current contents. React to changes with `net.on(pattern, function(path, new_value) … end)`, where `*` in the pattern matches one segment of the path and `**` any number of them.

### Events

[[net.emit]] and `net.on("event:…")` carry one-shot messages for things that **happen**: a serve, a tag, a game start. Events are not stored, a player who joins later never sees past events, so anything that must survive a join belongs in `net.state`. The sender does not receive its own event.

### Locks and queues

[[net.lock]] and [[net.queue]] are coordination objects for when players **compete**: two players grabbing the same coin, or work items that exactly one peer should process. Create one and place it in `net.state` (`net.state.respawns = net.queue()`), then use it from there. Both are ordered by the host, so simultaneous actions are cleanly serialized, and being in `net.state` they obey the same per-path permissions as any other key. A player who leaves releases every lock it held.

## Who writes what

`net.state` is **allow-by-default**: with nothing configured, any peer may read or write any key, and games stay consistent by convention. Each player writes only its own branch, keyed by its player id; the host writes everything global, the ball, the scores, who is "it"; everyone reads everything. When two peers genuinely must write the same key, protect it with `net.lock`.

The membership code below only makes sense **inside the callback** of `net.host` or `net.join`: outside a session, touching `net.state` raises `net: no active session`.

``` lua
function _init()
  net.host({ max_players = 4 }, function()
    -- the first player creates the branch; the others add themselves to it
    local entry = { x = 24, y = 40 }
    if net.state.players then
      net.state.players[net.id()] = entry
    else
      net.state.players = { [net.id()] = entry }
    end
  end)
end
```

From then on, each frame, a player writes only its own keys: `net.state.players[net.id()].x = my_x`.

## Enforcing it: permissions

Convention is enough for a cooperative game, but you can make it a rule. The **NET** tab gives every `net.state` path two flags, enforced by the host at runtime. With W off, only the host may write the path: a client's write is rejected and rolled back, so a player cannot set its own `score` or declare itself the `winner`. With R off, the host keeps the path private and never sends it to clients, in snapshots or live updates, which is what a shuffled deck wants.

Flags inherit from the nearest configured ancestor, and paths you never configure stay open. The host is always the authority. The only way a game learns that a write was refused is `net.on("error", function(path, reason) … end)`, where `reason` is `"forbidden"` for a permission and `"conflict"` for a write that raced another. A lock acquire, a queue push or a queue pop that the permissions refuse fires the same `"error"` with `"forbidden"`. See [Permissions](/learn/tutorials/permissions) for a worked example.

## Session lifecycle

A robust multiplayer game is a small state machine around the session:

{{svg:img/session.svg}}

Points that deserve care:

- `net.host` and `net.join` raise an error only if called while a session is already active; a repeat call made while a dialog is still open is silently ignored. Either way, do not call them every frame: switch state first.
- The success callback is the only signal: if the player cancels the dialog, your game simply stays where it was.
- Outside a session, `net.lock()`, `net.queue()` and `net.leave()` work, and every other `net` function raises `net: no active session`. Gate your network code behind your `"playing"` state.
- `peer.joined` and `peer.left` fire on the host, which is where a joiner's branch is created and a leaver's state cleaned up.
- An error inside a `net` callback (`net.on`, a lock's `acquire`, a queue's `pop`, the host/join callback) does **not** halt the game: it is only printed to the Console as `Error: …`. Read the Console while testing.
- Re-running or reloading the game tears the session down.

## Testing alone

The NET tab is also the test bench. Once the game has called `net.host`, **Spawn a second client** opens a second player on the same machine that joins your session, with a Latency and a Loss slider applied to its outgoing frames; the R and W columns show the permissions of every declared path, and Route says whether the session is direct or relayed. Force a relay refuses the direct path for the next session, to measure what a relayed game costs.

Who can join is shown there too: everyone in the work session can take a player slot, and anyone else needs the invite code from the host dialog, where the host can also list the session publicly.

## Practical constraints

- Shared values are numbers, strings and booleans; nested tables are flattened into their scalar leaves. Functions can never be shared, sent or queued.
- Change events fire on real changes. Writing the same value again is silent, so a state write cannot serve as a ping; use `net.emit` for that.
- `pairs(net.state.players)` yields **string keys**, even for numeric player ids.

Ready to build something? The [pong](/learn/tutorials/pong), [click-race](/learn/tutorials/click-race) and [tag](/learn/tutorials/tag) tutorials each exercise a different part of the API.
