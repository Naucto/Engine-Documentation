---
title: Tutorials
slug: tutorials/index
section: tutorials
order: 0
description: Seven guided builds, from a ten-minute coin hunt to a host-refereed online game, each teaching one idea of the engine at a time.
legacy_slugs:
- tutorials/index.html
---

# Tutorials

Seven games built step by step. Each tutorial builds its game one step at a time, and every step gives the whole of the functions it adds, so the page can be followed to the letter in a new game; **Copy to new game** installs the finished game in a fresh project when you would rather read it or compare your version against it.

Before any of them, do [Getting started](/learn/getting-started) and read [the game loop](/learn/concepts/game-loop). Every tutorial assumes you can run a game and know what `_init`, `_update` and `_draw` are for.

## Start here: your first game

[Your first game](/learn/tutorials/first-game) takes ten minutes and is the one to do right after Getting started. A one-screen coin hunt, solo, that visits ART, MAP and CODE once each and teaches sprite flags, the painted map as collision data, a table of things to collect, a score and a win condition.

## Next: the platformer

[Build a platformer](/learn/tutorials/platformer) is the second solo game. It builds on the same map-as-collision idea and adds gravity and jumping, movement resolved one axis at a time, a small animation state machine and a clamped camera.

## Then: make it sound

[Make it sound](/learn/tutorials/sound) is the third solo build, and the short one. It visits SOUND for an instrument from a preset, a pattern on the piano roll and a chain of two in the MUSIC grid, then CODE for [[sound.play_sfx]] on a key press, [[sound.play_music]] from the first frame and a beat indicator read off [[sound.music_pos]].

## Then online, in this order

The four netplay tutorials build on one another, so do them in order. Read the [multiplayer](/learn/concepts/multiplayer) concepts page first: it explains `net.state`, ownership and events, and the tutorials only apply them.

1. [Build multiplayer Pong](/learn/tutorials/pong): the host/join menu every later game reuses, shared paddles, a host-simulated ball, events for announcements, and what to do when the session ends.
2. [Build a Coin Rush](/learn/tutorials/click-race): up to four players; the host provisions everyone, a [[net.lock]] per coin settles simultaneous grabs, a [[net.queue]] feeds respawn work to the host.
3. [Build a Tag Arena](/learn/tutorials/tag): reacting to a shared key with `net.on`, players joining mid-game, cleaning up after the ones who leave.
4. [Permissions & authority](/learn/tutorials/permissions): the NET tab's read and write flags, and what to lock so a client cannot declare itself the winner.

To test a netplay game alone, the NET tab's **TEST RIG** spawns a second client: a small screen inside that panel, on your machine. It starts at `_init` like any run and joins through your game's own menu, so click its screen and press your join key. Pop the VIEWER out first, so your own game keeps running while you are on NET, and turn Auto off, since a rerun ends the session. That client runs on your account but plays under an id of its own, so `net.id()` differs in the two clients and Coin Rush and Tag, which key everything by it, see two players. A third needs a second browser logged in to another account, or friends.
