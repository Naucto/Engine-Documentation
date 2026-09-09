---
title: Build a Coin Rush
slug: tutorials/click-race
lua: click-race/main.lua
section: tutorials
order: 3
description: 'Up to four players race to collect coins scattered on the screen --
  first to ten wins. When two players touch the same coin on the same frame, only
  one may get the point: this tutorial is all about ne'
legacy_slugs:
- tutorials/click-race.html
---

# Build a Coin Rush

Up to four players race to collect coins scattered on the screen -- first to ten wins. When two players touch the same coin on the same frame, only one may get the point: this tutorial is all about [[net.lock]] (settling races fairly) and [[net.queue]] (feeding respawn work to the host). Do the [pong](/learn/tutorials/pong) tutorial first -- this one builds on its session menu and moves faster over everything the two games share.

As in the Pong tutorial, each step teaches an idea and shows only the lines that carry it; the [complete code](#complete-code) is there to compare against when you are done.

## What you will build

- A host/join menu for up to **four** players
- One colored square per player, moved with the arrow keys
- Coins that only **one** player can collect, no matter how simultaneous the grab -- each coin carries a lock in `net.state` (`net.lock`)
- A respawn work queue in `net.state`, processed by the host (`net.queue`)
- Per-player scores and a first-to-ten win

Everything is drawn with [[gfx.fill_rect]] and [[gfx.rect]] -- no sprites needed.

## Step 1: Reuse the session menu

Start from the state machine and menu you built in Pong (Steps 1--2 there): the same `"menu" | "waiting" | "playing" | "over"` dispatch, the same `update_menu` / `update_waiting` pair. Only the host call changes -- more seats, different title:

``` lua
net.host({ max_players = 4, title = "Coin rush" }, on_connected)
```

This game needs three extra locals next to `state` and `is_host`, all explained as they come up: `next_color` (host only), `respawn_timer` (host only), and `claiming` (a table, one entry per coin we are currently trying to grab). Reset all of them in `_init()`.

Constants worth settling now: `COIN_COUNT = 5`, `WIN_SCORE = 10`, `RESPAWN_DELAY = 120` (two seconds at 60 FPS), an 8-pixel player, a 4-pixel coin, and a `COLORS` list with one palette color per possible player -- four entries.

## Step 2: The host provisions every player

In Pong each player wrote its own paddle from the start. With four players and host-assigned colors it is cleaner to flip the pattern: **the host creates each player's entry** (spawn position, color, score `0`) -- for itself at session start, and for the others from `peer.joined`. A joiner simply waits until its entry appears, then starts moving it. Mid-game joins need no special code at all: the late joiner receives the full current state, and the host's `peer.joined` gives them a square like everyone else.

The provisioning function is where the `net.state` empty-branch rule bites, so this one is worth copying exactly:

``` lua
-- A net.state branch only exists once it holds a value, so the first
-- player entry must create the branch itself
if net.state.players then
  net.state.players[playerId] = entry
else
  net.state.players = { [playerId] = entry }
end
```

Build `provision_player(playerId)` around it: construct `entry` with a random position, `score = 0`, and `col = COLORS[next_color]`, advancing `next_color` with wrap-around (`next_color % #COLORS + 1`).

The host's part of `on_connected` then reads like a checklist: provision yourself, create the coins, create the respawn queue, subscribe to `peer.joined` (provision them) and `peer.left` (delete `net.state.players[playerId]`). For the coins, build a plain local table of `COIN_COUNT` entries -- each with a random position, `taken = false`, and its own `lock = net.lock()` -- and assign it to `net.state.coins` in one go. A `new_coin()` helper that returns one such entry keeps this tidy and gets reused on respawn:

``` lua
function new_coin()
  return {
    x     = math.random(8, W - 8 - COIN_SIZE),
    y     = math.random(8, H - 8 - COIN_SIZE),
    taken = false,
    lock  = net.lock(),   -- each coin guards itself; see Step 4
  }
end
```

Create the respawn queue in the same place, with `net.state.respawns = net.queue()` -- a queue lives in `net.state` just like the coins do. Both roles subscribe to `"ended"` and switch to `"playing"`, as in Pong.

> [!NOTE]
> Collected coins will be *marked* `taken` rather than deleted. Keeping all `COIN_COUNT` entries alive means the `coins` branch always exists and every index stays valid -- one less `nil` case everywhere else in the game. Each coin's `lock` sits right beside the `taken` flag it protects.

## Step 3: Moving your square

Movement is Pong's paddle logic on two axes, applied to your own entry. The only new element is *finding* that entry -- it belongs to the host until it has been provisioned:

``` lua
function my_player()
  local players = net.state.players
  if not players then
    return nil
  end
  return players[net.id()]
end
```

Write `update_movement()`: get `my_player()`, return if it is `nil` (not provisioned yet -- the multi-player version of Pong's replication-lag guard), then move `me.x` / `me.y` with the arrow keys and clamp both to the screen.

For drawing, iterate the players. `pairs` over a `net.state` branch yields **string** keys, so convert before comparing ids:

``` lua
for id, p in pairs(net.state.players or {}) do
  gfx.fill_rect(p.x, p.y, PLAYER_SIZE, PLAYER_SIZE, p.col)

  if tonumber(id) == net.id() then
    gfx.rect(p.x - 2, p.y - 2, PLAYER_SIZE + 4, PLAYER_SIZE + 4, 7)   -- highlight yourself
  end
end
```

Draw the untaken coins the same way (skip entries with `taken` set), and later add a score display: a row of small squares per player, in that player's color.

> [!NOTE]
> Try it
>
> Host plus one or two joiners: every window should show every square moving live, each with a white ring around its own. Join a third window *after* moving around a bit -- the newcomer sees everyone in the right place. That is the state snapshot at work.

## Step 4: Collecting coins with a lock

Here is the race this game exists for: two players overlap coin `3` on the same frame and both try to take it. Both read `taken == false`, both would mark it, both would score. The coin's own lock -- `net.state.coins[i].lock`, created in Step 2 -- settles it: requests are granted one peer at a time, so whatever runs inside `acquire` runs exclusively:

``` lua
function try_collect(i)
  if claiming[i] then
    return   -- we already have a pending request for this coin
  end
  claiming[i] = true

  net.state.coins[i].lock.acquire(function(release)
    claiming[i] = false

    local coin = net.state.coins[i]
    if not coin.taken then             -- still there: it is ours
      coin.taken = true
      local me = my_player()
      me.score = me.score + 1
      net.state.respawns.push(i)       -- Step 5

      if me.score >= WIN_SCORE then
        net.state.winner = net.id()
      end
    end

    release()
  end)
end
```

Every line of ceremony here is the lesson:

- The `claiming` guard stops `_update` from piling up a new lock request every frame while you stand on a coin.
- The `taken` **re-check inside** `acquire` is the whole point of the lock: the world may have changed between asking for the lock and being granted it. The loser of the race reaches this line and finds the coin already gone.
- `release()` runs on every path -- a lock that is never released blocks that coin for the rest of the session.

Drive it from an `update_collect()` that loops over the coins and calls `try_collect(i)` for any untaken coin overlapping you. For the overlap test, use the AABB helper from [limitations](/learn/reference/limitations) with the player and coin sizes.

## Step 5: The host respawns coins from a queue

Collectors push the coin's index onto the `net.state.respawns` queue (already done in Step 4); the host pops one every couple of seconds and refreshes that coin. A queue fits perfectly: pushes from all players line up in order, each index is delivered to exactly one popper, and popping an empty queue just hands the callback `nil`:

``` lua
net.state.respawns.pop(function(i)
  if i and not net.state.winner then
    net.state.coins[i] = new_coin()   -- new_coin() gives it a fresh lock too
  end
end)
```

Wrap this in `update_respawns()`, gated by `respawn_timer` counting up to `RESPAWN_DELAY`. Only the host calls it -- add it to `update_playing()` inside an `is_host` branch, next to `update_movement()` and `update_collect()` which everyone runs. Close the loop like in Pong: when `net.state.winner` appears, announce it and switch to `"over"`, where `m` calls `net.leave()` and restarts.

> [!NOTE]
> Try it -- prove the lock works
>
> Park two players on the same coin. Exactly one score goes up, every time. Then remove the lock -- call the body of `try_collect` directly -- and repeat: sooner or later both players score off the same coin. That double-collect is the race the lock removes.

## How it all fits together

```
Any player                        Host
------------------------------    --------------------------------
moves own players.<id>            provisions players on peer.joined
sees a coin, wants it             cleans them up on peer.left
  |
  v
net.state.coins[i].lock    ---->  grants requests one at a time
  winner: taken = true,
  score + 1,
  net.state.respawns.push(i) -->  pops one index every 2 s,
  loser: already taken,              respawns that coin
  does nothing
```

## Complete code

{{lua:main.lua}}

## Extending the example

- **Bonus coins** -- store a `value` on each coin and add it to the score.
- **Sudden death** -- host shortens `RESPAWN_DELAY` as scores climb.
- **Announcements** -- `net.emit("stolen", i)` when you snatch a coin someone was standing on.
- **Round timer** -- host counts frames down in `net.state.time_left`; highest score wins at zero.
