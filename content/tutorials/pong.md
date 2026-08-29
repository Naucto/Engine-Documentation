---
title: Build Multiplayer Pong
slug: tutorials/pong
lua: pong/main.lua
section: tutorials
order: 2
description: 'This tutorial builds a complete two-player online Pong: one player hosts,
  a friend joins, and each controls a paddle on their own machine. It is the best
  place to start with the net API -- read the mu'
legacy_slugs:
- tutorials/pong.html
---

# Build Multiplayer Pong

This tutorial builds a complete two-player online Pong: one player hosts, a friend joins, and each controls a paddle on their own machine. It is the best place to start with the `net` API -- read the [multiplayer](/learn/concepts/multiplayer) concepts page first if you have not.

Rather than handing you the finished script, each step explains one idea and shows only the lines that carry it; you write the rest. If you get stuck or want to check your work, the [complete code](#complete-code) is one click away.

## What you will build

- A menu where the player chooses to **host** or **join** a session
- Two paddles, each controlled by its own player, shared through `net.state`
- A ball simulated by the host and replicated to the other player
- A score, point announcements via `net.emit`, and a win condition
- Clean handling of the opponent leaving

No sprites or map are needed -- the whole game is drawn with [[gfx.fill_rect]] and [[gfx.rect]], so you can go straight to the **Code Editor**.

## Step 1: A game with four states

A multiplayer game cannot jump straight into gameplay: the session has to be created first, and that involves a platform dialog the player can cancel. So the game is a small state machine. Keep the current state in a global and dispatch on it every frame:

``` lua
state = "menu"   -- "menu" | "waiting" | "playing" | "over"

function _update()
  if state == "menu" then
    update_menu()
  elseif state == "waiting" then
    update_waiting()
  elseif state == "playing" then
    update_playing()
  elseif state == "over" then
    update_over()
  end
end
```

Alongside `state`, declare two more globals you will need throughout: `is_host` (are we the one who created the session?) and `side` (`"left"` or `"right"` -- which paddle is ours). Write an `_init()` that resets all three and prints the menu instructions.

You will also want the usual `clamp(v, lo, hi)` helper, and a handful of constants: the screen size (`320 x 180`), paddle dimensions and speed, ball size, and a winning score. Pick palette colors for each side -- the examples below use `12` (blue) for the left paddle and `8` (red) for the right.

> [!NOTE]
> There is no on-canvas text API, so menus and announcements go to the **output panel** with [[sys.log]].

## Step 2: Hosting and joining

`net.host` and `net.join` open a platform dialog and return immediately; your callback fires only if the session is actually created or joined. That asymmetry drives the whole menu design. Two rules to encode:

1.  **Switch state before calling.** A repeat `net.host` on the next frame while the dialog is still open is silently ignored -- a no-op, not an error (an error is raised only if a session is already active). Moving to `"waiting"` first keeps the game's state clear instead of firing the call unconditionally every frame.
2.  **Cancel means nothing fires.** The only signal for "the player cancelled" is the absence of your callback, so give `"waiting"` its own inputs -- otherwise a cancel strands the player there. Let them re-open host/join, or press a key to return to the menu.

``` lua
function update_menu()
  if key_pressed("h") then
    state   = "waiting"
    is_host = true
    net.host({ max_players = 2, title = "Pong" }, on_connected)
  elseif key_pressed("j") then
    state   = "waiting"
    is_host = false
    net.join(on_connected)
  end
end
```

Write `update_waiting()` yourself: `m` returns to `"menu"` and reprints the instructions, while `h`/`j` re-open the host/join dialog. Calling `net.host`/`net.join` again from here is safe -- a cancelled attempt fully resets the net state. Without these inputs, a cancel would strand the player in `"waiting"`.

> [!NOTE]
> Try it
>
> Add a placeholder `on_connected` that just prints something, plus empty `update_playing` / `update_over`, and run the game. `H` should open the host dialog (note how the capacity is fixed at 2 -- the game decided that, not the player). Cancel it -- pressing `H`/`J` re-opens the dialog, or `M` takes you back to the menu.

## Step 3: The host sets the table

`on_connected` runs once, on success, for both roles -- use `is_host` to split the work. Following the ownership convention from [multiplayer](/learn/concepts/multiplayer), the host creates every piece of shared state the game will ever read, so nobody else has to wonder whether a key exists:

``` lua
if is_host then
  net.state.pads    = { left = (H - PAD_H) / 2, right = (H - PAD_H) / 2 }
  net.state.score   = { left = 0, right = 0 }
  net.state.playing = false
  reset_ball(1)

  net.on("peer.joined", function(playerId) net.state.playing = true end)
  net.on("peer.left",   function(playerId) net.state.playing = false end)
end
```

`net.state.playing` is the referee's whistle: the ball only moves while an opponent is connected, and the host flips it from the `peer.joined` / `peer.left` events.

Complete the function for both roles: derive `side` from `is_host`, switch `state` to `"playing"`, and subscribe to `"ended"` (the session dies when the host leaves -- go to `"over"` and tell the player). Then write `reset_ball(direction)`: assign `net.state.ball` a fresh table with a centered `x, y` and a `dx, dy` velocity moving toward `direction`. Assigning a whole table replaces the subtree in one go -- exactly what a reset wants.

## Step 4: Your paddle, their paddle

Each player writes **only its own** paddle key and merely reads the other one -- that is the entire synchronization model, no messages needed. Two things matter in the code:

``` lua
function update_paddle()
  local pads = net.state.pads
  if not pads then
    return   -- state not replicated yet
  end

  local y = pads[side]
  -- move y with ArrowUp / ArrowDown, then:
  pads[side] = clamp(y, 0, H - PAD_H)
end
```

The `nil` guard is not paranoia: the joiner's first frames can run *before* the host's state has replicated to it, and indexing a branch that does not exist yet would crash the game. Guard every read of a shared branch this way.

Now make it visible. In `_draw()`, clear the screen and (in the `"playing"` state) draw both paddles from `net.state.pads` -- same `nil` guard -- and the ball from `net.state.ball`, but only while `net.state.playing` is true and nobody has won. Draw *everything* from `net.state`, never from local variables: that is what guarantees both screens show the same game.

> [!NOTE]
> Try it
>
> Host in one browser window, join from another (invite code). You should see both paddles on both screens, each window controlling its own -- and the ball sitting frozen in the center, because nothing moves it yet.

## Step 5: The host simulates the ball

Only the host runs ball physics; the other player just draws the replicated result. One referee means the two screens can never disagree about a bounce. Note what the first line gives you -- `net.state.ball` is a *live view*, so writing `ball.x` goes straight into shared state:

``` lua
function update_ball()
  if not net.state.playing or net.state.winner then
    return
  end

  local ball = net.state.ball
  ball.x = ball.x + ball.dx
  ball.y = ball.y + ball.dy
  -- bounces and scoring go here
end
```

Fill in the physics -- it is classic Pong:

- **Walls**: when `ball.y` leaves `0 .. H - BALL_SIZE`, negate `dy`.
- **Paddles**: when the ball moves left (`dx < 0`), reaches the left paddle's x-plane, and overlaps it vertically, negate `dx`; mirror the test for the right side.
- **Goals**: when the ball fully exits on the left, the right side scores (and vice versa).

Scoring is where the host talks to the other player. The sender of an event never receives it, hence the local [[sys.log]] next to the emit:

``` lua
function score_point(scorer, serve_direction)
  net.state.score[scorer] = net.state.score[scorer] + 1
  net.emit("point", scorer)
  print("Point for the " .. scorer .. " side!")

  if net.state.score[scorer] >= WIN_SCORE then
    net.state.winner = scorer
  else
    reset_ball(serve_direction)
  end
end
```

On the receiving side, subscribe once in `on_connected`: `net.on("event:point", function(from, scorer) ... end)`. Finally, wire it all into `update_playing()`: everyone updates their paddle; **only the host** calls `update_ball()`.

## Step 6: Winning and leaving

The host decides the winner by writing `net.state.winner`; everyone else just watches for it. At the end of `update_playing()`, when `net.state.winner` is set, switch to `"over"` and announce the result. In `update_over()`, let `m` clean up and restart:

``` lua
function update_over()
  if key_pressed("m") then
    net.leave()
    _init()
  end
end
```

`net.leave()` is safe here even when the session already ended (after an `"ended"` event it simply does nothing), so one exit path covers both "we won" and "the host left".

To finish the presentation, extend `_draw()` for the other states: fill the screen with the winner's color in `"over"`, and draw something for the menu (the complete code shows two idle paddles and a dotted center line). A score display needs no text: draw one small square per point in each side's color along the top edge.

> [!NOTE]
> Try it
>
> Play a full match to 5. Then close the host's window mid-rally: the joiner should get the "host closed the session" message and land back in the menu via `M`. That path -- session dies, `"ended"` fires, player recovers -- is one your game should never leave untested.

## How it all fits together

```
Host machine                          Joiner machine
--------------------------            --------------------------
net.host{max_players = 2}   ------>   net.join()  (invite code)
owns: ball, score, playing            owns: pads.right only
writes pads.left                      reads ball, score, pads.left
simulates the ball          ------>   draws the replicated ball
net.emit("point", ...)      ------>   net.on("event:point", ...)
sets net.state.winner       ------>   sees winner, shows "over"
```

## Complete code

{{lua:main.lua}}

## Extending the example

- **Rematch** -- on the "over" screen, let the host reset the score and ball instead of leaving.
- **Faster rallies** -- increase `ball.dx` slightly on each paddle bounce.
- **Spin** -- adjust `ball.dy` based on where the ball hits the paddle.
- **Sound** -- call [[sound.play_music]] on `event:point` if your project has music slots.
