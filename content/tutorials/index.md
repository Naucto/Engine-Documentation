---
title: Tutorials
slug: tutorials/index
section: tutorials
order: 0
description: Six guided builds, from a ten-minute coin hunt to a host-refereed online game, each teaching one idea of the engine at a time.
legacy_slugs:
- tutorials/index.html
---

# Tutorials

Six games built step by step. Each tutorial explains one idea at a time and shows only the lines that carry it; the complete code is folded at the foot of the page, and **Copy to new game** installs it in a fresh project so you can compare your version against it.

Before any of them, do [Getting started](/learn/getting-started) and read [the game loop](/learn/concepts/game-loop). Every tutorial assumes you can run a game and know what `_init`, `_update` and `_draw` are for.

## Start here: your first game

[Your first game](/learn/tutorials/first-game) takes ten minutes and is the one to do right after Getting started. A one-screen coin hunt, solo, that visits ART, MAP and CODE once each and teaches sprite flags, the painted map as collision data, a table of things to collect, a score and a win condition.

## Next: the platformer

[Build a platformer](/learn/tutorials/platformer) is the second solo game. It builds on the same map-as-collision idea and adds gravity and jumping, movement resolved one axis at a time, a small animation state machine and a clamped camera.

## Then online, in this order

The four netplay tutorials build on one another, so do them in order. Read the [multiplayer](/learn/concepts/multiplayer) concepts page first: it explains `net.state`, ownership and events, and the tutorials only apply them.

1. [Build multiplayer Pong](/learn/tutorials/pong): the host/join menu every later game reuses, shared paddles, a host-simulated ball, events for announcements, and what to do when the session ends.
2. [Build a Coin Rush](/learn/tutorials/click-race): up to four players; the host provisions everyone, a [[net.lock]] per coin settles simultaneous grabs, a [[net.queue]] feeds respawn work to the host.
3. [Build a Tag Arena](/learn/tutorials/tag): reacting to a shared key with `net.on`, players joining mid-game, cleaning up after the ones who leave.
4. [Permissions & authority](/learn/tutorials/permissions): the NET tab's read and write flags, and what to lock so a client cannot declare itself the winner.

To test a netplay game alone, the NET tab's **Test rig** spawns a second client on your machine. That client runs on your account but plays under an id of its own, so `net.id()` differs in the two windows and Coin Rush and Tag, which key everything by it, see two players. A third needs a second browser logged in to another account, or friends.
