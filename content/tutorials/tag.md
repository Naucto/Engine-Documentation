---
title: Build a Tag Arena
slug: tutorials/tag
lua: tag/main.lua
section: tutorials
order: 4
description: A four-player game of tag where one player is "it" and touching someone passes it on; a tutorial about reacting to net.state changes, mid-game joins and cleanup.
legacy_slugs:
- tutorials/tag.html
---

# Build a Tag Arena

A four-player game of tag: everyone runs around the arena, one player is "it", and touching someone passes it on. This tutorial focuses on playing with **more than two peers**: reacting to [[net.state]] changes with `net.on`, handling players who join mid-game, and cleaning up after players who leave. Do [Pong](/learn/tutorials/pong) and [Coin Rush](/learn/tutorials/click-race) first; the session menu comes from the former and the host-provisioning pattern from the latter, and this tutorial only shows what is new.

The [complete code](#complete-code) is there to compare against when you are done.

## What you will build

- A host/join menu for up to four players
- One coloured square per player; whoever is "it" gets a red ring
- Host-refereed tagging, announced through a `net.state` change listener
- A taunt button using `net.emit`
- Correct behaviour when players join mid-game or leave (even the tagged one)

Everything is drawn with [[gfx.fill_rect]] and [[gfx.rect]]; no sprites needed.

## Step 1: Assemble the known parts

### The menu

The state machine is Pong's: `"menu" | "waiting" | "playing" | "over"`, dispatched from `_update()`. The menu differs only in seats and title:

``` lua
function update_menu()
  if input.key_pressed("h") then
    state   = "waiting"
    is_host = true
    net.host({ max_players = 4, title = "Tag arena" }, on_connected)
  elseif input.key_pressed("j") then
    state   = "waiting"
    is_host = false
    net.join(on_connected)
  end
end
```

`update_waiting()` is the same as in Pong: `m` back to the menu, `h` / `j` re-open the dialog.

### The players

The host provisions every player, as in Coin Rush, minus the `score` field. The first entry has to **create the branch**:

``` lua
function provision_player(playerId)
  local entry = {
    x   = math.random(8, W - 8 - PLAYER_SIZE),
    y   = math.random(8, H - 8 - PLAYER_SIZE),
    col = COLORS[next_color],
  }
  next_color = next_color % #COLORS + 1

  if net.state.players then
    net.state.players[playerId] = entry
  else
    net.state.players = { [playerId] = entry }
  end
end
```

Then `my_player()` returns `net.state.players[net.id()]` (or `nil` while the branch is missing) and `update_movement()` moves it with the arrow keys, clamped to the screen. You will also want an AABB overlap test between two players; Tag defines its own `overlaps(a, b)` (in the [complete code](#complete-code)), the rectangle test explained in [limitations](/learn/reference/limitations).

New locals for this game: `tag_cooldown` (host only) and `taunt_timer`, plus two constants, `IT_SPEED` slightly above `SPEED` (the chaser's reward) and `TAG_COOLDOWN = 60` frames. In `update_movement()`, pick the speed by role:

``` lua
local speed = SPEED
if net.state.it == net.id() then
  speed = IT_SPEED
end
```

## Step 2: Who is "it"

The entire game state specific to Tag is a single shared key, `net.state.it`, the player id of the chaser. The host declares itself "it" at session start (`net.state.it = net.id()`, right after provisioning itself).

The interesting part is how everyone reacts to it. Instead of sending an event when a tag happens, every peer **listens to the key**:

``` lua
net.on("it", function(path, value)
  if value == net.id() then
    print("You are it! Catch someone!")
  else
    print("Player " .. value .. " is it -- run!")
  end
end)
```

State your facts, listen for changes. Compared with announcing tags via `net.emit`, this keeps late joiners correct for free: an event fired before they arrived is gone forever, but the current `it` is right there in their state snapshot.

One detail of the order: the host writes `net.state.it` before it registers this listener, so the host never sees "You are it!" at the start. A listener fires for the writer's own changes too, so from the first tag on the host is announced like everyone else.

### Departures

While you are in `on_connected`, handle departures. With more than two players, cleanup is a real concern, and the departed player might be the chaser:

``` lua
net.on("peer.left", function(playerId)
  net.state.players[playerId] = nil
  if net.state.it == playerId then
    net.state.it = net.id()   -- "it" left: the host takes over
  end
end)
```

Only the host registers this (it owns the players branch); both roles subscribe to `"ended"` as usual.

> [!NOTE]
> Try it
>
> Make "it" visible before testing: in `draw_players()`, ring the entry whose `tonumber(id)` equals `net.state.it` with a red [[gfx.rect]], and draw a red border around the whole arena when it is you. Then run two or three clients: every square moves, and every screen agrees on who wears the ring.

## Step 3: The host referees tags

Who decides a touch happened? If everyone did, two players could disagree by a frame and "it" would flicker. **One referee**, the host, scans for contact and writes the single shared fact; the cooldown stops the tag from bouncing straight back:

``` lua
function update_tagging()
  if tag_cooldown > 0 then
    tag_cooldown = tag_cooldown - 1
    return
  end

  local players = net.state.players
  if not players then
    return
  end

  local it = players[net.state.it]
  if not it then
    return
  end

  for id, p in pairs(players) do
    if tonumber(id) ~= net.state.it and overlaps(it, p) then
      net.state.it = tonumber(id)   -- everyone's "it" listener fires
      tag_cooldown = TAG_COOLDOWN
      break
    end
  end
end
```

Note the familiar details doing their job: string `pairs` keys converted with `tonumber`, and `nil` guards on both the branch and the "it" entry (the chaser might have just disconnected). Call it from `update_playing()` inside the `is_host` branch.

## Step 4: A taunt event

Not everything belongs in `net.state`. A taunt is a one-shot moment with no lasting truth, exactly what `net.emit` is for. On <kbd>Space</kbd>, with a one-second local cooldown so holding the key does not spam:

``` lua
if input.key_pressed(" ") and taunt_timer <= 0 then
  taunt_timer = 60
  net.emit("taunt")
  print("You taunt everyone!")
end
```

Receivers subscribe to `"event:taunt"` in `on_connected` and print who taunted them (the `from` argument). The local `print` next to the emit is the usual reminder that **senders never receive** their own events.

## Step 5: Play with three or four

Wire the remaining glue exactly as in the previous tutorials (winner-less this time: the game just runs), then put the multi-peer claims to the test. Like Coin Rush, Tag keys players by `net.id()`, the account id, so each client needs **its own account**; the NET tab's Test rig would join under yours and share your square. Use other browsers logged in as other accounts, or friends.

1. Host, and in the Host a session dialog switch on **Listed in browse** (it is off by default). The session then appears under PUBLIC in the others' Join a session dialog; without it they need the JOIN CODE.
2. Let one player join after the game has been running: they appear instantly with the right positions and the right "it", the state snapshot doing its job.
3. Close the tab of the player who is "it": the host's `peer.left` removes their square and takes the "it" role back.
4. Close the host's tab instead: everyone else prints "The host closed the session." and returns to the menu.

## How it all fits together

```
Every player                       Host only
---------------------------        -----------------------------
writes own players.<id>.x/y        provisions players (join/mid-game)
net.on("it", ...) announces        removes them on peer.left
net.emit("taunt")  ------->        checks overlap with "it"
draws all players,                 writes net.state.it on a tag
ring around the "it"                 (replicates to everyone)
```

## Complete code

{{lua:main.lua}}

## Extending the example

- Freeze tag: tagged players stop moving until a teammate touches them; store a `frozen` flag per player, written by the host.
- Score by survival: the host counts the frames each player spends not being it in `net.state.players.<id>.score`.
- Obstacles: draw a wall layout with [[gfx.fill_rect]] and block movement against it; keep the layout in constants so every client agrees.
- Round timer: the host counts down in `net.state.time_left`; whoever is "it" at zero loses.
